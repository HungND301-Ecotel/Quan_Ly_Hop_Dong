using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record DeleteContractProgressCommand(Guid Id) : IRequest<DeleteContractProgressResponse>;

public class DeleteContractProgressCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<DeleteContractProgressCommand, DeleteContractProgressResponse>
{
    public async Task<DeleteContractProgressResponse> Handle(
        DeleteContractProgressCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.DeleteAsync(request.Id);
    }
}
