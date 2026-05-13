namespace Application.Dto.Catalog;

public class ContractMaterialUnitPriceReportByYearDto
{
    public int Year { get; set; }
    public List<ContractMaterialUnitPriceReportDto> Materials { get; set; } = new();
}

public class ContractMaterialUnitPriceReportDto
{
    public string? MaterialCode { get; set; }
    public string? MaterialName { get; set; }
    public string? UnitOfMeasureName { get; set; }
    public List<ContractUnitPriceByContractDto> Contracts { get; set; } = new();
}

public class ContractUnitPriceByContractDto
{
    public Guid ContractId { get; set; }
    public string? ContractCode { get; set; }
    public string? ContractTitle { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Quantity { get; set; }
    public decimal Amount { get; set; }
}
