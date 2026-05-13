using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Commands;

public record DeleteUnitOfMeasureCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteUnitOfMeasureCommandHandler(IUnitOfMeasureService service)
    : IRequestHandler<DeleteUnitOfMeasureCommand, bool>
{
    public async Task<bool> Handle(DeleteUnitOfMeasureCommand request, CancellationToken cancellationToken)
    {
        foreach (var id in request.DeleteIds)
        {
            await service.DeleteAsync(id);
        }
        return true;
    }
}
