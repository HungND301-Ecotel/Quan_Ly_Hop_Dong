using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface ITaxSyncSourceService
{
    Task<IList<ExternalTaxSyncItemDto>> GetTaxesAsync(Guid sourceConnectionId, string contractNumber, DateTime contractDate, CancellationToken cancellationToken = default);
}