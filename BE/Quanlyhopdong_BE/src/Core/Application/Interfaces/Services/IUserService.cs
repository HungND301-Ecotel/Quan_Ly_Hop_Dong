using Application.Catalog.Users.Commands;
using Application.Dto.Authorization.Accounts;
using Application.Dto.Authorization.Verification;
using Application.Dto.Catalog;
using Application.Dto.Persistence.Catalog.User;
using MediatR;

namespace Application.Interfaces.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();

    Task<Unit> UpdateUserAsync(UpdateUserInfoInput updateUser);

    Task<bool> CreateNewAccountAsync(CreateNewAccountInput account);

    Task<bool> DeleteUserAsync(Guid userId);
    Task<bool> DeleteUserListAsync(IList<Guid> userIds);

    /// <summary>
    /// Authenticates user and returns user data
    /// </summary>
    Task<UserDto> GetLoginResultAsync(string username, string password);

    /// <summary>
    /// Changes user password using current password verification
    /// </summary>
    Task<bool> ChangePassword(UpdatePasswordCommand request);

    /// <summary>
    /// Checks if email exists in the system
    /// </summary>
    Task<CheckingItemExistModel> CheckEmailExisted(string email);

    /// <summary>
    /// Gets user by email address
    /// </summary>
    Task<UserDto> GetUserEmailExisted(string email);

    /// <summary>
    /// Gets user by ID with roles and avatar
    /// </summary>
    Task<UserDto> GetUserByIdAsync(Guid userId);

    /// <summary>
    /// Registers a new user account
    /// </summary>
    Task<UserDto> Register(RegisterAccountInput input);

    /// <summary>
    /// Changes user password by user ID (admin function)
    /// </summary>
    Task ChangePasswordAsync(Guid userId, string password);

    /// <summary>
    /// Initiates password reset process
    /// </summary>
    Task<SendVerificationEmailOutputModel> ForgotPassword(SendPasswordResetCodeInput input);

    /// <summary>
    /// Validates password reset code/token
    /// </summary>
    Task<ResetPasswordOutput> ValidResetPasswordCode(ValidateResetPasswordCodeInput input);

    /// <summary>
    /// Resets password using reset token
    /// </summary>
    Task<string> ResetPassword(ResetPasswordInput input);

    /// <summary>
    /// Validates email verification
    /// </summary>
    Task ValidateVerifyEmail(VerifyEmailInput input);

    /// <summary>
    /// Sets email as verified
    /// </summary>
    Task SetVerificationEmail(string email);

    /// <summary>
    /// Resends email verification
    /// </summary>
    Task ResendVerificationEmail(Guid userId);

    Task<UserPermissionsDto> GetUserPermissionsAsync(Guid userId);
    Task<List<UserSignatureDto>> GetUserSignaturesAsync(Guid userId);
    Task<UserSignatureDto> CreateUserSignatureAsync(Guid userId, CreateUserSignatureDto dto);
    Task<bool> DeleteUserSignatureAsync(Guid userId, Guid signatureId);
    Task<bool> SetStatusUserSignatureAsync(Guid userId, Guid signatureId, bool status);
    Task<bool> SendUserPasswordAccountEmailAsync(IList<Guid> userIds);
}