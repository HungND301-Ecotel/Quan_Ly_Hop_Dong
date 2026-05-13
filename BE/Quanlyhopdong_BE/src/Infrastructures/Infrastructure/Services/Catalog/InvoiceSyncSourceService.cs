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
                k.SO_HDON      AS NumberInvoice,
                k.NGAY_HDON    AS DateInvoice
            FROM [EFS_2022].[dbo].[KTPS] k
            WHERE k.SO_HDONG = @ContractNumber
              AND k.NGAY_HDONG >= @ContractDate
              AND k.NGAY_HDONG < DATEADD(DAY, 1, @ContractDate)
              AND k.SO_HDON IS NOT NULL
              AND k.NGAY_HDON IS NOT NULL
            GROUP BY k.SO_HDON, k.NGAY_HDON
        )
        SELECT
            ROW_NUMBER() OVER (ORDER BY DateInvoice, NumberInvoice) AS PeriodNumber,
            NumberInvoice,
            DateInvoice
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

        while (await reader.ReadAsync(cancellationToken))
        {
            if (await reader.IsDBNullAsync(periodNumberOrdinal, cancellationToken)
                || await reader.IsDBNullAsync(dateInvoiceOrdinal, cancellationToken))
            {
                continue;
            }

            long periodNumber = reader.GetInt64(periodNumberOrdinal);
            string numberInvoice = await reader.IsDBNullAsync(numberInvoiceOrdinal, cancellationToken)
                ? string.Empty
                : reader.GetValue(numberInvoiceOrdinal).ToString() ?? string.Empty;

            DateTimeOffset dateInvoice;
            object rawDate = reader.GetValue(dateInvoiceOrdinal);
            if (rawDate is DateTimeOffset dto)
            {
                dateInvoice = dto;
            }
            else if (rawDate is DateTime dt)
            {
                dateInvoice = new DateTimeOffset(dt);
            }
            else
            {
                continue;
            }

            results.Add(new ExternalInvoiceSyncItemDto
            {
                PeriodNumber = (int)periodNumber,
                NumberInvoice = numberInvoice,
                DateInvoice = dateInvoice
            });
        }

        return results;
    }
}
