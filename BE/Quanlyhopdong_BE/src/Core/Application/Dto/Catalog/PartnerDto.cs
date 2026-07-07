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
    public string? Position { get; set; }
    public string? Note { get; set; }
    public string? PartnerContractCode { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? AccountHolder { get; set; }
    public string? BankAccountName { get; set; }
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
    public string? Position { get; set; }
    public string? Note { get; set; }
    public string? PartnerContractCode { get; set; }
}
