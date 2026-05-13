using Application.Catalog.Users.Commands;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Dto.Authorization.Accounts;
using Application.Dto.Authorization.Verification;
using Application.Dto.Catalog;
using Application.Dto.Cloud.AWS;
using Application.Dto.Persistence.Catalog.User;
using Application.Interfaces.Infrastructures.Integrates.Cloud.Service.AWS;
using Application.Interfaces.Infrastructures.Integrates.External.Service.Email;
using Application.Interfaces.Services;
using Application.Utility;
using Domain.Common.Enums;
using Domain.Entities.Identity;
using Humanizer;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Constants;
using Shared.Constants.EmailTemplate;
using User = Domain.Entities.Identity.User;

namespace Infrastructure.Services.Identity;

public class UserService(
    IUnitOfWork unitOfWork,
    IVerificationService verificationService,
    IEmailService emailService,
    ICurrentUser currentUser,
    IAwsS3Service awsS3Service) : IUserService
{
    private readonly IWriteRepository<User> _userRepository = unitOfWork.GetRepository<User>();
    private readonly IWriteRepository<UserDepartment> _userDepartmentRepository = unitOfWork.GetRepository<UserDepartment>();
    private readonly IWriteRepository<DepartmentModulePermission> _departmentModulePermissionRepository = unitOfWork.GetRepository<DepartmentModulePermission>();
    private readonly IWriteRepository<PositionSubmodulePermission> _positionSubmodulePermissionRepository = unitOfWork.GetRepository<PositionSubmodulePermission>();
    private readonly IWriteRepository<UserPermissionOverride> _userPermissionOverrideRepository = unitOfWork.GetRepository<UserPermissionOverride>();
    private readonly IWriteRepository<UserSignature> _userSignatureRepository = unitOfWork.GetRepository<UserSignature>();

    public async Task<UserDto> GetLoginResultAsync(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            throw new NotFoundException(CustomResponseMessage.InvalidUserNameOrPassword);
        }

        string normalizedUsername = Utils.NormalizeUserName(username);

        string passwordHash = Utils.ComputeHash(password);

        string defaultPasswordHash = Utils.ComputeHash(AppConsts.DefaultPassword);
        bool allowDefaultPassword = passwordHash == defaultPasswordHash;

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => (u.NormalizedUserName == normalizedUsername || u.NormalizedEmail == normalizedUsername),
            include: u => u.Include(u => u.Position)
                    .Include(p => p.UserDepartments).ThenInclude(u => u.Department)
                    .Include(p => p.UserSignatures),
            disableTracking: false
        );

        if (user == null)
        {
            throw new NotFoundException(CustomResponseMessage.InvalidUserNameOrPassword);
        }

        if (user.IsLockedOut())
        {
            throw new NotFoundException($"{MessageCommon.AccountLocked}, Please wait until {user.LockoutEnd}");
        }

        if (user.AccessFailedCount > 5)
        {
            user.LockAccount(TimeSpan.FromMinutes(5));
            user.ResetAccessFailedCount();
            await unitOfWork.SaveChangesAsync();
            throw new NotFoundException($"{MessageCommon.AccountLocked}, Please wait until {user.LockoutEnd}");
        }

        if (!(user.PasswordHash == passwordHash || allowDefaultPassword))
        {
            user.IncrementAccessFailedCount();
            await unitOfWork.SaveChangesAsync();
            throw new NotFoundException(CustomResponseMessage.InvalidUserNameOrPassword);
        }

        user.ResetAccessFailedCount();
        await unitOfWork.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            PhoneNumber = user.PhoneNumber,
            Fullname = user.Fullname,
            Avatar = user.Avatar,
            Email = user.Email,
            PositionId = user.PositionId,
            PositionName = user.Position?.Name ?? "",
            Role = user.Role,
            UserName = user.UserName,
            IsVerifiedEmail = user.IsVerifiedEmail,
            IsVerifiedPhone = user.IsVerifiedPhone,
            RegisterProvider = user.RegisterProvider,
            Signatures = user.UserSignatures.Adapt<List<UserSignatureDto>>(),
            DepartmentId = user.UserDepartments.FirstOrDefault()!.DepartmentId,
            DepartmentName = user.UserDepartments.FirstOrDefault()!.Department.Name
        };
    }

    /// <summary>
    /// Gets user by ID with full profile information
    /// </summary>
    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: x => x.Id == userId,
            include: u => u.Include(u => u.Position)
                    .Include(p => p.UserDepartments).ThenInclude(u => u.Department)
                    .Include(p => p.UserSignatures),
            disableTracking: true) ?? throw new NotFoundException(MessageCommon.DataNotFound);

        var result = new UserDto
        {
            Id = user.Id,
            PhoneNumber = user.PhoneNumber,
            Fullname = user.Fullname,
            Avatar = user.Avatar,
            Email = user.Email,
            PositionId = user.PositionId,
            PositionName = user.Position?.Name ?? "",
            Role = user.Role,
            UserName = user.UserName,
            IsVerifiedEmail = user.IsVerifiedEmail,
            IsVerifiedPhone = user.IsVerifiedPhone,
            RegisterProvider = user.RegisterProvider,
            Signatures = user.UserSignatures.Adapt<List<UserSignatureDto>>(),
            DepartmentId = user.UserDepartments.FirstOrDefault()!.DepartmentId,
            DepartmentName = user.UserDepartments.FirstOrDefault()!.Department.Name
        };
        return result;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync(
            include: u => u.Include(u => u.Position)
                    .Include(p => p.UserDepartments).ThenInclude(u => u.Department)
                    .Include(p => p.UserSignatures),
            disableTracking: true) ?? throw new NotFoundException(MessageCommon.DataNotFound);

        return users.Select(user =>
        {
            var userDto = user.Adapt<UserDto>();
            userDto.PositionName = user.Position?.Name;
            userDto.DepartmentId = user.UserDepartments.FirstOrDefault()!.DepartmentId;
            userDto.DepartmentName = user.UserDepartments.FirstOrDefault()!.Department.Name;
            userDto.Signatures = user.UserSignatures.Adapt<List<UserSignatureDto>>();
            return userDto;
        }).ToList();
    }

    public async Task<Unit> UpdateUserAsync(UpdateUserInfoInput updateUser)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
                    predicate: x => x.Id == updateUser.Id,
                    include: x => x.Include(x => x.UserDepartments),
                    disableTracking: true)
                   ?? throw new NotFoundException(MessageCommon.DataNotFound);

        await unitOfWork.BeginTransactionAsync();
        try
        {
            _userDepartmentRepository.Delete(user.UserDepartments);

            user.Update(updateUser.Email, updateUser.PhoneNumber, updateUser.Fullname,
                        updateUser.PositionId, updateUser.Role);
            user.AddUserDepartment(user.UserDepartments.Select(u => UserDepartment.Create(u.DepartmentId, u.IsPrimary)));
            _userRepository.Update(user);
            await unitOfWork.SaveChangesAsync();

            await unitOfWork.CommitAsync();
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            throw new BadRequestException(MessageCommon.UpdateFailed);
        }

        return Unit.Value;
    }

    public async Task<bool> CreateNewAccountAsync(CreateNewAccountInput account)
    {
        var existingUser = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Email == account.Email,
            disableTracking: true);

        if (existingUser != null)
        {
            throw new BadRequestException(CustomResponseMessage.EmailAlreadyExists);
        }

        var checkUserNameExisted = await CheckUsernameExisted(account.UserName.Trim());
        if (checkUserNameExisted.Existed)
        {
            throw new BadRequestException(CustomResponseMessage.UserNameAlreadyExists);
        }

        if (!string.IsNullOrEmpty(account.Email))
        {
            var checkEmailExisted = await CheckEmailExisted(account.Email.Trim());
            if (checkEmailExisted.Existed)
            {
                throw new BadRequestException(CustomResponseMessage.EmailAlreadyExists);
            }
        }

        if (!string.IsNullOrEmpty(account.PhoneNumber))
        {
            var checkPhoneNumberExisted = await CheckPhoneNumberExisted(account.PhoneNumber.Trim());
            if (checkPhoneNumberExisted.Existed)
            {
                throw new BadRequestException(CustomResponseMessage.PhoneAlreadyExists);
            }
        }

        if (account.Password == null)
        {
            account.Password = AppConsts.DefaultPassword;
        }

        var newAccount = new User(account.UserName, account.Email.Trim(), account.PhoneNumber, account.Fullname, account.PositionId, account.UserRole);
        newAccount.SetPassword(Utils.ComputeHash(account.Password));
        newAccount.AddUserDepartment(UserDepartment.Create(account.DepartmentId, true));

        var insertUser = (await _userRepository.InsertAsync(newAccount)).Entity;

        await unitOfWork.SaveChangesAsync();
        return true;
    }


    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var existingUser = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == userId,
            disableTracking: true);

        if (existingUser == null)
        {
            throw new BadRequestException(CustomResponseMessage.UserDoesNotExist);
        }

        _userRepository.Delete(existingUser);
        return await unitOfWork.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteUserListAsync(IList<DefaultIdType> userIds)
    {
        var distinctIds = userIds.Distinct().ToList();

        if (distinctIds.Count != userIds.Count)
        {
            throw new ConflictException(CustomResponseMessage.DeletedIdDuplicated);
        }

        if (!distinctIds.Any())
        {
            throw new BadRequestException(CustomResponseMessage.DeletedIdsEmpty);
        }

        var existingUsers = await _userRepository.GetAllAsync(
            predicate: u => userIds.Contains(u.Id),
            disableTracking: true);

        if (existingUsers == null || !existingUsers.Any())
        {
            throw new NotFoundException(CustomResponseMessage.EntityNotFound);
        }

        if (existingUsers.Count != distinctIds.Count)
        {
            throw new NotFoundException(CustomResponseMessage.MaterialNotFound);
        }

        _userRepository.Delete(existingUsers);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto> Register(RegisterAccountInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Username))
        {
            throw new ArgumentException("Username cannot be empty", nameof(input.Username));
        }

        if (string.IsNullOrWhiteSpace(input.Email))
        {
            throw new ArgumentException("Email cannot be empty", nameof(input.Email));
        }

        if (string.IsNullOrWhiteSpace(input.FullName) || input.Username.Length < 3)
        {
            throw new ArgumentException("invalid Fullname", nameof(input.FullName));
        }

        if (string.IsNullOrWhiteSpace(input.Password))
        {
            throw new ArgumentException("Password cannot be empty", nameof(input.Password));
        }
        var existingUser = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Email == input.Email,
            disableTracking: true);

        if (existingUser != null)
        {
            throw new BadRequestException(CustomResponseMessage.UserNameAlreadyExists);
        }

        var checkEmailExisted = await CheckEmailExisted(input.Email.Trim());

        if (checkEmailExisted.Existed)
        {
            throw new BadRequestException(CustomResponseMessage.EmailAlreadyExists);
        }

        var userRegister = new User(input.Email, input.Email.Trim(), input.FullName);
        userRegister.SetPassword(Utils.ComputeHash(input.Password));

        await _userRepository.InsertAsync(userRegister);
        await unitOfWork.SaveChangesAsync();

        await verificationService.SaveAndSendVerificationByEmail(new SendVerificationEmailModel
        {
            Email = input.Email,
            Locale = EmailSupportLanguageConst.Vietnamese,
            Mode = UserVerificationMode.VerifyCurrentUserEmailByLinkOnly
        }, userRegister.Id);

        return userRegister.Adapt<UserDto>();
    }

    /// <summary>
    /// Changes user password with current password verification
    /// </summary>
    public async Task<bool> ChangePassword(UpdatePasswordCommand request)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            throw new BadRequestException("New password and confirmation password do not match");
        }

        string passwordHash = Utils.ComputeHash(request.CurrentPassword);

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == request.UserId,
            disableTracking: false
        );

        if (user is null || !user.PasswordHash.Equals(passwordHash))
        {
            throw new BadRequestException("The old password is incorrect");
        }

        string newPasswordHash = Utils.ComputeHash(request.NewPassword);
        user.SetPassword(newPasswordHash);

        await unitOfWork.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Checks if an email address already exists in the system
    /// </summary>
    public async Task<CheckingItemExistModel> CheckEmailExisted(string email)
    {
        if (!Utils.CheckEmailIsValid(email))
        {
            throw new ArgumentException("Wrong email format");
        }

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Email == email,
            disableTracking: true);

        return new CheckingItemExistModel(user != null, user?.IsVerifiedPhone ?? false, email.Trim());
    }

    /// <summary>
    /// Checks if an username already exists in the system
    /// </summary>
    public async Task<CheckingItemExistModel> CheckUsernameExisted(string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            throw new ArgumentException("username is null or empty");
        }

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.UserName == username,
            disableTracking: true);

        return new CheckingItemExistModel(user != null, user?.IsVerifiedPhone ?? false, username.Trim());
    }

    public async Task<CheckingItemExistModel> CheckPhoneNumberExisted(string phoneNumber)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.PhoneNumber == phoneNumber,
            disableTracking: true);

        return new CheckingItemExistModel(user != null, user?.IsVerifiedPhone ?? false, phoneNumber.Trim());
    }

    /// <summary>
    /// Gets user information by email address
    /// </summary>
    public async Task<UserDto> GetUserEmailExisted(string email)
    {
        if (!Utils.CheckEmailIsValid(email))
        {
            throw new ArgumentException("Wrong email format");
        }

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Email == email,
            disableTracking: true);

        return user.Adapt<UserDto>();
    }

    /// <summary>
    /// Changes user password by user ID (admin function)
    /// </summary>
    public async System.Threading.Tasks.Task ChangePasswordAsync(Guid userId, string password)
    {
        string passwordHash = Utils.ComputeHash(password);

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == userId,
            disableTracking: false);

        if (user is null)
        {
            throw new NotFoundException(CustomResponseMessage.UserDoesNotExist);
        }

        user.SetPassword(passwordHash);
        user.ClearPasswordResetToken();

        _userRepository.Update(user);
        await unitOfWork.SaveChangesAsync();
    }

    /// <summary>
    /// Sets new password reset token for user
    /// </summary>
    private async Task<string> SetNewPasswordResetToken(Guid userId)
    {
        string? token = Guid.NewGuid().ToString("N").Truncate(328);
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == userId,
            disableTracking: false);

        if (user is null)
        {
            throw new NotFoundException(CustomResponseMessage.UserDoesNotExist);
        }

        user.GeneratePasswordResetToken(token, TimeSpan.FromHours(1)); // Token expires in 1 hour
        _userRepository.Update(user);
        await unitOfWork.SaveChangesAsync();
        return token;
    }

    /// <summary>
    /// Initiates password reset process by sending verification email
    /// </summary>
    public async Task<SendVerificationEmailOutputModel> ForgotPassword(SendPasswordResetCodeInput input)
    {

        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.NormalizedEmail == input.EmailAddress.ToUpperInvariant(),
            disableTracking: true);

        if (user == null)
        {
            throw new NotFoundException(CustomResponseMessage.EmailDoesNotExist);
        }

        if (user.IsVerifiedEmail == false)
        {
            throw new BadRequestException(CustomResponseMessage.EmailDoesNotVerify);
        }

        return await verificationService.SaveAndSendVerificationByEmail(new SendVerificationEmailModel
        {
            Email = user.Email,
            Mode = UserVerificationMode.ForgotPassword
        }, user.Id);
    }

    /// <summary>
    /// Validates password reset code or token
    /// </summary>
    public async Task<ResetPasswordOutput> ValidResetPasswordCode(ValidateResetPasswordCodeInput input)
    {
        if (string.IsNullOrEmpty(input.c) && string.IsNullOrEmpty(input.ResetCode))
        {
            throw new BadRequestException(CustomResponseMessage.InvalidParams);
        }

        EmailConfirmVerificationOutput emailConfirm;

        if (!string.IsNullOrEmpty(input.c))
        {
            var verificationTokenInput = new VerifyUserEmailTokenInput(input.c);
            verificationTokenInput.ResolveParameters();

            if (verificationTokenInput.Mode != UserVerificationMode.ForgotPassword)
            {
                throw new BadRequestException(CustomResponseMessage.NotAllowed);
            }

            emailConfirm = await verificationService.VerifyUserEmailByToken(new EmailVerificationModel
            {
                Email = verificationTokenInput.Email,
                Token = verificationTokenInput.Token
            });

            if (!emailConfirm.VerifiedEmail)
            {
                throw new BadRequestException(emailConfirm.Message);
            }
        }
        else if (!string.IsNullOrEmpty(input.ResetCode) && !string.IsNullOrEmpty(input.Email))
        {
            emailConfirm = await verificationService.VerifyUserEmailByCode(new EmailVerificationModel
            {
                Email = input.Email,
                Code = input.ResetCode
            }, UserVerificationMode.ForgotPassword);

            if (!emailConfirm.VerifiedEmail)
            {
                throw new BadRequestException(emailConfirm.Message);
            }
        }
        else
        {
            throw new BadRequestException(CustomResponseMessage.InvalidParams);
        }

        if (!emailConfirm.UserId.HasValue)
        {
            throw new NotFoundException(CustomResponseMessage.UserDoesNotExist);
        }

        string token = await SetNewPasswordResetToken(emailConfirm.UserId.Value);

        return new ResetPasswordOutput
        {
            Token = token,
            Email = emailConfirm.Email
        };
    }

    /// <summary>
    /// Resets user password using reset token
    /// </summary>

    public async Task<string> ResetPassword(ResetPasswordInput input)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Email == input.Email && u.PasswordResetToken == input.ResetToken,
            disableTracking: false);

        if (user == null)
        {
            throw new NotFoundException(CustomResponseMessage.EmailDoesNotExist);
        }

        if (user.PasswordResetExpiration < DateTime.UtcNow)
        {
            throw new BadRequestException(CustomResponseMessage.TokenExpired);
        }

        await ChangePasswordAsync(user.Id, input.NewPassword);
        await emailService.ChangePasswordSuccessfullyAsync(input.Email, user.Fullname, EmailSupportLanguageConst.Vietnamese);

        return user.Email;
    }

    /// <summary>
    /// Validates email verification token
    /// </summary>
    public async System.Threading.Tasks.Task ValidateVerifyEmail(VerifyEmailInput input)
    {
        if (!string.IsNullOrEmpty(input.C))
        {
            var verificationTokenInput = new VerifyUserEmailTokenInput(input.C);
            verificationTokenInput.ResolveParameters();

            if (verificationTokenInput.Mode != UserVerificationMode.VerifyCurrentUserEmailByLinkOnly)
            {
                throw new BadRequestException(CustomResponseMessage.NotAllowed);
            }

            var emailConfirm = await verificationService.VerifyUserEmailByToken(new EmailVerificationModel
            {
                Email = verificationTokenInput.Email,
                Token = verificationTokenInput.Token
            });

            if (!emailConfirm.VerifiedEmail)
            {
                throw new BadRequestException(emailConfirm.Message);
            }

            await SetVerificationEmail(emailConfirm.Email);
        }
    }

    /// <summary>
    /// Sets email as verified for user
    /// </summary>
    public async System.Threading.Tasks.Task SetVerificationEmail(string email)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.NormalizedEmail == email.ToUpperInvariant(),
            disableTracking: false);

        if (user == null)
        {
            throw new NotFoundException(CustomResponseMessage.UserDoesNotExist);
        }

        user.VerifyEmail();
        _userRepository.Update(user);
        await unitOfWork.SaveChangesAsync();
    }

    /// <summary>
    /// Resends email verification to user
    /// </summary>
    public async System.Threading.Tasks.Task ResendVerificationEmail(Guid userId)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == userId,
            disableTracking: true);

        if (user is null || user.IsVerifiedEmail.HasValue && user.IsVerifiedEmail.Value)
        {
            return;
        }

        await verificationService.SaveAndSendVerificationByEmail(new SendVerificationEmailModel
        {
            Email = user.Email,
            Locale = EmailSupportLanguageConst.Vietnamese,
            Mode = UserVerificationMode.VerifyCurrentUserEmailByLinkOnly
        }, user.Id);
    }

    public async Task<List<UserSignatureDto>> GetUserSignaturesAsync(Guid userId)
    {
        // Verify user exists
        var user = await _userRepository.FindAsync(userId);
        if (user == null || user.DeletedOn != null)
        {
            throw new NotFoundException("User not found");
        }

        // Only allow users to see their own signatures or admins
        if (currentUser.UserId != userId)
        {
            throw new ForbiddenException("Unauthorized");
        }

        var signatures = await _userSignatureRepository.GetAllAsync(
            predicate: x => x.UserId == userId,
            orderBy: x => x.OrderByDescending(x => x.IsActive).ThenByDescending(x => x.CreatedOn),
            disableTracking: true);

        var tasks = signatures.Select(async x => new UserSignatureDto
        {
            Id = x.Id,
            UserId = x.UserId,
            SignatureType = x.SignatureType,
            SignatureFile = x.SignatureFile != null ? await awsS3Service.GetPresignedDownloadUrl(x.SignatureFile, BucketType.SourceDefault) : "",
            CertificateId = x.CertificateId,
            IsPinSaved = x.IsPinSaved,
            IsActive = x.IsActive
        }).ToList();

        var dtos = (await System.Threading.Tasks.Task.WhenAll(tasks)).ToList();

        return dtos;
    }

    public async Task<UserSignatureDto> CreateUserSignatureAsync(Guid userId, CreateUserSignatureDto dto)
    {
        var user = await _userRepository.FindAsync(userId);
        if (user == null || user.DeletedOn != null)
        {
            throw new NotFoundException("User not found");
        }

        // Only allow users to create their own signatures
        if (currentUser.UserId != userId)
        {
            throw new ForbiddenException("Unauthorized");
        }

        // Validate file
        if ((dto.SignatureFile == null || dto.SignatureFile.Length == 0) && (dto.SignatureType == SignatureType.Normal || dto.SignatureType == SignatureType.Handwritten))
        {
            throw new BadRequestException("Signature file is required");
        }
        var relativeFilePath = string.Empty;
        if (dto.SignatureFile != null)
        {
            // Validate file type
            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg" };
            var fileExtension = Path.GetExtension(dto.SignatureFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ConflictException("Only PNG, JPG, and JPEG files are allowed");
            }

            // Validate file size (max 2MB)
            if (dto.SignatureFile.Length > 2 * 1024 * 1024)
            {
                throw new ConflictException("File size must not exceed 2MB");
            }

            // Save signature file
            var inputModel = new AwsInputModel
            {
                FileId = Guid.NewGuid(),
                FileName = $"signature_{dto.SignatureType}_{user.Email}{fileExtension}",
                BucketType = Application.Dto.Cloud.AWS.BucketType.SourceDefault,
                Module = $"users/{user.Email}/signatures/{dto.SignatureType}",
                ContentType = dto.SignatureFile.ContentType,
                IsExpires = true
            };
            var resultModel = await awsS3Service.UploadFileAsync(dto.SignatureFile, inputModel);
            relativeFilePath = resultModel.Path;
        }

        // Hash PIN if provided
        string? pinHash = null;
        if (dto.SavePin && !string.IsNullOrEmpty(dto.Pin))
        {
            pinHash = BCrypt.Net.BCrypt.HashPassword(dto.Pin);
        }

        await unitOfWork.BeginTransactionAsync();
        try
        {
            var existingSignatures = await _userSignatureRepository.GetAllAsync(
                predicate: x => x.UserId == userId && x.IsActive && x.SignatureType == dto.SignatureType,
                disableTracking: true);

            if (existingSignatures.Any())
            {
                _userSignatureRepository.Delete(existingSignatures);
            }

            // Create signature record
            var signature = UserSignature.Create(userId, dto.SignatureType, relativeFilePath, dto.CertificateId, pinHash, !string.IsNullOrEmpty(pinHash));

            await _userSignatureRepository.InsertAsync(signature);
            await unitOfWork.SaveChangesAsync();
            await unitOfWork.CommitAsync();

            var resultDto = new UserSignatureDto
            {
                Id = signature.Id,
                UserId = signature.UserId,
                SignatureType = signature.SignatureType,
                SignatureFile = signature.SignatureFile,
                IsPinSaved = signature.IsPinSaved,
                CertificateId = signature.CertificateId,
                IsActive = signature.IsActive,
            };

            return resultDto;
        }
        catch
        {
            await unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteUserSignatureAsync(Guid userId, Guid signatureId)
    {
        // Verify user exists
        var user = await _userRepository.FindAsync(userId);
        if (user == null || user.DeletedOn != null)
        {
            throw new NotFoundException("User not found");
        }

        // Only allow users to delete their own signatures
        if (currentUser.UserId != userId)
        {
            throw new ForbiddenException("Unauthorized");
        }

        var signature = await _userSignatureRepository.FindAsync(signatureId);
        if (signature == null || signature.DeletedOn != null)
        {
            throw new NotFoundException("Signature not found");
        }

        if (signature.UserId != userId)
        {
            throw new ForbiddenException("Unauthorized");
        }

        // Soft dele

        _userSignatureRepository.Delete(signature);
        await unitOfWork.SaveChangesAsync();

        // Delete physical file
        if (!string.IsNullOrEmpty(signature.SignatureFile) &&
            File.Exists(signature.SignatureFile))
        {
            File.Delete(signature.SignatureFile);
        }

        return true;
    }


    public async Task<UserPermissionsDto> GetUserPermissionsAsync(Guid userId)
    {
        var user = await _userRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == userId,
            include: x => x.Include(x => x.Position),
            disableTracking: true) ?? throw new NotFoundException("User not found");

        // Lấy raw data từ 3 nguồn
        var userDepartments = (await _userDepartmentRepository.GetAllAsync(
            predicate: u => u.UserId == userId,
            selector: x => x.DepartmentId,
            disableTracking: true)).ToList();

        var departmentPermissions = await GetDepartmentPermissionsAsync(userId, userDepartments);
        var positionPermissions = await GetPositionPermissionsAsync(user.PositionId);
        var userOverrides = await GetUserOverridesAsync(userId);

        // Tính toán permission cuối cùng
        var computedPermissions = ComputeFinalPermissions(
            userDepartments,
            departmentPermissions,
            positionPermissions,
            userOverrides);

        // Flat permissions array cho FE dễ dùng
        var flatPermissions = computedPermissions
            .SelectMany(m => m.SubModules.Select(sm => new
            {
                ModuleCode = m.ModuleCode,
                SubModule = sm
            }))
            .SelectMany(x => x.SubModule.Permissions.Select(p =>
                FormatPermissionKey(x.SubModule.SubModuleCode, p)))
            .Distinct()
            .OrderBy(p => p)
            .ToList();

        var result = new UserPermissionsDto
        {
            UserId = user.Id,
            UserName = user.UserName,
            Fullname = user.Fullname,
            PositionId = user.PositionId,
            PositionName = user.Position?.Name,
            AccessibleDepartmentIds = userDepartments,
            Permissions = flatPermissions,
            //PermissionDetails = computedPermissions
        };

        return result;
    }

    public async Task<bool> SendUserPasswordAccountEmailAsync(IList<DefaultIdType> userIds)
    {
        if (!userIds.Any())
        {
            throw new BadRequestException("UserIds is empty");
        }

        var users = await _userRepository.GetAllAsync(
            predicate: u => userIds.Contains(u.Id),
            disableTracking: true);

        if (users.Count != userIds.Count())
        {
            throw new BadRequestException("UserIds contain 1 or more invlid Id");
        }
        var mailList = new List<SendProfileEmailPasswordDefaultInput>();
        foreach (var u in users)
        {
            mailList.Add(new SendProfileEmailPasswordDefaultInput
            {
                Email = u.Email,
                FullName = u.Fullname,
                Password = AppConsts.DefaultPassword,
                Locale = EmailSupportLanguageConst.Vietnamese,
                Mode = UserVerificationMode.VerifyCurrentUserEmailByLinkOnly
            });
        }

        await emailService.SendBulkUserEmailPasswordProfileAsync(mailList, EmailSupportLanguageConst.Vietnamese);

        return true;
    }

    #region helper
    private string FormatPermissionKey(string moduleCode, string subModuleCode, string permissionCode)
    {
        return $"{moduleCode.ToLower()}.{subModuleCode.ToLower()}.{permissionCode.ToLower()}";
    }

    private string FormatPermissionKey(string subModuleCode, string permissionCode)
    {
        return $"{subModuleCode.ToLower()}.{permissionCode.ToLower()}";
    }

    private async Task<List<DepartmentPermissionDto>> GetDepartmentPermissionsAsync(
        Guid userId,
        List<Guid> userDepartments)
    {
        var deptPerms = await _departmentModulePermissionRepository.GetAllAsync(
            predicate: u => userDepartments.Contains(u.DepartmentId) && u.IsGranted,
            include: u => u.Include(u => u.Department)
                           .Include(u => u.Module)
                           .Include(u => u.Permission),
            disableTracking: true);

        return deptPerms
            .GroupBy(x => new { x.DepartmentId, x.Department.Name })
            .Select(g => new DepartmentPermissionDto
            {
                DepartmentId = g.Key.DepartmentId,
                DepartmentName = g.Key.Name,
                Modules = g.GroupBy(m => new { m.ModuleId, m.Module.Code, m.Module.Name })
                    .Select(mg => new ModulePermissionDto
                    {
                        ModuleId = mg.Key.ModuleId,
                        ModuleCode = mg.Key.Code,
                        ModuleName = mg.Key.Name,
                        Permissions = mg.Select(p => p.Permission.Code).ToList()
                    }).ToList()
            }).ToList();
    }

    private async Task<List<PositionPermissionDto>> GetPositionPermissionsAsync(Guid? positionId)
    {
        if (!positionId.HasValue)
        {
            return new List<PositionPermissionDto>();
        }

        var posPerms = await _positionSubmodulePermissionRepository.GetAllAsync(
            predicate: x => x.PositionId == positionId.Value && x.IsGranted,
            include: x => x.Include(x => x.Position)
                          .Include(x => x.SubModule)
                              .ThenInclude(sm => sm.Module)
                          .Include(x => x.Permission),
            disableTracking: true);

        if (!posPerms.Any())
        {
            return new List<PositionPermissionDto>();
        }

        var position = posPerms.First().Position;

        return new List<PositionPermissionDto>
    {
        new PositionPermissionDto
        {
            PositionId = positionId.Value,
            PositionName = position.Name,
            SubModules = posPerms
                .GroupBy(x => new
                {
                    x.SubModuleId,
                    x.SubModule.Code,
                    x.SubModule.Name,
                    x.SubModule.ModuleId,
                    ModuleCode = x.SubModule.Module.Code,
                    ModuleName = x.SubModule.Module.Name
                })
                .Select(g => new SubModulePermissionDto
                {
                    SubModuleId = g.Key.SubModuleId,
                    SubModuleCode = g.Key.Code,
                    SubModuleName = g.Key.Name,
                    ModuleId = g.Key.ModuleId,
                    ModuleCode = g.Key.ModuleCode,
                    ModuleName = g.Key.ModuleName,
                    Permissions = g.Select(p => p.Permission.Code).ToList()
                }).ToList()
        }
    };
    }

    private async Task<List<UserPermissionOverrideDto>> GetUserOverridesAsync(Guid userId)
    {
        var overrides = await _userPermissionOverrideRepository.GetAllAsync(
            predicate: x => x.UserId == userId,
            include: x => x.Include(x => x.SubModule)
                          .Include(x => x.Permission),
            disableTracking: true);

        return overrides.Select(x => new UserPermissionOverrideDto
        {
            SubModuleId = x.SubModuleId,
            SubModuleName = x.SubModule.Name,
            PermissionId = x.PermissionId,
            PermissionCode = x.Permission.Code,
            IsGranted = x.IsGranted,
            Reason = x.Reason
        }).ToList();
    }

    private List<ModulePermissionDetailDto> ComputeFinalPermissions(
        List<Guid> userDepartments,
        List<DepartmentPermissionDto> departmentPermissions,
        List<PositionPermissionDto> positionPermissions,
        List<UserPermissionOverrideDto> userOverrides)
    {
        var tempResult = new Dictionary<Guid, ComputedSubModulePermissionDto>();

        // Bước 1: Lấy danh sách Module được phép từ Department
        var allowedModules = new HashSet<Guid>();
        var moduleToDepartments = new Dictionary<Guid, List<Guid>>();

        foreach (var dept in departmentPermissions)
        {
            foreach (var module in dept.Modules)
            {
                allowedModules.Add(module.ModuleId);

                if (!moduleToDepartments.ContainsKey(module.ModuleId))
                {
                    moduleToDepartments[module.ModuleId] = new List<Guid>();
                }

                if (!moduleToDepartments[module.ModuleId].Contains(dept.DepartmentId))
                {
                    moduleToDepartments[module.ModuleId].Add(dept.DepartmentId);
                }
            }
        }

        // Bước 2: Áp dụng Position permissions
        foreach (var pos in positionPermissions)
        {
            foreach (var subModule in pos.SubModules)
            {
                if (!allowedModules.Contains(subModule.ModuleId))
                {
                    continue;
                }

                tempResult[subModule.SubModuleId] = new ComputedSubModulePermissionDto
                {
                    SubModuleId = subModule.SubModuleId,
                    SubModuleCode = subModule.SubModuleCode,
                    SubModuleName = subModule.SubModuleName,
                    ModuleId = subModule.ModuleId,
                    ModuleCode = subModule.ModuleCode,
                    ModuleName = subModule.ModuleName,
                    Permissions = new List<PermissionCode>(subModule.Permissions),
                    AllowedDepartmentIds = moduleToDepartments.ContainsKey(subModule.ModuleId)
                        ? moduleToDepartments[subModule.ModuleId]
                        : new List<Guid>()
                };
            }
        }

        // Bước 3: Áp dụng User Overrides
        foreach (var ovr in userOverrides)
        {
            if (!tempResult.ContainsKey(ovr.SubModuleId))
            {
                continue;
            }

            var permissions = tempResult[ovr.SubModuleId].Permissions;

            if (ovr.IsGranted)
            {
                if (!permissions.Contains(ovr.PermissionCode))
                {
                    permissions.Add(ovr.PermissionCode);
                }
            }
            else
            {
                permissions.Remove(ovr.PermissionCode);
            }
        }

        // Bước 4: Group theo Module cho structure rõ ràng hơn
        var result = tempResult.Values
            .GroupBy(x => new { x.ModuleId, x.ModuleCode, x.ModuleName })
            .Select(g => new ModulePermissionDetailDto
            {
                ModuleId = g.Key.ModuleId,
                ModuleCode = g.Key.ModuleCode,
                ModuleName = g.Key.ModuleName,
                SubModules = g.Select(sm => new SubModulePermissionDetailDto
                {
                    SubModuleId = sm.SubModuleId,
                    SubModuleCode = sm.SubModuleCode,
                    SubModuleName = sm.SubModuleName,
                    Permissions = sm.Permissions.Select(p => p.ToString()).ToList(),
                    AllowedDepartmentIds = sm.AllowedDepartmentIds
                })
                .OrderBy(sm => sm.SubModuleCode)
                .ToList()
            })
            .OrderBy(m => m.ModuleCode)
            .ToList();

        return result;
    }

    public async Task<bool> SetStatusUserSignatureAsync(DefaultIdType userId, DefaultIdType signatureId, bool status)
    {
        var signature = await _userSignatureRepository.GetFirstOrDefaultAsync(
            predicate: u => u.Id == signatureId && u.UserId == userId,
            disableTracking: true) ?? throw new BadRequestException("Cannot find user signature");

        signature.SetActive(status);
        _userSignatureRepository.Update(signature);
        await unitOfWork.SaveChangesAsync();
        return true;
    }
    #endregion
}