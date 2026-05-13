using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;
using Domain.Common.Enums;
using ValueType = Domain.Common.Enums.ValueType;

namespace Domain.Entities.Catalog.PaymentSchedule;

public abstract class PaymentSchedule : AuditableEntity, IAggregateRoot
{
    public Guid ContractId { get; protected set; }
    public ValueType AmountType { get; protected set; }
    public decimal Amount { get; protected set; }
    public PaymentStatus PaymentStatus { get; protected set; } = PaymentStatus.Unpaid;

    // Navigation Properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; protected set; } = null!;

    private readonly IList<ContractPayment> _contractPayments = new List<ContractPayment>();
    public virtual IReadOnlyCollection<ContractPayment> ContractPayments => _contractPayments.AsReadOnly();

    private readonly IList<ContractProgress.ContractProgress> _contractProgresses = new List<ContractProgress.ContractProgress>();
    public virtual IReadOnlyCollection<ContractProgress.ContractProgress> ContractProgresses => _contractProgresses.AsReadOnly();

    // Constructor
    protected PaymentSchedule() { }

    protected PaymentSchedule(Guid contractId, decimal amount, ValueType amountType)
    {
        ContractId = contractId;
        Amount = amount;
        AmountType = amountType;
    }

    public decimal GetPaymentPercentage()
    {
        return Contract.ContractValue.HasValue && Contract.ContractValue.Value > 0
            ? (Amount / Contract.ContractValue.Value) * 100
            : 0;
    }

    public decimal GetPaymentRemaining()
    {
        return Contract.ContractValue.HasValue
            ? Contract.ContractValue.Value - Amount
            : 0;
    }

    public void MarkPaid() =>
        PaymentStatus = PaymentStatus.Paid;

    public void MarkUnpaid() =>
        PaymentStatus = PaymentStatus.Unpaid;

    /// <summary>
    /// Lấy tổng số tiền đã thanh toán từ các ContractPayment liên kết
    /// </summary>
    public decimal GetTotalPaid()
    {
        return _contractPayments.Sum(p => p.Amount);
    }

    /// <summary>
    /// Lấy số tiền còn lại cần thanh toán
    /// </summary>
    public decimal GetRemainingAmount()
    {
        return Amount - GetTotalPaid();
    }

    /// <summary>
    /// Kiểm tra xem đã thanh toán đủ số tiền chưa
    /// </summary>
    public bool IsFullyPaid()
    {
        return GetTotalPaid() >= Amount;
    }

    /// <summary>
    /// Lấy phần trăm đã thanh toán
    /// </summary>
    public decimal GetPaidPercentage()
    {
        return Amount > 0 ? (GetTotalPaid() / Amount) * 100 : 0;
    }

    /// <summary>
    /// Lấy ngày sắp đến hạn thanh toán của payment schedule
    /// </summary>
    public abstract DateTimeOffset? GetDueDate();

    /// <summary>
    /// Kiểm tra xem payment schedule có sắp đến hạn không (trong vòng daysBefore)
    /// </summary>
    public bool IsPaymentDueSoon(int daysBefore)
    {
        if (PaymentStatus != PaymentStatus.Unpaid)
        {
            return false;
        }

        var dueDate = GetDueDate();
        if (!dueDate.HasValue)
        {
            return false;
        }

        var today = DateTimeOffset.UtcNow;
        var thresholdDate = today.AddDays(daysBefore);

        return dueDate.Value >= today && dueDate.Value <= thresholdDate;
    }
}
