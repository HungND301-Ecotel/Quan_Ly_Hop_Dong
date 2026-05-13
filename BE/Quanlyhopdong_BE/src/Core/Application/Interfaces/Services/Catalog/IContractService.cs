using Application.Dto.Catalog;
using Domain.Common.Enums;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Services.Catalog;

public interface IContractService
{
    Task<List<ShortContractDto>> GetAllAsync(string? search, Guid? contractTypeId, Guid? departmentId, Guid? partnerId,
        ContractStatus? status, DateTime? startDate, DateTime? endDate, IList<ContractFormat>? formats, bool? IsArchiveContract, bool? IsDebtTrackingEnabled);
    Task<List<ShortContractDto>> GetMyVisibleContractsAsync(string? search, Guid? contractTypeId, Guid? departmentId, Guid? partnerId,
        ContractStatus? status, DateTime? startDate, DateTime? endDate, IList<ContractFormat>? formats, bool? IsArchiveContract, bool? IsDebtTrackingEnabled);
    Task<ContractDto> GetByIdAsync(Guid id);
    Task<bool> CreateAsync(CreateContractDto dto);
    Task<bool> UpdateAsync(Guid id, UpdateContractDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> DeleteAsync(IList<Guid> DeleteIds);
    Task<List<ContractApprovalHistoryDto>> GetApprovalHistoryAsync(Guid contractId);
    Task<bool> ApproveContractAsync(ApproveContractDto dto);
    Task<bool> SubmitForApprovalAsync(Guid contractId);
    Task<bool> ActivateContractAsync(ActivateContractDto dto);
    Task<List<ContractDto>> GetPendingApprovalContractsAsync(ContractStatus? status = null, ContractSubStatus? subStatus = null);
    Task<List<ContractDto>> GetCurrentUserContractApprovalHistory();

    Task<string> UploadContract(IFormFile ContractFile, string ConrtactNumber);
    Task<IList<CreateContractAttachmentDto>> UploadAttachmentFile(List<IFormFile> AttachmentFiles, string ConrtactNumber);
    Task<List<ContractItemDto>> GetContractItemsByContractIdAsync(Guid contractId);
    Task<List<ShortContractDto>> GetAllSoonExpiredContractsAsync(ContractFormat? contractFormat);
    Task<List<ShortContractDto>> GetAllContractsWithPaymentDueSoonAsync(ContractFormat? contractFormat);
    Task<List<PaymentScheduleDto>> GetContractPaymentSchedulesAsync(Guid contractId);
    Task<bool> PauseContractAsync(Guid contractId, string? reason);
    Task<bool> ResumeContractAsync(Guid contractId, string? reason);
    Task<bool> CancelContractAsync(Guid contractId, string? reason);
    Task<bool> UpdateToLiquidationAsync(Guid contractId, string? reason);
    Task<bool> ArchiveContractAsync(Guid contractId);
    Task<PrepareExtensionDto> PrepareContractExtensionAsync(Guid contractId);
    Task<ContractDashboardDto> GetContractDashboardAsync(ContractFormat? contractFormat = null);
    Task<ContractReportDto> GetContractReportAsync(Guid contractId);
    Task<List<ContractReportDto>> GetAllContractReportsAsync(
        Guid? contractTypeId,
        Guid? level1CodeId,
        Guid? procurementMethodId,
        Guid? contractStructureCatalogId,
        Guid? partnerId,
        string? partnerName,
        DateTime? startDateFrom,
        DateTime? startDateTo,
        DateTime? endDateFrom,
        DateTime? endDateTo,
        DateTime? endDate,
        bool? isAutoLiquidated,
        bool? isLiquidated);
    Task<List<ContractMaterialUnitPriceReportByYearDto>> GetContractMaterialUnitPriceReportsAsync(
        Guid? contractTypeId,
        Guid? level1CodeId,
        Guid? procurementMethodId,
        Guid? contractStructureCatalogId,
        Guid? partnerId,
        string? partnerName,
        DateTime? startDateFrom,
        DateTime? startDateTo,
        DateTime? endDateFrom,
        DateTime? endDateTo,
        DateTime? endDate,
        bool? isAutoLiquidated,
        bool? isLiquidated);
}
