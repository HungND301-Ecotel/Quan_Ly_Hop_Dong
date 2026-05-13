using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class PauseContractCommand(Guid ContractId, string? Reason) : IRequest<bool>;

public class PauseContractCommandHandler(IContractService _contractService) : IRequestHandler<PauseContractCommand, bool>
{
    public async Task<bool> Handle(PauseContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.PauseContractAsync(request.ContractId, request.Reason);
    }
}
