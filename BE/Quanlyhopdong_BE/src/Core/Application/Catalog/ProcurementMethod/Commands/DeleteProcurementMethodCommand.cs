using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using MediatR;
using Shared.Constants;

namespace Application.Catalog.ProcurementMethod.Commands;

public record class DeleteProcurementMethodCommand(List<Guid> DeleteIds) : IRequest<bool>;

public class DeleteProcurementMethodCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<DeleteProcurementMethodCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Category.ProcurementMethod> repo = _unitOfWork.GetRepository<Domain.Entities.Category.ProcurementMethod>();
    public async Task<bool> Handle(DeleteProcurementMethodCommand request, CancellationToken cancellationToken)
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