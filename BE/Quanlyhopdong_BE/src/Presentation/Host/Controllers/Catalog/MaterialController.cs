using Application.Catalog.Material.Commands;
using Application.Catalog.Material.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class MaterialController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllMaterialAsync(
        [FromQuery] bool IsOtherMaterial = false,
        [FromQuery] int? pageNumber = null,
        [FromQuery] int? pageSize = null,
        [FromQuery] string? keyword = null)
    {
        var result = await Mediator.Send(new GetAllMaterialQuery(IsOtherMaterial, pageNumber, pageSize, keyword));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMaterialByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetMaterialByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMaterialCommand(CreateMaterialDto createModel)
    {
        var result = await Mediator.Send(new CreateMaterialCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMaterialCommand(MaterialDto updateModel)
    {
        var result = await Mediator.Send(new UpdateMaterialCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMaterialListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteMaterialListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncMaterialFromExternalDbAsync([FromBody] SyncExternalSourceRequest request)
    {
        var result = await Mediator.Send(new SyncMaterialCommand(request.SourceConnectionId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }
}
