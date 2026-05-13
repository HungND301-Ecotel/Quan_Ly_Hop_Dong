using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog.ContractProgress;

/// <summary>
/// Tiến độ thực hiện hợp đồng
/// </summary>
public class ContractProgress : AuditableEntity, IAggregateRoot
{
    public Guid ContractId { get; protected set; }
    public Guid? PaymentScheduleId { get; protected set; }
    public DateTimeOffset PeriodStart { get; protected set; }
    public DateTimeOffset PeriodEnd { get; protected set; }

    // Navigation Properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; protected set; } = null!;

    [ForeignKey(nameof(PaymentScheduleId))]
    public virtual PaymentSchedule.PaymentSchedule? PaymentSchedule { get; protected set; }

    private IList<ContractProgressItem> _progressItems = new List<ContractProgressItem>();
    public virtual IReadOnlyCollection<ContractProgressItem> ProgressItems => _progressItems.AsReadOnly();

    // Constructors
    protected ContractProgress() { }

    public static ContractProgress Create(
        Guid contractId,
        Guid? paymentScheduleId,
        DateTimeOffset periodStart,
        DateTimeOffset periodEnd)
    {
        if (periodStart >= periodEnd)
        {
            throw new ArgumentException("Period start must be before period end");
        }

        return new ContractProgress
        {
            ContractId = contractId,
            PaymentScheduleId = paymentScheduleId,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd
        };
    }

    // Methods
    public void Update(
        Guid? paymentScheduleId,
        DateTimeOffset periodStart,
        DateTimeOffset periodEnd)
    {
        if (periodStart >= periodEnd)
        {
            throw new ArgumentException("Period start must be before period end");
        }

        PaymentScheduleId = paymentScheduleId;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
    }

    public void AddProgressItem(ContractProgressItem item)
    {
        _progressItems.Add(item);
    }

    public void AddProgressItems(IList<ContractProgressItem> items)
    {
        foreach (var item in items)
        {
            _progressItems.Add(item);
        }
    }

    public void ClearProgressItems()
    {
        _progressItems.Clear();
    }

    public void RemoveProgressItem(ContractProgressItem item)
    {
        _progressItems.Remove(item);
    }

    /// <summary>
    /// Tổng khối lượng thực hiện
    /// </summary>
    public decimal GetTotalExecutedQuantity()
    {
        return _progressItems.Sum(x => x.ExecutedQuantity);
    }

    /// <summary>
    /// Tổng giá trị thực hiện
    /// </summary>
    public decimal GetTotalExecutedAmount()
    {
        return _progressItems.Sum(x => x.ExecutedAmount);
    }

    /// <summary>
    /// Lấy lũy kế năm - tổng hợp tất cả tiến độ trong năm
    /// </summary>
    public static (decimal TotalQuantity, decimal TotalAmount) GetYearlyAccumulation(
        IEnumerable<ContractProgress> progresses,
        int year)
    {
        var yearProgresses = progresses
            .Where(p => p.PeriodStart.Year == year || p.PeriodEnd.Year == year)
            .ToList();

        var totalQuantity = yearProgresses
            .SelectMany(p => p.ProgressItems)
            .Sum(item => item.ExecutedQuantity);

        var totalAmount = yearProgresses
            .SelectMany(p => p.ProgressItems)
            .Sum(item => item.ExecutedAmount);

        return (totalQuantity, totalAmount);
    }

    /// <summary>
    /// Tính khối lượng/giá trị dở dang
    /// </summary>
    public (decimal RemainingQuantity, decimal RemainingAmount) GetWorkInProgress()
    {
        var totalExecutedQuantity = GetTotalExecutedQuantity();
        var totalExecutedAmount = GetTotalExecutedAmount();

        // Tính tổng từ contract items
        var contractTotalQuantity = Contract.ContractItems.Sum(x => x.Quantity);
        var contractTotalAmount = Contract.ContractItems.Sum(x => x.Amount);

        return (
            RemainingQuantity: contractTotalQuantity - totalExecutedQuantity,
            RemainingAmount: contractTotalAmount - totalExecutedAmount
        );
    }
}
