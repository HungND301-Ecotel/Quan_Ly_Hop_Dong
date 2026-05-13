using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetMyVisibleContractsQuery(
    string? Search,
    Guid? ContractTypeId,
    Guid? DepartmentId,
    Guid? PartnerId,
    ContractStatus? Status,
    DateTime? StartDate,
    DateTime? EndDate,
    IList<ContractFormat>? Formats,
    bool? IsArchiveContract,
    bool? IsDebtTrackingEnabled) : IRequest<List<ShortContractDto>>;

public class GetMyVisibleContractsQueryHandler(IContractService contractService)
    : IRequestHandler<GetMyVisibleContractsQuery, List<ShortContractDto>>
{
    public async Task<List<ShortContractDto>> Handle(GetMyVisibleContractsQuery request, CancellationToken cancellationToken)
    {
        return await contractService.GetMyVisibleContractsAsync(
            request.Search,
            request.ContractTypeId,
            request.DepartmentId,
            request.PartnerId,
            request.Status,
            request.StartDate,
            request.EndDate,
            request.Formats,
            request.IsArchiveContract,
            request.IsDebtTrackingEnabled);
    }
}