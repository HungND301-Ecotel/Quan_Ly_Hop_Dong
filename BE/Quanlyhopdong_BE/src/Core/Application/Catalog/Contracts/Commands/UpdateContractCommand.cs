using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class UpdateContractCommand(Guid Id, UpdateContractDto UpdateModel) : IRequest<bool>;

public class UpdateContractCommandHandler(IContractService _contractService) : IRequestHandler<UpdateContractCommand, bool>
{
    public async Task<bool> Handle(UpdateContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.UpdateAsync(request.Id, request.UpdateModel);
    }
}