using Application.Common.Exceptions;
using Application.Dto.Catalog.ContractPayment;
using Application.Dto.Catalog.ContractProgress;
using Domain.Common.Enums;
using Domain.Entities.Catalog.PaymentSchedule;
using ValueType = Domain.Common.Enums.ValueType;

namespace Application.Dto.Catalog;

public class PaymentScheduleDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public ScheduleType ScheduleType { get; set; }
    public ValueType AmountType { get; set; }
    public decimal Amount { get; set; }
    public decimal PaymentAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }

    public int? Month { get; set; }
    public int? Year { get; set; }
    public int? Quarter { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }

    public List<ContractPaymentInfoDto> ContractPayments { get; set; } = new();
    public List<ContractProgressDto> ContractProgresses { get; set; } = new();

    public PaymentSchedule ToDomain(Guid contractId)
    {
        return ScheduleType switch
        {
            ScheduleType.Monthly =>
                new MonthlyPaymentSchedule(contractId, Month!.Value, Year!.Value, Amount, AmountType),

            ScheduleType.Quarterly =>
                new QuarterlyPaymentSchedule(contractId, Quarter!.Value, Year!.Value, Amount, AmountType),

            ScheduleType.Yearly =>
                new YearlyPaymentSchedule(contractId, Year!.Value, Amount, AmountType),

            ScheduleType.Stage =>
                new StagePaymentSchedule(contractId, FromDate!.Value, ToDate!.Value, Amount, AmountType),

            ScheduleType.LumpSum =>
                new LumpSumPaymentSchedule(contractId, DueDate!.Value, Amount, AmountType),

            _ => throw new BadRequestException("Invalid ScheduleType")
        };
    }
}

public class ContractPaymentInfoDto
{
    public Guid Id { get; set; }
    public int PeriodNumber { get; set; }
    public string[]? AcceptanceReportFilePaths { get; set; }
    public string[]? InvoiceFilePaths { get; set; }
    public InvoiceDto? Invoice { get; set; }
    public string[]? TaxFilePaths { get; set; }
    public TaxDto? Tax { get; set; }
    public DateTimeOffset PaymentDate { get; set; }
    public decimal Amount { get; set; }
}

public class CreatePaymentScheduleDto
{
    public ValueType AmountType { get; set; }
    public decimal Amount { get; set; }
    public int? Month { get; set; }
    public int? Year { get; set; }
    public int? Quarter { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }

    public PaymentSchedule ToDomain(Guid contractId, ScheduleType schedule)
    {
        return schedule switch
        {
            ScheduleType.Monthly =>
                new MonthlyPaymentSchedule(contractId, Month.Value, Year.Value, Amount, AmountType),

            ScheduleType.Quarterly =>
                new QuarterlyPaymentSchedule(contractId, Quarter.Value, Year.Value, Amount, AmountType),

            ScheduleType.Yearly =>
                new YearlyPaymentSchedule(contractId, Year.Value, Amount, AmountType),

            ScheduleType.Stage =>
                new StagePaymentSchedule(contractId, FromDate.Value, ToDate.Value, Amount, AmountType),

            ScheduleType.LumpSum =>
                new LumpSumPaymentSchedule(contractId, DueDate.Value, Amount, AmountType),

            _ => throw new ArgumentException("Invalid schedule type")
        };
    }
}

public class PaymentScheduleDetailDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public int? Month { get; set; }
    public int? Year { get; set; }
    public int? Quarter { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public class CreatePaymentScheduleListDto
{
    public ScheduleType ScheduleType { get; set; }
    public IList<CreatePaymentScheduleDto> Schedules { get; set; } = new List<CreatePaymentScheduleDto>();
}

public class PaymentScheduleDetailListDto
{
    public ScheduleType ScheduleType { get; set; }
    public IList<PaymentScheduleDetailDto> Schedules { get; set; } = new List<PaymentScheduleDetailDto>();
}
