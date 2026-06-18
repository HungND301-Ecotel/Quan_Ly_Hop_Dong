using Application.Interfaces.Services.Catalog;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Catalog.Contracts.Commands;

public record class UploadContractCommand(List<IFormFile> ContractFile, string ContractNumber) : IRequest<string>;

public class UploadContractCommandHandler(IContractService _contractService) : IRequestHandler<UploadContractCommand, string>
{
    public async Task<string> Handle(UploadContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.UploadContract(request.ContractFile, request.ContractNumber);
    }
}