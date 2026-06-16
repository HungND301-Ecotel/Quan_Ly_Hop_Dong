namespace Application.Dto.Catalog;

public class Level3CodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
    public string Level1CodeName { get; set; } = string.Empty;
    public Guid? Level2CodeId { get; set; }
    public string? Level2CodeName { get; set; }
}

public class Level3CodeLookupDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
}

public class CreateLevel3CodeRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
    public Guid? Level2CodeId { get; set; }
}

public class UpdateLevel3CodeRequest
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Level1CodeId { get; set; }
    public Guid? Level2CodeId { get; set; }
}
