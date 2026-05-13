using Application.Catalog.Department.Commands;
using Application.Catalog.Department.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class DepartmentController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllDepartmentAsync([FromQuery] string? search)
    {
        var result = await Mediator.Send(new GetAllDepartmentQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDepartmentIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetDepartmentByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDepartmentAsync([FromBody] CreateDepartmentDto createModel)
    {
        var result = await Mediator.Send(new CreateDepartmentCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateDepartmentAsync([FromBody] DepartmentDto updateModel)
    {
        var result = await Mediator.Send(new UpdateDepartmentCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }


    [HttpDelete]
    public async Task<IActionResult> DeleteDepartmentListAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteDepartmentCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
