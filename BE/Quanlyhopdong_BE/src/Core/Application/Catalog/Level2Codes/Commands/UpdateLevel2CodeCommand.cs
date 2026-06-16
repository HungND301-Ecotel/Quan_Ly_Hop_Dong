using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Commands;

public record UpdateLevel2CodeCommand(Guid Id, string Code, Guid Level1CodeId, string? Description = null) : IRequest<bool>;

public class UpdateLevel2CodeCommandHandler(ILevel2CodeService level2CodeService) : IRequestHandler<UpdateLevel2CodeCommand, bool>
{
    public async Task<bool> Handle(UpdateLevel2CodeCommand request, CancellationToken cancellationToken)
    {
        return await level2CodeService.UpdateAsync(request.Id, request.Code, request.Level1CodeId, request.Description);
    }
}
