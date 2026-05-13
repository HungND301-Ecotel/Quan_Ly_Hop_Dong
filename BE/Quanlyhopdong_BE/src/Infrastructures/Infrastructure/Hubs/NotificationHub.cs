using Application.Interfaces.Services.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Hubs;

[Authorize]
public class NotificationHub(INotificationService _notificationService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value
                     ?? Context.User?.FindFirst("userId")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        var unreadCount = await _notificationService.GetUserUnreadCountAsync(Guid.Parse(userId!));
        await Clients.Caller.SendAsync("UpdateUnreadCount", unreadCount);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value
                     ?? Context.User?.FindFirst("userId")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<object> GetNotifications(int pageNumber = 1, int pageSize = 20)
    {
        var userId = Guid.Parse(Context.UserIdentifier!);
        var request = new Application.Dto.Catalog.Notification.GetAllNotificationsRequest
        {
            UserId = userId,
            PageIndex = pageNumber - 1, // Convert to 0-based index
            PageSize = pageSize
        };
        var result = await _notificationService.GetAllNotificationsAsync(request);
        return result;
    }

    public async Task MarkAsRead(Guid notificationId)
    {
        try
        {
            var userId = Guid.Parse(Context.UserIdentifier!);
            await _notificationService.MarkAsReadAsync(notificationId, userId);

            // Notify client that notification was marked as read
            await Clients.Caller.SendAsync("NotificationMarkedAsRead", notificationId);

            // Update unread count
            var unreadCount = await _notificationService.GetUserUnreadCountAsync(userId);
            await Clients.Caller.SendAsync("UpdateUnreadCount", unreadCount);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task MarkAllAsRead()
    {
        try
        {
            var userId = Guid.Parse(Context.UserIdentifier!);
            await _notificationService.MarkAllAsReadAsync(userId);

            // Notify client that all notifications were marked as read
            await Clients.Caller.SendAsync("AllNotificationsMarkedAsRead");

            // Update unread count to 0
            await Clients.Caller.SendAsync("UpdateUnreadCount", 0);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task DeleteNotification(Guid notificationId)
    {
        try
        {
            var userId = Guid.Parse(Context.UserIdentifier!);
            await _notificationService.DeleteNotificationAsync(notificationId, userId);

            // Notify client that notification was deleted
            await Clients.Caller.SendAsync("NotificationDeleted", notificationId);

            // Update unread count
            var unreadCount = await _notificationService.GetUserUnreadCountAsync(userId);
            await Clients.Caller.SendAsync("UpdateUnreadCount", unreadCount);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task TestMe(string someRandomText)
    {
        await Clients.All.SendAsync(
            $"ReceiveTest : {someRandomText}",
            CancellationToken.None);
    }
}
