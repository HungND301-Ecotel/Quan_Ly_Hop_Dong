using Application.Dto.Catalog;
using Application.Interfaces.Services.Catalog;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Services.Catalog;

public class MaterialGroupSyncSourceService(
    IExternalSyncConnectionResolver connectionResolver) : IMaterialGroupSyncSourceService
{
    // Keep SQL in code per sync module to scale better when adding sync Material and others.
    private const string MaterialGroupSelectQuery = @"
SELECT
    MA_NHOM_VTHH AS GroupCode,
    TEN_NHOM_VTHH AS Name
FROM dbo.DM_NHOM_VTHH";

    public async Task<IList<ExternalMaterialGroupSyncItemDto>> GetMaterialGroupsAsync(Guid sourceConnectionId, CancellationToken cancellationToken = default)
    {
        var config = await connectionResolver.ResolveAsync(sourceConnectionId, cancellationToken);
        string connectionString = config.BuildConnectionString();

        List<ExternalMaterialGroupSyncItemDto> results = [];

        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using SqlCommand command = new(MaterialGroupSelectQuery, connection)
        {
            CommandTimeout = config.CommandTimeoutSeconds <= 0 ? 30 : config.CommandTimeoutSeconds
        };

        await using SqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

        int groupCodeOrdinal = reader.GetOrdinal("GroupCode");
        int nameOrdinal = reader.GetOrdinal("Name");

        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new ExternalMaterialGroupSyncItemDto
            {
                GroupCode = reader.IsDBNull(groupCodeOrdinal) ? string.Empty : reader.GetValue(groupCodeOrdinal).ToString() ?? string.Empty,
                Name = reader.IsDBNull(nameOrdinal) ? string.Empty : reader.GetValue(nameOrdinal).ToString() ?? string.Empty
            });
        }

        return results;
    }
}