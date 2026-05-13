using System.Diagnostics;
using System.Threading.Channels;
using Application.Dto.Authorization.Verification;
using Application.Interfaces.Infrastructures.Integrates.External.Service.Email;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Integrates;

public class BackgroundEmailQueueService(
    IServiceProvider serviceProvider,
    ILogger<BackgroundEmailQueueService> logger,
    Channel<EmailQueueItem> mainChannel,
    Channel<EmailQueueItem> dlqChannel) : BackgroundService
{

    private const int MAX_CONCURRENCY = 4;

    public async Task EnqueueAsync(string to, string subject, string html)
    {
        var item = new EmailQueueItem
        {
            To = to,
            Subject = subject,
            Html = html,
            QueuedAt = DateTime.UtcNow
        };

        await mainChannel.Writer.WriteAsync(item);
        logger.LogInformation("Email queued for {Email}", to);
    }

    public int GetPendingCount() => mainChannel.Reader.Count;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Background Email Queue Service started");

        var options = new ParallelOptions
        {
            MaxDegreeOfParallelism = MAX_CONCURRENCY,
            CancellationToken = stoppingToken
        };

        await Parallel.ForEachAsync(mainChannel.Reader.ReadAllAsync(stoppingToken), options,
            async (item, ct) =>
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

                    var sw = Stopwatch.StartNew();
                    await emailSender.SendAsync(item.To, item.Subject, item.Html);

                    logger.LogInformation("Sent {Email} in {ms}ms", item.To, sw.ElapsedMilliseconds);
                }
                catch (Exception ex)
                {
                    item.RetryCount++;
                    item.LastError = ex.Message;

                    if (item.RetryCount < EmailQueueItem.MaxRetries)
                    {
                        // Re-queue để thử lại
                        await mainChannel.Writer.WriteAsync(item, ct);
                        logger.LogWarning("Retry {Count}/{Max} for {To} - Error: {Msg}",
                            item.RetryCount, EmailQueueItem.MaxRetries, item.To, ex.Message);
                    }
                    else
                    {
                        // Hết retry → đẩy vào DLQ
                        await dlqChannel.Writer.WriteAsync(item, ct);
                        logger.LogError(ex, "Moved to DLQ after {Max} retries → {To}",
                            EmailQueueItem.MaxRetries, item.To);
                    }
                }
            });
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Stopping. Pending emails: {Count}", GetPendingCount());
        mainChannel.Writer.Complete();
        await base.StopAsync(cancellationToken);
    }
}