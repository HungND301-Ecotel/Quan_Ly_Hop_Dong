using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Commands;

public record DeleteLevel2CodeCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteLevel2CodeCommandHandler(ILevel2CodeService level2CodeService) : IRequestHandler<DeleteLevel2CodeCommand, bool>
{
    public async Task<bool> Handle(DeleteLevel2CodeCommand request, CancellationToken cancellationToken)
    {
        return await level2CodeService.DeleteAsync(request.DeleteIds);
    }
}
