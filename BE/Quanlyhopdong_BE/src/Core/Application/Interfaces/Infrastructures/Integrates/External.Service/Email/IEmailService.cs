using Application.Dto.Authorization.Verification;

namespace Application.Interfaces.Infrastructures.Integrates.External.Service.Email;

public interface IEmailService
{
    Task ChangePasswordSuccessfullyAsync(string emailAddress, string fullName, string language, bool useQueue = false);

    Task SendVerificationPasswordReset(SendVerificationByEmailInput input, string language, bool useQueue = false);

    Task SendVerificationCodeAsync(SendVerificationByEmailInput input, string language, bool useQueue = false);

    Task SendVerificationEmailVerify(SendVerificationByEmailInput input, string language, bool useQueue = false);

    Task SendVerificationEmailVerifyLinkOnly(SendVerificationByEmailInput input, string language, bool useQueue = false);

    Task SendVerificationCodeForUpdateProfileAsync(SendVerificationByEmailInput input, string language, bool useQueue = false);

    Task SendUserEmailPasswordProfileAsync(SendProfileEmailPasswordDefaultInput input, string language, bool useQueue = false);
    Task SendBulkUserEmailPasswordProfileAsync(IList<SendProfileEmailPasswordDefaultInput> inputs, string language);
}