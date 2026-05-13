using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;

namespace Domain.Entities.Catalog;

public class ContractGuarantee : AuditableEntity
{
    public Guid ContractId { get; protected set; }
    public GuaranteeType GuaranteeType { get; protected set; }
    public decimal Value { get; protected set; } // Giá trị tiền || % hợp đồng
    public ContractGuaranteeValueType ValueType { get; protected set; } // Kiểu giá trị
    public DateTimeOffset? DurationDate { get; protected set; } //Thời gian bảo lãnh, bảo hành, đặt cọc
    public Guid? BankAccountId { get; protected set; }

    // Navigation properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; protected set; }

    [ForeignKey(nameof(BankAccountId))]
    public virtual BankAccount? BankAccount { get; protected set; }

    //Constructor
    public static ContractGuarantee Create(GuaranteeType guaranteeType, decimal value, ContractGuaranteeValueType valueType, DateTimeOffset? durationDate, Guid? bankAccountId = null)
    {
        return new ContractGuarantee
        {
            GuaranteeType = guaranteeType,
            Value = value,
            ValueType = valueType,
            DurationDate = durationDate,
            BankAccountId = bankAccountId
        };
    }

    public void Update(GuaranteeType guaranteeType, decimal value, ContractGuaranteeValueType valueType, DateTimeOffset? durationDate, Guid? bankAccountId = null)
    {
        GuaranteeType = guaranteeType;
        Value = value;
        ValueType = valueType;
        DurationDate = durationDate;
        BankAccountId = bankAccountId;
    }

    public decimal GetContractPercentage()
    {
        return (Value / Contract?.ContractValue) ?? 0;
    }

    public decimal GetContractAmmount()
    {
        return (Value * Contract?.ContractValue) ?? 0;
    }
}
