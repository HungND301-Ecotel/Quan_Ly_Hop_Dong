using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractApporvalHistoryQuery(Guid Id) : IRequest<List<ContractApprovalHistoryDto>>;

public class GetContractApporvalHistoryQueryHandler(IContractService _contractSerivce) : IRequestHandler<GetContractApporvalHistoryQuery, List<ContractApprovalHistoryDto>>
{
    public async Task<List<ContractApprovalHistoryDto>> Handle(GetContractApporvalHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetApprovalHistoryAsync(request.Id);
    }
}