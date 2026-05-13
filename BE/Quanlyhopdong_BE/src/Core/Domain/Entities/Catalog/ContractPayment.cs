using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class ContractPayment : AuditableEntity, IAggregateRoot
{
    public Guid ContractId { get; protected set; }
    public Guid? PaymentScheduleId { get; protected set; }
    public int PeriodNumber { get; protected set; }
    public string[]? AcceptanceReportFilePaths { get; protected set; }
    public string[]? InvoiceFilePaths { get; protected set; }
    public string[]? TaxFilePaths { get; protected set; }
    public Invoice? Invoice { get; protected set; }
    public Tax? Tax { get; protected set; }
    public DateTimeOffset PaymentDate { get; protected set; }
    public decimal Amount { get; protected set; }

    // Navigation Properties
    [ForeignKey(nameof(ContractId))]
    public virtual Contract Contract { get; protected set; } = null!;

    [ForeignKey(nameof(PaymentScheduleId))]
    public virtual PaymentSchedule.PaymentSchedule? PaymentSchedule { get; protected set; }

    // Constructors
    protected ContractPayment() { }

    public static ContractPayment Create(
        Guid contractId,
        Guid? paymentScheduleId,
        int periodNumber,
        DateTimeOffset paymentDate,
        decimal amount,
        string[]? acceptanceReportFilePaths = null,
        string[]? invoiceFilePaths = null,
        string[]? taxFilePaths = null,
        string? numberInvoice = null,
        DateTimeOffset? dateInvoice = null,
        DateTime? declarationDate = null,
        decimal? vatRate = null,
        decimal? taxableRevenue = null,
        decimal? vatAmount = null,
        string? taxCode = null)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Amount must be positive");
        }

        var contractPayment = new ContractPayment
        {
            ContractId = contractId,
            PaymentScheduleId = paymentScheduleId,
            PeriodNumber = periodNumber,
            PaymentDate = paymentDate,
            Amount = amount,
            AcceptanceReportFilePaths = acceptanceReportFilePaths,
            InvoiceFilePaths = invoiceFilePaths,
            TaxFilePaths = taxFilePaths
        };

        contractPayment.SetInvoice(numberInvoice, dateInvoice);
        contractPayment.SetTax(declarationDate, vatRate, taxableRevenue, vatAmount, taxCode);

        return contractPayment;
    }

    public void Update(
        Guid? paymentScheduleId,
        int periodNumber,
        DateTimeOffset paymentDate,
        decimal amount,
        string[]? acceptanceReportFilePaths,
        string[]? invoiceFilePaths,
        string[]? taxFilePaths,
        string? numberInvoice,
        DateTimeOffset? dateInvoice,
        DateTime? declarationDate,
        decimal? vatRate,
        decimal? taxableRevenue,
        decimal? vatAmount,
        string? taxCode)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Amount must be positive");
        }

        PaymentScheduleId = paymentScheduleId;
        PeriodNumber = periodNumber;
        PaymentDate = paymentDate;
        Amount = amount;
        AcceptanceReportFilePaths = acceptanceReportFilePaths;
        InvoiceFilePaths = invoiceFilePaths;
        TaxFilePaths = taxFilePaths;
        SetInvoice(numberInvoice, dateInvoice);
        SetTax(declarationDate, vatRate, taxableRevenue, vatAmount, taxCode);
    }

    private void SetInvoice(string? numberInvoice, DateTimeOffset? dateInvoice)
    {
        if (string.IsNullOrWhiteSpace(numberInvoice) && !dateInvoice.HasValue)
        {
            Invoice = null;
            return;
        }

        if (string.IsNullOrWhiteSpace(numberInvoice) || !dateInvoice.HasValue)
        {
            throw new ArgumentException("NumberInvoice and DateInvoice are required when setting invoice");
        }

        if (Invoice == null)
        {
            Invoice = Domain.Entities.Catalog.Invoice.Create(numberInvoice, dateInvoice.Value);
            return;
        }

        Invoice.Update(numberInvoice, dateInvoice.Value);
    }

    private void SetTax(
        DateTime? declarationDate,
        decimal? vatRate,
        decimal? taxableRevenue,
        decimal? vatAmount,
        string? taxCode)
    {
        var isEmptyTax = !declarationDate.HasValue
            && !vatRate.HasValue
            && !taxableRevenue.HasValue
            && !vatAmount.HasValue
            && string.IsNullOrWhiteSpace(taxCode);

        if (isEmptyTax)
        {
            Tax = null;
            return;
        }

        if (!declarationDate.HasValue
            || !vatRate.HasValue
            || !taxableRevenue.HasValue
            || !vatAmount.HasValue
            || string.IsNullOrWhiteSpace(taxCode))
        {
            throw new ArgumentException("DeclarationDate, VatRate, TaxableRevenue, VatAmount and TaxCode are required when setting tax");
        }

        if (Tax == null)
        {
            Tax = Domain.Entities.Catalog.Tax.Create(
                declarationDate.Value,
                vatRate.Value,
                taxableRevenue.Value,
                vatAmount.Value,
                taxCode);
            return;
        }

        Tax.Update(
            declarationDate.Value,
            vatRate.Value,
            taxableRevenue.Value,
            vatAmount.Value,
            taxCode);
    }
}
