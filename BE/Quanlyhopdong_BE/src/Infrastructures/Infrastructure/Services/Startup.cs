using System.Threading.Channels;
using Application.Common.Services;
using Application.Configurations;
using Application.Dto.Authorization.Verification;
using Application.Identity.Tokens;
using Application.Interfaces;
using Application.Interfaces.Infrastructures.Integrates.Cloud.Service.AWS;
using Application.Interfaces.Infrastructures.Integrates.External.Service.Email;
using Application.Interfaces.Services;
using Application.Interfaces.Services.Catalog;
using External.Service.Email;
using Infrastructure.Auth.Authorization;
using Infrastructure.Services.Cache;
using Infrastructure.Services.Catalog;
using Infrastructure.Services.Identity;
using Infrastructure.Services.Integrates;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Services;

internal static class Startup
{
    internal static IServiceCollection AddRegisterService(this IServiceCollection services)
    {
        services.AddTransient<IPaginationService, PaginationService>();
        services.AddTransient<IInitializeCacheService, InitializeCacheService>();
        services.AddTransient<IAwsCloudService, AwsCloudService>();

        services.AddSingleton(sp =>
            Channel.CreateBounded<EmailQueueItem>(new BoundedChannelOptions(5000)
            {
                FullMode = BoundedChannelFullMode.Wait
            })); // main queue
        services.AddSingleton(sp => Channel.CreateUnbounded<EmailQueueItem>()); // DLQ
        services.AddHostedService<BackgroundEmailQueueService>();
        services.AddSingleton<BackgroundEmailQueueService>();
        services.AddHostedService<DeadLetterQueueMonitorService>();
        services.AddSingleton<DeadLetterQueueMonitorService>();
        services.AddTransient<IEmailQueueService, EmailQueueService>();

        services.AddTransient<IEmailTemplateProvider, EmailTemplateProvider>();
        services.AddTransient<ApplicationInfoConfiguration>();
        services.AddTransient<IEmailSender, EmailSender>();
        services.AddTransient<IEmailService, EmailService>();

        services.AddTransient<ITokenService, TokenService>();
        services.AddTransient<IUserService, UserService>();
        services.AddTransient<IVerificationService, VerificationService>();

        services.AddTransient<IContractService, ContractService>();
        services.AddTransient<IContractProgressService, ContractProgressService>();
        services.AddTransient<IContractPaymentService, ContractPaymentService>();
        services.AddTransient<INotificationService, NotificationService>();
        services.AddTransient<IDigitalSignatureService, ContractService>();
        services.AddTransient<IFileStorageService, FileStorageService>();
        services.AddTransient<IPartnerService, PartnerService>();
        services.AddTransient<IDepartmentService, DepartmentService>();
        services.AddTransient<IContractTypeService, ContractTypeService>();
        services.AddTransient<IContractStructureCatalogService, ContractStructureCatalogService>();
        services.AddTransient<IUnitOfMeasureService, UnitOfMeasureService>();
        services.AddTransient<IExternalSyncConnectionResolver, ExternalSyncConnectionResolverService>();
        services.AddTransient<IUnitOfMeasureSyncSourceService, UnitOfMeasureSyncSourceService>();
        services.AddTransient<IMaterialGroupSyncSourceService, MaterialGroupSyncSourceService>();
        services.AddTransient<IMaterialSyncSourceService, MaterialSyncSourceService>();
        services.AddTransient<IInvoiceSyncSourceService, InvoiceSyncSourceService>();
        services.AddTransient<ITaxSyncSourceService, TaxSyncSourceService>();
        services.AddTransient<ILevel1CodeService, Level1CodeService>();
        services.AddTransient<ILevel2CodeService, Level2CodeService>();
        services.AddTransient<ILevel3CodeService, Level3CodeService>();
        services.AddTransient<ISignedContentService, SignedContentService>();
        return services;
    }
}