using Domain.Common.Contracts;
using Domain.Common.Enums;

namespace Domain.Entities.Catalog;

public class NotificationConfig : AuditableEntity<Guid>
{
    public NotificationEventType EventType { get; protected set; }
    public int DaysBefore { get; protected set; }
    public bool IsEnabled { get; protected set; } = true;

    protected NotificationConfig() { }

    public static NotificationConfig Create(
        NotificationEventType eventType,
        int daysBefore,
        bool isEnabled = true)
    {
        if (daysBefore < 0)
        {
            throw new ArgumentException("Days before must be non-negative");
        }

        return new NotificationConfig
        {
            EventType = eventType,
            DaysBefore = daysBefore,
            IsEnabled = isEnabled
        };
    }

    public void UpdateSettings(int daysBefore, bool isEnabled)
    {
        if (daysBefore < 0)
        {
            throw new ArgumentException("Days before must be non-negative");
        }

        DaysBefore = daysBefore;
        IsEnabled = isEnabled;
    }
}

