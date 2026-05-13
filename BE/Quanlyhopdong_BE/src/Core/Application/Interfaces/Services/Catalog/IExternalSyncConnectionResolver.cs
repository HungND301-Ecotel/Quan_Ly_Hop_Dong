using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IExternalSyncConnectionResolver
{
    Task<DatabaseConnectionOptions> ResolveAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default);
}