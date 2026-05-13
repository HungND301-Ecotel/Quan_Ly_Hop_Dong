using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Hubs;

internal static class Startup
{
    internal static IServiceCollection AddHubs(this IServiceCollection services)
    {
        services.AddSignalR();
        return services;
    }

    internal static HubEndpointConventionBuilder MapNotificationHubsWithAuth(
            this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapHub<NotificationHub>("/notificationHub");
    }

    internal static IApplicationBuilder UseWebSocketHub(this IApplicationBuilder app) =>
        app.UseWebSockets();
}