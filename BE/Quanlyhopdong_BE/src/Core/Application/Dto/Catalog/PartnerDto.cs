namespace Application.Dto.Catalog;

public class PartnerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? TaxCode { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public Guid? BankId { get; set; }
    public string? Fax { get; set; }
    public Guid? PositionId { get; set; }
}

public class CreatePartnerDto
{
    public string Name { get; set; }
    public string? TaxCode { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public Guid? BankId { get; set; }
    public string? Fax { get; set; }
    public Guid? PositionId { get; set; }
}
