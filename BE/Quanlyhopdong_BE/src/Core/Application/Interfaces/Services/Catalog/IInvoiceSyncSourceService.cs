using Application.Dto.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IInvoiceSyncSourceService
{
    Task<IList<ExternalInvoiceSyncItemDto>> GetInvoicesAsync(Guid sourceConnectionId, string contractNumber, DateTime contractDate, CancellationToken cancellationToken = default);
}
