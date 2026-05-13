namespace Application.Interfaces.Infrastructures.Integrates.External.Service.Email;

public interface IEmailQueueService
{
    Task QueueAsync(string to, string subject, string html);
    Task QueueBulkAsync(IEnumerable<(string to, string subject, string html)> emails);
    int GetPendingCount();
}
