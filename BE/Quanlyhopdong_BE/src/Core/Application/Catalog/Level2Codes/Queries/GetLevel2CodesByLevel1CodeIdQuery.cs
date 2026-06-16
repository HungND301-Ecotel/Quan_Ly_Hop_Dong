using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Queries;

public record GetLevel2CodesByLevel1CodeIdQuery(Guid Level1CodeId) : IRequest<IList<Level2CodeLookupDto>>;

public class GetLevel2CodesByLevel1CodeIdQueryHandler(ILevel2CodeService level2CodeService) : IRequestHandler<GetLevel2CodesByLevel1CodeIdQuery, IList<Level2CodeLookupDto>>
{
    public async Task<IList<Level2CodeLookupDto>> Handle(GetLevel2CodesByLevel1CodeIdQuery request, CancellationToken cancellationToken)
    {
        return await level2CodeService.GetByLevel1CodeIdAsync(request.Level1CodeId);
    }
}
