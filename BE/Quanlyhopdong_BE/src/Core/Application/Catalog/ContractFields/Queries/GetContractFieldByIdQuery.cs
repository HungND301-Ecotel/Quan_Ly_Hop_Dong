using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.ContractFields.Queries;

public record class GetContractFieldByIdQuery(Guid Id) : IRequest<ContractFieldDto>;

public class GetContractFieldByIdQueryHandler(IContractFieldService _contractFieldService) : IRequestHandler<GetContractFieldByIdQuery, ContractFieldDto>
{
    public async Task<ContractFieldDto> Handle(GetContractFieldByIdQuery request, CancellationToken cancellationToken)
    {
        return await _contractFieldService.GetContractFieldByIdAsync(request.Id);
    }
}
