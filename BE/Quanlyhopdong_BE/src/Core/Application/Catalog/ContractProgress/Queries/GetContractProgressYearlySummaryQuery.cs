using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetContractProgressYearlySummaryQuery(Guid ContractId) : IRequest<YearlySummaryListDto>;

public class GetContractProgressYearlySummaryQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetContractProgressYearlySummaryQuery, YearlySummaryListDto>
{
    public async Task<YearlySummaryListDto> Handle(
        GetContractProgressYearlySummaryQuery request,
        CancellationToken cancellationToken)
    {
        // Validation
        if (request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        return await contractProgressService.GetYearlySummaryAsync(request.ContractId);
    }
}

