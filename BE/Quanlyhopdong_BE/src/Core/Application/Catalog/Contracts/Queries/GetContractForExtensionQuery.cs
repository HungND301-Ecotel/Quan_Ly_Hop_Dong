using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractForExtensionQuery(Guid ContractId) : IRequest<PrepareExtensionDto>;

public class GetContractForExtensionQueryHandler(IContractService _contractService) 
    : IRequestHandler<GetContractForExtensionQuery, PrepareExtensionDto>
{
    public async Task<PrepareExtensionDto> Handle(GetContractForExtensionQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.PrepareContractExtensionAsync(request.ContractId);
    }
}
