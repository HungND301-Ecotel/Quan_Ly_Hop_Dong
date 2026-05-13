using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Notification.Commands;

public record DeleteNotificationCommand(Guid NotificationId, Guid UserId) : IRequest<Unit>;

public class DeleteNotificationCommandHandler(INotificationService notificationService)
    : IRequestHandler<DeleteNotificationCommand, Unit>
{
    public async Task<Unit> Handle(
        DeleteNotificationCommand request,
        CancellationToken cancellationToken)
    {
        await notificationService.DeleteNotificationAsync(request.NotificationId, request.UserId);
        return Unit.Value;
    }
}
