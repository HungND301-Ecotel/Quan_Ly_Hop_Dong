using Application.Catalog.UnitOfMeasures.Commands;
using Application.Catalog.UnitOfMeasures.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class UnitOfMeasuresController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllUnitOfMeasureAsync([FromQuery] string? search)
    {
        var result = await Mediator.Send(new GetAllUnitOfMeasureQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUnitOfMeasureByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetUnitOfMeasureByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUnitOfMeasureAsync([FromBody] CreateUnitOfMeasureRequest createModel)
    {
        var result = await Mediator.Send(new CreateUnitOfMeasureCommand(createModel.Code, createModel.Name));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUnitOfMeasureAsync([FromBody] UnitOfMeasureDto updateModel)
    {
        bool result = await Mediator.Send(new UpdateUnitOfMeasureCommand(updateModel.Id, updateModel.Code, updateModel.Name, updateModel.IsActive));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteUnitOfMeasureAsync([FromBody] IList<Guid> deleteIds)
    {
        bool result = await Mediator.Send(new DeleteUnitOfMeasureCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncUnitOfMeasureFromExternalDbAsync([FromBody] SyncExternalSourceRequest request)
    {
        var result = await Mediator.Send(new SyncUnitOfMeasureCommand(request.SourceConnectionId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }
}
