using Application.Catalog.Contracts.Queries;
using Application.Catalog.ContractTypes.Commands;
using Application.Catalog.ContractTypes.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractTypeController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllContractTypeAsync()
    {
        var result = await Mediator.Send(new GetAllContractTypeQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractTypeByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractTypeByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContractTypeAsync([FromBody] CreateContractTypeDto createModel)
    {
        var result = await Mediator.Send(new CreateContractTypeCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateContractTypeAsync([FromBody] ContractTypeDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractTypeCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteContractTypeListAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteContractTypeListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
