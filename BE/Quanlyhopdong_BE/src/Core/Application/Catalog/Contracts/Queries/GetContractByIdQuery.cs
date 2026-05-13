using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractByIdQuery(Guid Id) : IRequest<ContractDto>;

public class GetContractByIdQueryHandler(IContractService _contractSerivce) : IRequestHandler<GetContractByIdQuery, ContractDto>
{
    public async Task<ContractDto> Handle(GetContractByIdQuery request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetByIdAsync(request.Id);
    }
}