using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record AddContractProgressItemsBatchCommand(AddContractProgressItemsRequest Request)
    : IRequest<AddContractProgressItemsResponse>;

public class AddContractProgressItemsBatchCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<AddContractProgressItemsBatchCommand, AddContractProgressItemsResponse>
{
    public async Task<AddContractProgressItemsResponse> Handle(
        AddContractProgressItemsBatchCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.AddProgressItemsBatchAsync(request.Request);
    }
}
