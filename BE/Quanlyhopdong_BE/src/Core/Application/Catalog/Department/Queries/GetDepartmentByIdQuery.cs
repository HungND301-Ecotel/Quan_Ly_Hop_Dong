using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Department.Queries;

public record class GetDepartmentByIdQuery(Guid Id) : IRequest<DepartmentDto>;

public class GetDepartmentByIdQueryHandler(IDepartmentService departmentService) : IRequestHandler<GetDepartmentByIdQuery, DepartmentDto>
{
    public async Task<DepartmentDto> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        return await departmentService.GetByIdAsync(request.Id);
    }
}
