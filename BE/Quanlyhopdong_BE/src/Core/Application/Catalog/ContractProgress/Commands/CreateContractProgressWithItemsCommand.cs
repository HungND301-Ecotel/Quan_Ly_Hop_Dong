using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record CreateContractProgressWithItemsCommand(CreateContractProgressWithItemsRequest Request)
    : IRequest<CreateContractProgressWithItemsResponse>;

public class CreateContractProgressWithItemsCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<CreateContractProgressWithItemsCommand, CreateContractProgressWithItemsResponse>
{
    public async Task<CreateContractProgressWithItemsResponse> Handle(
        CreateContractProgressWithItemsCommand request,
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

        return await contractProgressService.CreateContractProgressWithItemsAsync(request.Request);
    }
}
