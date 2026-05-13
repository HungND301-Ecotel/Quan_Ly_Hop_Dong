using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record UpdateContractProgressWithItemsCommand(UpdateContractProgressWithItemsRequest Request)
    : IRequest<UpdateContractProgressWithItemsResponse>;

public class UpdateContractProgressWithItemsCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<UpdateContractProgressWithItemsCommand, UpdateContractProgressWithItemsResponse>
{
    public async Task<UpdateContractProgressWithItemsResponse> Handle(
        UpdateContractProgressWithItemsCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Request.ContractId == Guid.Empty)
        {
            throw new BadRequestException("Contract ID is required");
        }

        if (request.Request.ContractProgressItems == null || !request.Request.ContractProgressItems.Any())
        {
            throw new BadRequestException("Progress items are required");
        }

        return await contractProgressService.UpdateContractProgressWithItemsAsync(request.Request);
    }
}
