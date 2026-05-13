using System.ComponentModel.DataAnnotations;
using Application.Utility;

namespace Application.Dto.Authorization.Verification;

public class EmailMessage
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = true;
}

public class SendVerificationInput
{
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    public string CaptchaToken { get; set; } = string.Empty;

    /// <summary>
    /// Set id Locale as en, vi
    /// </summary>
    public string Locale { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;
}

public class PhoneVerificationInput
{
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    public string SessionInfo { get; set; } = string.Empty;
}

public class SendVerificationEmailInput
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Locale { get; set; } = string.Empty;
}

public class SendVerificationEmailModel
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string Mode { get; set; } = string.Empty;

    public string Locale { get; set; } = string.Empty;
}

public class SendVerificationByEmailInput
{
    public string Mode { get; set; } = string.Empty;
    public string Locale { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
}

public class SendProfileEmailPasswordDefaultInput
{
    public string Mode { get; set; } = string.Empty;
    public string Locale { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class SendInviteUserEmailInput : SendVerificationByEmailInput
{
    public string InviteeName { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string InviteeEmail { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class EmailVerificationInput
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;
}

public class EmailVerificationModel
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;
}

public class PhoneVerificationModel
{
    public string Phone { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;
}

public class VerifyCurrentUserEmailTokenInput
{
    public string c { get; set; } = string.Empty;
}

public class VerifyCurrentUserEmailInput
{
    public string c { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
}


public class EmailQueueItem
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Html { get; set; } = string.Empty;
    public DateTime QueuedAt { get; set; }

    // Thêm cho retry + DLQ
    public int RetryCount { get; set; } = 0;
    public const int MaxRetries = 3;         // Có thể config từ appsettings
    public string? LastError { get; set; }   // Lưu thông báo lỗi cuối
}

public class VerifyUserEmailTokenInput
{
    /// <summary>
    /// Encrypted values for {Email}, {Token}, {Mode}
    /// </summary>
    public string c { get; set; }

    public string Mode { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }

    public VerifyUserEmailTokenInput(string c)
    {
        this.c = c;
        Email = string.Empty;
        Token = string.Empty;
        Mode = string.Empty;
    }

    public virtual void ResolveParameters()
    {
        c = Uri.UnescapeDataString(c);
        if (string.IsNullOrEmpty(c))
        {
            throw new Exception("Invalid parameters");
        }

        string? parameterDecryptString = Utils.DecryptString(c);

        string[]? parameters = parameterDecryptString.Split("|");

        if (parameters.Length != 3)
        {
            throw new Exception("Invalid parameters");
        }

        Email = parameters[0];
        Token = parameters[1];
        Mode = parameters[2];
    }
}