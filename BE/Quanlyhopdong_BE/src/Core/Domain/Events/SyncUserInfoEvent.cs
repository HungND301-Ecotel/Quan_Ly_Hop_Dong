using Domain.Common.Contracts;

namespace Domain.Events;

public class SyncUserInfoEvent(Guid userId) : DomainEvent
{
    public Guid UserId { get; private set; } = userId;
}