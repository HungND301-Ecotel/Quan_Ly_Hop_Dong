using Application.Common.Exceptions;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Catalog;
using Domain.Entities.Catalog;
using MediatR;

namespace Application.Catalog.ExternalSyncConnections.Commands;

public record UpdateExternalSyncConnectionCommand(UpdateExternalSyncConnectionRequest UpdateModel) : IRequest<bool>;

public class UpdateExternalSyncConnectionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateExternalSyncConnectionCommand, bool>
{
    private readonly IWriteRepository<ExternalSyncConnection> _repo = unitOfWork.GetRepository<ExternalSyncConnection>();

    public async Task<bool> Handle(UpdateExternalSyncConnectionCommand request, CancellationToken cancellationToken)
    {
        if (request.UpdateModel.Connection == null)
        {
            throw new BadRequestException("Connection is required");
        }

        var entity = await _repo.GetFirstOrDefaultAsync(predicate: x => x.Id == request.UpdateModel.Id)
            ?? throw new NotFoundException("External sync connection was not found");

        entity.Update(
            server: request.UpdateModel.Connection.Server,
            port: request.UpdateModel.Connection.Port,
            database: request.UpdateModel.Connection.Database,
            userId: request.UpdateModel.Connection.UserId,
            password: request.UpdateModel.Connection.Password,
            trustServerCertificate: request.UpdateModel.Connection.TrustServerCertificate,
            commandTimeoutSeconds: request.UpdateModel.Connection.CommandTimeoutSeconds,
            isActive: request.UpdateModel.IsActive);

        _repo.Update(entity);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
}
