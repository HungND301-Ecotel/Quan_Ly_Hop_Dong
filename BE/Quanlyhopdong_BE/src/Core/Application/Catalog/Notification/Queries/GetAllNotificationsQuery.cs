using Application.Dto.Catalog.Notification;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Notification.Queries;

public record GetAllNotificationsQuery(GetAllNotificationsRequest Request) 
    : IRequest<GetAllNotificationsResponse>;

public class GetAllNotificationsQueryHandler(INotificationService notificationService)
    : IRequestHandler<GetAllNotificationsQuery, GetAllNotificationsResponse>
{
    public async Task<GetAllNotificationsResponse> Handle(
        GetAllNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        return await notificationService.GetAllNotificationsAsync(request.Request);
    }
}
