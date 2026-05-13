using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Notification.Commands;

public record MarkNotificationAsReadCommand(Guid NotificationId, Guid UserId) : IRequest<Unit>;

public class MarkNotificationAsReadCommandHandler(INotificationService notificationService)
    : IRequestHandler<MarkNotificationAsReadCommand, Unit>
{
    public async Task<Unit> Handle(
        MarkNotificationAsReadCommand request,
        CancellationToken cancellationToken)
    {
        await notificationService.MarkAsReadAsync(request.NotificationId, request.UserId);
        return Unit.Value;
    }
}
