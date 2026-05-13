using Application.Catalog.Position.Queries;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class PositionController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetAllPartnerAsync()
    {
        var result = await Mediator.Send(new GetAllPositionQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }
}
