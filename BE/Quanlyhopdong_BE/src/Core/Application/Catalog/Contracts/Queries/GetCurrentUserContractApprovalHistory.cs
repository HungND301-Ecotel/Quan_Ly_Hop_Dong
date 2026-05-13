using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetCurrentUserContractApprovalHistory() : IRequest<List<ContractDto>>;

public class GetCurrentUserContractApprovalHistoryHandler(IContractService _contractSerivce) : IRequestHandler<GetCurrentUserContractApprovalHistory, List<ContractDto>>
{
    public async Task<List<ContractDto>> Handle(GetCurrentUserContractApprovalHistory request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetCurrentUserContractApprovalHistory();
    }
}