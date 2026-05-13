using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Queries;

public record GetAllLevel3CodeQuery(string? Search) : IRequest<IList<Level3CodeDto>>;

public class GetAllLevel3CodeQueryHandler(ILevel3CodeService level3CodeService) : IRequestHandler<GetAllLevel3CodeQuery, IList<Level3CodeDto>>
{
    public async Task<IList<Level3CodeDto>> Handle(GetAllLevel3CodeQuery request, CancellationToken cancellationToken)
    {
        return await level3CodeService.GetAllAsync(request.Search);
    }
}
