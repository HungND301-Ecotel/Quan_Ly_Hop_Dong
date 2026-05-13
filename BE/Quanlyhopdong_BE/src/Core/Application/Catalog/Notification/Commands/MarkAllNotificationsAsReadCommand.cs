using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Notification.Commands;

public record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<Unit>;

public class MarkAllNotificationsAsReadCommandHandler(INotificationService notificationService)
    : IRequestHandler<MarkAllNotificationsAsReadCommand, Unit>
{
    public async Task<Unit> Handle(
        MarkAllNotificationsAsReadCommand request,
        CancellationToken cancellationToken)
    {
        await notificationService.MarkAllAsReadAsync(request.UserId);
        return Unit.Value;
    }
}
