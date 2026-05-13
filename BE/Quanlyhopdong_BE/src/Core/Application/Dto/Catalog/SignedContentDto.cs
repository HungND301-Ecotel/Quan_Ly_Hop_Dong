namespace Application.Dto.Catalog;

public class SignedContentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid Level3CodeId { get; set; }
    public string Level3CodeName { get; set; } = string.Empty;
}

public class SignedContentLookupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateSignedContentRequest
{
    public string Title { get; set; } = string.Empty;
    public Guid Level3CodeId { get; set; }
}

public class UpdateSignedContentRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid Level3CodeId { get; set; }
}
