using System.ComponentModel.DataAnnotations;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class BankAccount : AuditableEntity<Guid>
{
    public string BankName { get; protected set; } = string.Empty;
    public string AccountNumber { get; protected set; } = string.Empty;
    public string AccountHolder { get; protected set; } = string.Empty;
    public bool IsActive { get; protected set; } = true;

    [MaxLength(1000)]
    public string? Note { get; protected set; }

    // Navigation Properties
    private IList<ContractGuarantee> _contractGuarantees = new List<ContractGuarantee>();
    public virtual IReadOnlyCollection<ContractGuarantee> ContractGuarantees => _contractGuarantees.AsReadOnly();

    // Constructor
    protected BankAccount() { }

    public static BankAccount Create(string bankName, string accountNumber, string accountHolder, bool isActive = true, string? note = null)
    {
        if (string.IsNullOrWhiteSpace(bankName))
        {
            throw new ArgumentException("Bank name is required", nameof(bankName));
        }

        if (string.IsNullOrWhiteSpace(accountNumber))
        {
            throw new ArgumentException("Account number is required", nameof(accountNumber));
        }

        if (string.IsNullOrWhiteSpace(accountHolder))
        {
            throw new ArgumentException("Account holder is required", nameof(accountHolder));
        }

        return new BankAccount
        {
            BankName = bankName,
            AccountNumber = accountNumber,
            AccountHolder = accountHolder,
            IsActive = isActive,
            Note = note
        };
    }

    public void Update(string bankName, string accountNumber, string accountHolder, bool isActive, string? note)
    {
        if (string.IsNullOrWhiteSpace(bankName))
        {
            throw new ArgumentException("Bank name is required", nameof(bankName));
        }

        if (string.IsNullOrWhiteSpace(accountNumber))
        {
            throw new ArgumentException("Account number is required", nameof(accountNumber));
        }

        if (string.IsNullOrWhiteSpace(accountHolder))
        {
            throw new ArgumentException("Account holder is required", nameof(accountHolder));
        }

        BankName = bankName;
        AccountNumber = accountNumber;
        AccountHolder = accountHolder;
        IsActive = isActive;
        Note = note;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
