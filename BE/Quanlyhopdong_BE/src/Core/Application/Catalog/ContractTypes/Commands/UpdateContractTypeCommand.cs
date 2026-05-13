using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractTypes.Commands;

public record class UpdateContractTypeCommand(ContractTypeDto UpdateModel) : IRequest<bool>;

public class UpdateContractTypeCommandHandler(IContractTypeService _contractTypeService) : IRequestHandler<UpdateContractTypeCommand, bool>
{
    public async Task<bool> Handle(UpdateContractTypeCommand request, CancellationToken cancellationToken)
    {
        return await _contractTypeService.UpdateContractType(request.UpdateModel);
    }
}