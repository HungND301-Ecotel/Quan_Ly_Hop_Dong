using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level1Codes.Commands;

public record DeleteLevel1CodeCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteLevel1CodeCommandHandler(ILevel1CodeService level1CodeService) : IRequestHandler<DeleteLevel1CodeCommand, bool>
{
    public async Task<bool> Handle(DeleteLevel1CodeCommand request, CancellationToken cancellationToken)
    {
        return await level1CodeService.DeleteAsync(request.DeleteIds);
    }
}
