using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using MediatR;
using Shared.Constants;

namespace Application.Catalog.MaterialGroup.Commands;

public record class DeleteMaterialGroupCommand(List<Guid> DeleteIds) : IRequest<bool>;

public class DeleteMaterialGroupCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMaterialGroupCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.MaterialGroup> _repo = unitOfWork.GetRepository<Domain.Entities.Category.MaterialGroup>();

    public async Task<bool> Handle(DeleteMaterialGroupCommand request, CancellationToken cancellationToken)
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

        if (itemsToDelete == null || !itemsToDelete.Any())
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        if (itemsToDelete.Count != distinctIds.Count)
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
        catch (Exception)
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
