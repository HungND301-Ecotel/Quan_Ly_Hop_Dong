namespace Application.Dto.Catalog;

public class SyncInvoiceByContractRequest
{
    public string ContractNumber { get; set; } = string.Empty;
    public DateTime ContractDate { get; set; }
    public Guid SourceConnectionId { get; set; }
}

public class ExternalInvoiceSyncItemDto
{
    public int PeriodNumber { get; set; }
    public string NumberInvoice { get; set; } = string.Empty;
    public DateTimeOffset DateInvoice { get; set; }
}

public class SyncInvoiceResultDto
{
    public int SourceCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
}
