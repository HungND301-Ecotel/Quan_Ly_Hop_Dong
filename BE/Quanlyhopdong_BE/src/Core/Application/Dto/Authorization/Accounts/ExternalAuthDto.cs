namespace Application.Dto.Authorization.Accounts;

public class ExternalAuthDto
{
    public string? Provider { get; set; }
    public string? IdToken { get; set; }
}