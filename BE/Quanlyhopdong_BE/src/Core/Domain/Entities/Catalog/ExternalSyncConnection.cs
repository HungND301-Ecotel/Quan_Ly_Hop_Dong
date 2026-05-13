using Domain.Common.Contracts;

namespace Domain.Entities.Catalog;

public class ExternalSyncConnection : AuditableEntity<Guid>
{
    public string Server { get; protected set; } = string.Empty;
    public int Port { get; protected set; } = 1433;
    public string Database { get; protected set; } = string.Empty;
    public string UserId { get; protected set; } = string.Empty;
    public string Password { get; protected set; } = string.Empty;
    public bool TrustServerCertificate { get; protected set; } = true;
    public int CommandTimeoutSeconds { get; protected set; } = 30;
    public bool IsActive { get; protected set; } = true;

    protected ExternalSyncConnection() { }

    public static ExternalSyncConnection Create(
        string server,
        int port,
        string database,
        string userId,
        string password,
        bool trustServerCertificate = true,
        int commandTimeoutSeconds = 30,
        bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(server))
        {
            throw new ArgumentException("Server is required", nameof(server));
        }

        return new ExternalSyncConnection
        {
            Server = server.Trim(),
            Port = port <= 0 ? 1433 : port,
            Database = database.Trim(),
            UserId = userId.Trim(),
            Password = password,
            TrustServerCertificate = trustServerCertificate,
            CommandTimeoutSeconds = commandTimeoutSeconds <= 0 ? 30 : commandTimeoutSeconds,
            IsActive = isActive
        };
    }

    public void Update(
        string server,
        int port,
        string database,
        string userId,
        string password,
        bool trustServerCertificate,
        int commandTimeoutSeconds,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(server))
        {
            throw new ArgumentException("Server is required", nameof(server));
        }

        Server = server.Trim();
        Port = port <= 0 ? 1433 : port;
        Database = database.Trim();
        UserId = userId.Trim();
        Password = password;
        TrustServerCertificate = trustServerCertificate;
        CommandTimeoutSeconds = commandTimeoutSeconds <= 0 ? 30 : commandTimeoutSeconds;
        IsActive = isActive;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}