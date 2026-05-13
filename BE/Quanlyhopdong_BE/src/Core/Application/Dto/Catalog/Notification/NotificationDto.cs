using Domain.Common.Enums;

namespace Application.Dto.Catalog.Notification;

/// <summary>
/// DTO for notification
/// </summary>
public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public NotificationType? Type { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public NotificationPriority Priority { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
}

/// <summary>
/// Request for getting all notifications with filtering
/// </summary>
public class GetAllNotificationsRequest
{
    public Guid? UserId { get; set; }
    public bool? IsRead { get; set; }
    public NotificationType? Type { get; set; }
    public NotificationPriority? Priority { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Response for get all notifications
/// </summary>
public class GetAllNotificationsResponse
{
    public List<NotificationDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
