using Application.Catalog.ContractProgress.Commands;
using Application.Catalog.ContractProgress.Queries;
using Application.Dto.Catalog.ContractProgress;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractProgressItemController : BaseAuthController
{
    /// <summary>
    /// Get contract progress item detail by ID
    /// </summary>
    /// <param name="id">Progress item identifier</param>
    /// <returns>Progress item detail with material and execution information</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContractProgressItemDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetProgressItemByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Update a single contract progress item
    /// </summary>
    /// <param name="request">Request containing item ID and new executed quantity</param>
    /// <returns>Updated progress item response</returns>
    [HttpPut]
    [ProducesResponseType(typeof(UpdateSingleProgressItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateSingleProgressItemRequest request)
    {
        var result = await Mediator.Send(new UpdateProgressItemCommand(request));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Delete a single contract progress item
    /// </summary>
    /// <param name="id">Progress item identifier</param>
    /// <returns>Delete response with success status</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(DeleteContractProgressItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        var result = await Mediator.Send(new DeleteProgressItemCommand(id));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
