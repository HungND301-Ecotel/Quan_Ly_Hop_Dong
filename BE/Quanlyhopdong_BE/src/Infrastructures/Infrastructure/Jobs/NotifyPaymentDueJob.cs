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
    private readonly IWriteRepository<StagePaymentSchedule> _stagePaymentRepo = unitOfWork.GetRepository<StagePaymentSchedule>();
    private readonly IWriteRepository<MonthlyPaymentSchedule> _monthlyPaymentRepo = unitOfWork.GetRepository<MonthlyPaymentSchedule>();
    private readonly IWriteRepository<QuarterlyPaymentSchedule> _quarterlyPaymentRepo = unitOfWork.GetRepository<QuarterlyPaymentSchedule>();
    private readonly IWriteRepository<YearlyPaymentSchedule> _yearlyPaymentRepo = unitOfWork.GetRepository<YearlyPaymentSchedule>();
    private readonly IWriteRepository<LumpSumPaymentSchedule> _lumpSumPaymentRepo = unitOfWork.GetRepository<LumpSumPaymentSchedule>();
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

            // 3. Query StagePaymentSchedule - ToDate = targetDate
            var stagePaymentsDue = await _stagePaymentRepo.GetAllAsync(
                predicate: p => p.ToDate.Date == targetDate && p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            foreach (var payment in stagePaymentsDue)
            {
                contractsDue.Add(payment.ContractId);
            }
            logger.LogInformation("Found {Count} stage payments due", stagePaymentsDue.Count);

            // 4. Query MonthlyPaymentSchedule - last day of Month/Year
            var monthlyPaymentsDue = await _monthlyPaymentRepo.GetAllAsync(
                predicate: p => p.Year == targetDate.Year &&
                               p.Month == targetDate.Month &&
                               p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            var lastDayOfMonth = new DateTime(targetDate.Year, targetDate.Month,
                DateTime.DaysInMonth(targetDate.Year, targetDate.Month));

            foreach (var payment in monthlyPaymentsDue.Where(p => lastDayOfMonth == targetDate.Date))
            {
                contractsDue.Add(payment.ContractId);
            }
            logger.LogInformation("Found {Count} monthly payments due",
                monthlyPaymentsDue.Count(p => lastDayOfMonth == targetDate.Date));

            var quarterlyPaymentsDue = await _quarterlyPaymentRepo.GetAllAsync(
                predicate: p => p.Year == targetDate.Year && p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            foreach (var payment in quarterlyPaymentsDue)
            {
                var quarterEndDate = GetQuarterEndDate(payment.Quarter, payment.Year);
                if (quarterEndDate == targetDate.Date)
                {
                    contractsDue.Add(payment.ContractId);
                }
            }
            logger.LogInformation("Found {Count} quarterly payments due",
                quarterlyPaymentsDue.Count(p => GetQuarterEndDate(p.Quarter, p.Year) == targetDate.Date));

            var yearlyPaymentsDue = await _yearlyPaymentRepo.GetAllAsync(
                predicate: p => p.Year == targetDate.Year && p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            var yearEndDate = new DateTime(targetDate.Year, 12, 31);
            foreach (var payment in yearlyPaymentsDue.Where(p => yearEndDate == targetDate.Date))
            {
                contractsDue.Add(payment.ContractId);
            }
            logger.LogInformation("Found {Count} yearly payments due",
                yearlyPaymentsDue.Count(p => yearEndDate == targetDate.Date));

            var lumpSumPaymentsDue = await _lumpSumPaymentRepo.GetAllAsync(
                predicate: p => p.DueDate.Date == targetDate && p.PaymentStatus == PaymentStatus.Unpaid,
                include: p => p.Include(x => x.Contract),
                disableTracking: true);

            foreach (var payment in lumpSumPaymentsDue)
            {
                contractsDue.Add(payment.ContractId);
            }
            logger.LogInformation("Found {Count} lump sum payments due", lumpSumPaymentsDue.Count);

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

    /// <summary>
    /// Get last day of quarter
    /// Q1: March 31, Q2: June 30, Q3: September 30, Q4: December 31
    /// </summary>
    private static DateTime GetQuarterEndDate(int quarter, int year)
    {
        return quarter switch
        {
            1 => new DateTime(year, 3, 31),
            2 => new DateTime(year, 6, 30),
            3 => new DateTime(year, 9, 30),
            4 => new DateTime(year, 12, 31),
            _ => throw new ArgumentException($"Invalid quarter: {quarter}")
        };
    }
}

