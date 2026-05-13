using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Domain.Entities.Catalog;
using MediatR;

namespace Application.Catalog.ExternalSyncConnections.Queries;

public record GetExternalSyncConnectionByIdQuery(Guid Id) : IRequest<ExternalSyncConnectionDto>;

public class GetExternalSyncConnectionByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetExternalSyncConnectionByIdQuery, ExternalSyncConnectionDto>
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<ExternalSyncConnectionDto> Handle(GetExternalSyncConnectionByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repo.GetFirstOrDefaultAsync(
            predicate: x => x.Id == request.Id,
            disableTracking: true) ?? throw new NotFoundException("External sync connection was not found");

        return new ExternalSyncConnectionDto
        {
            Id = entity.Id,
            Connection = new DatabaseConnectionOptions
            {
                Server = entity.Server,
                Port = entity.Port,
                Database = entity.Database,
                UserId = entity.UserId,
                Password = entity.Password,
                TrustServerCertificate = entity.TrustServerCertificate,
                CommandTimeoutSeconds = entity.CommandTimeoutSeconds
            },
            IsActive = entity.IsActive
        };
    }
}
