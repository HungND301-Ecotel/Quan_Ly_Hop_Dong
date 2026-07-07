using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.BankAccount.Commands;

public record class UpdateBankAccountCommand(UpdateBankAccountDto UpdateModel) : IRequest<bool>;

public class UpdateBankAccountCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateBankAccountCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.BankAccount> _bankAccountRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.BankAccount>();

    public async Task<bool> Handle(UpdateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _bankAccountRepo.GetFirstOrDefaultAsync(
            predicate: p => p.Id == request.UpdateModel.Id,
            disableTracking: false) 
            ?? throw new NotFoundException("Bank account not found");

        entity.Update(
            request.UpdateModel.BankName,
            request.UpdateModel.AccountNumber,
            request.UpdateModel.AccountHolder,
            request.UpdateModel.IsActive,
            request.UpdateModel.Note);

        _bankAccountRepo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        
        return true;
    }
}
