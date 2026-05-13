namespace Application.Dto.Catalog.ContractPayment;

/// <summary>
/// Response for contract payments query
/// </summary>
public class ContractPaymentResponseDto
{
    public Guid ContractId { get; set; }
    public decimal TotalAmount { get; set; }
    public string? LiquidationFilePath { get; set; }
    public List<ContractPaymentDto> Payments { get; set; } = new();
}

/// <summary>
/// Individual payment DTO
/// </summary>
public class ContractPaymentDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public int PeriodNumber { get; set; }
    public string[]? AcceptanceReportFilePaths { get; set; }
    public string[]? InvoiceFilePaths { get; set; }
    public InvoiceDto? Invoice { get; set; }
    public string[]? TaxFilePaths { get; set; }
    public TaxDto? Tax { get; set; }
    public DateTimeOffset PaymentDate { get; set; }
    public decimal Amount { get; set; }
}

public class InvoiceDto
{
    public string? NumberInvoice { get; set; }
    public DateTimeOffset? DateInvoice { get; set; }
}

public class TaxDto
{
    public DateTime? DeclarationDate { get; set; }
    public decimal? VatRate { get; set; }
    public decimal? TaxableRevenue { get; set; }
    public decimal? VatAmount { get; set; }
    public string? TaxCode { get; set; }
}

/// <summary>
/// Request for batch update contract payments with smart operations
/// If Id provided ? Update
/// If Id null/empty ? Create
/// If exists in DB but not in request ? Delete
/// </summary>
public class UpdateContractPaymentBatchRequest
{
    public Guid ContractId { get; set; }
    public List<UpdateContractPaymentBatchItem> Items { get; set; } = new();
}

/// <summary>
/// Individual payment item for batch update
/// </summary>
public class UpdateContractPaymentBatchItem
{
    public Guid? Id { get; set; }  // NULL = Create, NOT NULL = Update
    public Guid? PaymentScheduleId { get; set; }  // Optional - Link to PaymentSchedule
    public int PeriodNumber { get; set; }
    public string[]? AcceptanceReportFilePaths { get; set; }
    public string[]? InvoiceFilePaths { get; set; }
    public InvoiceDto? Invoice { get; set; }
    public string[]? TaxFilePaths { get; set; }
    public TaxDto? Tax { get; set; }
    public DateTimeOffset PaymentDate { get; set; }
    public decimal Amount { get; set; }
}

/// <summary>
/// Response for batch update operation
/// </summary>
public class UpdateContractPaymentBatchResponse
{
    public int AddedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int DeletedCount { get; set; }
    public int FailedCount { get; set; }
    public List<UpdateContractPaymentBatchResult> Results { get; set; } = new();
}

/// <summary>
/// Result for individual payment in batch update
/// </summary>
public class UpdateContractPaymentBatchResult
{
    public Guid? Id { get; set; }
    public string Operation { get; set; } = string.Empty; // "Added", "Updated", "Deleted", "Failed"
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request for updating liquidation file
/// </summary>
public class UpdateLiquidationFileRequest
{
    public Guid ContractId { get; set; }
    public string LiquidationFilePath { get; set; } = string.Empty;
}

/// <summary>
/// Payment file type enum
/// </summary>
public enum PaymentFileType
{
    AcceptanceReport,  // Bi�n b?n nghi?m thu
    Invoice,          // H�a ��n
    Tax,              // Thu?
    Liquidation       // Thanh l?
}

/// <summary>
/// Request for uploading payment file
/// </summary>
public class UploadPaymentFileRequest
{
    public Guid ContractId { get; set; }
    public PaymentFileType FileType { get; set; }
}

/// <summary>
/// Response for file upload
/// </summary>
public class UploadPaymentFileResponse
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public PaymentFileType FileType { get; set; }
}

