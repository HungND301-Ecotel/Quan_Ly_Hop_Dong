using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetAllContractsWithPaymentDueSoonQuery(ContractFormat? ContractFormat) : IRequest<List<ShortContractDto>>;

public class GetAllContractsWithPaymentDueSoonQueryHandler(IContractService contractService) : IRequestHandler<GetAllContractsWithPaymentDueSoonQuery, List<ShortContractDto>>
{
    public async Task<List<ShortContractDto>> Handle(GetAllContractsWithPaymentDueSoonQuery request, CancellationToken cancellationToken)
    {
        return await contractService.GetAllContractsWithPaymentDueSoonAsync(request.ContractFormat);
    }
}
