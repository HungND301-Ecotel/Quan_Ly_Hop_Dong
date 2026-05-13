using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record UpdateContractProgressItemsBatchCommand(UpdateContractProgressItemsBatchRequest Request)
    : IRequest<UpdateContractProgressItemsBatchResponse>;

public class UpdateContractProgressItemsBatchCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<UpdateContractProgressItemsBatchCommand, UpdateContractProgressItemsBatchResponse>
{
    public async Task<UpdateContractProgressItemsBatchResponse> Handle(
        UpdateContractProgressItemsBatchCommand request,
        CancellationToken cancellationToken)
    {
        // Validation
        if (request.Request.ContractProgressId == Guid.Empty)
        {
            throw new BadRequestException("Contract Progress ID is required");
        }

        if (request.Request.Items == null)
        {
            throw new BadRequestException("Items list cannot be null");
        }

        return await contractProgressService.UpdateItemsBatchAsync(request.Request);
    }
}
