using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Department.Commands;

public record class CreateDepartmentCommand(CreateDepartmentDto CreateModel) : IRequest<bool>;

public class CreateDepartmentCommandHandler(IDepartmentService departmentService) : IRequestHandler<CreateDepartmentCommand, bool>
{
    public async Task<bool> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await departmentService.CreateAsync(request.CreateModel);
    }
}
