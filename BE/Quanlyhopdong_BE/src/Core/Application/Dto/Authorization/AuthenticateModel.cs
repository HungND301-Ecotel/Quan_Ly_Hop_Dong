using System.ComponentModel.DataAnnotations;

namespace Application.Dto.Authorization;

public class AuthenticateModel
{
    /// <summary>
    /// UserName Or EmailAddress
    /// </summary>
    [Required]
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Password user
    /// </summary>
    [Required]
    public string Password { get; set; } = string.Empty;
}