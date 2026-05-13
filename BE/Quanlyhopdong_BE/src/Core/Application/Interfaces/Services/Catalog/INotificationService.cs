using Application.Dto.Catalog.Notification;

namespace Application.Interfaces.Services.Catalog;

public interface INotificationService
{
    Task<GetAllNotificationsResponse> GetAllNotificationsAsync(GetAllNotificationsRequest request);
    Task<int> GetUserUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task DeleteNotificationAsync(Guid notificationId, Guid userId);
    Task NotifyContractCreatedAsync(Guid contractId, Guid userId);
    Task NotifyNextSignerAsync(Guid contractId, Guid userId);
    Task NotifyContractRejectedAsync(Guid contractId, Guid userId);
    Task NotifyContractRevisionRequestedAsync(Guid contractId, Guid userId);
    Task NotifyContractSignedAsync(Guid contractId, Guid userId);
    Task NotifyPaymentDueAsync(Guid contractId, List<Guid> userIds, int daysBefore);
    Task NotifyContractExpiringAsync(Guid contractId, List<Guid> userIds, int daysBefore);
    Task NotifySignatureOverdueAsync(Guid contractId, Guid userId, int daysBefore);
}

