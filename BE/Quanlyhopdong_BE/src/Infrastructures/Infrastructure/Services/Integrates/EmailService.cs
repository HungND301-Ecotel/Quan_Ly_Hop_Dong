using Application.Dto.Authorization.Verification;
using Application.Interfaces.Infrastructures.Integrates.External.Service.Email;
using Infrastructure.Localization;
using Shared.Constants;
using Shared.Constants.EmailTemplate;

namespace Infrastructure.Services.Integrates;

public class EmailService(IEmailTemplateProvider emailTemplateProvider, IEmailSender emailSender, IEmailQueueService emailQueueService)
    : IEmailService
{
    public async Task SendVerificationPasswordReset(SendVerificationByEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.ResetPassword, language);

        emailTemplate = emailTemplate.Replace("{USER}", input.UserName);

        if (!string.IsNullOrEmpty(input.Code) && !string.IsNullOrEmpty(input.Token))
        {
            emailTemplate = emailTemplate.Replace("{CODE}", input.Code);
            emailTemplate = emailTemplate.Replace("{LINK}", input.Link);
        }

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_REQUEST_CHANGE_PASSWORD_TITLE", language), emailTemplate, useQueue);
    }
    public async Task SendVerificationEmailVerify(SendVerificationByEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.CurrentEmail, language);

        if (!string.IsNullOrEmpty(input.Code))
        {
            emailTemplate = emailTemplate.Replace("{USER}", input.UserName);
            emailTemplate = emailTemplate.Replace("{CODE}", input.Code);
            emailTemplate = emailTemplate.Replace("{EMAIL}", input.Email);
        }

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_VERIFICATION_TITLE", language), emailTemplate, useQueue);
    }
    public async Task SendVerificationEmailVerifyLinkOnly(SendVerificationByEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.CurrentEmailOnlyLink, language);

        if (!string.IsNullOrEmpty(input.Code) && !string.IsNullOrEmpty(input.Token))
        {
            emailTemplate = emailTemplate.Replace("{USER}", input.UserName);
            emailTemplate = emailTemplate.Replace("{LINK}", input.Link);
            emailTemplate = emailTemplate.Replace("{EMAIL}", input.Email);
        }

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_VERIFICATION_TITLE", language), emailTemplate, useQueue);
    }
    public async Task ChangePasswordSuccessfullyAsync(string emailAddress, string username, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        if (string.IsNullOrEmpty(emailAddress))
        { return; }

        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.ChangePwdSuccess, language);

        emailTemplate = emailTemplate.Replace("{USER}", username);
        emailTemplate = emailTemplate.Replace("{EMAIL}", emailAddress);

        await ReplaceBodyAndSend(emailAddress, L.T("EMAIL_CHANGED_PASSWORD_SUCCESSFULLY", language), emailTemplate, useQueue);
    }
    public async Task SendVerificationCodeForUpdateProfileAsync(SendVerificationByEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        if (string.IsNullOrEmpty(input.Email) || !input.Email.Contains("@"))
        {
            return;
        }


        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.VerifyEmailForUpdateInfo, language);

        emailTemplate = emailTemplate.Replace("{USER}", input.UserName);
        emailTemplate = emailTemplate.Replace("{CODE}", input.Code);

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_REQUEST_CHANGE_IN_PROFILE_TITLE", language), emailTemplate, useQueue);
    }
    public async Task SendUserInvitationAsync(SendInviteUserEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.UserInvitation, language);
        string title = L.T("EMAIL_INVITE_USER_TITLE", language);
        title = title.Replace("{InviteeName}", input.InviteeName);
        emailTemplate = emailTemplate.Replace("{TITLE}", title);
        emailTemplate = emailTemplate.Replace("{InviteeName}", input.InviteeName);
        emailTemplate = emailTemplate.Replace("{InviteeEmail}", input.InviteeEmail);
        emailTemplate = emailTemplate.Replace("{OrganizationName}", input.OrganizationName);

        if (!string.IsNullOrEmpty(input.Link))
        {
            emailTemplate = emailTemplate.Replace("{LINK}", input.Link);
        }

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_INVITE_USER_SUBJECT", language), emailTemplate, useQueue);
    }
    public async Task SendVerificationCodeAsync(SendVerificationByEmailInput input, string language = EmailSupportLanguageConst.Vietnamese, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.LoginEmailCode, language);

        emailTemplate = emailTemplate.Replace("{EMAIL}", input.Email);

        switch (input.Mode)
        {
            case UserVerificationMode.VerificationForSignin:
                emailTemplate = emailTemplate.Replace("{TITLE}", L.T("EMAIL_LOGIN_CODE_TITLE", language));
                break;

            default:
                emailTemplate = emailTemplate.Replace("{TITLE}", L.T("EMAIL_VERIFICATION_TITLE", language));
                break;
        }

        if (!string.IsNullOrEmpty(input.Code))
        {
            emailTemplate = emailTemplate.Replace("{CODE}", input.Code);
        }

        switch (input.Mode)
        {
            case UserVerificationMode.VerificationForSignin:
                await ReplaceBodyAndSend(input.Email, L.T("EMAIL_LOGIN_CODE_TITLE", language), emailTemplate, useQueue);
                break;

            default:
                await ReplaceBodyAndSend(input.Email, L.T("EMAIL_VERIFICATION_TITLE", language), emailTemplate, useQueue);
                break;
        }
    }

    public async Task SendUserEmailPasswordProfileAsync(SendProfileEmailPasswordDefaultInput input, string language, bool useQueue = false)
    {
        string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.UserEmailPassword, language);

        emailTemplate = emailTemplate.Replace("{USER}", input.FullName);

        if (!string.IsNullOrEmpty(input.Email) && !string.IsNullOrEmpty(input.Password))
        {
            emailTemplate = emailTemplate.Replace("{EMAIL}", input.Email);
            emailTemplate = emailTemplate.Replace("{PASSWORD}", input.Password);
        }

        await ReplaceBodyAndSend(input.Email, L.T("EMAIL_REQUEST_CHANGE_PASSWORD_TITLE", language), emailTemplate, useQueue);
    }

    public async Task SendBulkUserEmailPasswordProfileAsync(IList<SendProfileEmailPasswordDefaultInput> inputs, string language)
    {
        var emailTasks = new List<(string to, string subject, string html)>();

        foreach (var input in inputs)
        {
            string emailTemplate = await emailTemplateProvider.GetTemplateByNameAsync(EmailTemplateNameConst.UserEmailPassword, language);

            emailTemplate = emailTemplate.Replace("{USER}", input.FullName);

            if (!string.IsNullOrEmpty(input.Email) && !string.IsNullOrEmpty(input.Password))
            {
                emailTemplate = emailTemplate.Replace("{EMAIL}", input.Email);
                emailTemplate = emailTemplate.Replace("{PASSWORD}", input.Password);
            }

            string subject = L.T("EMAIL_USER_PROFILE_EMAIL_PASSWORD", language);
            emailTasks.Add((input.Email, subject, emailTemplate));
        }

        await emailQueueService.QueueBulkAsync(emailTasks);
    }
    private async Task ReplaceBodyAndSend(
        string emailAddress,
        string subject,
        string emailTemplate,
        bool useQueue = false)
    {
        if (useQueue && emailQueueService != null)
        {
            await emailQueueService.QueueAsync(emailAddress, subject, emailTemplate);
        }
        else
        {
            await emailSender.SendAsync(emailAddress, subject, emailTemplate);
        }
    }
}