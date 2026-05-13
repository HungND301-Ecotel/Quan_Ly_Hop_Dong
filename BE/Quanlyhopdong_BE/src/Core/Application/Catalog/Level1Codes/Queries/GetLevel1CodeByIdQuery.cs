using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Level1Codes.Queries;

public record GetLevel1CodeByIdQuery(Guid Id) : IRequest<Level1CodeDto?>;

public class GetLevel1CodeByIdQueryHandler(ILevel1CodeService level1CodeService) : IRequestHandler<GetLevel1CodeByIdQuery, Level1CodeDto?>
{
    public async Task<Level1CodeDto?> Handle(GetLevel1CodeByIdQuery request, CancellationToken cancellationToken)
    {
        return await level1CodeService.GetByIdAsync(request.Id);
    }
}
