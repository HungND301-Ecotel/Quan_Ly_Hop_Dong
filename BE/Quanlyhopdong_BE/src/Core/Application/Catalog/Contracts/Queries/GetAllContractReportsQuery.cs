using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetAllContractReportsQuery(
    Guid? ContractTypeId,
    Guid? Level1CodeId,
    Guid? ProcurementMethodId,
    Guid? ContractStructureCatalogId,
    Guid? PartnerId,
    string? PartnerName,
    DateTime? StartDateFrom,
    DateTime? StartDateTo,
    DateTime? EndDateFrom,
    DateTime? EndDateTo,
    DateTime? EndDate,
    bool? IsAutoLiquidated,
    bool? IsLiquidated) : IRequest<List<ContractReportDto>>;

public class GetAllContractReportsQueryHandler(IContractService _contractService) : IRequestHandler<GetAllContractReportsQuery, List<ContractReportDto>>
{
    public async Task<List<ContractReportDto>> Handle(GetAllContractReportsQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetAllContractReportsAsync(
            request.ContractTypeId,
            request.Level1CodeId,
            request.ProcurementMethodId,
            request.ContractStructureCatalogId,
            request.PartnerId,
            request.PartnerName,
            request.StartDateFrom,
            request.StartDateTo,
            request.EndDateFrom,
            request.EndDateTo,
            request.EndDate,
            request.IsAutoLiquidated,
            request.IsLiquidated);
    }
}
