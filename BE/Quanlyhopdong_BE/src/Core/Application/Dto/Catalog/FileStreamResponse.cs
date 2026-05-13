namespace Application.Dto.Catalog;

public class FileStreamResponse
{
    public Stream Data { get; set; }
    public string ContentType { get; set; }
    public string FileName { get; set; }
}
