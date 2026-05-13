using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetAllSoonExpiredContractQuery(ContractFormat? ContractFormat) : IRequest<List<ShortContractDto>>;

public class GetAllSoonExpiredContractQueryHandler(IContractService contractService) : IRequestHandler<GetAllSoonExpiredContractQuery, List<ShortContractDto>>
{
    public async Task<List<ShortContractDto>> Handle(GetAllSoonExpiredContractQuery request, CancellationToken cancellationToken)
    {
        return await contractService.GetAllSoonExpiredContractsAsync(request.ContractFormat);
    }
}
