using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Queries;

public record GetUnitOfMeasureByIdQuery(Guid Id) : IRequest<UnitOfMeasureDto?>;

public class GetUnitOfMeasureByIdQueryHandler(IUnitOfMeasureService service)
    : IRequestHandler<GetUnitOfMeasureByIdQuery, UnitOfMeasureDto?>
{
    public async Task<UnitOfMeasureDto?> Handle(GetUnitOfMeasureByIdQuery request, CancellationToken cancellationToken)
        => await service.GetByIdAsync(request.Id);
}