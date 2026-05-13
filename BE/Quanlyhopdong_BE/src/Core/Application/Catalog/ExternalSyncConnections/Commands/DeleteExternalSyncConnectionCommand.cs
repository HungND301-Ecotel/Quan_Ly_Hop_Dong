using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Domain.Entities.Catalog;
using MediatR;
using Shared.Constants;

namespace Application.Catalog.ExternalSyncConnections.Commands;

public record DeleteExternalSyncConnectionCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteExternalSyncConnectionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteExternalSyncConnectionCommand, bool>
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<bool> Handle(DeleteExternalSyncConnectionCommand request, CancellationToken cancellationToken)
    {
        var distinctIds = request.DeleteIds.Distinct().ToList();
        if (distinctIds.Count != request.DeleteIds.Count)
        {
            throw new ConflictException(CustomResponseMessage.DeletedIdDuplicated);
        }

        if (!distinctIds.Any())
        {
            throw new BadRequestException(CustomResponseMessage.DeletedIdsEmpty);
        }

        var itemsToDelete = await _repo.GetAllAsync(
            predicate: x => distinctIds.Contains(x.Id),
            disableTracking: true);

        if (!itemsToDelete.Any() || itemsToDelete.Count != distinctIds.Count)
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        await unitOfWork.BeginTransactionAsync(cancellationToken: cancellationToken);
        try
        {
            _repo.Delete(itemsToDelete);
            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
