using Application.Catalog.Notification.Commands;
using Application.Catalog.Notification.Queries;
using Application.Dto.Catalog.Notification;
using Domain.Common.Enums;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Shared.Constants;

namespace Host.Controllers.Catalog;

public class NotificationController : BaseAuthController
{
    [HttpGet]
    [ProducesResponseType(typeof(GetAllNotificationsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllNotificationsAsync(
        [FromQuery] Guid? userId,
        [FromQuery] bool? isRead,
        [FromQuery] NotificationType? type,
        [FromQuery] NotificationPriority? priority,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20)
    {
        var request = new GetAllNotificationsRequest
        {
            UserId = userId,
            IsRead = isRead,
            Type = type,
            Priority = priority,
            FromDate = fromDate,
            ToDate = toDate,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        var result = await Mediator.Send(new GetAllNotificationsQuery(request));
        return Ok(result, MessageCommon.GetDataSuccess);
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{notificationId}/mark-as-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsReadAsync(Guid notificationId, [FromQuery] Guid userId)
    {
        await Mediator.Send(new MarkNotificationAsReadCommand(notificationId, userId));
        return Ok(MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Mark all notifications as read for a user
    /// </summary>
    [HttpPut("mark-all-as-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsReadAsync([FromQuery] Guid userId)
    {
        await Mediator.Send(new MarkAllNotificationsAsReadCommand(userId));
        return Ok(MessageCommon.UpdateSuccess);
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{notificationId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNotificationAsync(Guid notificationId, [FromQuery] Guid userId)
    {
        await Mediator.Send(new DeleteNotificationCommand(notificationId, userId));
        return Ok(MessageCommon.DeleteSuccess);
    }
}

