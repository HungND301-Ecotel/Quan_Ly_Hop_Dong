using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractStructureCatalogs.Commands;

public record DeleteContractStructureCatalogCommand(Guid Id) : IRequest<bool>;

public class DeleteContractStructureCatalogCommandHandler(IContractStructureCatalogService service)
    : IRequestHandler<DeleteContractStructureCatalogCommand, bool>
{
    public async Task<bool> Handle(DeleteContractStructureCatalogCommand request, CancellationToken cancellationToken)
        => await service.DeleteAsync(request.Id);
}
