using System.Threading.Channels;
using Application.Dto.Authorization.Verification;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Integrates;

public class DeadLetterQueueMonitorService(
        Channel<EmailQueueItem> dlqChannel,
        ILogger<DeadLetterQueueMonitorService> logger) : BackgroundService
{

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("DLQ Monitor started");

        await foreach (var item in dlqChannel.Reader.ReadAllAsync(stoppingToken))
        {
            // Option 1: Log chi tiết (có thể lưu vào database, table FailedEmails)
            logger.LogCritical(
                "DLQ Email | To: {To} | Subject: {Subject} | Retries: {Retries} | LastError: {Error} | Queued: {Time}",
                item.To, item.Subject, item.RetryCount, item.LastError, item.QueuedAt);

            // await _dbContext.FailedEmails.AddAsync(new FailedEmailEntity(item));
            // await _dbContext.SaveChangesAsync();
        }
    }
}
