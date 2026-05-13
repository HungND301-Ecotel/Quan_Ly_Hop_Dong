namespace Application.Dto.Catalog;

public class BankAccountDto
{
    public Guid Id { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateBankAccountDto
{
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateBankAccountDto
{
    public Guid Id { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
