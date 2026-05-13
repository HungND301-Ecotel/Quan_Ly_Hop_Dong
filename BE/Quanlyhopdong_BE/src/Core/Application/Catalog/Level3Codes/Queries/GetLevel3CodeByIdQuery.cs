using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level3Codes.Queries;

public record GetLevel3CodeByIdQuery(Guid Id) : IRequest<Level3CodeDto?>;

public class GetLevel3CodeByIdQueryHandler(ILevel3CodeService level3CodeService) : IRequestHandler<GetLevel3CodeByIdQuery, Level3CodeDto?>
{
    public async Task<Level3CodeDto?> Handle(GetLevel3CodeByIdQuery request, CancellationToken cancellationToken)
    {
        return await level3CodeService.GetByIdAsync(request.Id);
    }
}
