namespace Application.Configurations;

public class GlobalAdminAccountConfiguration
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public long BrandId { get; set; }
    public string Uuid { get; set; } = default!;
}