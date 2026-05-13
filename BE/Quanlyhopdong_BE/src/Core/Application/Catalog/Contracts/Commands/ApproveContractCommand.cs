using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class ApproveContractCommand(Guid Id, ApproveContractDto ApproveModel) : IRequest<bool>;

public class ApproveContractCommandHandler(IContractService _contractService) : IRequestHandler<ApproveContractCommand, bool>
{
    public async Task<bool> Handle(ApproveContractCommand request, CancellationToken cancellationToken)
    {
        request.ApproveModel.ContractId = request.Id;
        return await _contractService.ApproveContractAsync(request.ApproveModel);
    }
}
