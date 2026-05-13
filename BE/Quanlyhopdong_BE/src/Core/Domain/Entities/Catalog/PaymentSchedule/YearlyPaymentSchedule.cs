namespace Domain.Entities.Catalog.PaymentSchedule;

using ValueType = Domain.Common.Enums.ValueType;

public class YearlyPaymentSchedule : PaymentSchedule
{
    public int Year { get; private set; }

    private YearlyPaymentSchedule() { }

    public YearlyPaymentSchedule(Guid contractId, int year, decimal amount, ValueType amountType)
        : base(contractId, amount, amountType)
    {
        Year = year;
    }

    public override DateTimeOffset? GetDueDate()
    {
        try
        {
            var dueDate = new DateTime(Year, 12, 31, 23, 59, 59);
            return new DateTimeOffset(dueDate, TimeSpan.Zero);
        }
        catch
        {
            return null;
        }
    }
}
