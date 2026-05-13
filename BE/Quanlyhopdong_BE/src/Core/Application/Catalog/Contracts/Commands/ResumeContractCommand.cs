using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class ResumeContractCommand(Guid ContractId, string? Reason) : IRequest<bool>;

public class ResumeContractCommandHandler(IContractService _contractService) : IRequestHandler<ResumeContractCommand, bool>
{
    public async Task<bool> Handle(ResumeContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.ResumeContractAsync(request.ContractId, request.Reason);
    }
}
