using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Commands;

public record CreateUnitOfMeasureCommand(string Code, string Name, string? Note) : IRequest<Guid>;

public class CreateUnitOfMeasureCommandHandler(IUnitOfMeasureService service)
    : IRequestHandler<CreateUnitOfMeasureCommand, Guid>
{
    public async Task<Guid> Handle(CreateUnitOfMeasureCommand request, CancellationToken cancellationToken)
        => await service.CreateAsync(request.Code, request.Name, request.Note);
}