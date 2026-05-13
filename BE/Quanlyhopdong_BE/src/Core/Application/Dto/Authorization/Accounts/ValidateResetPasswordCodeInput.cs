using System.ComponentModel.DataAnnotations;

namespace Application.Dto.Authorization.Accounts;

public class ValidateResetPasswordCodeInput
{
    //[EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [StringLength(328)]
    public string ResetCode { get; set; } = string.Empty;

    [StringLength(1000)]
    public string c { get; set; } = string.Empty;
}