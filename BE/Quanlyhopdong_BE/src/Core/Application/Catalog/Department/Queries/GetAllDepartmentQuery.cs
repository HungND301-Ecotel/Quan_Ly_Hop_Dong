using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Department.Queries;

public record class GetAllDepartmentQuery(string? Search) : IRequest<IList<DepartmentDto>>;

public class GetAllDepartmentQueryHandler(IDepartmentService departmentService) : IRequestHandler<GetAllDepartmentQuery, IList<DepartmentDto>>
{
    public async Task<IList<DepartmentDto>> Handle(GetAllDepartmentQuery request, CancellationToken cancellationToken)
    {
        return await departmentService.GetAllAsync(request.Search);
    }
}