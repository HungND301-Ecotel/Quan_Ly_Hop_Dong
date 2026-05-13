using Application.Dto.Catalog;
using Domain.Common.Enums;
using Microsoft.AspNetCore.Http;

namespace Application.Dto.Persistence.Catalog.User;

public class UserDto : ShortUserInfo
{
    public bool? IsVerifiedPhone { get; set; }
    public bool? IsVerifiedEmail { get; set; }
    public string? RegisterProvider { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public List<UserSignatureDto> Signatures { get; set; } = new List<UserSignatureDto>();
}
public class UserDepartmentDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public bool IsPrimary { get; set; }
}

public class ShortUserInfo
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public UserRole? Role { get; set; }
    public Guid PositionId { get; set; }
    public string? PositionName { get; set; }
}
public class UpdateUserInfoInput
{
    public Guid Id { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public Guid PositionId { get; set; }
    public Guid Department { get; set; }
}

public class CreateNewAccountInput
{
    public string UserName { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public UserRole UserRole { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid PositionId { get; set; }
}

public class UpdateUserPasswordInput
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string RePassword { get; set; } = string.Empty;
}

public class UploadAvatarInput
{
    public IFormFile FileData { get; set; }
}