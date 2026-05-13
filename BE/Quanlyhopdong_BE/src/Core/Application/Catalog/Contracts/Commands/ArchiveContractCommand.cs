using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class ArchiveContractCommand(Guid ContractId) : IRequest<bool>;

public class ArchiveContractCommandHandler(IContractService _contractService) : IRequestHandler<ArchiveContractCommand, bool>
{
    public async Task<bool> Handle(ArchiveContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.ArchiveContractAsync(request.ContractId);
    }
}
