using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Services.Catalog;

public class UnitOfMeasureSyncSourceService(
    IExternalSyncConnectionResolver connectionResolver) : IUnitOfMeasureSyncSourceService
{
    // Source systems can vary; this query is robust because MA_DVT is used directly by DM_VTHH.
    private const string UnitOfMeasureSelectQuery = @"
SELECT
    dvt.MA_DVT AS Code,
    dvt.TEN_DVT AS Name,
    dvt.ACTIVE AS IsActive
FROM dbo.DM_DVT dvt
WHERE dvt.MA_DVT IS NOT NULL
  AND LTRIM(RTRIM(dvt.MA_DVT)) <> ''";

    public async Task<IList<ExternalUnitOfMeasureSyncItemDto>> GetUnitOfMeasuresAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default)
    {
        var config = await connectionResolver.ResolveAsync(sourceConnectionId, cancellationToken);
        string connectionString = config.BuildConnectionString();

        List<ExternalUnitOfMeasureSyncItemDto> results = [];

        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using SqlCommand command = new(UnitOfMeasureSelectQuery, connection)
        {
            CommandTimeout = config.CommandTimeoutSeconds <= 0 ? 30 : config.CommandTimeoutSeconds
        };

        await using SqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
        int codeOrdinal = reader.GetOrdinal("Code");
        int nameOrdinal = reader.GetOrdinal("Name");
        int isActiveOrdinal = reader.GetOrdinal("IsActive");

        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new ExternalUnitOfMeasureSyncItemDto
            {
                Code = reader.IsDBNull(codeOrdinal) ? string.Empty : reader.GetValue(codeOrdinal).ToString() ?? string.Empty,
                Name = reader.IsDBNull(nameOrdinal) ? string.Empty : reader.GetValue(nameOrdinal).ToString() ?? string.Empty,
                IsActive = !reader.IsDBNull(isActiveOrdinal) && reader.GetInt16(isActiveOrdinal) != 0
            });
        }

        return results;
    }
}