using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetContractProgressGroupedSummaryQuery(Guid ContractProgressId) : IRequest<ContractProgressGroupedSummaryDto>;

public class GetContractProgressGroupedSummaryQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetContractProgressGroupedSummaryQuery, ContractProgressGroupedSummaryDto>
{
    public async Task<ContractProgressGroupedSummaryDto> Handle(
        GetContractProgressGroupedSummaryQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ContractProgressId == Guid.Empty)
        {
            throw new BadRequestException("ContractProgress ID is required");
        }

        return await contractProgressService.GetContractProgressGroupedSummaryAsync(request.ContractProgressId);
    }
}
