using Application.Dto.Catalog;
using Application.Dto.Catalog.ContractProgress;

namespace Application.Interfaces.Services.Catalog;

public interface IContractProgressService
{
    /// <summary>
    /// Get contract progress detail by ID
    /// </summary>
    Task<ContractProgressDto> GetByIdAsync(Guid id);

    /// <summary>
    /// Get contract progress by contract ID
    /// </summary>
    Task<ContractProgressResponseDto> GetByContractIdAsync(Guid contractId);

    /// <summary>
    /// Create a new contract progress period
    /// </summary>
    Task<CreateContractProgressResponse> CreateAsync(CreateContractProgressRequest request);

    /// <summary>
    /// Add contract progress items in batch
    /// </summary>
    Task<AddContractProgressItemsResponse> AddProgressItemsBatchAsync(AddContractProgressItemsRequest request);

    /// <summary>
    /// Get yearly summary of contract progress for a date range
    /// </summary>
    Task<YearlySummaryListDto> GetYearlySummaryAsync(Guid contractId);

    /// <summary>
    /// Create multiple contract progress periods in batch
    /// </summary>
    Task<CreateContractProgressBatchResponse> CreateBatchAsync(CreateContractProgressBatchRequest request);

    /// <summary>
    /// Update an existing contract progress period
    /// </summary>
    Task UpdateAsync(UpdateContractProgressRequest request);

    /// <summary>
    /// Update contract progress records in batch (add/update/delete)
    /// </summary>
    Task<UpdateContractProgressBatchResponse> UpdateContractProgressBatchAsync(UpdateContractProgressBatchRequest request);

    /// <summary>
    /// Delete a contract progress period
    /// </summary>
    Task<DeleteContractProgressResponse> DeleteAsync(Guid id);

    /// <summary>
    /// Update contract progress items in batch with smart operations (add/update/delete)
    /// </summary>
    Task<UpdateContractProgressItemsBatchResponse> UpdateItemsBatchAsync(UpdateContractProgressItemsBatchRequest request);

    /// <summary>
    /// Get work in progress (Khối lượng và Giá trị Dở dang) for a contract
    /// </summary>
    /// <param name="contractId">Contract identifier</param>
    /// <returns>Work in progress with total amount and item details</returns>
    Task<WorkInProgressDto> GetWorkInProgressAsync(Guid contractId);

    /// <summary>
    /// Get all contract items by contract ID
    /// </summary>
    /// <param name="contractId">Contract identifier</param>
    /// <returns>List of contract items with material details</returns>
    Task<List<ContractItemDto>> GetContractItemsByContractIdAsync(Guid contractId);

    /// <summary>
    /// Create contract progress records with nested items in batch
    /// </summary>
    /// <param name="request">Request containing contract ID and list of progress records with items</param>
    /// <returns>Response with success/failed counts and details</returns>
    Task<CreateContractProgressWithItemsResponse> CreateContractProgressWithItemsAsync(
        CreateContractProgressWithItemsRequest request);

    /// <summary>
    /// Update contract progress records with nested items in batch (add/update/delete)
    /// </summary>
    /// <param name="request">Request containing contract ID and list of progress records with items</param>
    /// <returns>Response with added/updated/deleted counts</returns>
    Task<UpdateContractProgressWithItemsResponse> UpdateContractProgressWithItemsAsync(
        UpdateContractProgressWithItemsRequest request);

    /// <summary>
    /// Get grouped summary by ContractProgressId (quantity and amount)
    /// </summary>
    /// <param name="contractProgressId">Contract progress identifier</param>
    /// <returns>Grouped summary with total quantity and amount</returns>
    Task<ContractProgressGroupedSummaryDto> GetContractProgressGroupedSummaryAsync(Guid contractProgressId);

    /// <summary>
    /// Get contract progress item detail by ID
    /// </summary>
    /// <param name="id">Progress item identifier</param>
    /// <returns>Progress item detail with material and execution info</returns>
    Task<ContractProgressItemDetailResponse> GetProgressItemByIdAsync(Guid id);

    /// <summary>
    /// Update a single contract progress item
    /// </summary>
    /// <param name="request">Request with item ID and new executed quantity</param>
    /// <returns>Updated progress item response</returns>
    Task<UpdateSingleProgressItemResponse> UpdateProgressItemAsync(UpdateSingleProgressItemRequest request);

    /// <summary>
    /// Delete a single contract progress item
    /// </summary>
    /// <param name="id">Progress item identifier</param>
    /// <returns>Delete response with success status</returns>
    Task<DeleteContractProgressItemResponse> DeleteProgressItemAsync(Guid id);
}