using Application.Catalog.ContractNumber.Commands;
using Application.Catalog.ContractNumber.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractNumberController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractNumberAsync()
    {
        var result = await Mediator.Send(new GetAllContractNumberQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractNumberByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractNumberByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContractNumberCommand(CreateContractNumberDto createModel)
    {
        var result = await Mediator.Send(new CreateContractNumberCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateContractNumberCommand(ContractNumberDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractNumberCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractNumberListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteContractNumberListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
