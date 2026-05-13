namespace Application.Dto.Catalog;

public class SignContractDto
{
    public int ContractSigningFlowId { get; set; }
    public int? UserSignatureId { get; set; }
    public string? CertificateUuid { get; set; }  // UUID của certificate từ CA
    public string? Pin { get; set; }              // PIN để unlock certificate
}

public class SignatureResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string SignedFilePath { get; set; }
    public string SignatureHash { get; set; }
    public DateTime SignedAt { get; set; }
}

public class SignatureInfoDto
{
    public string SignatureName { get; set; }
    public string SignerName { get; set; }
    public string Reason { get; set; }
    public string Location { get; set; }
    public DateTimeOffset SignDate { get; set; }
}

public class CAVerifyResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
}

public class CACertificateResponse
{
    public string Certificate { get; set; }
    public string PrivateKey { get; set; }
}
