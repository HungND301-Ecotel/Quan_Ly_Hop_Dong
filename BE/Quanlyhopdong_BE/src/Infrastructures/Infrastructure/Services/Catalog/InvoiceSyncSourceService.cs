using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Infrastructure.Services.Catalog;

public class InvoiceSyncSourceService(
    IExternalSyncConnectionResolver connectionResolver) : IInvoiceSyncSourceService
{
    private const string InvoiceSelectQuery = @"
    WITH InvoiceSource AS (
        SELECT
            k.SO_HDON AS NumberInvoice,
            k.NGAY_HDON AS DateInvoice,
            SUM(k.SO_TIEN) AS InvoiceAmount
        FROM [EFS_2022].[dbo].[KTPS] k
        WHERE k.SO_HDONG = @ContractNumber
          AND k.SO_HDON IS NOT NULL
        GROUP BY
            k.SO_HDON,
            k.NGAY_HDON
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY DateInvoice, NumberInvoice) AS PeriodNumber,
        NumberInvoice,
        DateInvoice,
        InvoiceAmount
    FROM InvoiceSource";

    public async Task<IList<ExternalInvoiceSyncItemDto>> GetInvoicesAsync(Guid sourceConnectionId, string contractNumber, DateTime contractDate, CancellationToken cancellationToken = default)
    {
        var config = await connectionResolver.ResolveAsync(sourceConnectionId, cancellationToken);
        string connectionString = config.BuildConnectionString();

        if (string.IsNullOrWhiteSpace(contractNumber))
        {
            throw new ArgumentException("contractNumber is required");
        }

        var results = new List<ExternalInvoiceSyncItemDto>();

        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using SqlCommand command = new(InvoiceSelectQuery, connection)
        {
            CommandTimeout = config.CommandTimeoutSeconds <= 0 ? 30 : config.CommandTimeoutSeconds
        };

        command.Parameters.Add(new SqlParameter("@ContractNumber", SqlDbType.NVarChar, 100)
        {
            Value = contractNumber.Trim()
        });
        command.Parameters.Add(new SqlParameter("@ContractDate", SqlDbType.Date)
        {
            Value = contractDate.Date
        });

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        int periodNumberOrdinal = reader.GetOrdinal("PeriodNumber");
        int numberInvoiceOrdinal = reader.GetOrdinal("NumberInvoice");
        int dateInvoiceOrdinal = reader.GetOrdinal("DateInvoice");
        int invoiceAmountOrdinal = reader.GetOrdinal("InvoiceAmount");

        while (await reader.ReadAsync(cancellationToken))
        {
            if (await reader.IsDBNullAsync(periodNumberOrdinal, cancellationToken))
            {
                continue;
            }

            long periodNumber = reader.GetInt64(periodNumberOrdinal);
            string numberInvoice = await reader.IsDBNullAsync(numberInvoiceOrdinal, cancellationToken)
                ? string.Empty
                : reader.GetValue(numberInvoiceOrdinal).ToString() ?? string.Empty;

            DateTimeOffset? dateInvoice = null;
            if (!await reader.IsDBNullAsync(dateInvoiceOrdinal, cancellationToken))
            {
                object rawDate = reader.GetValue(dateInvoiceOrdinal);
                if (rawDate is DateTimeOffset dto)
                {
                    dateInvoice = dto;
                }
                else if (rawDate is DateTime dt)
                {
                    dateInvoice = new DateTimeOffset(dt);
                }
            }

            decimal invoiceAmount = await reader.IsDBNullAsync(invoiceAmountOrdinal, cancellationToken)
                ? 0
                : Convert.ToDecimal(reader.GetValue(invoiceAmountOrdinal));

            results.Add(new ExternalInvoiceSyncItemDto
            {
                PeriodNumber = (int)periodNumber,
                NumberInvoice = numberInvoice,
                DateInvoice = dateInvoice,
                InvoiceAmount = invoiceAmount
            });
        }

        return results;
    }
}
