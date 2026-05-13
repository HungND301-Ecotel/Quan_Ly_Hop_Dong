using Application.Common.Repositories;
using Application.Common.UnitOfWork;
using Application.Interfaces.Services.Catalog;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Infrastructure.Jobs;

public class NotifySignatureOverdueJob(
    ILogger<NotifySignatureOverdueJob> logger,
    INotificationService notificationService,
    IUnitOfWork unitOfWork) : IJob
{
    private readonly IWriteRepository<NotificationConfig> _configRepo = unitOfWork.GetRepository<NotificationConfig>();
    private readonly IWriteRepository<ContractSigningFlow> _signingFlowRepo = unitOfWork.GetRepository<ContractSigningFlow>();

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("NotifySignatureOverdueJob Started at {Time}", DateTimeOffset.Now);

        try
        {
            var config = await _configRepo.GetFirstOrDefaultAsync(
                predicate: c => c.EventType == NotificationEventType.SignatureOverdue && c.IsEnabled,
                disableTracking: true);

            if (config == null)
            {
                logger.LogWarning("NotificationConfig for SignatureOverdue not found or disabled");
                return;
            }

            logger.LogInformation("Config found: DaysBefore = {DaysBefore}", config.DaysBefore);

            var targetDate = DateTimeOffset.Now.Date.AddDays(config.DaysBefore);

            logger.LogInformation("Checking contracts with pending signatures on: {TargetDate}", targetDate);

            var pendingSigningFlows = await _signingFlowRepo.GetAllAsync(
                predicate: sf => sf.Status == SigningFlowStatus.Pending,
                include: sf => sf.Include(x => x.Contract)
                               .Include(x => x.User),
                disableTracking: true);

            logger.LogInformation("Found {Count} pending signing flows", pendingSigningFlows.Count);

            if (!pendingSigningFlows.Any())
            {
                logger.LogInformation("No pending signing flows found");
                return;
            }

            var contractsToNotify = pendingSigningFlows
                .Where(sf => sf.Contract.CreatedOn.Date <= targetDate.AddDays(-config.DaysBefore))
                .GroupBy(sf => sf.ContractId)
                .ToList();

            logger.LogInformation("Found {Count} contracts needing signature reminders", contractsToNotify.Count);

            foreach (var contractGroup in contractsToNotify)
            {
                try
                {
                    var contract = contractGroup.First().Contract;
                    var contractId = contractGroup.Key;

                    var nextSigner = contractGroup
                        .OrderBy(sf => sf.SequenceOrder)
                        .FirstOrDefault();

                    if (nextSigner == null)
                    {
                        continue;
                    }

                    logger.LogInformation("Processing contract: {ContractNumber} - Next signer: {UserName}",
                        contract.ContractNumber, nextSigner.User.UserName);

                    await notificationService.NotifySignatureOverdueAsync(
                        contractId,
                        nextSigner.UserId,
                        config.DaysBefore);

                    logger.LogInformation("? Notification sent to user {UserId} for contract {ContractId}",
                        nextSigner.UserId, contractId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing contract {ContractId}", contractGroup.Key);
                }
            }

            logger.LogInformation("=== NotifySignatureOverdueJob Completed Successfully ===");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in NotifySignatureOverdueJob");
            throw;
        }
    }
}
