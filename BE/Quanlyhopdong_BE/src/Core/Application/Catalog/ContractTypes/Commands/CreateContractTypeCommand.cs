using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractTypes.Commands;

public record class CreateContractTypeCommand(CreateContractTypeDto CreateModel) : IRequest<bool>;

public class CreateContractTypeCommandHandler(IContractTypeService _contractTypeService) : IRequestHandler<CreateContractTypeCommand, bool>
{
    public async Task<bool> Handle(CreateContractTypeCommand request, CancellationToken cancellationToken)
    {
        return await _contractTypeService.CreateContractType(request.CreateModel);
    }
}