namespace Application.Dto.Catalog;

public class PositionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int? Level { get; set; }
    public string? Description { get; set; }
}