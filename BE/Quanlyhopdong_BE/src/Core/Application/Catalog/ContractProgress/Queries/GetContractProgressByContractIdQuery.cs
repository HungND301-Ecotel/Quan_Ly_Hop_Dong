using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetContractProgressByContractIdQuery(Guid ContractId) : IRequest<ContractProgressResponseDto>;

public class GetContractProgressByContractIdQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetContractProgressByContractIdQuery, ContractProgressResponseDto>
{
    public async Task<ContractProgressResponseDto> Handle(
        GetContractProgressByContractIdQuery request, 
        CancellationToken cancellationToken)
    {
        return await contractProgressService.GetByContractIdAsync(request.ContractId);
    }
}

