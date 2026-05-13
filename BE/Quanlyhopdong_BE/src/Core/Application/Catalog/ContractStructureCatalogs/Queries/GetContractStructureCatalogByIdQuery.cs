using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractStructureCatalogs.Queries;

public record GetContractStructureCatalogByIdQuery(Guid Id) : IRequest<ContractStructureCatalogDto?>;

public class GetContractStructureCatalogByIdQueryHandler(IContractStructureCatalogService service)
    : IRequestHandler<GetContractStructureCatalogByIdQuery, ContractStructureCatalogDto?>
{
    public async Task<ContractStructureCatalogDto?> Handle(GetContractStructureCatalogByIdQuery request, CancellationToken cancellationToken)
        => await service.GetByIdAsync(request.Id);
}
