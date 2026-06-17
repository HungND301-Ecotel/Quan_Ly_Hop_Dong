using Application.Catalog.ContractAppendix.Commands;
using Application.Catalog.ContractAppendix.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractAppendixController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractAppendixAsync()
    {
        var result = await Mediator.Send(new GetAllContractAppendixQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractAppendixByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractAppendixByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContractAppendixCommand(CreateContractAppendixDto createModel)
    {
        var result = await Mediator.Send(new CreateContractAppendixCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateContractAppendixCommand(ContractAppendixDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractAppendixCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractAppendixListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteContractAppendixListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
