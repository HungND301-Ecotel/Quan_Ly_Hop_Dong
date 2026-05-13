using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractStructureCatalogs.Queries;

public record GetAllContractStructureCatalogQuery(string? Search) : IRequest<IList<ContractStructureCatalogDto>>;

public class GetAllContractStructureCatalogQueryHandler(IContractStructureCatalogService service)
    : IRequestHandler<GetAllContractStructureCatalogQuery, IList<ContractStructureCatalogDto>>
{
    public async Task<IList<ContractStructureCatalogDto>> Handle(GetAllContractStructureCatalogQuery request, CancellationToken cancellationToken)
        => await service.GetAllAsync(request.Search);
}
