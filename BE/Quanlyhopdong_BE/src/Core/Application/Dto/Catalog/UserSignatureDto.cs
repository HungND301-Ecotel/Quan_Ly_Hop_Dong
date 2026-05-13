using Domain.Common.Enums;
using Microsoft.AspNetCore.Http;

namespace Application.Dto.Catalog;

public class UserSignatureDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public SignatureType SignatureType { get; set; }
    public string? SignatureFile { get; set; }
    public string? CertificateId { get; set; }
    public bool IsPinSaved { get; set; }
    public bool IsDefault { get; set; } = true;
    public bool IsActive { get; set; } = true;
}

public class CreateUserSignatureDto
{
    public SignatureType SignatureType { get; set; } // "Handwritten", "Normal"
    public IFormFile? SignatureFile { get; set; } // File ảnh chữ ký
    public string? CertificateId { get; set; }
    public string? Pin { get; set; }
    public bool SavePin { get; set; }
    public bool IsActive { get; set; } = true;
}
