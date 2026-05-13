using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level1Codes.Queries;

public record GetAllLevel1CodeQuery(string? Search) : IRequest<IList<Level1CodeDto>>;

public class GetAllLevel1CodeQueryHandler(ILevel1CodeService level1CodeService) : IRequestHandler<GetAllLevel1CodeQuery, IList<Level1CodeDto>>
{
    public async Task<IList<Level1CodeDto>> Handle(GetAllLevel1CodeQuery request, CancellationToken cancellationToken)
    {
        return await level1CodeService.GetAllAsync(request.Search);
    }
}
