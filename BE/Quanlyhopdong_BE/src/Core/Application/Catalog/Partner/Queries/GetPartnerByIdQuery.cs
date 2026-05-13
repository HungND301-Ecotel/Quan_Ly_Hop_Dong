using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Partner.Queries;

public record class GetPartnerByIdQuery(Guid Id) : IRequest<PartnerDto>;

public class GetPartnerByIdQueryHandler(IPartnerService partnerService) : IRequestHandler<GetPartnerByIdQuery, PartnerDto>
{
    public async Task<PartnerDto> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
    {
        return await partnerService.GetByIdAsync(request.Id);
    }
}
