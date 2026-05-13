using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Mapster;
using MediatR;

namespace Application.Catalog.BankAccount.Queries;

public record class GetAllBankAccountsQuery(bool? IsActive = null, string? Search = null) : IRequest<IList<BankAccountDto>>;

public class GetAllBankAccountsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllBankAccountsQuery, IList<BankAccountDto>>
{
    private readonly IWriteRepository<Domain.Entities.Catalog.BankAccount> _bankAccountRepo = unitOfWork.GetRepository<Domain.Entities.Catalog.BankAccount>();

    public async Task<IList<BankAccountDto>> Handle(GetAllBankAccountsQuery request, CancellationToken cancellationToken)
    {
        var result = await _bankAccountRepo.GetAllAsync(
            predicate: b => 
                (request.IsActive == null || b.IsActive == request.IsActive) &&
                (string.IsNullOrEmpty(request.Search) || 
                 b.BankName.Contains(request.Search) || 
                 b.AccountNumber.Contains(request.Search) ||
                 b.AccountHolder.Contains(request.Search)),
            disableTracking: true);

        return result.Adapt<List<BankAccountDto>>();
    }
}
