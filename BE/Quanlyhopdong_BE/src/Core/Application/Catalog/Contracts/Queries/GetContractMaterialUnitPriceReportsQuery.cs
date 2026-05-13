using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractMaterialUnitPriceReportsQuery(
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
    bool? IsLiquidated) : IRequest<List<ContractMaterialUnitPriceReportByYearDto>>;

public class GetContractMaterialUnitPriceReportsQueryHandler(IContractService contractService)
    : IRequestHandler<GetContractMaterialUnitPriceReportsQuery, List<ContractMaterialUnitPriceReportByYearDto>>
{
    public async Task<List<ContractMaterialUnitPriceReportByYearDto>> Handle(
        GetContractMaterialUnitPriceReportsQuery request,
        CancellationToken cancellationToken)
    {
        return await contractService.GetContractMaterialUnitPriceReportsAsync(
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
