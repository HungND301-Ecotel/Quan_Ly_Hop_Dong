using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class ActivateContractCommand(ActivateContractDto ActivateModel) : IRequest<bool>;

public class ActivateContractCommandHandler(IContractService _contractService) : IRequestHandler<ActivateContractCommand, bool>
{
    public async Task<bool> Handle(ActivateContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.ActivateContractAsync(request.ActivateModel);
    }
}
