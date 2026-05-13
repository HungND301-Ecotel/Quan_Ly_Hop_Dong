using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IUnitOfMeasureSyncSourceService
{
    Task<IList<ExternalUnitOfMeasureSyncItemDto>> GetUnitOfMeasuresAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default);
}