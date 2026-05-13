using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Commands;

public record DeleteLevel3CodeCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteLevel3CodeCommandHandler(ILevel3CodeService level3CodeService) : IRequestHandler<DeleteLevel3CodeCommand, bool>
{
    public async Task<bool> Handle(DeleteLevel3CodeCommand request, CancellationToken cancellationToken)
    {
        return await level3CodeService.DeleteAsync(request.DeleteIds);
    }
}
