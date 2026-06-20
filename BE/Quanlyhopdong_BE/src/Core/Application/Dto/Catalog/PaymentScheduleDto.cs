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
    public ValueType AmountType { get; set; }
    public decimal Amount { get; set; }
    public decimal PaymentAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public int Days { get; set; }

    public List<ContractPaymentInfoDto> ContractPayments { get; set; } = new();
    public List<ContractProgressDto> ContractProgresses { get; set; } = new();

    public PaymentSchedule ToDomain(Guid contractId)
    {
        return new PaymentSchedule(contractId, Days, Amount, AmountType);
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
    public int Days { get; set; }

    public PaymentSchedule ToDomain(Guid contractId)
    {
        return new PaymentSchedule(contractId, Days, Amount, AmountType);
    }
}

public class PaymentScheduleDetailDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public int Days { get; set; }
}

public class CreatePaymentScheduleListDto
{
    public IList<CreatePaymentScheduleDto> Schedules { get; set; } = new List<CreatePaymentScheduleDto>();
}

public class PaymentScheduleDetailListDto
{
    public IList<PaymentScheduleDetailDto> Schedules { get; set; } = new List<PaymentScheduleDetailDto>();
}
