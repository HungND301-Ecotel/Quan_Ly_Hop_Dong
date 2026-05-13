using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetProgressItemByIdQuery(Guid Id) : IRequest<ContractProgressItemDetailResponse>;

public class GetProgressItemByIdQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetProgressItemByIdQuery, ContractProgressItemDetailResponse>
{
    public async Task<ContractProgressItemDetailResponse> Handle(
        GetProgressItemByIdQuery request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.GetProgressItemByIdAsync(request.Id);
    }
}
