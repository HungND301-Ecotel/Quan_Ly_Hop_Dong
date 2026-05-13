using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Queries;

public record GetAllUnitOfMeasureQuery(string? Search) : IRequest<IList<UnitOfMeasureDto>>;

public class GetAllUnitOfMeasureQueryHandler(IUnitOfMeasureService service)
    : IRequestHandler<GetAllUnitOfMeasureQuery, IList<UnitOfMeasureDto>>
{
    public async Task<IList<UnitOfMeasureDto>> Handle(GetAllUnitOfMeasureQuery request, CancellationToken cancellationToken)
        => await service.GetAllAsync(request.Search);
}
