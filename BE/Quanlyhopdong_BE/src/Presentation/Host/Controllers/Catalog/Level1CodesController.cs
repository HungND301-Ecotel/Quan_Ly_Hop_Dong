using Application.Catalog.Level1Codes.Commands;
using Application.Catalog.Level1Codes.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class Level1CodesController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllLevel1CodeAsync([FromQuery] string? search)
    {
        var result = await Mediator.Send(new GetAllLevel1CodeQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLevel1CodeByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetLevel1CodeByIdQuery(id));
        if (result == null)
        {
            return NotFound(MessageCommon.DataNotFound);
        }
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLevel1CodeAsync([FromBody] CreateLevel1CodeRequest createModel)
    {
        var result = await Mediator.Send(new CreateLevel1CodeCommand(
            createModel.Code,
            createModel.ContractTypeId,
            createModel.ContractRegisterId,
            createModel.Description));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateLevel1CodeAsync([FromBody] UpdateLevel1CodeRequest updateModel)
    {
        var result = await Mediator.Send(new UpdateLevel1CodeCommand(
            updateModel.Id,
            updateModel.Code,
            updateModel.ContractTypeId,
            updateModel.ContractRegisterId,
            updateModel.Description));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteLevel1CodeAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteLevel1CodeCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
