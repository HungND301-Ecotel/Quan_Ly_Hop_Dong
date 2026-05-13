namespace Application.Dto.Catalog;

public class MaterialGroupDto
{
    public Guid Id { get; set; }
    public string GroupCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class CreateMaterialGroupDto
{
    public string GroupCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class ExternalMaterialGroupSyncItemDto
{
    public string GroupCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class SyncMaterialGroupResultDto
{
    public int SourceCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
}
