using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Queries;

public record GetLevel3CodesByLevel1CodeIdQuery(Guid Level1CodeId) : IRequest<IList<Level3CodeLookupDto>>;

public class GetLevel3CodesByLevel1CodeIdQueryHandler(ILevel3CodeService level3CodeService)
    : IRequestHandler<GetLevel3CodesByLevel1CodeIdQuery, IList<Level3CodeLookupDto>>
{
    public async Task<IList<Level3CodeLookupDto>> Handle(GetLevel3CodesByLevel1CodeIdQuery request, CancellationToken cancellationToken)
    {
        return await level3CodeService.GetByLevel1CodeIdAsync(request.Level1CodeId);
    }
}
