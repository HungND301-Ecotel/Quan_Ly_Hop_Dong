using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.UnitOfMeasures.Commands;

public record UpdateUnitOfMeasureCommand(Guid Id, string Code, string Name, bool IsActive) : IRequest<bool>;

public class UpdateUnitOfMeasureCommandHandler(IUnitOfMeasureService service)
    : IRequestHandler<UpdateUnitOfMeasureCommand, bool>
{
    public async Task<bool> Handle(UpdateUnitOfMeasureCommand request, CancellationToken cancellationToken)
    {
        return await service.UpdateAsync(request.Id, request.Code, request.Name, request.IsActive);
    }
}
