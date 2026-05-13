using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Commands;

public record class DeleteContractListCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteContractListCommandHandler(IContractService _contractService) : IRequestHandler<DeleteContractListCommand, bool>
{
    public async Task<bool> Handle(DeleteContractListCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.DeleteAsync(request.DeleteIds);
    }
}