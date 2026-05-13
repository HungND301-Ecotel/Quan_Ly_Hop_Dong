using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractFilesByIdQuery(Guid Id) : IRequest<ContractDto>;

public class GetContractFilesByIdQueryHandler(IContractService _contractSerivce) : IRequestHandler<GetContractFilesByIdQuery, ContractDto>
{
    public async Task<ContractDto> Handle(GetContractFilesByIdQuery request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetByIdAsync(request.Id);
    }
}