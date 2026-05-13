using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level1Codes.Commands;

public record CreateLevel1CodeCommand(string Code, Guid ContractTypeId, string? Description = null) : IRequest<Guid>;

public class CreateLevel1CodeCommandHandler(ILevel1CodeService level1CodeService) : IRequestHandler<CreateLevel1CodeCommand, Guid>
{
    public async Task<Guid> Handle(CreateLevel1CodeCommand request, CancellationToken cancellationToken)
    {
        return await level1CodeService.CreateAsync(request.Code, request.ContractTypeId, request.Description);
    }
}
