using Domain.Common.Enums;

namespace Application.Dto.Catalog;

public class UserPermissionsDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; }
    public string Fullname { get; set; }
    public Guid? PositionId { get; set; }
    public string? PositionName { get; set; }
    public List<Guid> AccessibleDepartmentIds { get; set; }

    // FE chỉ cần check: permissions.includes('approve_sign_contract')
    public List<string> Permissions { get; set; }

    // Chi tiết permissions theo module/submodule (optional, để debug hoặc UI nâng cao)
    //public List<ModulePermissionDetailDto> PermissionDetails { get; set; }
}

public class ModulePermissionDetailDto
{
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; }
    public string ModuleName { get; set; }
    public List<SubModulePermissionDetailDto> SubModules { get; set; }
}

public class SubModulePermissionDetailDto
{
    public Guid SubModuleId { get; set; }
    public string SubModuleCode { get; set; }
    public string SubModuleName { get; set; }
    public List<string> Permissions { get; set; }
    public List<Guid> AllowedDepartmentIds { get; set; }
}

public class ComputedSubModulePermissionDto
{
    public Guid SubModuleId { get; set; }
    public string SubModuleCode { get; set; }
    public string SubModuleName { get; set; }
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; }
    public string ModuleName { get; set; }
    public List<PermissionCode> Permissions { get; set; }
    public List<Guid> AllowedDepartmentIds { get; set; }
}

// Thêm ModuleId, ModuleCode vào SubModulePermissionDto
public class SubModulePermissionDto
{
    public Guid SubModuleId { get; set; }
    public string SubModuleCode { get; set; }
    public string SubModuleName { get; set; }
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; }
    public string ModuleName { get; set; }
    public List<PermissionCode> Permissions { get; set; }
}

public class DepartmentPermissionDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public List<ModulePermissionDto> Modules { get; set; }
}

public class ModulePermissionDto
{
    public Guid ModuleId { get; set; }
    public string ModuleCode { get; set; }
    public string ModuleName { get; set; }
    public List<PermissionCode> Permissions { get; set; }
}

public class PositionPermissionDto
{
    public Guid PositionId { get; set; }
    public string PositionName { get; set; }
    public List<SubModulePermissionDto> SubModules { get; set; }
}

public class UserPermissionOverrideDto
{
    public Guid SubModuleId { get; set; }
    public string SubModuleName { get; set; }
    public Guid PermissionId { get; set; }
    public PermissionCode PermissionCode { get; set; }
    public bool IsGranted { get; set; }
    public string? Reason { get; set; }
}
