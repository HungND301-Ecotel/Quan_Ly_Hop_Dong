using Application.Dto.Catalog.ContractProgress;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractProgress.Commands;

public record CreateContractProgressCommand(CreateContractProgressRequest Request)
    : IRequest<CreateContractProgressResponse>;

public class CreateContractProgressCommandHandler(IContractProgressService contractProgressService)
    : IRequestHandler<CreateContractProgressCommand, CreateContractProgressResponse>
{
    public async Task<CreateContractProgressResponse> Handle(
        CreateContractProgressCommand request,
        CancellationToken cancellationToken)
    {
        return await contractProgressService.CreateAsync(request.Request);
    }
}

