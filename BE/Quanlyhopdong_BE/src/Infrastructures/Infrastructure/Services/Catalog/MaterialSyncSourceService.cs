using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Services.Catalog;

public class MaterialSyncSourceService(
    IExternalSyncConnectionResolver connectionResolver) : IMaterialSyncSourceService
{
    private const string MaterialSelectQuery = @"
SELECT TOP 1000
    dmvt.MA_VTHH AS MaterialCode,
    dmvt.TEN_VTHH AS Name,
    dmvt.MA_DVT AS UnitOfMeasureCode,
    dmvt.MA_NHOM_VTHH AS MaterialGroupCode,
    dmvt.MA_DON_VI AS DonVi,
    COALESCE((
        SELECT TOP 1 vc.GIA_GOC
        FROM dbo.VTHH_CT vc
        WHERE vc.MA_VTHH = dmvt.MA_VTHH
          AND vc.GIA_GOC IS NOT NULL
          AND vc.GIA_GOC > 0
        ORDER BY vc.GIA_GOC DESC
    ), 0) AS Price
FROM dbo.DM_VTHH dmvt";

    public async Task<IList<ExternalMaterialSyncItemDto>> GetMaterialsAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default)
    {
        var config = await connectionResolver.ResolveAsync(sourceConnectionId, cancellationToken);
        string connectionString = config.BuildConnectionString();

        var results = new List<ExternalMaterialSyncItemDto>();

        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using SqlCommand command = new(MaterialSelectQuery, connection)
        {
            CommandTimeout = config.CommandTimeoutSeconds <= 0 ? 30 : config.CommandTimeoutSeconds
        };

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        int materialCodeOrdinal = reader.GetOrdinal("MaterialCode");
        int nameOrdinal = reader.GetOrdinal("Name");
        int unitCodeOrdinal = reader.GetOrdinal("UnitOfMeasureCode");
        int groupCodeOrdinal = reader.GetOrdinal("MaterialGroupCode");
        int priceOrdinal = reader.GetOrdinal("Price");
        int donViOrdinal = reader.GetOrdinal("DonVi");

        while (await reader.ReadAsync(cancellationToken))
        {
            decimal price = 0m;
            if (!await reader.IsDBNullAsync(priceOrdinal, cancellationToken))
            {
                price = Convert.ToDecimal(reader.GetValue(priceOrdinal));
            }

            bool isOtherMaterial = await reader.IsDBNullAsync(donViOrdinal, cancellationToken);
            string materialCode = await reader.IsDBNullAsync(materialCodeOrdinal, cancellationToken)
                ? string.Empty
                : reader.GetValue(materialCodeOrdinal).ToString() ?? string.Empty;
            string name = await reader.IsDBNullAsync(nameOrdinal, cancellationToken)
                ? string.Empty
                : reader.GetValue(nameOrdinal).ToString() ?? string.Empty;
            string unitOfMeasureCode = await reader.IsDBNullAsync(unitCodeOrdinal, cancellationToken)
                ? string.Empty
                : reader.GetValue(unitCodeOrdinal).ToString() ?? string.Empty;
            string? materialGroupCode = await reader.IsDBNullAsync(groupCodeOrdinal, cancellationToken)
                ? null
                : reader.GetValue(groupCodeOrdinal).ToString();

            results.Add(new ExternalMaterialSyncItemDto
            {
                MaterialCode = materialCode,
                Name = name,
                UnitOfMeasureCode = unitOfMeasureCode,
                MaterialGroupCode = materialGroupCode,
                Price = price < 0 ? 0 : price,
                IsOtherMaterial = isOtherMaterial
            });
        }

        return results;
    }
}