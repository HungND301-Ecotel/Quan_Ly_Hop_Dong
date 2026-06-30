using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using Domain.Common.Events;
using Domain.Entities.Catalog;
using Domain.Events;

namespace Domain.Entities.Identity;

public class User : AuditableEntity<Guid>, IAggregateRoot
{
    // Main constructor with required fields
    public User(string userName, string? email, string? phoneNumber, string? fullname, Guid positionId, UserRole? role, string? employeeCode = null, string? note = null)
    {
        SetUserName(userName);
        if (!string.IsNullOrEmpty(email))
        {
            SetEmail(email);
        }
        if (!string.IsNullOrEmpty(phoneNumber))
        {
            SetPhoneNumber(phoneNumber);
        }
        Fullname = fullname ?? string.Empty;
        JoinDate = DateTimeOffset.UtcNow;
        LockoutEnabled = true;
        AccessFailedCount = 0;
        PositionId = positionId;
        Role = role;
        IsVerifiedEmail = false;
        EmployeeCode = employeeCode;
        Note = note;
        //SetPassword(passwordHash);

        // Add domain event for entity creation
        DomainEvents.Add(EntityCreatedEvent.WithEntity(this));
    }

    public User(string userName, string? email, string? fullname, Guid positionId, UserRole? role, string passwordHash)
    {
        SetUserName(userName);
        if (!string.IsNullOrEmpty(email))
        {
            SetEmail(email);
        }
        Fullname = fullname ?? string.Empty;
        JoinDate = DateTimeOffset.UtcNow;
        LockoutEnabled = true;
        AccessFailedCount = 0;
        PositionId = positionId;
        Role = role;
        IsVerifiedEmail = false;
        SetPassword(passwordHash);

        // Add domain event for entity creation
        DomainEvents.Add(EntityCreatedEvent.WithEntity(this));
    }

    public User(string userName, string? email, string? fullname, Guid positionId, string passwordHash)
    {
        SetUserName(userName);
        if (!string.IsNullOrEmpty(email))
        {
            SetEmail(email);
        }
        Fullname = fullname ?? string.Empty;
        JoinDate = DateTimeOffset.UtcNow;
        LockoutEnabled = true;
        AccessFailedCount = 0;
        PositionId = positionId;
        IsVerifiedEmail = false;
        //SetPassword(passwordHash);

        // Add domain event for entity creation
        DomainEvents.Add(EntityCreatedEvent.WithEntity(this));
    }

    public User(string userName, string? email, string? fullname)
    {
        SetUserName(userName);
        if (!string.IsNullOrEmpty(email))
        {
            SetEmail(email);
        }
        Fullname = fullname ?? string.Empty;
        JoinDate = DateTimeOffset.UtcNow;
        LockoutEnabled = true;
        AccessFailedCount = 0;
        IsVerifiedEmail = false;

        // Add domain event for entity creation
        DomainEvents.Add(EntityCreatedEvent.WithEntity(this));
    }

    public User()
    {

    }

    [MaxLength(50)]
    public string UserName { get; private set; } = string.Empty;

    [MaxLength(50)]
    public string NormalizedUserName { get; private set; } = string.Empty;

    [MaxLength(256)]
    public string Email { get; private set; } = string.Empty;

    [MaxLength(256)]
    public string Avatar { get; private set; } = string.Empty;

    [MaxLength(256)]
    public string NormalizedEmail { get; private set; } = string.Empty;

    [MaxLength(500)]
    public string PasswordHash { get; private set; } = string.Empty;

    [MaxLength(15)]
    public string PhoneNumber { get; private set; } = string.Empty;

    public bool LockoutEnabled { get; private set; }

    public int AccessFailedCount { get; private set; }

    public DateTimeOffset? LockoutEnd { get; private set; }

    public DateTimeOffset JoinDate { get; private set; }

    [MaxLength(50)]
    public string Fullname { get; private set; }

    [MaxLength(50)]
    public UserRole? Role { get; set; }

    public Guid PositionId { get; set; }

    public bool? IsVerifiedPhone { get; private set; }

    public bool? IsVerifiedEmail { get; private set; }

    [MaxLength(256)]
    public string PasswordResetToken { get; private set; } = string.Empty;

    public DateTimeOffset PasswordResetExpiration { get; private set; }

    [MaxLength(50)]
    public string? RegisterProvider { get; private set; }

    [MaxLength(50)]
    public string? EmployeeCode { get; private set; }

    [MaxLength(500)]
    public string? Note { get; private set; }

    // Navigation properties
    [ForeignKey("PositionId")]
    public virtual Position? Position { get; protected set; }

