using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Entities.Catalog;

namespace Infrastructure.Services.Catalog;

public class ExternalSyncConnectionResolverService(IUnitOfWork unitOfWork) : IExternalSyncConnectionResolver
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<DatabaseConnectionOptions> ResolveAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default)
    {
        if (sourceConnectionId == Guid.Empty)
        {
            throw new BadRequestException("SourceConnectionId is required");
        }

        ExternalSyncConnection? source = await _repo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == sourceConnectionId,
            disableTracking: true);

        if (source == null)
        {
            throw new NotFoundException($"External sync connection '{sourceConnectionId}' was not found");
        }

        if (!source.IsActive)
        {
            throw new BadRequestException($"External sync connection '{sourceConnectionId}' is inactive");
        }

        if (string.IsNullOrWhiteSpace(source.Server))
        {
            throw new BadRequestException($"External sync connection '{sourceConnectionId}' has no server");
        }

        if (string.IsNullOrWhiteSpace(source.Database))
        {
            throw new BadRequestException($"External sync connection '{sourceConnectionId}' has no database");
        }

        if (string.IsNullOrWhiteSpace(source.UserId))
        {
            throw new BadRequestException($"External sync connection '{sourceConnectionId}' has no user id");
        }

        return new DatabaseConnectionOptions
        {
            Server = source.Server,
            Port = source.Port,
            Database = source.Database,
            UserId = source.UserId,
            Password = source.Password,
            TrustServerCertificate = source.TrustServerCertificate,
            CommandTimeoutSeconds = source.CommandTimeoutSeconds
        };
    }
}