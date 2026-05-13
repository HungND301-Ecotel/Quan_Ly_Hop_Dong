namespace Domain.Entities.Catalog.PaymentSchedule;

using ValueType = Domain.Common.Enums.ValueType;

public class StagePaymentSchedule : PaymentSchedule
{
    public DateTimeOffset FromDate { get; private set; }
    public DateTimeOffset ToDate { get; private set; }

    private StagePaymentSchedule() { }

    public StagePaymentSchedule(Guid contractId, DateTimeOffset fromDate, DateTimeOffset toDate, decimal amount, ValueType amountType)
        : base(contractId, amount, amountType)
    {
        if (fromDate >= toDate)
        {
            throw new ArgumentException("FromDate must be < ToDate");
        }

        FromDate = fromDate;
        ToDate = toDate;
    }

    public override DateTimeOffset? GetDueDate()
    {
        return ToDate;
    }
}

