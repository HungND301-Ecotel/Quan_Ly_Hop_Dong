using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Domain.Entities.Catalog;
using MediatR;

namespace Application.Catalog.ExternalSyncConnections.Queries;

public record GetAllExternalSyncConnectionQuery(string? Search) : IRequest<IList<ExternalSyncConnectionDto>>;

public class GetAllExternalSyncConnectionQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAllExternalSyncConnectionQuery, IList<ExternalSyncConnectionDto>>
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<IList<ExternalSyncConnectionDto>> Handle(GetAllExternalSyncConnectionQuery request, CancellationToken cancellationToken)
    {
        string search = request.Search?.Trim() ?? string.Empty;
        var entities = await _repo.GetAllAsync(
            predicate: x => string.IsNullOrEmpty(search)
                || x.Server.Contains(search)
                || x.Database.Contains(search),
            disableTracking: true);

        return entities
            .Select(x => new ExternalSyncConnectionDto
            {
                Id = x.Id,
                Connection = new DatabaseConnectionOptions
                {
                    Server = x.Server,
                    Port = x.Port,
                    Database = x.Database,
                    UserId = x.UserId,
                    Password = x.Password,
                    TrustServerCertificate = x.TrustServerCertificate,
                    CommandTimeoutSeconds = x.CommandTimeoutSeconds
                },
                IsActive = x.IsActive
            })
            .ToList();
    }
}
