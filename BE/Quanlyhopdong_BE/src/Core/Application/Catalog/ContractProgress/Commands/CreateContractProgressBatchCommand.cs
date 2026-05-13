using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record CreateContractProgressBatchCommand(CreateContractProgressBatchRequest Request)
    : IRequest<CreateContractProgressBatchResponse>;

public class CreateContractProgressBatchCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<CreateContractProgressBatchCommand, CreateContractProgressBatchResponse>
{
    public async Task<CreateContractProgressBatchResponse> Handle(
        CreateContractProgressBatchCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.CreateBatchAsync(request.Request);
    }
}
