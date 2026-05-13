using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetAllContractTypeQuery() : IRequest<IList<ContractTypeDto>>;

public class GetAllContractTypeQueryHandler(IContractTypeService _contractTypeSerivce) : IRequestHandler<GetAllContractTypeQuery, IList<ContractTypeDto>>
{
    public async Task<IList<ContractTypeDto>> Handle(GetAllContractTypeQuery request, CancellationToken cancellationToken)
    {
        return await _contractTypeSerivce.GetAllContractTypeAsync();
    }
}