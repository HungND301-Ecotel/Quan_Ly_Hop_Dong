using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Commands;

public record CreateLevel3CodeCommand(string Code, Guid Level1CodeId, string? Description = null) : IRequest<Guid>;

public class CreateLevel3CodeCommandHandler(ILevel3CodeService level3CodeService) : IRequestHandler<CreateLevel3CodeCommand, Guid>
{
    public async Task<Guid> Handle(CreateLevel3CodeCommand request, CancellationToken cancellationToken)
    {
        return await level3CodeService.CreateAsync(request.Code, request.Level1CodeId, request.Description);
    }
}
