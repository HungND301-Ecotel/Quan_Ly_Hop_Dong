using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record UpdateContractProgressCommand(UpdateContractProgressRequest Request)
    : IRequest<Unit>;

public class UpdateContractProgressCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<UpdateContractProgressCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateContractProgressCommand request,
        CancellationToken cancellationToken)
    {
        await contractProgressService.UpdateAsync(request.Request);
        return Unit.Value;
    }
}
