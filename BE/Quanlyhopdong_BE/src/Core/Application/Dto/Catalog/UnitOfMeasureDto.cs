using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dto.Catalog;

public class UnitOfMeasureDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public bool IsActive { get; set; }
    public string? Note { get; set; }
}
public class CreateUnitOfMeasureRequest
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? Note { get; set; }
}

public class ExternalUnitOfMeasureSyncItemDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class SyncUnitOfMeasureResultDto
{
    public int SourceCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
}