using Application.Common.Events;
using Application.Common.Interfaces;
using Domain.Common.Enums;
using Domain.Entities.Catalog;
using Domain.Entities.Catalog.PaymentSchedule;
using Domain.Entities.Category;
using Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace EfCore.Persistence.Context;

public class ApplicationDbContext(
    ICurrentUser currentUser,
    ISerializerService serializer,
    IOptions<DatabaseSettings> dbSettings,
    IEventPublisher events)
    : BaseDbContext(currentUser,
        serializer,
        dbSettings,
        events)
{
    // Identity DbSets
    public DbSet<User> Users => Set<User>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<UserVerification> UserVerifications => Set<UserVerification>();
    public DbSet<UserClaim> UserClaims => Set<UserClaim>();
    public DbSet<UserSignature> UserSignatures { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<UserDepartment> UserDepartments { get; set; }
    public DbSet<Position> Positions { get; set; }

    // ==================== PERMISSIONS ====================
    public DbSet<Module> Modules { get; set; }
    public DbSet<SubModule> SubModules { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<DepartmentModulePermission> DepartmentModulePermissions { get; set; }
    public DbSet<PositionSubmodulePermission> PositionSubmodulePermissions { get; set; }
    public DbSet<UserPermissionOverride> UserPermissionOverrides { get; set; }

    // ==================== CONTRACTS ====================
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<Material> Materials { get; set; }
    public DbSet<MaterialGroup> MaterialGroups { get; set; }
    public DbSet<UnitOfMeasure> UnitOfMeasures { get; set; }
    public DbSet<ContractItem> ContractItems { get; set; }
    public DbSet<ContractGuarantee> ContractGuarantees { get; set; }
    public DbSet<BankAccount> BankAccounts { get; set; }
    public DbSet<ContractUserRole> ContractUserRoles { get; set; }
    public DbSet<ContractAttachment> ContractAttachments { get; set; }
    public DbSet<ContractSigningFlow> ContractSigningFlows { get; set; }
    public DbSet<ContractApprovalHistory> ContractApprovalHistories { get; set; }
    public DbSet<ContractEditHistory> ContractEditHistories { get; set; }
    public DbSet<SigningHistory> SigningHistories { get; set; }
    public DbSet<Domain.Entities.Catalog.ContractProgress.ContractProgress> ContractProgresses { get; set; }
    public DbSet<Domain.Entities.Catalog.ContractProgress.ContractProgressItem> ContractProgressItems { get; set; }
    public DbSet<ContractPayment> ContractPayments { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Tax> Taxes { get; set; }
    public DbSet<ContractRelationship> ContractRelationships { get; set; }

    // ==================== FINANCE ====================
    public DbSet<PaymentSchedule> PaymentSchedules { get; set; }

    // ==================== NOTIFICATIONS ====================
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationConfig> NotificationConfigs { get; set; }

    // ==================== CATEGORY ====================
    public DbSet<ContractRegister> ContractRegisters { get; set; }
    public DbSet<ContractStructureCatalog> ContractStructureCatalogs { get; set; }
    public DbSet<ContractType> ContractTypes { get; set; }
    public DbSet<Level1Code> Level1Codes { get; set; }
    public DbSet<Level3Code> Level3Codes { get; set; }
    public DbSet<SignedContent> SignedContents { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<ProcurementMethod> ProcurementMethods { get; set; }
    public DbSet<ExternalSyncConnection> ExternalSyncConnections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var decimalProps = modelBuilder.Model
            .GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => (System.Nullable.GetUnderlyingType(p.ClrType) ?? p.ClrType) == typeof(decimal));

        foreach (var property in decimalProps)
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        // Departments
        modelBuilder.Entity<Department>()
            .HasIndex(d => d.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // Positions
        modelBuilder.Entity<Position>()
            .HasIndex(p => p.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // UnitOfMeasure
        modelBuilder.Entity<UnitOfMeasure>()
            .Property(u => u.Code)
            .IsRequired();

        modelBuilder.Entity<UnitOfMeasure>()
            .Property(u => u.Name)
            .IsRequired();

        modelBuilder.Entity<UnitOfMeasure>()
            .Property(u => u.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<UnitOfMeasure>()
            .HasIndex(u => u.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // ContractItem
        modelBuilder.Entity<Material>()
            .HasIndex(p => p.MaterialCode)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Material>()
            .HasOne(m => m.UnitOfMeasure)
            .WithMany(u => u.Materials)
            .HasForeignKey(m => m.UnitOfMeasureId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaterialGroup>()
            .HasIndex(p => p.GroupCode)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Material>()
            .HasOne(m => m.MaterialGroup)
            .WithMany(g => g.Materials)
            .HasForeignKey(m => m.MaterialGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ContractItem>()
            .HasIndex(p => new { p.ContractId, p.MaterialId })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<ContractGuarantee>()
            .HasIndex(cg => cg.ContractId);

        // UserDepartments - Composite unique
        modelBuilder.Entity<UserDepartment>()
            .HasIndex(ud => new
            {
                ud.UserId,
                ud.DepartmentId
            })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // UserSignatures
        modelBuilder.Entity<UserSignature>()
                    .HasIndex(us => new { us.UserId, us.SignatureType });

        // Modules
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // SubModules
        modelBuilder.Entity<SubModule>()
            .HasIndex(sm => new { sm.ModuleId, sm.Code })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // Permissions
        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // DepartmentModulePermissions - Composite unique
        modelBuilder.Entity<DepartmentModulePermission>()
            .HasIndex(dmp => new { dmp.DepartmentId, dmp.ModuleId, dmp.PermissionId })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // PositionSubModulePermissions - Composite unique
        modelBuilder.Entity<PositionSubmodulePermission>()
            .HasIndex(psmp => new { psmp.PositionId, psmp.SubModuleId, psmp.PermissionId })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // UserPermissionOverrides - Composite unique
        modelBuilder.Entity<UserPermissionOverride>()
            .HasIndex(upo => new { upo.UserId, upo.SubModuleId, upo.PermissionId })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // ContractTypes
        modelBuilder.Entity<ContractType>()
            .HasIndex(ct => ct.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<ContractStructureCatalog>()
            .Property(cs => cs.Name)
            .IsRequired();

        modelBuilder.Entity<ContractStructureCatalog>()
            .Property(cs => cs.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<ContractStructureCatalog>()
            .HasIndex(cs => cs.Name)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // Level1Code - 1-1 with ContractType
        modelBuilder.Entity<Level1Code>()
            .HasIndex(lc => lc.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Level1Code>()
            .HasIndex(lc => lc.ContractTypeId)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Level1Code>()
            .HasOne(lc => lc.ContractType)
            .WithOne(ct => ct.Level1Code)
            .HasForeignKey<Level1Code>(lc => lc.ContractTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Level1Code>()
            .HasOne(lc => lc.ContractRegister)
            .WithMany()
            .HasForeignKey(lc => lc.ContractRegisterId)
            .OnDelete(DeleteBehavior.Restrict);

        // Level3Code - many with Level1Code, 1-1 with SignedContent
        modelBuilder.Entity<Level3Code>()
            .HasIndex(l3 => l3.Code)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Level3Code>()
            .HasOne(l3 => l3.Level1Code)
            .WithMany(l1 => l1.Level3Codes)
            .HasForeignKey(l3 => l3.Level1CodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SignedContent>()
            .HasIndex(sc => sc.Level3CodeId)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<SignedContent>()
            .HasOne(sc => sc.Level3Code)
            .WithOne(l3 => l3.SignedContent)
            .HasForeignKey<SignedContent>(sc => sc.Level3CodeId)
            .OnDelete(DeleteBehavior.Restrict);
        // Contracts
        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.ContractNumber)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.Level3CodeId)
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.SignedContentId)
            .HasFilter("\"DeletedOn\" IS NULL AND \"SignedContentId\" IS NOT NULL");

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.Status);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.SubStatus);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => new { c.Status, c.SubStatus });

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.DepartmentId);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.ContractTypeId);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.ProcurementMethodId);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.ContractRegisterId);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.Level1CodeId);

        modelBuilder.Entity<Contract>()
            .HasIndex(c => c.ContractStructureId);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Level1Code)
            .WithMany(lc => lc.Contracts)
            .HasForeignKey(c => c.Level1CodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Level3Code)
            .WithMany(l3 => l3.Contracts)
            .HasForeignKey(c => c.Level3CodeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.SignedContent)
            .WithMany(sc => sc.Contracts)
            .HasForeignKey(c => c.SignedContentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.ContractStructureCatalog)
            .WithMany(cs => cs.Contracts)
            .HasForeignKey(c => c.ContractStructureId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ContractUserRole>()
            .HasIndex(c => new { c.ContractId, c.UserId });

        // ContractAttachments
        modelBuilder.Entity<ContractAttachment>()
            .HasIndex(ca => ca.ContractId);

        // ContractSigningFlows
        modelBuilder.Entity<ContractSigningFlow>()
            .HasIndex(csf => new { csf.ContractId, csf.SequenceOrder });

        modelBuilder.Entity<ContractSigningFlow>()
            .HasIndex(csf => new { csf.ContractId, csf.UserId });

        modelBuilder.Entity<ContractSigningFlow>()
            .HasIndex(csf => csf.Status);

        // ContractApprovalHistories
        modelBuilder.Entity<ContractApprovalHistory>()
            .HasIndex(cah => cah.ContractId);

        modelBuilder.Entity<ContractApprovalHistory>()
            .HasIndex(cah => cah.UserId);

        // ContractEditHistories
        modelBuilder.Entity<ContractEditHistory>()
            .HasIndex(ceh => ceh.ContractId);

        // SigningHistories
        modelBuilder.Entity<SigningHistory>()
            .HasIndex(sh => sh.ContractSigningFlowId);

        // ContractProgresses
        modelBuilder.Entity<Domain.Entities.Catalog.ContractProgress.ContractProgress>()
            .HasIndex(cp => cp.ContractId);

        modelBuilder.Entity<Domain.Entities.Catalog.ContractProgress.ContractProgress>()
            .HasIndex(cp => new { cp.ContractId, cp.PeriodStart, cp.PeriodEnd });

        // ContractProgressItems
        modelBuilder.Entity<Domain.Entities.Catalog.ContractProgress.ContractProgressItem>()
            .HasIndex(cpi => cpi.ContractProgressId);

        modelBuilder.Entity<Domain.Entities.Catalog.ContractProgress.ContractProgressItem>()
            .HasIndex(cpi => cpi.ContractItemId);

        modelBuilder.Entity<Domain.Entities.Catalog.ContractProgress.ContractProgressItem>()
            .HasIndex(cpi => new { cpi.ContractProgressId, cpi.ContractItemId })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // ContractPayments
        modelBuilder.Entity<ContractPayment>()
            .HasIndex(cp => cp.ContractId);

        modelBuilder.Entity<ContractPayment>()
            .HasIndex(cp => new { cp.ContractId, cp.PeriodNumber })
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<ContractPayment>()
            .HasIndex(cp => cp.PaymentDate);

        modelBuilder.Entity<Invoice>()
            .HasIndex(i => i.ContractPaymentId)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.ContractPayment)
            .WithOne(cp => cp.Invoice)
            .HasForeignKey<Invoice>(i => i.ContractPaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Tax>()
            .HasIndex(t => t.ContractPaymentId)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        modelBuilder.Entity<Tax>()
            .HasOne(t => t.ContractPayment)
            .WithOne(cp => cp.Tax)
            .HasForeignKey<Tax>(t => t.ContractPaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PostgreSQL text[] type for array properties
        modelBuilder.Entity<ContractPayment>()
            .Property(cp => cp.AcceptanceReportFilePaths)
            .HasColumnType("text[]");

        modelBuilder.Entity<ContractPayment>()
            .Property(cp => cp.InvoiceFilePaths)
            .HasColumnType("text[]");

        modelBuilder.Entity<ContractPayment>()
            .Property(cp => cp.TaxFilePaths)
            .HasColumnType("text[]");

        // PaymentSchedules
        modelBuilder.Entity<PaymentSchedule>()
            .HasDiscriminator<ScheduleType>("ScheduleType")
            .HasValue<LumpSumPaymentSchedule>(ScheduleType.LumpSum)
            .HasValue<MonthlyPaymentSchedule>(ScheduleType.Monthly)
            .HasValue<QuarterlyPaymentSchedule>(ScheduleType.Quarterly)
            .HasValue<YearlyPaymentSchedule>(ScheduleType.Yearly)
            .HasValue<StagePaymentSchedule>(ScheduleType.Stage);

        modelBuilder.Entity<PaymentSchedule>()
            .HasIndex(p => p.ContractId);

        modelBuilder.Entity<PaymentSchedule>()
            .HasIndex(p => p.PaymentStatus);

        // PaymentTransactions
        modelBuilder.Entity<ProcurementMethod>()
            .HasIndex(a => a.Code);

        // Notifications
        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.IsRead });

        modelBuilder.Entity<Notification>()
            .HasIndex(n => n.Type);

        // NotificationConfigs
        modelBuilder.Entity<NotificationConfig>()
            .HasIndex(nc => nc.EventType)
            .IsUnique()
            .HasFilter("\"DeletedOn\" IS NULL");

        // ==================== RELATIONSHIPS ====================

        // Department Self-Reference
        modelBuilder.Entity<Department>()
            .HasOne(d => d.ParentDepartment)
            .WithMany(d => d.SubDepartments)
            .HasForeignKey(d => d.ParentId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==================== ENUM CONVERSIONS ====================

        // Convert enums to strings in database
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Contract>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Contract>()
            .Property(c => c.SubStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Contract>()
            .Property(c => c.ContractFormat)
            .HasConversion<string>();

        modelBuilder.Entity<UserSignature>()
            .Property(us => us.SignatureType)
            .HasConversion<string>();

        modelBuilder.Entity<ContractSigningFlow>()
            .Property(csf => csf.SignatureType)
            .HasConversion<string>();

        modelBuilder.Entity<ContractSigningFlow>()
            .Property(csf => csf.Status)
            .HasConversion<string>();

        modelBuilder.Entity<PaymentSchedule>()
            .Property(p => p.PaymentStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Permission>()
            .Property(us => us.Code)
            .HasConversion<string>();

        modelBuilder.Entity<Notification>()
            .Property(n => n.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Notification>()
            .Property(n => n.Priority)
            .HasConversion<string>();

        modelBuilder.Entity<NotificationConfig>()
            .Property(nc => nc.EventType)
            .HasConversion<string>();

        modelBuilder.Entity<Notification>()
            .Property(n => n.IsRead)
            .HasDefaultValue(false);

        modelBuilder.Entity<NotificationConfig>()
            .Property(nc => nc.IsEnabled)
            .HasDefaultValue(true);

        // ContractRelationship - Composite unique
        modelBuilder.Entity<ContractRelationship>()
            .HasIndex(cr => new { cr.ParentContractId, cr.ChildContractId })
            .IsUnique();

        modelBuilder.Entity<ContractRelationship>()
            .HasIndex(cr => cr.RelationType);

        modelBuilder.Entity<ContractRelationship>()
            .Property(cr => cr.RelationType)
            .HasConversion<string>();

        // ContractRelationship - Foreign Keys
        modelBuilder.Entity<ContractRelationship>()
            .HasOne(cr => cr.ParentContract)
            .WithMany(c => c.AsParentRelationships)
            .HasForeignKey(cr => cr.ParentContractId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ContractRelationship>()
            .HasOne(cr => cr.ChildContract)
            .WithMany(c => c.AsChildRelationships)
            .HasForeignKey(cr => cr.ChildContractId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}