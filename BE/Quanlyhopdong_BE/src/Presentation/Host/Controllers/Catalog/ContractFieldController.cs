using Application.Catalog.ContractFields.Commands;
using Application.Catalog.ContractFields.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractFieldController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractFieldAsync()
    {
        var result = await Mediator.Send(new GetAllContractFieldQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractFieldByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractFieldByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContractFieldAsync([FromBody] CreateContractFieldDto createModel)
    {
        var result = await Mediator.Send(new CreateContractFieldCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateContractFieldAsync([FromBody] ContractFieldDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractFieldCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractFieldListAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteContractFieldListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
