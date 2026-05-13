using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractItemsQuery(Guid ContractId) : IRequest<List<ContractItemDto>>;

public class GetContractItemsQueryHandler(IContractService contractService) 
    : IRequestHandler<GetContractItemsQuery, List<ContractItemDto>>
{
    public async Task<List<ContractItemDto>> Handle(GetContractItemsQuery request, CancellationToken cancellationToken)
    {
        return await contractService.GetContractItemsByContractIdAsync(request.ContractId);
    }
}
