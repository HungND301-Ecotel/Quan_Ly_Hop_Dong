using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Domain.Entities.Catalog.PaymentSchedule;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Infrastructure.Jobs;

public class NotifyPaymentDueJob(
    ILogger<NotifyPaymentDueJob> logger,
    INotificationService notificationService,
    IUnitOfWork unitOfWork) : IJob
{
    private readonly IWriteRepository<PaymentSchedule> _paymentScheduleRepo = unitOfWork.GetRepository<PaymentSchedule>();
    private readonly IWriteRepository<NotificationConfig> _configRepo = unitOfWork.GetRepository<NotificationConfig>();
    private readonly IWriteRepository<ContractUserRole> _contractUserRoleRepo = unitOfWork.GetRepository<ContractUserRole>();

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1848:Use the LoggerMessage delegates", Justification = "<Pending>")]
    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("=== NotifyPaymentDueJob Started at {Time} ===", DateTimeOffset.Now);

        try
        {
            // 1. Lấy cấu hình thông báo cho Payment Due
            var config = await _configRepo.GetFirstOrDefaultAsync(
                predicate: c => c.EventType == NotificationEventType.PaymentDue && c.IsEnabled,
                disableTracking: true);

            if (config == null)
            {
                logger.LogWarning("NotificationConfig for PaymentDue not found or disabled");
                return;
            }

            logger.LogInformation("Config found: DaysBefore = {DaysBefore}", config.DaysBefore);

            // 2. Tính ngày cảnh báo: Today + DaysBefore
            var targetDate = DateTimeOffset.Now.Date.AddDays(config.DaysBefore);

            logger.LogInformation("Checking payments due on: {TargetDate}", targetDate);

            var contractsDue = new HashSet<Guid>();

            // 3. Query PaymentSchedule
            var paymentsDue = await _paymentScheduleRepo.GetAllAsync(
                predicate: p => p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            foreach (var payment in paymentsDue)
            {
                var dueDate = payment.GetDueDate();
                if (dueDate.HasValue && dueDate.Value.Date == targetDate)
                {
                    contractsDue.Add(payment.ContractId);
                }
            }
            logger.LogInformation("Found {Count} payments due on {TargetDate}", contractsDue.Count, targetDate);

            logger.LogInformation("Total {Count} contracts with payments due", contractsDue.Count);

            if (!contractsDue.Any())
            {
                logger.LogInformation("No payments due on target date");
                return;
            }

            foreach (var contractId in contractsDue)
            {
                try
                {
                    logger.LogInformation("Processing contract: {ContractId}", contractId);

                    var contractUserRoles = await _contractUserRoleRepo.GetAllAsync(
                        predicate: cur => cur.ContractId == contractId,
                        disableTracking: true);

                    var userIds = contractUserRoles.Select(cur => cur.UserId).Distinct().ToList();

                    if (!userIds.Any())
                    {
                        logger.LogWarning("No users found for contract {ContractId}", contractId);
                        continue;
                    }

                    logger.LogInformation("Notifying {Count} users for contract {ContractId}",
                        userIds.Count, contractId);

                    await notificationService.NotifyPaymentDueAsync(
                        contractId,
                        userIds,
                        config.DaysBefore);

                    logger.LogInformation("✓ Notifications sent successfully for contract {ContractId}",
                        contractId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing contract {ContractId}", contractId);
                }
            }

            logger.LogInformation("=== NotifyPaymentDueJob Completed Successfully ===");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in NotifyPaymentDueJob");
            throw;
        }
    }
}

