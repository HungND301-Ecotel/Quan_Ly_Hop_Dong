using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Entities.Identity;

namespace Domain.Entities.Catalog;

public class Notification : AuditableEntity<Guid>
{
    public Guid UserId { get; protected set; }
    public string Title { get; protected set; } = string.Empty;
    public string? Content { get; protected set; }
    public NotificationType? Type { get; protected set; }
    public string? ReferenceType { get; protected set; }
    public Guid? ReferenceId { get; protected set; }
    public NotificationPriority Priority { get; protected set; } = NotificationPriority.Normal;
    public bool IsRead { get; protected set; } = false;
    public DateTimeOffset? ReadAt { get; protected set; }

    // Navigation Properties
    [ForeignKey("UserId")]
    public virtual User User { get; protected set; } = null!;

    public static Notification Create(Guid userId, string title, string? content, NotificationType? type, string? referenceType, Guid? referenceId, NotificationPriority priority, bool isRead)
    {
        return new Notification
        {
            UserId = userId,
            Title = title,
            Content = content,
            Type = type,
            ReferenceType = referenceType,
            Priority = priority,
            IsRead = isRead
        };
    }

    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTimeOffset.UtcNow;
        }
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
    }
}

