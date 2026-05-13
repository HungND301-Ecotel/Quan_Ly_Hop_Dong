using Application.Dto.Authorization.Accounts;
using Application.Interfaces.Services;
using Domain.Exceptions;
using Host.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace Host.Controllers.Client;

public class AccountController(
    IUserService userService)
    : BaseNoAuthController
{
    /// <summary>
    /// This is action ForgotPassword
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(SendPasswordResetCodeInput input)
    {
        var result = await userService.ForgotPassword(input);
        return Ok(result);
    }

    [HttpPost("validate-reset-password-code")]
    public async Task<IActionResult> ValidResetPasswordCode(ValidateResetPasswordCodeInput input)
    {
        var output = await userService.ValidResetPasswordCode(input);
        return Ok(output);
    }

    /// <summary>
    /// Reset Password by link from email
    /// </summary>
    /// <param name="input">Reset with c is param</param>
    /// <returns></returns>
    ///
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordInput input)
    {
        string userEmail = await userService.ResetPassword(input);
        return Ok(userEmail);
    }

    [HttpPost("external-login")]
    public async Task<IActionResult> ExternalLogin([FromBody] ExternalAuthDto externalAuth)
    {
        switch (externalAuth.Provider)
        {
            default:
                {
                    throw new UnauthorizedException("Invalid provider");
                }
        }

        await Task.WhenAll();
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailInput input)
    {
        await userService.ValidateVerifyEmail(input);
        return Ok();
    }
}