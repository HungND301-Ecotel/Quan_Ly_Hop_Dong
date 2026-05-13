using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IMaterialSyncSourceService
{
    Task<IList<ExternalMaterialSyncItemDto>> GetMaterialsAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default);
}