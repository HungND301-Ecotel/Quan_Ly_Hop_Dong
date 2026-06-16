using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractFields.Commands;

public record class DeleteContractFieldListCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteContractFieldListCommandHandler(IContractFieldService _contractFieldService) : IRequestHandler<DeleteContractFieldListCommand, bool>
{
    public async Task<bool> Handle(DeleteContractFieldListCommand request, CancellationToken cancellationToken)
    {
        return await _contractFieldService.DeleteContractFieldList(request.DeleteIds);
    }
}
