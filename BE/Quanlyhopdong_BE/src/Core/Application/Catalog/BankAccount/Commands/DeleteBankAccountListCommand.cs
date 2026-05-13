using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using MediatR;
using Shared.Constants;

namespace Application.Catalog.BankAccount.Commands;

public record class DeleteBankAccountListCommand(List<Guid> DeleteIds) : IRequest<bool>;

public class DeleteBankAccountListCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteBankAccountListCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.BankAccount> _bankAccountRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.BankAccount>();

    public async Task<bool> Handle(DeleteBankAccountListCommand request, CancellationToken cancellationToken)
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

        var itemsToDelete = await _bankAccountRepo.GetAllAsync(
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
            _bankAccountRepo.Delete(itemsToDelete);
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
