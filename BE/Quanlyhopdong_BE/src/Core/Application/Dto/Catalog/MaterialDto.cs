namespace Application.Dto.Catalog;

public class MaterialDto
{
    public Guid Id { get; set; }
    public bool IsOtherMaterial { get; set; } = false;
    public string MaterialCode { get; set; }
    public string Name { get; set; }
    public Guid? MaterialGroupId { get; set; }
    public string? MaterialGroupName { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public string? UnitOfMeasureName { get; set; }
    public decimal? Price { get; set; }
}

public class CreateMaterialDto
{
    public bool IsOtherMaterial { get; set; } = false;
    public string MaterialCode { get; set; }
    public string Name { get; set; }
    public Guid? MaterialGroupId { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public decimal? Price { get; set; }
}

public class ExternalMaterialSyncItemDto
{
    public string MaterialCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? UnitOfMeasureCode { get; set; }
    public string? MaterialGroupCode { get; set; }
    public decimal? Price { get; set; }
    public bool IsOtherMaterial { get; set; }
}

public class SyncMaterialResultDto
{
    public int SourceCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
}
