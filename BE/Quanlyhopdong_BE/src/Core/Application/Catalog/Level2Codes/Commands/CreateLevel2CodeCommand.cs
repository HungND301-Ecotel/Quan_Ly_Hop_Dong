using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Commands;

public record CreateLevel2CodeCommand(string Code, Guid Level1CodeId, string? Description = null) : IRequest<Guid>;

public class CreateLevel2CodeCommandHandler(ILevel2CodeService level2CodeService) : IRequestHandler<CreateLevel2CodeCommand, Guid>
{
    public async Task<Guid> Handle(CreateLevel2CodeCommand request, CancellationToken cancellationToken)
    {
        return await level2CodeService.CreateAsync(request.Code, request.Level1CodeId, request.Description);
    }
}
