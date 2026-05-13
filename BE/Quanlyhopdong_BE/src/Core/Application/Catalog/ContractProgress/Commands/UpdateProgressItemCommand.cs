using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record UpdateProgressItemCommand(UpdateSingleProgressItemRequest Request) 
    : IRequest<UpdateSingleProgressItemResponse>;

public class UpdateProgressItemCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<UpdateProgressItemCommand, UpdateSingleProgressItemResponse>
{
    public async Task<UpdateSingleProgressItemResponse> Handle(
        UpdateProgressItemCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.UpdateProgressItemAsync(request.Request);
    }
}
