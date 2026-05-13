using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class CreateContractCommand(CreateContractDto CreateModel) : IRequest<bool>;

public class CreateContractCommandHandler(IContractService _contractService) : IRequestHandler<CreateContractCommand, bool>
{
    public async Task<bool> Handle(CreateContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.CreateAsync(request.CreateModel);
    }
}
