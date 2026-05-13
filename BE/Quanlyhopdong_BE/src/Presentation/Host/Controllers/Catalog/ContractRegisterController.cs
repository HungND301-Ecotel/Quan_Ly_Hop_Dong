using Application.Catalog.ContractRegister.Commands;
using Application.Catalog.ContractRegister.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractRegisterController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractRegisterAsync()
    {
        var result = await Mediator.Send(new GetAllContractRegisterQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractRegisterByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractRegisterByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContractRegisterCommand(CreateContractRegisterDto createModel)
    {
        var result = await Mediator.Send(new CreateContractRegisterCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateContractRegisterCommand(ContractRegisterDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractRegisterCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractRegisterListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteContractRegisterListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
