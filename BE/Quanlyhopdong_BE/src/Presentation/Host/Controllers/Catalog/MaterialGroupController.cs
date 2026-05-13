using Application.Catalog.MaterialGroup.Commands;
using Application.Catalog.MaterialGroup.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class MaterialGroupController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllMaterialGroupAsync()
    {
        var result = await Mediator.Send(new GetAllMaterialGroupQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMaterialGroupByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetMaterialGroupByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMaterialGroupCommand(CreateMaterialGroupDto createModel)
    {
        var result = await Mediator.Send(new CreateMaterialGroupCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMaterialGroupCommand(MaterialGroupDto updateModel)
    {
        var result = await Mediator.Send(new UpdateMaterialGroupCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMaterialGroupListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteMaterialGroupCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncMaterialGroupFromExternalDbAsync([FromBody] SyncExternalSourceRequest request)
    {
        var result = await Mediator.Send(new SyncMaterialGroupCommand(request.SourceConnectionId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }
}
