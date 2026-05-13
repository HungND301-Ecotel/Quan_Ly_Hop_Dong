using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetPenndingApprovalContractQuery(ContractStatus? Status = null, ContractSubStatus? SubStatus = null) : IRequest<List<ContractDto>>;

public class GetPenndingApprovalContractQueryHandler(IContractService _contractSerivce) : IRequestHandler<GetPenndingApprovalContractQuery, List<ContractDto>>
{
    public async Task<List<ContractDto>> Handle(GetPenndingApprovalContractQuery request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetPendingApprovalContractsAsync(request.Status, request.SubStatus);
    }
}