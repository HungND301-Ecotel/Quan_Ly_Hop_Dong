using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractTypes.Queries;

public record class GetContractTypeByIdQuery(Guid Id) : IRequest<ContractTypeDto>;

public class GetContractTypeByIdQueryHandler(IContractTypeService _contractTypeSerivce) : IRequestHandler<GetContractTypeByIdQuery, ContractTypeDto>
{
    public async Task<ContractTypeDto> Handle(GetContractTypeByIdQuery request, CancellationToken cancellationToken)
    {
        return await _contractTypeSerivce.GetContractTypeByIdAsync(request.Id);
    }
}