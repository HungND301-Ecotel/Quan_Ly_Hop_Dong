using Application.Catalog.ContractStructureCatalogs.Commands;
using Application.Catalog.ContractStructureCatalogs.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class ContractStructureCatalogController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] string? search, [FromQuery] bool? isActive)
    {
        var result = await Mediator.Send(new GetAllContractStructureCatalogQuery(search, isActive));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetContractStructureCatalogByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateContractStructureCatalogRequest createModel)
    {
        var result = await Mediator.Send(new CreateContractStructureCatalogCommand(createModel.Name, createModel.Code, createModel.Description, createModel.IsActive ?? true));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAsync([FromBody] ContractStructureCatalogDto updateModel)
    {
        var result = await Mediator.Send(new UpdateContractStructureCatalogCommand(updateModel.Id, updateModel.Name, updateModel.Code, updateModel.Description, updateModel.IsActive));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        var result = await Mediator.Send(new DeleteContractStructureCatalogCommand(id));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
