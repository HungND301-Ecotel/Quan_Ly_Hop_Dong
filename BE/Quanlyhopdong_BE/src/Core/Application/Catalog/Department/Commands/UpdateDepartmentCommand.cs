using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Department.Commands;

public record class UpdateDepartmentCommand(DepartmentDto UpdateModel) : IRequest<bool>;

public class UpdateDepartmentCommandHandler(IDepartmentService departmentService) : IRequestHandler<UpdateDepartmentCommand, bool>
{
    public async Task<bool> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await departmentService.UpdateAsync(request.UpdateModel);
    }
}