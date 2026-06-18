using System.ComponentModel.DataAnnotations.Schema;
using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class ContractAttachment : AuditableEntity<Guid>
{
    public Guid ContractId { get; protected set; }
    public string FileName { get; protected set; } = string.Empty;
    public string FilePath { get; protected set; } = string.Empty;
    public long? FileSize { get; protected set; }
    public string? FileType { get; protected set; }
    public string? Description { get; protected set; }

    // Navigation Properties
    [ForeignKey("ContractId")]
    public virtual Contract Contract { get; protected set; } = null!;

    public static ContractAttachment Create(Guid contractId, string fileName, string filePath, long? fileSize, string? fileType, string? description)
    {
        return new ContractAttachment
        {
            ContractId = contractId,
            FileName = fileName,
            FilePath = filePath,
            FileSize = fileSize,
            FileType = fileType,
            Description = description
        };
    }

    public void UpdateSignedAttachment(string filePath, string fileName)
    {
        FilePath = filePath;
        FileName = fileName;
        FileType = ".pdf";
    }
}

