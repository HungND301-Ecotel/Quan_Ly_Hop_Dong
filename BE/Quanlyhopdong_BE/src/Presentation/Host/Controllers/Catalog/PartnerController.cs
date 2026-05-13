using Application.Catalog.Partner.Commands;
using Application.Catalog.Partner.Queries;
using Application.Dto.Catalog;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class PartnerController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllPartnerAsync([FromQuery] string? search)
    {
        var result = await Mediator.Send(new GetAllPartnerQuery(search));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPartnerByIdAsync(Guid id)
    {
        var result = await Mediator.Send(new GetPartnerByIdQuery(id));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePartnerAsync([FromBody] CreatePartnerDto createModel)
    {
        var result = await Mediator.Send(new CreatePartnerCommand(createModel));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePartnerAsync([FromBody] PartnerDto updateModel)
    {
        var result = await Mediator.Send(new UpdatePartnerCommand(updateModel));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete]
    public async Task<IActionResult> DeletePartnerListAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeletePartnerCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }
}
