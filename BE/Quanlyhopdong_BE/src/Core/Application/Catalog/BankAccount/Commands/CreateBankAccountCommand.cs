using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using MediatR;

namespace Application.Catalog.BankAccount.Commands;

public record class CreateBankAccountCommand(CreateBankAccountDto CreateModel) : IRequest<bool>;

public class CreateBankAccountCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateBankAccountCommand, bool>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.BankAccount> _bankAccountRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.BankAccount>();

    public async Task<bool> Handle(CreateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var dto = request.CreateModel;
        
        var entity = Domain.Entities.Catalog.BankAccount.Create(
            dto.BankName,
            dto.AccountNumber,
            dto.AccountHolder,
            dto.IsActive,
            dto.Note);

        await _bankAccountRepo.InsertAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync();
        
        return true;
    }
}
