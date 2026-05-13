using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Domain.Entities.Catalog;
using MediatR;

namespace Application.Catalog.ExternalSyncConnections.Commands;

public record CreateExternalSyncConnectionCommand(CreateExternalSyncConnectionRequest CreateModel) : IRequest<Guid>;

public class CreateExternalSyncConnectionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateExternalSyncConnectionCommand, Guid>
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<Guid> Handle(CreateExternalSyncConnectionCommand request, CancellationToken cancellationToken)
    {
        if (request.CreateModel.Connection == null)
        {
            throw new BadRequestException("Connection is required");
        }

        var entity = ExternalSyncConnection.Create(
            server: request.CreateModel.Connection.Server,
            port: request.CreateModel.Connection.Port,
            database: request.CreateModel.Connection.Database,
            userId: request.CreateModel.Connection.UserId,
            password: request.CreateModel.Connection.Password,
            trustServerCertificate: request.CreateModel.Connection.TrustServerCertificate,
            commandTimeoutSeconds: request.CreateModel.Connection.CommandTimeoutSeconds,
            isActive: request.CreateModel.IsActive);

        await _repo.InsertAsync(entity);
        await unitOfWork.SaveChangesAsync();
        return entity.Id;
    }
}
