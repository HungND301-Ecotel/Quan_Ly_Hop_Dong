using Application.Catalog.ContractProgress.Commands;
using Application.Catalog.ContractProgress.Queries;
using Application.Dto.Catalog;
using Application.Dto.Catalog.ContractProgress;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractProgressController : BaseAuthController
{
    /// <summary>
    /// Get contract progress detail by ID
    /// </summary>
    /// <param name="id">The contract progress ID</param>
    /// <returns>Contract progress detail with period and all progress items</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContractProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractProgressByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Get contract progress by contract ID
    /// </summary>
    /// <param name="contractId">The contract ID</param>
    /// <returns>Contract progress details with all periods and items</returns>
    [HttpGet("contract/{contractId}")]
    [ProducesResponseType(typeof(ContractProgressResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByContractIdAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractProgressByContractIdQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Create a new contract progress period
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateContractProgressResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateContractProgressRequest request)
    {
        var result = await Mediator.Send(new CreateContractProgressCommand(request));
        return Created(string.Empty, result);
    }

    /// <summary>
    /// Add contract progress items in batch
    /// </summary>
    [HttpPost("items/batch")]
    [ProducesResponseType(typeof(AddContractProgressItemsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddProgressItemsBatchAsync([FromBody] AddContractProgressItemsRequest request)
    {
        var result = await Mediator.Send(new AddContractProgressItemsBatchCommand(request));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    /// <summary>
    /// Get yearly summary of contract progress
    /// </summary>
    [HttpGet("yearly-summary/{contractId}")]
    [ProducesResponseType(typeof(YearlySummaryListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetYearlySummaryAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractProgressYearlySummaryQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Create multiple contract progress periods in batch
    /// </summary>
    [HttpPost("batch")]
    [ProducesResponseType(typeof(CreateContractProgressBatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBatchAsync([FromBody] CreateContractProgressBatchRequest request)
    {
        var result = await Mediator.Send(new CreateContractProgressBatchCommand(request));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    /// <summary>
    /// Update an existing contract progress period
    /// </summary>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateContractProgressRequest request)
    {
        await Mediator.Send(new UpdateContractProgressCommand(request));
        return Ok(MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Update contract progress records in batch with smart operations
    /// If Id is null/empty ? Add new
    /// If Id exists with data ? Update
    /// If progress exists in DB but not in request ? Delete
    /// </summary>
    [HttpPut("batch")]
    [ProducesResponseType(typeof(UpdateContractProgressBatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateContractProgressBatchAsync([FromBody] UpdateContractProgressBatchRequest request)
    {
        var result = await Mediator.Send(new UpdateContractProgressBatchCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Delete a contract progress period
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(DeleteContractProgressResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        var result = await Mediator.Send(new DeleteContractProgressCommand(id));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    /// <summary>
    /// Update contract progress items in batch with smart operations
    /// If Id is null/empty ? Add new
    /// If Id exists with data ? Update
    /// If item exists in DB but not in request ? Delete
    /// </summary>
    [HttpPut("items/batch")]
    [ProducesResponseType(typeof(UpdateContractProgressItemsBatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItemsBatchAsync([FromBody] UpdateContractProgressItemsBatchRequest request)
    {
        var result = await Mediator.Send(new UpdateContractProgressItemsBatchCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Get work in progress (Kh?i l�?ng v� Gi� tr? D? dang) for a contract
    /// </summary>
    /// <param name="contractId">Contract identifier</param>
    /// <returns>Work in progress with total amount and executed items</returns>
    [HttpGet("work-in-progress/{contractId}")]
    [ProducesResponseType(typeof(WorkInProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkInProgressAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetWorkInProgressQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Get all contract items by contract ID
    /// </summary>
    /// <param name="contractId">Contract identifier</param>
    /// <returns>List of contract items with material details</returns>
    [HttpGet("items/{contractId}")]
    [ProducesResponseType(typeof(List<ContractItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContractItemsByContractIdAsync(Guid contractId)
    {
        var result = await Mediator.Send(new GetContractItemsByContractIdQuery(contractId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Create a contract progress record with nested items
    /// </summary>
    /// <param name="request">Request with contract ID, period, and progress items</param>
    /// <returns>Response with progress ID and items count</returns>
    [HttpPost("with-items")]
    [ProducesResponseType(typeof(CreateContractProgressWithItemsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateContractProgressWithItemsAsync(
        [FromBody] CreateContractProgressWithItemsRequest request)
    {
        var result = await Mediator.Send(new CreateContractProgressWithItemsCommand(request));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    /// <summary>
    /// Update a contract progress record with nested items
    /// If progress Id is null/empty ? Add new
    /// If progress Id exists ? Update
    /// </summary>
    /// <param name="request">Request with contract ID, progress ID, period, and items</param>
    /// <returns>Response with operation type and items affected</returns>
    [HttpPut("with-items")]
    [ProducesResponseType(typeof(UpdateContractProgressWithItemsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateContractProgressWithItemsAsync(
        [FromBody] UpdateContractProgressWithItemsRequest request)
    {
        var result = await Mediator.Send(new UpdateContractProgressWithItemsCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Get grouped summary by ContractProgressId (quantity and amount)
    /// </summary>
    /// <param name="id">Contract progress identifier</param>
    /// <returns>Grouped summary with total quantity and amount</returns>
    [HttpGet("grouped-summary/{id}")]
    [ProducesResponseType(typeof(ContractProgressGroupedSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGroupedSummaryAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractProgressGroupedSummaryQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }
}
