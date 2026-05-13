using Application.Interfaces.Infrastructures.Integrates.External.Service.Email;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Integrates;

public class EmailQueueService(
        BackgroundEmailQueueService backgroundService,
        ILogger<EmailQueueService> logger) : IEmailQueueService
{

    public async Task QueueAsync(string to, string subject, string html)
    {
        await backgroundService.EnqueueAsync(to, subject, html);
    }

    public async Task QueueBulkAsync(IEnumerable<(string to, string subject, string html)> emails)
    {
        var emailList = emails.ToList();
        logger.LogInformation("Queuing {Count} bulk emails", emailList.Count);

        foreach (var (to, subject, html) in emailList)
        {
            await backgroundService.EnqueueAsync(to, subject, html);
        }

        logger.LogInformation("Queued {Count} emails successfully", emailList.Count);
    }

    public int GetPendingCount() => backgroundService.GetPendingCount();
}