namespace Application.Dto.Catalog;

public class Level2CodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
    public string Level1CodeName { get; set; } = string.Empty;
}

public class Level2CodeLookupDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
}

public class CreateLevel2CodeRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
}

public class UpdateLevel2CodeRequest
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
}
