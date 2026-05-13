using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

/// <summary>
/// Query to retrieve contract dashboard statistics filtered by contract format
/// </summary>
public record class GetContractDashboardQuery(ContractFormat? ContractFormat = null) : IRequest<ContractDashboardDto>;

/// <summary>
/// Handler for GetContractDashboardQuery
/// Retrieves total contracts and breakdown by status, filtered by contract format
/// </summary>
public class GetContractDashboardQueryHandler(IContractService _contractService) : IRequestHandler<GetContractDashboardQuery, ContractDashboardDto>
{
    public async Task<ContractDashboardDto> Handle(GetContractDashboardQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetContractDashboardAsync(request.ContractFormat);
    }
}
