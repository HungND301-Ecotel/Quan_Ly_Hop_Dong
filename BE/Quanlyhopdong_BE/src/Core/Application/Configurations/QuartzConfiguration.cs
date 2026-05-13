namespace Application.Configurations;

public class QuartzConfiguration
{
    public bool Enabled { get; set; }
    public QuartzSetting AutoNotifyContractExpiringDate { get; set; } = default!;
    public QuartzSetting AutoNotifySignatureOverdue { get; set; } = default!;
    public QuartzSetting AutoNotifyPaymentDue { get; set; } = default!;
    public QuartzSetting AutoCheckContractExpiry { get; set; } = default!;
    public QuartzSetting AutoActivateContractsByStartDate { get; set; } = default!;
}

public class QuartzSetting
{
    public bool Enabled { get; set; }
    public string Scheduled { get; set; } = string.Empty;
}

