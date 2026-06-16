using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractFields.Commands;

public record class CreateContractFieldCommand(CreateContractFieldDto CreateModel) : IRequest<bool>;

public class CreateContractFieldCommandHandler(IContractFieldService _contractFieldService) : IRequestHandler<CreateContractFieldCommand, bool>
{
    public async Task<bool> Handle(CreateContractFieldCommand request, CancellationToken cancellationToken)
    {
        return await _contractFieldService.CreateContractField(request.CreateModel);
    }
}
