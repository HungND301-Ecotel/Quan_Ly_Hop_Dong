using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Queries;

public record GetAllLevel2CodeQuery(string? Search) : IRequest<IList<Level2CodeDto>>;

public class GetAllLevel2CodeQueryHandler(ILevel2CodeService level2CodeService) : IRequestHandler<GetAllLevel2CodeQuery, IList<Level2CodeDto>>
{
    public async Task<IList<Level2CodeDto>> Handle(GetAllLevel2CodeQuery request, CancellationToken cancellationToken)
    {
        return await level2CodeService.GetAllAsync(request.Search);
    }
}
