using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractFields.Commands;

public record class UpdateContractFieldCommand(ContractFieldDto UpdateModel) : IRequest<bool>;

public class UpdateContractFieldCommandHandler(IContractFieldService _contractFieldService) : IRequestHandler<UpdateContractFieldCommand, bool>
{
    public async Task<bool> Handle(UpdateContractFieldCommand request, CancellationToken cancellationToken)
    {
        return await _contractFieldService.UpdateContractField(request.UpdateModel);
    }
}
