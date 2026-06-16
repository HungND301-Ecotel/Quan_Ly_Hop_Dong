using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level2Codes.Queries;

public record GetLevel2CodeByIdQuery(Guid Id) : IRequest<Level2CodeDto?>;

public class GetLevel2CodeByIdQueryHandler(ILevel2CodeService level2CodeService) : IRequestHandler<GetLevel2CodeByIdQuery, Level2CodeDto?>
{
    public async Task<Level2CodeDto?> Handle(GetLevel2CodeByIdQuery request, CancellationToken cancellationToken)
    {
        return await level2CodeService.GetByIdAsync(request.Id);
    }
}
