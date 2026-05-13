using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class Invoice : AuditableEntity
{
    public Guid ContractPaymentId { get; protected set; }
    public string NumberInvoice { get; protected set; } = string.Empty;
    public DateTimeOffset DateInvoice { get; protected set; }

    [ForeignKey(nameof(ContractPaymentId))]
    public virtual ContractPayment ContractPayment { get; protected set; } = null!;

    protected Invoice() { }

    public static Invoice Create(string numberInvoice, DateTimeOffset dateInvoice)
    {
        if (string.IsNullOrWhiteSpace(numberInvoice))
        {
            throw new ArgumentException("NumberInvoice is required");
        }

        return new Invoice
        {
            NumberInvoice = numberInvoice.Trim(),
            DateInvoice = dateInvoice
        };
    }

    public void Update(string numberInvoice, DateTimeOffset dateInvoice)
    {
        if (string.IsNullOrWhiteSpace(numberInvoice))
        {
            throw new ArgumentException("NumberInvoice is required");
        }

        NumberInvoice = numberInvoice.Trim();
        DateInvoice = dateInvoice;
    }
}
