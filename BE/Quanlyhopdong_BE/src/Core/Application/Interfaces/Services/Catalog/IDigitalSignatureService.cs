using Application.Dto.Catalog;
using Domain.Entities.Catalog;

namespace Application.Interfaces.Services.Catalog;

public interface IDigitalSignatureService
{
    Task<SignatureResultDto> SignContractAsync(ContractSigningFlow flow, Guid? userSignatureId, string? certificateUuid, string? pin, Guid userId);
    Task<bool> VerifySignatureAsync(string filePath);
    Task<List<SignatureInfoDto>> GetSignatureInfoAsync(string filePath);
}
