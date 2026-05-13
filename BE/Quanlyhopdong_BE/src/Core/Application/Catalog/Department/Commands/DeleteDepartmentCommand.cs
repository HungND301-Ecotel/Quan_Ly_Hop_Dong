using Application.Interfaces.Services.Catalog;
using MediatR;

namespace Application.Catalog.Department.Commands;

public record class DeleteDepartmentCommand(IList<Guid> DeleteIds) : IRequest<bool>;

public class DeleteDepartmentCommandHandler(IDepartmentService departmentService) : IRequestHandler<DeleteDepartmentCommand, bool>
{
    public async Task<bool> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await departmentService.DeleteAsync(request.DeleteIds);
    }
}