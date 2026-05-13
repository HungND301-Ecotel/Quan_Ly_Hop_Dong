namespace Domain.Entities.Catalog.PaymentSchedule;

using ValueType = Domain.Common.Enums.ValueType;

public class QuarterlyPaymentSchedule : PaymentSchedule
{
    public int Quarter { get; private set; }
    public int Year { get; private set; }

    private QuarterlyPaymentSchedule() { }

    public QuarterlyPaymentSchedule(Guid contractId, int quarter, int year, decimal amount, ValueType amountType)
        : base(contractId, amount, amountType)
    {
        Quarter = quarter;
        Year = year;
    }

    public override DateTimeOffset? GetDueDate()
    {
        try
        {
            var month = (Quarter - 1) * 3 + 3; // Q1 = 3, Q2 = 6, Q3 = 9, Q4 = 12
            var daysInMonth = DateTime.DaysInMonth(Year, month);
            var dueDate = new DateTime(Year, month, daysInMonth, 23, 59, 59);
            return new DateTimeOffset(dueDate, TimeSpan.Zero);
        }
        catch
        {
            return null;
        }
    }
}
