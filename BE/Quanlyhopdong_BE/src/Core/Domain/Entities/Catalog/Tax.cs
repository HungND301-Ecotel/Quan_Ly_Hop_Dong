using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class Tax : AuditableEntity
{
    public Guid ContractPaymentId { get; protected set; }
    public DateTime DeclarationDate { get; protected set; }
    public decimal VatRate { get; protected set; }
    public decimal TaxableRevenue { get; protected set; }
    public decimal VatAmount { get; protected set; }
    public string TaxCode { get; protected set; } = string.Empty;

    [ForeignKey(nameof(ContractPaymentId))]
    public virtual ContractPayment ContractPayment { get; protected set; } = null!;

    protected Tax() { }

    public static Tax Create(
        DateTime declarationDate,
        decimal vatRate,
        decimal taxableRevenue,
        decimal vatAmount,
        string taxCode)
    {
        Validate(vatRate, taxableRevenue, vatAmount, taxCode);

        return new Tax
        {
            DeclarationDate = declarationDate,
            VatRate = vatRate,
            TaxableRevenue = taxableRevenue,
            VatAmount = vatAmount,
            TaxCode = taxCode.Trim()
        };
    }

    public void Update(
        DateTime declarationDate,
        decimal vatRate,
        decimal taxableRevenue,
        decimal vatAmount,
        string taxCode)
    {
        Validate(vatRate, taxableRevenue, vatAmount, taxCode);

        DeclarationDate = declarationDate;
        VatRate = vatRate;
        TaxableRevenue = taxableRevenue;
        VatAmount = vatAmount;
        TaxCode = taxCode.Trim();
    }

    private static void Validate(decimal vatRate, decimal taxableRevenue, decimal vatAmount, string taxCode)
    {
        if (vatRate < 0)
        {
            throw new ArgumentException("VatRate must be non-negative");
        }

        if (taxableRevenue < 0)
        {
            throw new ArgumentException("TaxableRevenue must be non-negative");
        }

        if (vatAmount < 0)
        {
            throw new ArgumentException("VatAmount must be non-negative");
        }

        if (string.IsNullOrWhiteSpace(taxCode))
        {
            throw new ArgumentException("TaxCode is required");
        }
    }
}