using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using MediatR;
using Shared.Constants;

namespace Application.Catalog.Material.Commands;

public record class DeleteMaterialListCommand(List<Guid> DeleteIds) : IRequest<bool>;

public class DeleteMaterialListCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<DeleteMaterialListCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.Material> repo = _unitOfWork.GetRepository<Domain.Entities.Category.Material>();
    public async Task<bool> Handle(DeleteMaterialListCommand request, CancellationToken cancellationToken)
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

        var itemsToDelete = await repo.GetAllAsync(
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

        await _unitOfWork.BeginTransactionAsync(cancellationToken: cancellationToken);

        try
        {
            repo.Delete(itemsToDelete);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync(cancellationToken);

            return true;
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}