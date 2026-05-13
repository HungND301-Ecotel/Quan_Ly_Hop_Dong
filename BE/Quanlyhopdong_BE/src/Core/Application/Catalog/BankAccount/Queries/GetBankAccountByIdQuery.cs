using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.BankAccount.Queries;

public record class GetBankAccountByIdQuery(Guid Id) : IRequest<BankAccountDto>;

public class GetBankAccountByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetBankAccountByIdQuery, BankAccountDto>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.BankAccount> _bankAccountRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.BankAccount>();

    public async Task<BankAccountDto> Handle(GetBankAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _bankAccountRepo.GetFirstOrDefaultAsync(
            predicate: c => c.Id == request.Id,
            disableTracking: true) 
            ?? throw new NotFoundException("Bank account not found");

        return entity.Adapt<BankAccountDto>();
    }
}
