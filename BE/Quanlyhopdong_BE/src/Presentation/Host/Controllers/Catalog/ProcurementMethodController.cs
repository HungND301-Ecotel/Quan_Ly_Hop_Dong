using Application.Catalog.ProcurementMethod.Commands;
using Application.Catalog.ProcurementMethod.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ProcurementMethodController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllProcurementMethodAsync()
    {
        var result = await Mediator.Send(new GetAllProcurementMethodQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProcurementMethodByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetProcurementMethodByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProcurementMethodCommand(CreateProcurementMethodDto createModel)
    {
        var result = await Mediator.Send(new CreateProcurementMethodCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProcurementMethodCommand(ProcurementMethodDto updateModel)
    {
        var result = await Mediator.Send(new UpdateProcurementMethodCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteProcurementMethodListCommand(List<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteProcurementMethodCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
