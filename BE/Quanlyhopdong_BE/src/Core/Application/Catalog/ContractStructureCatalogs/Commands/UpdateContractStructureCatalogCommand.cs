using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractStructureCatalogs.Commands;

public record UpdateContractStructureCatalogCommand(Guid Id, string Name, bool IsActive) : IRequest<bool>;

public class UpdateContractStructureCatalogCommandHandler(IContractStructureCatalogService service)
    : IRequestHandler<UpdateContractStructureCatalogCommand, bool>
{
    public async Task<bool> Handle(UpdateContractStructureCatalogCommand request, CancellationToken cancellationToken)
        => await service.UpdateAsync(request.Id, request.Name, request.IsActive);
}
