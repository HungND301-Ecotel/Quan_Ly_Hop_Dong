using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetContractReportQuery(Guid Id) : IRequest<ContractReportDto>;

public class GetContractReportQueryHandler(IContractService _contractService) : IRequestHandler<GetContractReportQuery, ContractReportDto>
{
    public async Task<ContractReportDto> Handle(GetContractReportQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetContractReportAsync(request.Id);
    }
}
