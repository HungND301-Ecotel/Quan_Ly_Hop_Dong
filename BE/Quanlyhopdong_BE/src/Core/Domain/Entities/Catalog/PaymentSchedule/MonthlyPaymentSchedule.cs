using ValueType = Domain.Common.Enums.ValueType;

namespace Domain.Entities.Catalog.PaymentSchedule;

public class MonthlyPaymentSchedule : PaymentSchedule
{
    public int Month { get; private set; }
    public int Year { get; private set; }

    private MonthlyPaymentSchedule() { }

    public MonthlyPaymentSchedule(Guid contractId, int month, int year, decimal amount, ValueType amountType)
        : base(contractId, amount, amountType)
    {
        Month = month;
        Year = year;
    }

    public void Update(int month, int year, decimal amount)
    {
        Month = month;
        Year = year;
        Amount = amount;
    }

    public override DateTimeOffset? GetDueDate()
    {
        try
        {
            var daysInMonth = DateTime.DaysInMonth(Year, Month);
            var dueDate = new DateTime(Year, Month, daysInMonth, 23, 59, 59);
            return new DateTimeOffset(dueDate, TimeSpan.Zero);
        }
        catch
        {
            return null;
        }
    }
}
