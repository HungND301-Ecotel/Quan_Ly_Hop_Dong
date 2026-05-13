using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Queries;

public record GetWorkInProgressQuery(Guid ContractId) : IRequest<WorkInProgressDto>;

public class GetWorkInProgressQueryHandler(IContractProgressService contractProgressService)
    : IRequestHandler<GetWorkInProgressQuery, WorkInProgressDto>
{
    public async Task<WorkInProgressDto> Handle(
        GetWorkInProgressQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        return await contractProgressService.GetWorkInProgressAsync(request.ContractId);
    }
}
