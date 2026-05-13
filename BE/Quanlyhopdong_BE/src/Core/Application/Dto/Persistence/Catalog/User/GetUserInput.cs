using Application.Common.Pagination;

namespace Application.Dto.Persistence.Catalog.User;

public enum GetUserModuleEnum
{
    AssignClassForTeacher = 1,
    AssignClassForStudent = 2,
}

public class GetUserInput : PagedInputDto
{
    public string? KeySearch { get; set; } = string.Empty;
    //public List<int>? RoleIds { get; set; }
}