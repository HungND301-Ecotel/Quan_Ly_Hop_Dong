using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Infrastructure.Jobs;

public class NotifyContractExpiringJob(
    ILogger<NotifyContractExpiringJob> logger,
    INotificationService notificationService,
    IUnitOfWork unitOfWork) : IJob
{
    private readonly IWriteRepository<Contract> _contractRepo = unitOfWork.GetRepository<Contract>();
    private readonly IWriteRepository<NotificationConfig> _configRepo = unitOfWork.GetRepository<NotificationConfig>();
    private readonly IWriteRepository<ContractUserRole> _contractUserRoleRepo = unitOfWork.GetRepository<ContractUserRole>();

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("NotifyContractExpiringJob Started");

        try
        {
            // 1. Lấy cấu hình thông báo cho Contract Expiring
            var config = await _configRepo.GetFirstOrDefaultAsync(
                predicate: c => c.EventType == NotificationEventType.ContractExpiring && c.IsEnabled,
                disableTracking: true);

            if (config == null)
            {
                logger.LogWarning("NotificationConfig for ContractExpiring not found or disabled");
                return;
            }

            logger.LogInformation("Config found: DaysBefore = {DaysBefore}", config.DaysBefore);

            // 2. Tính ngày cảnh báo: Today + DaysBefore
            var targetDate = DateTimeOffset.Now.Date.AddDays(config.DaysBefore);

            logger.LogInformation("Checking contracts expiring on: {TargetDate}", targetDate);

            // 3. Lấy danh sách hợp đồng sắp hết hạn
            var expiringContracts = await _contractRepo.GetAllAsync(
                predicate: c => c.EndDate.Date == targetDate && c.Status == ContractStatus.Active,
                disableTracking: true);

            logger.LogInformation($"Found {expiringContracts.Count} contracts expiring on {targetDate}");

            if (!expiringContracts.Any())
            {
                logger.LogInformation("No contracts found expiring on target date");
                return;
            }

            // 4. Xử lý từng hợp đồng
            foreach (var contract in expiringContracts)
            {
                try
                {
                    logger.LogInformation($"Processing contract: {contract.ContractNumber} - {contract.Id}");

                    // 5. Lấy danh sách users liên quan đến hợp đồng
                    var contractUserRoles = await _contractUserRoleRepo.GetAllAsync(
                        predicate: cur => cur.ContractId == contract.Id,
                        disableTracking: true);

                    var userIds = contractUserRoles.Select(cur => cur.UserId).Distinct().ToList();

                    if (!userIds.Any())
                    {
                        logger.LogWarning($"No users found for contract {contract.Id}");
                        continue;
                    }

                    logger.LogInformation("Notifying {Count} users for contract {ContractId}",
                        userIds.Count, contract.Id);

                    // 6. Gửi thông báo
                    await notificationService.NotifyContractExpiringAsync(
                        contract.Id,
                        userIds,
                        config.DaysBefore);

                    logger.LogInformation("✓ Notifications sent successfully for contract {ContractId}",
                        contract.Id);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing contract {ContractId}", contract.Id);
                    // Continue với contracts khác
                }
            }

            logger.LogInformation("NotifyContractExpiringJob Completed Successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in NotifyContractExpiringJob");
            throw;
        }
    }
}
