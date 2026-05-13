using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class CancelContractCommand(Guid ContractId, string? Reason) : IRequest<bool>;

public class CancelContractCommandHandler(IContractService _contractService) : IRequestHandler<CancelContractCommand, bool>
{
    public async Task<bool> Handle(CancelContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.CancelContractAsync(request.ContractId, request.Reason);
    }
}
