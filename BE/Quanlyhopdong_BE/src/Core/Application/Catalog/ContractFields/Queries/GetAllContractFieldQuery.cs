using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractFields.Queries;

public record class GetAllContractFieldQuery() : IRequest<IList<ContractFieldDto>>;

public class GetAllContractFieldQueryHandler(IContractFieldService _contractFieldService) : IRequestHandler<GetAllContractFieldQuery, IList<ContractFieldDto>>
{
    public async Task<IList<ContractFieldDto>> Handle(GetAllContractFieldQuery request, CancellationToken cancellationToken)
    {
        return await _contractFieldService.GetAllContractFieldAsync();
    }
}
