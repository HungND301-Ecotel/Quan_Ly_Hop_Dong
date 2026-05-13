using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using MediatR;

namespace Application.Catalog.Contracts.Queries;

public record class GetAllContractQuery(string? Search, Guid? ContractTypeId, Guid? DepartmentId, Guid? PartnerId,
        ContractStatus? Status, DateTime? StartDate, DateTime? EndDate, IList<ContractFormat>? Formats, bool? IsArchiveContract, bool? IsDebtTrackingEnabled) : IRequest<List<ShortContractDto>>;

public class GetAllContractQueryHandler(IContractService _contractSerivce) : IRequestHandler<GetAllContractQuery, List<ShortContractDto>>
{
    public async Task<List<ShortContractDto>> Handle(GetAllContractQuery request, CancellationToken cancellationToken)
    {
        return await _contractSerivce.GetAllAsync(request.Search, request.ContractTypeId, request.DepartmentId, request.PartnerId, request.Status, request.StartDate, request.EndDate, request.Formats, request.IsArchiveContract, request.IsDebtTrackingEnabled);
    }
}