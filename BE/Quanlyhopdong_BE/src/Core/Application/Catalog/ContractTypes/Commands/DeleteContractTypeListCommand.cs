using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractTypes.Commands;

public record class DeleteContractTypeListCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteContractTypeListCommandHandler(IContractTypeService _contractTypeService) : IRequestHandler<DeleteContractTypeListCommand, bool>
{
    public async Task<bool> Handle(DeleteContractTypeListCommand request, CancellationToken cancellationToken)
    {
        return await _contractTypeService.DeleteContractTypeList(request.DeleteIds);
    }
}