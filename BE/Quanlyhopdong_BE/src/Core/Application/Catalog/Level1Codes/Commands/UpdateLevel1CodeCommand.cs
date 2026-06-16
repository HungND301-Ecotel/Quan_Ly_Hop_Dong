using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level1Codes.Commands;

public record UpdateLevel1CodeCommand(Guid Id, string Code, Guid ContractTypeId, Guid? ContractRegisterId, string? Description = null) : IRequest<bool>;

public class UpdateLevel1CodeCommandHandler(ILevel1CodeService level1CodeService) : IRequestHandler<UpdateLevel1CodeCommand, bool>
{
    public async Task<bool> Handle(UpdateLevel1CodeCommand request, CancellationToken cancellationToken)
    {
        return await level1CodeService.UpdateAsync(request.Id, request.Code, request.ContractTypeId, request.ContractRegisterId, request.Description);
    }
}
