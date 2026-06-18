using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog.Notification;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Catalog;

public class NotificationService(IUnitOfWork unitOfWork, ICurrentUser currentUser, IHubContext<NotificationHub> notificationHub, ILogger<NotificationService> logger) : INotificationService
{
    private readonly IWriteRepository<Notification> _notificationRepo = unitOfWork.GetRepository<Notification>();
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<SignedContent> _signedContentRepo = unitOfWork.GetRepository<SignedContent>();
    private readonly IWriteRepository<NotificationConfig> _configRepo = unitOfWork.GetRepository<NotificationConfig>();

    public async Task<GetAllNotificationsResponse> GetAllNotificationsAsync(GetAllNotificationsRequest request)
    {
        try
        {
            // Build predicate
            var predicates = new List<Func<Notification, bool>>();

            if (request.UserId.HasValue)
            {
                predicates.Add(n => n.UserId == request.UserId.Value);
            }

            if (request.IsRead.HasValue)
            {
                predicates.Add(n => n.IsRead == request.IsRead.Value);
            }

            if (request.Type.HasValue)
            {
                predicates.Add(n => n.Type == request.Type.Value);
            }

            if (request.Priority.HasValue)
            {
                predicates.Add(n => n.Priority == request.Priority.Value);
            }

            if (request.FromDate.HasValue)
            {
                predicates.Add(n => n.CreatedOn >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                predicates.Add(n => n.CreatedOn <= request.ToDate.Value);
            }

            // Get all notifications
            var allNotifications = await _notificationRepo.GetAllAsync(disableTracking: true);

            // Apply filters
            var filteredNotifications = allNotifications.AsEnumerable();
            foreach (var predicate in predicates)
            {
                filteredNotifications = filteredNotifications.Where(predicate);
            }

            // Order by CreatedOn descending (newest first)
            var orderedNotifications = filteredNotifications
                .OrderByDescending(n => n.CreatedOn)
                .ToList();

            // Get total count
            var totalCount = orderedNotifications.Count;

            // Apply paging
            var pagedNotifications = orderedNotifications
                .Skip(request.PageIndex * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // Map to DTOs
            var notificationDtos = pagedNotifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Content = n.Content,
                Type = n.Type,
                ReferenceType = n.ReferenceType,
                ReferenceId = n.ReferenceId,
                Priority = n.Priority,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedOn = n.CreatedOn
            }).ToList();

            return new GetAllNotificationsResponse
            {
                Items = notificationDtos,
                TotalCount = totalCount,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting notifications");
            throw;
        }
    }

    public async Task<int> GetUserUnreadCountAsync(Guid userId)
    {
        try
        {
            var unreadNotifications = await _notificationRepo.GetAllAsync(
                predicate: n => n.UserId == userId && !n.IsRead,
                disableTracking: true);

            return unreadNotifications.Count;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting unread count for user {UserId}", userId);
            return 0;
        }
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        try
        {
            var notification = await _notificationRepo.GetFirstOrDefaultAsync(
                predicate: n => n.Id == notificationId && n.UserId == userId,
                disableTracking: false);

            if (notification == null)
            {
                throw new Exception($"Notification {notificationId} not found for user {userId}");
            }

            notification.MarkAsRead();
            await unitOfWork.SaveChangesAsync();

            logger.LogInformation("Notification {NotificationId} marked as read for user {UserId}",
                notificationId, userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
            throw;
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        try
        {
            var unreadNotifications = await _notificationRepo.GetAllAsync(
                predicate: n => n.UserId == userId && !n.IsRead,
                disableTracking: false);

            if (!unreadNotifications.Any())
            {
                logger.LogInformation("No unread notifications for user {UserId}", userId);
                return;
            }

            foreach (var notification in unreadNotifications)
            {
                notification.MarkAsRead();
            }

            await unitOfWork.SaveChangesAsync();

            logger.LogInformation("Marked {Count} notifications as read for user {UserId}",
                unreadNotifications.Count, userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
            throw;
        }
    }

    public async Task DeleteNotificationAsync(Guid notificationId, Guid userId)
    {
        try
        {
            var notification = await _notificationRepo.GetFirstOrDefaultAsync(
                predicate: n => n.Id == notificationId && n.UserId == userId,
                disableTracking: false);

            if (notification == null)
            {
                throw new Exception($"Notification {notificationId} not found for user {userId}");
            }

            _notificationRepo.Delete(notification);
            await unitOfWork.SaveChangesAsync();

            logger.LogInformation("Notification {NotificationId} deleted for user {UserId}",
                notificationId, userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting notification {NotificationId}", notificationId);
            throw;
        }
    }

    public async Task NotifyContractCreatedAsync(Guid contractId, Guid userId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(userId, "Hợp đồng mới cần ký", $"Bạn có hợp đồng mới cần ký: {contract.ContractNumber} - {contractTitle}", NotificationType.ContractCreated, "Contract", contractId, NotificationPriority.High, false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);

    }

    public async Task NotifyContractExpiringAsync(Guid contractId, List<Guid> userIds, int daysBefore)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var listNotification = new List<Notification>();
        foreach (var userId in userIds)
        {
            var notification = Notification.Create(userId, $"Hợp đồng sắp hết hạn (còn {daysBefore} ngày)", $"Hợp đồng {contract.ContractNumber} - {contractTitle} sắp hết hiệu lực vào {contract.CompletionDate:dd/MM/yyyy}", NotificationType.ContractExpiring, "Contract", contractId, NotificationPriority.Normal, false);
            listNotification.Add(notification);
        }
        await _notificationRepo.InsertAsync(listNotification);
        await unitOfWork.SaveChangesAsync();

        // Đẩy thông báo cho từng user
        foreach (var notification in listNotification)
        {
            await SendNotificationToChannelsAsync(notification.UserId, notification);
        }
    }

    public async Task NotifyContractRejectedAsync(Guid contractId, Guid userId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(userId, "Hợp đồng bị từ chối", $"Hợp đồng {contract.ContractNumber} - {contractTitle} đã bị từ chối", NotificationType.ContractReject, "Contract", contractId, NotificationPriority.High, false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);

    }

    public async Task NotifyContractRevisionRequestedAsync(Guid contractId, Guid userId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(userId, "Hợp đồng cần chỉnh sửa", $"Hợp đồng {contract.ContractNumber} - {contractTitle} yêu cầu chỉnh sửa", NotificationType.RevisionRequested, "Contract", contractId, NotificationPriority.High, false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);

    }

    public async Task NotifyContractSignedAsync(Guid contractId, Guid userId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(userId, "Hợp đồng đã hoàn tất ký", $"Hợp đồng {contract.ContractNumber} - {contractTitle} đã được ký hoàn tất", NotificationType.ContractSigned, "Contract", contractId, NotificationPriority.High, false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);

    }

    public async Task NotifyNextSignerAsync(Guid contractId, Guid userId)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(userId, "Đến lượt bạn ký hợp đồng", $"Hợp đồng {contract.ContractNumber} - {contractTitle} đang chờ chữ ký của bạn", NotificationType.SigningTurn, "Contract", contractId, NotificationPriority.High, false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);
    }

    public async Task NotifyPaymentDueAsync(Guid contractId, List<Guid> userIds, int daysBefore)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var listNotification = new List<Notification>();
        foreach (var userId in userIds)
        {
            var notification = Notification.Create(userId, $"Nhắc nhở thanh toán (còn {daysBefore} ngày)", $"Hợp đồng {contract.ContractNumber} - {contractTitle} sắp đến hạn thanh toán", NotificationType.PaymentDue, "Contract", contractId, NotificationPriority.Normal, false);
            listNotification.Add(notification);
        }
        await _notificationRepo.InsertAsync(listNotification);
        await unitOfWork.SaveChangesAsync();

        // Đẩy thông báo cho từng user
        foreach (var notification in listNotification)
        {
            await SendNotificationToChannelsAsync(notification.UserId, notification);
        }
    }

    private async Task SendNotificationToChannelsAsync(Guid userId, Notification notification)
    {
        try
        {
            // 1. LUÔN gửi realtime qua SignalR
            await SendRealtimeNotificationAsync(userId, notification);

            // 2. Kiểm tra config để gửi qua các kênh khác
            //var config = await GetNotificationConfigAsync(notification.Type);

            //if (config != null && config.IsEnabled)
            //{
            //    // Parse danh sách kênh từ config
            //    var channels = config.NotificationChannels?
            //        .Split(',', StringSplitOptions.RemoveEmptyEntries)
            //        .Select(c => c.Trim().ToLower())
            //        .ToList() ?? new List<string>();

            //    // Gửi Email
            //    if (channels.Contains("email"))
            //    {
            //        await SendEmailNotificationAsync(userId, notification);
            //    }

            //    // Gửi SMS
            //    if (channels.Contains("sms"))
            //    {
            //        await SendSmsNotificationAsync(userId, notification);
            //    }

            //    // Gửi Push Notification (FCM, APNs)
            //    if (channels.Contains("push"))
            //    {
            //        await SendPushNotificationAsync(userId, notification);
            //    }
            //}
        }
        catch (Exception ex)
        {
            // Log error nhưng không throw để không ảnh hưởng flow chính
            // Có thể dùng ILogger ở đây
            Console.WriteLine($"Error sending notifications: {ex.Message}");
        }
    }

    private async Task SendRealtimeNotificationAsync(Guid userId, Notification notification)
    {
        try
        {
            // Tạo DTO để gửi cho client
            var notificationDto = new
            {
                id = notification.Id,
                userId = notification.UserId,
                title = notification.Title,
                content = notification.Content,
                type = notification.Type?.ToString(),
                referenceType = notification.ReferenceType,
                referenceId = notification.ReferenceId,
                priority = notification.Priority.ToString(),
                isRead = notification.IsRead,
                createdAt = notification.CreatedOn
            };

            // Gửi đến user cụ thể (bằng UserId)
            await notificationHub.Clients
                .User(userId.ToString())
                .SendAsync("ReceiveNotification", notificationDto);

            logger.LogInformation($"✓ Realtime notification sent to user {userId}");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"✗ Error sending realtime notification to user {userId}: {ex.Message}");
        }
    }

    public async Task NotifySignatureOverdueAsync(Guid contractId, Guid userId, int daysBefore)
    {
        var contract = await _contractRepo.FindAsync(contractId);
        if (contract == null)
        {
            return;
        }

        var contractTitle = await GetContractDisplayTitleAsync(contract.SignedContentId, contract.ContractNumber);

        var notification = Notification.Create(
            userId,
            $"Nhắc nhở ký hợp đồng (đã quá {daysBefore} ngày)",
            $"Hợp đồng {contract.ContractNumber} - {contractTitle} đang chờ chữ ký của bạn. Vui lòng kiểm tra và ký sớm.",
            NotificationType.SigningDue,
            "Contract",
            contractId,
            NotificationPriority.High,
            false);

        await _notificationRepo.InsertAsync(notification);
        await unitOfWork.SaveChangesAsync();

        await SendNotificationToChannelsAsync(userId, notification);
    }

    private async Task<string> GetContractDisplayTitleAsync(Guid? signedContentId, string fallback)
    {
        if (!signedContentId.HasValue)
        {
            return fallback;
        }

        var signedContent = await _signedContentRepo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == signedContentId.Value,
            disableTracking: true);

        if (signedContent == null || string.IsNullOrWhiteSpace(signedContent.Title))
        {
            return fallback;
        }

        return signedContent.Title;
    }
}

