using Application.Dto.Catalog.ContractPayment;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Services.Catalog;

public interface IContractPaymentService
{
    /// <summary>
    /// Get contract payments by contract ID
    /// </summary>
    Task<ContractPaymentResponseDto> GetByContractIdAsync(Guid contractId);

    /// <summary>
    /// Update contract payments in batch with smart operations (add/update/delete)
    /// </summary>
    Task<UpdateContractPaymentBatchResponse> UpdateBatchAsync(UpdateContractPaymentBatchRequest request);

    /// <summary>
    /// Update liquidation file path for contract
    /// </summary>
    Task UpdateLiquidationFileAsync(UpdateLiquidationFileRequest request);

    /// <summary>
    /// Upload payment file (AcceptanceReport, Invoice, Tax, or Liquidation)
    /// </summary>
    Task<UploadPaymentFileResponse> UploadFileAsync(IFormFile file, UploadPaymentFileRequest request);
}

