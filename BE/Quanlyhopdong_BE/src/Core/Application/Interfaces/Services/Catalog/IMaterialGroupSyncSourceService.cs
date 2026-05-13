using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IMaterialGroupSyncSourceService
{
    Task<IList<ExternalMaterialGroupSyncItemDto>> GetMaterialGroupsAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default);
}