using Application.Catalog.Users.Commands;
using Application.Catalog.Users.Queries;
using Application.Dto.Catalog;
using Application.Dto.Persistence.Catalog.User;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class UserController : BaseAuthController
{
    [HttpGet]
    public async Task<IActionResult> GetUsersAsync()
    {
        var result = await Mediator.Send(new GetAllUsersQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("{userId:Guid}")]
    public async Task<IActionResult> GetUserByIdAsync([FromRoute] Guid userId)
    {
        var result = await Mediator.Send(new GetUserByIdQuery(userId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpGet("permission")]
    public async Task<IActionResult> GetCurrentUserPermissionAsync()
    {
        var result = await Mediator.Send(new GetCurrentUserPermissionQuery());
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost("create")]
    [OpenApiOperation("Create new account except for doctor account")]
    public async Task<IActionResult> CreateUserAsync([FromBody] CreateNewAccountInput account)
    {
        var result = await Mediator.Send(new CreateNewAccountCommand(account));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPost("send-bulk-account")]
    public async Task<IActionResult> SendBulkAccountEmailAsync([FromBody] IList<Guid> userIds)
    {
        var result = await Mediator.Send(new SendUserPasswordAccountEmailCommand(userIds));
        return Ok(result, MessageCommon.DoTaskSuccess);
    }

    [HttpPut("Update")]
    public async Task<IActionResult> UpdateUserAsync([FromBody] UpdateUserInfoInput updateUser)
    {
        var result = await Mediator.Send(new UpdateUserCommand(updateUser));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete("{userId}")]
    [OpenApiOperation("delete user with id = userId")]
    public async Task<IActionResult> DeleteUserAsync([FromRoute] Guid userId)
    {
        var result = await Mediator.Send(new DeleteUserCommand(userId));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpDelete]
    [OpenApiOperation("delete user with id = userId")]
    public async Task<IActionResult> DeleteUserListAsync([FromBody] IList<Guid> deleteIds)
    {
        var result = await Mediator.Send(new DeleteUserListCommand(deleteIds));
        return Ok(result, MessageCommon.DeleteSuccess);
    }

    [HttpPost("change-password")]
    [OpenApiOperation("Change password of current user")]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] UpdatePasswordCommand request)
    {
        var result = await Mediator.Send(request);
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpGet("{userId}/signatures")]
    public async Task<IActionResult> GetCurrentUserSignaturesAsync(Guid userId)
    {
        var result = await Mediator.Send(new GetUserSignaturesQuery(userId));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    [HttpPost("{userId}/signatures")]
    public async Task<IActionResult> CreateSignatureAsync(Guid userId, [FromForm] CreateUserSignatureDto request)
    {
        var result = await Mediator.Send(new CreateUserSignatureCommand(userId, request));
        return Ok(result, MessageCommon.CreateSuccess);
    }

    [HttpPut("{userId}/signatures/{signatureId}")]
    public async Task<IActionResult> SetStatusSignatureAsync(Guid userId, Guid signatureId, [FromBody] bool status)
    {
        var result = await Mediator.Send(new SetStatusUserSignatureCommand(userId, signatureId, status));
        return Ok(result, MessageCommon.UpdateSuccess);
    }

    [HttpDelete("{userId}/signatures/{signatureId}")]
    public async Task<IActionResult> DeleteSignatureAsync(Guid userId, Guid signatureId)
    {
        var result = await Mediator.Send(new DeleteSignatureCommand(userId, signatureId));
        return Ok(result, MessageCommon.UpdateSuccess);
    }
}
