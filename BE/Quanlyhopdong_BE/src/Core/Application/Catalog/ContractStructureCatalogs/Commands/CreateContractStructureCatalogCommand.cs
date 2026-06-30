using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractStructureCatalogs.Commands;

public record CreateContractStructureCatalogCommand(string Name, string Code, string? Description) : IRequest<Guid>;

public class CreateContractStructureCatalogCommandHandler(IContractStructureCatalogService service)
    : IRequestHandler<CreateContractStructureCatalogCommand, Guid>
{
    public async Task<Guid> Handle(CreateContractStructureCatalogCommand request, CancellationToken cancellationToken)
        => await service.CreateAsync(request.Name, request.Code, request.Description);
}
