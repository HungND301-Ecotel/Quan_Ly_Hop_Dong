using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Partner.Queries;

public record class GetAllPartnerQuery(string? Search) : IRequest<IList<PartnerDto>>;

public class GetAllPartnerQueryHandler(IPartnerService partnerService) : IRequestHandler<GetAllPartnerQuery, IList<PartnerDto>>
{
    public async Task<IList<PartnerDto>> Handle(GetAllPartnerQuery request, CancellationToken cancellationToken)
    {
        return await partnerService.GetAllAsync(request.Search);
    }
}