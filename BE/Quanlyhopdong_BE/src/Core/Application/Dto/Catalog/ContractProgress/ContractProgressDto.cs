namespace Application.Dto.Catalog.ContractProgress;

/// <summary>
/// DTO for Contract Progress response
/// </summary>
public class ContractProgressDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public decimal ProgressTotal { get; set; }
    public List<ContractProgressItemDetailDto> ContractProgressItems { get; set; } = new();
}

/// <summary>
/// DTO for Contract Progress Item detail within progress
/// </summary>
public class ContractProgressItemDetailDto
{
    public Guid Id { get; set; }
    public Guid ContractItemId { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal MaterialPrice { get; set; }
    public decimal ContractQuantity { get; set; }
    public decimal ExecutedQuantity { get; set; }
    public decimal TotalItemAmount { get; set; }
    
    /// <summary>
    /// Số lượng còn lại sau kỳ hiện tại = ContractQuantity - SUM(ExecutedQuantity từ kỳ 1 đến kỳ hiện tại)
    /// </summary>
    public decimal RemainingQuantity { get; set; }
    
    /// <summary>
    /// Số lượng tối đa có thể thực hiện ở kỳ hiện tại = RemainingQuantity của kỳ trước (cùng ContractItemId)
    /// Kỳ đầu tiên = ContractQuantity
    /// </summary>
    public decimal MaxExecutableQuantity { get; set; }
}

/// <summary>
/// Response DTO for getting contract progress by contract ID
/// </summary>
public class ContractProgressResponseDto
{
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public decimal Total { get; set; }
    public List<ContractProgressDto> ContractProgresses { get; set; } = new();
}

/// <summary>
/// Request DTO for creating contract progress
/// </summary>
public class CreateContractProgressRequest
{
    public Guid ContractId { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

/// <summary>
/// Response DTO for created contract progress
/// </summary>
public class CreateContractProgressResponse
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public decimal? EstimatedQuantity { get; set; }
    public decimal? EstimatedAmount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

/// <summary>
/// Request DTO for adding progress items in batch
/// </summary>
public class AddContractProgressItemsRequest
{
    public List<ContractProgressItemRequest> Items { get; set; } = new();
}

/// <summary>
/// Individual progress item in batch request
/// </summary>
public class ContractProgressItemRequest
{
    public Guid ContractProgressId { get; set; }
    public Guid ContractItemId { get; set; }
    public decimal ExecutedQuantity { get; set; }
}

/// <summary>
/// Response DTO for batch add operation
/// </summary>
public class AddContractProgressItemsResponse
{
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<BatchItemResult> Results { get; set; } = new();
}

/// <summary>
/// Result for individual item in batch operation
/// </summary>
public class BatchItemResult
{
    public Guid ContractItemId { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class YearlySummaryListDto
{
    public int FromYear { get; set; }
    public int ToYear { get; set; }
    public int Total { get; set; }
    public int TotalQuantity { get; set; }
    public List<YearlySummaryDto> YearlySummaries { get; set; } = [];
}

/// <summary>
/// DTO for yearly summary of contract progress
/// </summary>
public class YearlySummaryDto
{
    public int Year { get; set; }
    public decimal YearTotal { get; set; }
    public List<YearlySummaryItemDto> ContractItems { get; set; } = new();
}

/// <summary>
/// DTO for contract item in yearly summary
/// </summary>
public class YearlySummaryItemDto
{
    /// <summary>
    /// Contract item identifier
    /// </summary>
    public Guid Id { get; set; }

    public string MaterialCode { get; set; } = string.Empty;

    /// <summary>
    /// Material/Item name
    /// </summary>
    public string MaterialName { get; set; } = string.Empty;

    /// <summary>
    /// Unit price from contract
    /// </summary>
    public decimal MaterialPrice { get; set; }

    /// <summary>
    /// Total quantity specified in contract
    /// </summary>
    public decimal ContractQuantity { get; set; }

    /// <summary>
    /// Cumulative executed quantity for the year
    /// </summary>
    public decimal ExecutedQuantity { get; set; }

    /// <summary>
    /// Total amount = ExecutedQuantity � MaterialPrice
    /// </summary>
    public decimal TotalItemAmount { get; set; }
}

/// <summary>
/// Request DTO for creating multiple contract progress in batch
/// </summary>
public class CreateContractProgressBatchRequest
{
    public List<CreateContractProgressRequest> Items { get; set; } = new();
}

/// <summary>
/// Response DTO for batch create operation
/// </summary>
public class CreateContractProgressBatchResponse
{
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<CreateBatchResult> Results { get; set; } = new();
}

/// <summary>
/// Result for individual progress in batch create
/// </summary>
public class CreateBatchResult
{
    public Guid? Id { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating contract progress
/// </summary>
public class UpdateContractProgressRequest
{
    public Guid Id { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

/// <summary>
/// Request DTO for batch updating contract progress
/// If Id is null/empty ? Add new
/// If Id exists with data ? Update
/// If progress exists in DB but not in request ? Delete
/// </summary>
public class UpdateContractProgressBatchRequest
{
    public Guid ContractId { get; set; }
    public List<UpdateContractProgressItemInBatch> Items { get; set; } = new();
}

/// <summary>
/// Individual contract progress in batch update request
/// </summary>
public class UpdateContractProgressItemInBatch
{
    public Guid? Id { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

/// <summary>
/// Response DTO for batch update contract progress
/// </summary>
public class UpdateContractProgressBatchResponse
{
    public int AddedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int DeletedCount { get; set; }
    public List<UpdateContractProgressBatchResult> Results { get; set; } = new();
}

/// <summary>
/// Result for individual progress in batch update
/// </summary>
public class UpdateContractProgressBatchResult
{
    public Guid? Id { get; set; }
    public string Operation { get; set; } = string.Empty; // "Added", "Updated", "Deleted"
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating contract progress items in batch
/// </summary>
public class UpdateContractProgressItemsBatchRequest
{
    public Guid ContractProgressId { get; set; }
    public List<UpdateContractProgressItemRequest> Items { get; set; } = new();
}

/// <summary>
/// Individual item for batch update
/// If Id is null/empty ? Add new
/// If Id exists with data ? Update
/// If item exists in DB but not in request ? Delete
/// </summary>
public class UpdateContractProgressItemRequest
{
    public Guid? Id { get; set; }
    public Guid ContractItemId { get; set; }
    public decimal ExecutedQuantity { get; set; }
}

/// <summary>
/// Response DTO for batch update items operation
/// </summary>
public class UpdateContractProgressItemsBatchResponse
{
    public int AddedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int DeletedCount { get; set; }
    public int FailedCount { get; set; }
    public List<UpdateBatchItemResult> Results { get; set; } = new();
}

/// <summary>
/// Result for individual item in batch update
/// </summary>
public class UpdateBatchItemResult
{
    public Guid? Id { get; set; }
    public Guid ContractItemId { get; set; }
    public string Operation { get; set; } = string.Empty; // "Added", "Updated", "Deleted", "Failed"
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO for work in progress (Kh?i l�?ng v� Gi� tr? D? dang)
/// </summary>
public class WorkInProgressDto
{
    /// <summary>
    /// T?ng gi� tr? d? dang c?a to�n b? h?p �?ng
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Danh s�ch chi ti?t v?t t� �? th?c hi?n
    /// </summary>
    public List<WorkInProgressItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for work in progress item detail
/// </summary>
public class WorkInProgressItemDto
{
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal MaterialPrice { get; set; }
    public decimal ContractQuantity { get; set; }
    public decimal ExecutedQuantity { get; set; }
    public decimal TotalItemAmount { get; set; }
}

/// <summary>
/// Request DTO for creating contract progress with nested items
/// </summary>
public class CreateContractProgressWithItemsRequest
{
    public Guid ContractId { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public List<CreateProgressItemDetailRequest> ContractProgressItems { get; set; } = new();
}

/// <summary>
/// Progress item detail in create request
/// </summary>
public class CreateProgressItemDetailRequest
{
    public Guid ContractItemId { get; set; }
    public decimal ExecutedQuantity { get; set; }
}

/// <summary>
/// Response DTO for creating contract progress with items
/// </summary>
public class CreateContractProgressWithItemsResponse
{
    public Guid ProgressId { get; set; }
    public int ProgressItemsCount { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Result for individual progress in batch create with items
/// </summary>
public class CreateProgressBatchResult
{
    public Guid? ProgressId { get; set; }
    public int ProgressItemsCount { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Progress item detail in update request
/// </summary>
public class UpdateProgressItemDetailRequest
{
    public Guid? Id { get; set; }
    public Guid ContractItemId { get; set; }
    public decimal ExecutedQuantity { get; set; }
}

/// <summary>
/// Request DTO for updating contract progress with nested items
/// If Id is null/empty ? Add new
/// If Id exists ? Update
/// </summary>
public class UpdateContractProgressWithItemsRequest
{
    public Guid ContractId { get; set; }
    public Guid? Id { get; set; }
    public Guid? PaymentScheduleId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public List<UpdateProgressItemDetailRequest> ContractProgressItems { get; set; } = new();
}

/// <summary>
/// Response DTO for updating contract progress with items
/// </summary>
public class UpdateContractProgressWithItemsResponse
{
    public Guid? ProgressId { get; set; }
    public string Operation { get; set; } = string.Empty; // "Added", "Updated"
    public int ItemsAffected { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for grouped summary by ContractProgressId
/// </summary>
public class ContractProgressGroupedSummaryDto
{
    public Guid ContractProgressId { get; set; }
    public Guid ContractId { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalAmount { get; set; }
    public List<ContractProgressItemSummaryDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for individual item in grouped summary
/// </summary>
public class ContractProgressItemSummaryDto
{
    public Guid Id { get; set; }
    public Guid ContractItemId { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal MaterialPrice { get; set; }
    public decimal ExecutedQuantity { get; set; }
    public decimal ExecutedAmount { get; set; }
}
/// <summary>
/// Response DTO for deleted contract progress
/// </summary>
public class DeleteContractProgressResponse
{
    public Guid Id { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for contract progress item detail
/// </summary>
public class ContractProgressItemDetailResponse
{
    public Guid Id { get; set; }
    public Guid ContractProgressId { get; set; }
    public Guid ContractItemId { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal MaterialPrice { get; set; }
    public decimal ContractQuantity { get; set; }
    public decimal ExecutedQuantity { get; set; }
    public decimal ExecutedAmount { get; set; }
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
}

/// <summary>
/// Request DTO for updating a single contract progress item
/// </summary>
public class UpdateSingleProgressItemRequest
{
    public Guid Id { get; set; }
    public decimal ExecutedQuantity { get; set; }
}

/// <summary>
/// Response DTO for updated contract progress item
/// </summary>
public class UpdateSingleProgressItemResponse
{
    public Guid Id { get; set; }
    public Guid ContractItemId { get; set; }
    public decimal ExecutedQuantity { get; set; }
    public decimal ExecutedAmount { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for deleted contract progress item
/// </summary>
public class DeleteContractProgressItemResponse
{
    public Guid Id { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}