    private IList<UserSignature> _userSignatures = new List<UserSignature>();
    public virtual IReadOnlyCollection<UserSignature> UserSignatures => _userSignatures.AsReadOnly();

    private IList<UserDepartment> _userDepartments = new List<UserDepartment>();
    public virtual IReadOnlyCollection<UserDepartment> UserDepartments => _userDepartments.AsReadOnly();

    private IList<ContractUserRole> _contractUserRoles = new List<ContractUserRole>();
    public virtual IReadOnlyCollection<ContractUserRole> ContractUserRoles => _contractUserRoles.AsReadOnly();

    // Domain methods - all state changes go through these methods
    public void Update(string email, string phoneNumber, string? fullname, Guid positionId, UserRole role, string? employeeCode, string? note)
    {
        UpdateName(fullname);
        SetPhoneNumber(phoneNumber);
        SetEmail(email);
        Role = role;
        PositionId = positionId;
        EmployeeCode = employeeCode;
        Note = note;
    }

    #region Constructors
    public void SetUserName(string userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
        {
            throw new ArgumentException("Username cannot be empty", nameof(userName));
        }

        if (userName.Length < 3)
        {
            throw new ArgumentException("Username must be at least 3 characters", nameof(userName));
        }

        UserName = userName;
        NormalizedUserName = userName.ToUpperInvariant();
    }

    public void SetEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty", nameof(email));
        }

        // Basic email validation using regex
        if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            throw new ArgumentException("Invalid email format", nameof(email));
        }

        Email = email;
        NormalizedEmail = email.ToUpperInvariant();

        // Reset verification when email changes
        IsVerifiedEmail = false;
    }

    public void SetPassword(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash cannot be empty", nameof(passwordHash));
        }

        PasswordHash = passwordHash;
        DomainEvents.Add(new UserPasswordChangedEvent(this));
    }

    public void AddUserDepartment(IEnumerable<UserDepartment> list)
    {
        foreach (var item in list)
        {
            _userDepartments.Add(item);
        }
    }

    public void AddUserDepartment(UserDepartment userDepartment)
    {
        _userDepartments.Add(userDepartment);
    }
    public void SetPhoneNumber(string phoneNumber)
    {
        if (!string.IsNullOrWhiteSpace(phoneNumber))
        {
            // Basic phone number validation - can be enhanced
            if (!Regex.IsMatch(phoneNumber.Trim(), @"^\+?[0-9]{10,15}$"))
            {
                throw new ArgumentException("Invalid phone number format", nameof(phoneNumber));
            }
        }

        PhoneNumber = phoneNumber;

        // Reset verification when phone changes
        IsVerifiedPhone = false;
    }

    public void SetAvatar(string? avatarUrl)
    {
        Avatar = avatarUrl ?? string.Empty;
    }

    public void UpdateName(string? fullname)
    {
        Fullname = fullname ?? string.Empty;

        // Add domain event for profile update
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
        DomainEvents.Add(new SyncUserInfoEvent(Id));
    }

    public void VerifyEmail()
    {
        IsVerifiedEmail = true;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
        DomainEvents.Add(new UserEmailVerifiedEvent(this));
    }

    public void VerifyPhone()
    {
        IsVerifiedPhone = true;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
        DomainEvents.Add(new UserPhoneVerifiedEvent(this));
    }

    public void LockAccount(TimeSpan duration)
    {
        LockoutEnd = DateTimeOffset.UtcNow.Add(duration);
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
        DomainEvents.Add(new UserLockedOutEvent(this, duration));
    }

    public void UnlockAccount()
    {
        LockoutEnd = null;
        AccessFailedCount = 0;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
    }

    public bool IsLockedOut()
    {
        return LockoutEnabled && LockoutEnd.HasValue && LockoutEnd > DateTimeOffset.UtcNow;
    }

    public void IncrementAccessFailedCount()
    {
        AccessFailedCount++;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
    }

    public void ResetAccessFailedCount()
    {
        AccessFailedCount = 0;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
    }

    public void GeneratePasswordResetToken(string token, TimeSpan expiration)
    {
        PasswordResetToken = token;
        PasswordResetExpiration = DateTimeOffset.UtcNow.Add(expiration);
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = string.Empty;
        DomainEvents.Add(EntityUpdatedEvent.WithEntity(this));
    }

    public bool IsPasswordResetTokenValid()
    {
        return !string.IsNullOrEmpty(PasswordResetToken) &&
               PasswordResetExpiration > DateTimeOffset.UtcNow;
    }

    public void SetRegisterProvider(string provider)
    {
        RegisterProvider = provider;
    }
    #endregion
}