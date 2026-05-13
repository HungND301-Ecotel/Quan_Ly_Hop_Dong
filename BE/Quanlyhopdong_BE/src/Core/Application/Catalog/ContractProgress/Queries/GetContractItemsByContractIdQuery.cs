using Application.Common.Exceptions;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetContractItemsByContractIdQuery(Guid ContractId) : IRequest<List<ContractItemDto>>;

public class GetContractItemsByContractIdQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetContractItemsByContractIdQuery, List<ContractItemDto>>
{
    public async Task<List<ContractItemDto>> Handle(GetContractItemsByContractIdQuery request, CancellationToken cancellationToken)
    {
        if (request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        return await contractProgressService.GetContractItemsByContractIdAsync(request.ContractId);
    }
}
