using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Commands;

public record UpdateLevel3CodeCommand(Guid Id, string Code, Guid Level1CodeId, string? Description = null) : IRequest<bool>;

public class UpdateLevel3CodeCommandHandler(ILevel3CodeService level3CodeService) : IRequestHandler<UpdateLevel3CodeCommand, bool>
{
    public async Task<bool> Handle(UpdateLevel3CodeCommand request, CancellationToken cancellationToken)
    {
        return await level3CodeService.UpdateAsync(request.Id, request.Code, request.Level1CodeId, request.Description);
    }
}
