using Application.Catalog.ExternalSyncConnections.Commands;
using Application.Catalog.ExternalSyncConnections.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ExternalSyncConnectionsController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllExternalSyncConnectionsAsync([FromQuery] string? search)
    {
        var result = await Mediator.Send(new GetAllExternalSyncConnectionQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExternalSyncConnectionByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetExternalSyncConnectionByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExternalSyncConnectionAsync([FromBody] CreateExternalSyncConnectionRequest createModel)
    {
        var result = await Mediator.Send(new CreateExternalSyncConnectionCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateExternalSyncConnectionAsync([FromBody] UpdateExternalSyncConnectionRequest updateModel)
    {
        bool result = await Mediator.Send(new UpdateExternalSyncConnectionCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteExternalSyncConnectionAsync([FromBody] IList<Guid> deleteIds)
    {
        bool result = await Mediator.Send(new DeleteExternalSyncConnectionCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
