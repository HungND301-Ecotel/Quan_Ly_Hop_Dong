namespace Domain.Entities.Catalog.PaymentSchedule;

using ValueType = Domain.Common.Enums.ValueType;

public class LumpSumPaymentSchedule : PaymentSchedule
{
    public DateTimeOffset DueDate { get; private set; }

    private LumpSumPaymentSchedule() { }

    public LumpSumPaymentSchedule(Guid contractId, DateTimeOffset dueDate, decimal amount, ValueType amountType)
        : base(contractId, amount, ValueType.Amount)
    {
        DueDate = dueDate;
    }

    public override DateTimeOffset? GetDueDate()
    {
        return DueDate;
    }
}
