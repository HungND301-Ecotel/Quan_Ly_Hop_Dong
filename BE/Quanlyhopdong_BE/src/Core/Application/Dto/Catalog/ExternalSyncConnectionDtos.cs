namespace Application.Dto.Catalog;

public class SyncExternalSourceRequest
{
    public Guid SourceConnectionId { get; set; }
}

public class ExternalSyncConnectionDto
{
    public Guid Id { get; set; }
    public DatabaseConnectionOptions Connection { get; set; } = new();
    public bool IsActive { get; set; }
}

public class CreateExternalSyncConnectionRequest
{
    public DatabaseConnectionOptions Connection { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class UpdateExternalSyncConnectionRequest
{
    public Guid Id { get; set; }
    public DatabaseConnectionOptions Connection { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class DatabaseConnectionOptions
{
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; } = 1433;
    public string Database { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool TrustServerCertificate { get; set; } = true;
    public int CommandTimeoutSeconds { get; set; } = 30;

    public string BuildConnectionString() =>
        $"Server={Server},{Port};Database={Database};User Id={UserId};Password={Password};TrustServerCertificate={TrustServerCertificate};";
}