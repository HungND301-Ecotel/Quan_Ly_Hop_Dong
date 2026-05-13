using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record UpdateContractProgressBatchCommand(UpdateContractProgressBatchRequest Request)
    : IRequest<UpdateContractProgressBatchResponse>;

public class UpdateContractProgressBatchCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<UpdateContractProgressBatchCommand, UpdateContractProgressBatchResponse>
{
    public async Task<UpdateContractProgressBatchResponse> Handle(
        UpdateContractProgressBatchCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.UpdateContractProgressBatchAsync(request.Request);
    }
}
