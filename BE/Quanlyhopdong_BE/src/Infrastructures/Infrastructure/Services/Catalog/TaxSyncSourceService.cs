using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Infrastructure.Services.Catalog;

public class TaxSyncSourceService(
    IExternalSyncConnectionResolver connectionResolver) : ITaxSyncSourceService
{
    private const string TaxSelectQuery = @"
        WITH TaxSource AS (
            SELECT DISTINCT
                k.NGAY_KKVAT     AS DeclarationDate,
                k.THUE_SUAT_VAT  AS VatRate,
                k.DOANH_SO_VAT   AS TaxableRevenue,
                k.TIEN_THUE_VAT  AS VatAmount,
                k.MA_SO_VAT      AS TaxCode
            FROM [EFS_2022].[dbo].[KTPS] k
            WHERE k.SO_HDONG = @ContractNumber
            AND (
                    k.THUE_SUAT_VAT IS NOT NULL
                OR k.TIEN_THUE_VAT IS NOT NULL
                OR k.DOANH_SO_VAT IS NOT NULL
            )
            AND k.NGAY_KKVAT IS NOT NULL
            AND k.MA_SO_VAT IS NOT NULL
        )
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY 
                    ISNULL(DeclarationDate, '1900-01-01'),
                    TaxCode
            ) AS PeriodNumber,
            DeclarationDate,
            VatRate,
            TaxableRevenue,
            VatAmount,
            TaxCode
        FROM TaxSource";

    public async Task<IList<ExternalTaxSyncItemDto>> GetTaxesAsync(Guid sourceConnectionId, string contractNumber, DateTime contractDate, CancellationToken cancellationToken = default)
    {
        var config = await connectionResolver.ResolveAsync(sourceConnectionId, cancellationToken);
        string connectionString = config.BuildConnectionString();

        if (string.IsNullOrWhiteSpace(contractNumber))
        {
            throw new ArgumentException("contractNumber is required");
        }

        var results = new List<ExternalTaxSyncItemDto>();

        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using SqlCommand command = new(TaxSelectQuery, connection)
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
        int declarationDateOrdinal = reader.GetOrdinal("DeclarationDate");
        int vatRateOrdinal = reader.GetOrdinal("VatRate");
        int taxableRevenueOrdinal = reader.GetOrdinal("TaxableRevenue");
        int vatAmountOrdinal = reader.GetOrdinal("VatAmount");
        int taxCodeOrdinal = reader.GetOrdinal("TaxCode");

        while (await reader.ReadAsync(cancellationToken))
        {
            if (await reader.IsDBNullAsync(periodNumberOrdinal, cancellationToken)
                || await reader.IsDBNullAsync(declarationDateOrdinal, cancellationToken)
                || await reader.IsDBNullAsync(taxCodeOrdinal, cancellationToken))
            {
                continue;
            }

            long periodNumber = reader.GetInt64(periodNumberOrdinal);

            object rawDeclarationDate = reader.GetValue(declarationDateOrdinal);
            var declarationDate = rawDeclarationDate switch
            {
                DateTime dt => dt,
                DateTimeOffset dto => dto.DateTime,
                _ => default
            };

            if (declarationDate == default)
            {
                continue;
            }

            decimal vatRate = await reader.IsDBNullAsync(vatRateOrdinal, cancellationToken)
                ? 0m
                : Convert.ToDecimal(reader.GetValue(vatRateOrdinal));

            decimal taxableRevenue = await reader.IsDBNullAsync(taxableRevenueOrdinal, cancellationToken)
                ? 0m
                : Convert.ToDecimal(reader.GetValue(taxableRevenueOrdinal));

            decimal vatAmount = await reader.IsDBNullAsync(vatAmountOrdinal, cancellationToken)
                ? 0m
                : Convert.ToDecimal(reader.GetValue(vatAmountOrdinal));

            string taxCode = reader.GetValue(taxCodeOrdinal).ToString() ?? string.Empty;

            results.Add(new ExternalTaxSyncItemDto
            {
                PeriodNumber = (int)periodNumber,
                DeclarationDate = declarationDate,
                VatRate = vatRate,
                TaxableRevenue = taxableRevenue,
                VatAmount = vatAmount,
                TaxCode = taxCode
            });
        }

        return results;
    }
}