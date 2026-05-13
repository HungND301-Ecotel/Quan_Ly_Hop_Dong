using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record DeleteProgressItemCommand(Guid Id) : IRequest<DeleteContractProgressItemResponse>;

public class DeleteProgressItemCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<DeleteProgressItemCommand, DeleteContractProgressItemResponse>
{
    public async Task<DeleteContractProgressItemResponse> Handle(
        DeleteProgressItemCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.DeleteProgressItemAsync(request.Id);
    }
}
