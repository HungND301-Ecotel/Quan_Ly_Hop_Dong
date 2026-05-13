namespace Application.Dto.Catalog;

public class SyncTaxByContractRequest
{
    public string ContractNumber { get; set; } = string.Empty;
    public DateTime ContractDate { get; set; }
    public Guid SourceConnectionId { get; set; }
}

public class ExternalTaxSyncItemDto
{
    public int PeriodNumber { get; set; }
    public DateTime DeclarationDate { get; set; }
    public decimal VatRate { get; set; }
    public decimal TaxableRevenue { get; set; }
    public decimal VatAmount { get; set; }
    public string TaxCode { get; set; } = string.Empty;
}

public class SyncTaxResultDto
{
    public int SourceCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
}