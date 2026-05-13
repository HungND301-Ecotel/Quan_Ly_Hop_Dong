using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class SubmitForApprovalCommand(Guid ContractId) : IRequest<bool>;

public class SubmitForApprovalCommandHandler(IContractService contractService) 
    : IRequestHandler<SubmitForApprovalCommand, bool>
{
    public async Task<bool> Handle(SubmitForApprovalCommand request, CancellationToken cancellationToken)
    {
        return await contractService.SubmitForApprovalAsync(request.ContractId);
    }
}
