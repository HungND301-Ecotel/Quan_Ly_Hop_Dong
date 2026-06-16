using Application.Catalog.Level2Codes.Commands;
using Application.Catalog.Level2Codes.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class Level2CodesController : BaseAuthController
{
    [HttpGet("/api/v{version:apiVersion}/level2code/{level1CodeId:guid}")]
    public async Task<IActionResult> GetLevel2CodesByLevel1CodeIdAsync(Guid level1CodeId)
    {
        var result = await Mediator.Send(new GetLevel2CodesByLevel1CodeIdQuery(level1CodeId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllLevel2CodeAsync([FromQuery] string? search)
    {
        IList<Level2CodeDto> result = await Mediator.Send(new GetAllLevel2CodeQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLevel2CodeByIdAsync(Guid id)
    {
        Level2CodeDto? result = await Mediator.Send(new GetLevel2CodeByIdQuery(id));
        if (result == null)
        {
            return NotFound(MessageCommon.DataNotFound);
        }

        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLevel2CodeAsync([FromBody] CreateLevel2CodeRequest createModel)
    {
        Guid result = await Mediator.Send(new CreateLevel2CodeCommand(createModel.Code, createModel.Level1CodeId, createModel.Description));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateLevel2CodeAsync([FromBody] UpdateLevel2CodeRequest updateModel)
    {
        bool result = await Mediator.Send(new UpdateLevel2CodeCommand(updateModel.Id, updateModel.Code, updateModel.Level1CodeId, updateModel.Description));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteLevel2CodeAsync([FromBody] IList<Guid> deleteIds)
    {
        bool result = await Mediator.Send(new DeleteLevel2CodeCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
