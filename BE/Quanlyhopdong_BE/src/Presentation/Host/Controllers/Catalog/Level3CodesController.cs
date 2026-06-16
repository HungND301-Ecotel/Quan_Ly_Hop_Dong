using Application.Catalog.Level3Codes.Commands;
using Application.Catalog.Level3Codes.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class Level3CodesController : BaseAuthController
{
    [HttpGet("/api/v{version:apiVersion}/level3code/{level1CodeId:guid}")]
    public async Task<IActionResult> GetLevel3CodesByLevel1CodeIdAsync(Guid level1CodeId)
    {
        var result = await Mediator.Send(new GetLevel3CodesByLevel1CodeIdQuery(level1CodeId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllLevel3CodeAsync([FromQuery] string? search)
    {
        IList<Level3CodeDto> result = await Mediator.Send(new GetAllLevel3CodeQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLevel3CodeByIdAsync(Guid id)
    {
        Level3CodeDto? result = await Mediator.Send(new GetLevel3CodeByIdQuery(id));
        if (result == null)
        {
            return NotFound(MessageCommon.DataNotFound);
        }

        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLevel3CodeAsync([FromBody] CreateLevel3CodeRequest createModel)
    {
        Guid result = await Mediator.Send(new CreateLevel3CodeCommand(createModel.Code, createModel.Level1CodeId, createModel.Level2CodeId, createModel.Description));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateLevel3CodeAsync([FromBody] UpdateLevel3CodeRequest updateModel)
    {
        bool result = await Mediator.Send(new UpdateLevel3CodeCommand(updateModel.Id, updateModel.Code, updateModel.Level1CodeId, updateModel.Level2CodeId, updateModel.Description));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteLevel3CodeAsync([FromBody] IList<Guid> deleteIds)
    {
        bool result = await Mediator.Send(new DeleteLevel3CodeCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
