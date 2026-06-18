using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Infrastructure.Jobs;

/// <summary>
/// Job tự động chuyển hợp đồng từ NotStarted sang InProgress khi đã đến ngày hiệu lực.
/// </summary>
public class ContractStartDateActivationJob(
    ILogger<ContractStartDateActivationJob> logger,
    IUnitOfWork unitOfWork) : IJob
{
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<ContractEditHistory> _historyRepo = unitOfWork.GetRepository<ContractEditHistory>();

    // User ID cho system job - dùng user có sẵn trong database
    private static readonly Guid SystemUserId = Guid.Parse("44edcf1e-24db-41a7-a644-1eee77155fc4");

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("=== ContractStartDateActivationJob Started at {Time} ===", DateTimeOffset.Now);

        try
        {
            var today = DateTimeOffset.Now.Date;

            var contractsToActivate = await _contractRepo.GetAllAsync(
                predicate: c => c.Status == ContractStatus.Active
                                && c.SubStatus == ContractSubStatus.NotStarted
                                && c.EffectiveDate.Date <= today,
                disableTracking: false);

            logger.LogInformation("Found {Count} contracts to activate by start date", contractsToActivate.Count);

            if (contractsToActivate.Count == 0)
            {
                logger.LogInformation("No contracts require status transition from NotStarted to InProgress.");
                return;
            }

            foreach (var contract in contractsToActivate)
            {
                string oldSubStatus = contract.SubStatus?.ToString() ?? "null";

                contract.SetSubStatus(ContractSubStatus.InProgress);

                var subStatusHistory = ContractEditHistory.Create(
                    contractId: contract.Id,
                    editBy: SystemUserId,
                    fieldName: "SubStatus",
                    oldValue: oldSubStatus,
                    newValue: ContractSubStatus.InProgress.ToString(),
                    editReason: "Tự động cập nhật: Đến ngày hiệu lực hợp đồng");

                await _historyRepo.InsertAsync(subStatusHistory);
            }

            var affectedRows = await unitOfWork.SaveChangesAsync();
            logger.LogInformation("Updated {Count} contracts to InProgress. Affected rows: {Rows}", contractsToActivate.Count, affectedRows);
            logger.LogInformation("=== ContractStartDateActivationJob Completed Successfully at {Time} ===", DateTimeOffset.Now);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in ContractStartDateActivationJob");
            throw;
        }
    }
}
