using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Infrastructure.Jobs;

/// <summary>
/// Job tự động kiểm tra và cập nhật trạng thái hợp đồng hết hạn
/// - Chuyển hợp đồng quá hạn sang Expired và gán SubStatus theo mức ưu tiên nghiệp vụ
/// - Ghi lịch sử thay đổi vào ContractEditHistory
/// </summary>
public class ContractExpiryCheckerService(
    ILogger<ContractExpiryCheckerService> logger,
    IUnitOfWork unitOfWork) : IJob
{
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<ContractEditHistory> _historyRepo = unitOfWork.GetRepository<ContractEditHistory>();

    // User ID cho system job - dùng user có sẵn trong database
    private static readonly Guid SystemUserId = Guid.Parse("44edcf1e-24db-41a7-a644-1eee77155fc4");

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("=== ContractExpiryCheckerService Started at {Time} ===", DateTimeOffset.Now);

        try
        {
            var today = DateTimeOffset.Now.Date;
            logger.LogInformation("Today: {Today}", today);

            // Log tổng số Active contracts
            var allActiveContracts = await _contractRepo.GetAllAsync(
                predicate: c => c.Status == ContractStatus.Active);
            logger.LogInformation("Total Active Contracts: {Count}", allActiveContracts.Count);

            // 1. Xử lý hợp đồng đã quá hạn (EndDate < Today AND Status = Active)
            await ProcessOverdueContractsAsync(today);

            // 2. Commit tất cả thay đổi
            logger.LogInformation("Saving changes to database...");
            var savedCount = await unitOfWork.SaveChangesAsync();
            logger.LogInformation("Database changes saved. Affected rows: {Count}", savedCount);

            logger.LogInformation("=== ContractExpiryCheckerService Completed Successfully at {Time} ===", DateTimeOffset.Now);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in ContractExpiryCheckerService");
            throw;
        }
    }

    /// <summary>
    /// Xử lý hợp đồng đã quá hạn
    /// </summary>
    private async Task ProcessOverdueContractsAsync(DateTime today)
    {
        logger.LogInformation("--- Processing Overdue Contracts ---");
        logger.LogInformation("Query: EndDate < {Today} AND Status = Active", today);

        // Lấy tất cả hợp đồng Active đã quá hạn
        var overdueContracts = await _contractRepo.GetAllAsync(
            predicate: c => c.EndDate.Date < today && c.Status == ContractStatus.Active,
            include: q => q
                .Include(c => c.PaymentSchedules)
                .ThenInclude(ps => ps.ContractPayments)
                .ThenInclude(cp => cp.Invoice)
                .Include(c => c.PaymentSchedules)
                .ThenInclude(ps => ps.ContractPayments)
                .ThenInclude(cp => cp.Tax!),
            disableTracking: false); // Enable tracking để update

        logger.LogInformation("Found {Count} overdue contracts", overdueContracts.Count);
        
        if (overdueContracts.Count == 0)
        {
            logger.LogInformation("No overdue contracts to process.");
            return;
        }
        
        // Log danh sách contract numbers
        var contractNumbers = string.Join(", ", overdueContracts.Select(c => c.ContractNumber));
        logger.LogInformation("Overdue contract numbers: {ContractNumbers}", contractNumbers);

        foreach (var contract in overdueContracts)
        {
            try
            {
                string oldStatus = contract.Status.ToString();
                string oldSubStatus = contract.SubStatus?.ToString() ?? "null";

                var newSubStatus = DetermineExpiredSubStatus(contract);

                // Cập nhật trạng thái
                contract.SetStatus(ContractStatus.Expired);
                contract.SetSubStatus(newSubStatus);
                
                // Verify update
                logger.LogWarning(
                    "🔴 UPDATING: Contract {ContractNumber} ({Id}): {OldStatus}/{OldSubStatus} -> {NewStatus}/{NewSubStatus} (EndDate: {EndDate})",
                    contract.ContractNumber, contract.Id, oldStatus, oldSubStatus, 
                    contract.Status.ToString(), contract.SubStatus?.ToString() ?? "null", contract.EndDate.Date);

                // Ghi lịch sử thay đổi Status
                var statusHistory = ContractEditHistory.Create(
                    contractId: contract.Id,
                    editBy: SystemUserId,
                    fieldName: "Status",
                    oldValue: oldStatus,
                    newValue: ContractStatus.Expired.ToString(),
                    editReason: "Tự động chuyển trạng thái: Hợp đồng đã quá hạn");

                await _historyRepo.InsertAsync(statusHistory);

                // Ghi lịch sử thay đổi SubStatus
                var subStatusHistory = ContractEditHistory.Create(
                    contractId: contract.Id,
                    editBy: SystemUserId,
                    fieldName: "SubStatus",
                    oldValue: oldSubStatus,
                    newValue: newSubStatus?.ToString(),
                    editReason: "Tự động cập nhật: Hợp đồng đã quá hạn");

                await _historyRepo.InsertAsync(subStatusHistory);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing overdue contract {ContractId}", contract.Id);
                // Continue với contracts khác
            }
        }

        logger.LogInformation("✓ Successfully processed {Count} overdue contracts", overdueContracts.Count);
    }

    private static ContractSubStatus? DetermineExpiredSubStatus(Contract contract)
    {
        // Priority when contract is expired:
        // 1) Missing acceptance + missing payment => ExpiredMissingAcceptance
        // 2) Missing liquidation => ExpiredMissingLiquidation
        // 3) Missing acceptance => ExpiredMissingAcceptance
        // 4) Missing payment => ExpiredMissingPayment
        // 5) All required files are present => null
        bool hasIncompleteAcceptanceReport = HasIncompleteAcceptanceReport(contract);
        bool hasMissingPaymentFile = HasMissingPaymentFile(contract);
        bool hasMissingLiquidationFile = HasMissingLiquidationFile(contract);

        if (hasIncompleteAcceptanceReport && hasMissingPaymentFile)
        {
            return ContractSubStatus.ExpiredMissingAcceptance;
        }

        if (hasMissingLiquidationFile)
        {
            return ContractSubStatus.ExpiredMissingLiquidation;
        }

        if (hasIncompleteAcceptanceReport)
        {
            return ContractSubStatus.ExpiredMissingAcceptance;
        }

        if (hasMissingPaymentFile)
        {
            return ContractSubStatus.ExpiredMissingPayment;
        }

        return null;
    }

    private static bool HasIncompleteAcceptanceReport(Contract contract)
    {
        if (!contract.PaymentSchedules.Any())
        {
            return true;
        }

        return contract.PaymentSchedules.Any(ps =>
            !ps.ContractPayments.Any(p => p.AcceptanceReportFilePaths != null && p.AcceptanceReportFilePaths.Length > 0));
    }

    private static bool HasMissingPaymentFile(Contract contract)
    {
        if (!contract.PaymentSchedules.Any())
        {
            return true;
        }

        return contract.PaymentSchedules.Any(ps =>
            !ps.ContractPayments.Any(p =>
                (p.InvoiceFilePaths != null && p.InvoiceFilePaths.Length > 0) || p.Invoice != null));
    }

    private static bool HasMissingLiquidationFile(Contract contract)
    {
        return string.IsNullOrWhiteSpace(contract.LiquidationFilePath);
    }

}
