using Application.Catalog.Contracts.Commands;
using Application.Catalog.Contracts.Queries;
using Application.Dto.Catalog;
using Domain.Common.Enums;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class DashboardController : BaseAuthController
{
    [HttpGet("dashboard/statistics")]
    public async Task<IActionResult> GetContractDashboardAsync([FromQuery] ContractFormat? contractFormat = null)
    {
        var result = await Mediator.Send(new GetContractDashboardQuery(contractFormat));
        return Ok(result, MessageCommon.GetDataSuccess);
    }
}

