using Domain.Common.Enums;
using Domain.Entities.Category;
using Domain.Entities.Identity;
using EfCore.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Position = Domain.Entities.Identity.Position;

namespace EfCore.Persistence.Initialization;

internal class ApplicationDbSeeder(CustomSeederRunner seederRunner)
{
    public async Task SeedDatabaseAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        await seederRunner.RunSeedersAsync(cancellationToken);
        await SeedPositionAsync(dbContext);
        await SeedDepartmentAsync(dbContext);
        await SeedPermissionsAsync(dbContext);
        await SeedModulesAsync(dbContext);
        await SeedContractTypesAsync(dbContext);
        await SeedNotificationConfigAsync(dbContext);

        await SeedSubModulesAsync(dbContext);
        await SeedPositionSubmodulePermissionsAsync(dbContext);
        await SeedUsersAsync(dbContext);
        await SeedUserSignaturesAsync(dbContext);
        await SeedUserDepartmentsAsync(dbContext);
        await SeedDepartmentModulePermissionsAsync(dbContext);
        await SeedUserPermissionOverridesAsync(dbContext);
    }
    private static async Task SeedPositionAsync(ApplicationDbContext context)
    {
        if (!context.Positions.Any())
        {
            var positions = new List<Position>
            {
                Position.Create("Admin", "admin", 1, null),
                Position.Create("Giám đốc", "director", 2, null),
                Position.Create("Trưởng phòng", "manager", 3, null),
                Position.Create("Phó phòng", "assistant_manager", 3, null),
                Position.Create("Nhân viên", "staff", 4, null),
            };
            context.Positions.AddRange(positions);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedDepartmentAsync(ApplicationDbContext context)
    {
        if (!context.Departments.Any())
        {
            var departments = new List<Department>
            {
                Department.Create("Phòng Kinh Doanh", "business", null),
                Department.Create("Phòng Kế Toán", "accountant", null),
                Department.Create("Phòng Pháp Chế", "legal", null),
                Department.Create("Phòng Giám Đốc", "director", null),
                Department.Create("Admin", "admin", null),
            };
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedPermissionsAsync(ApplicationDbContext context)
    {
        if (!context.Permissions.Any())
        {
            var permissions = new List<Permission>
            {
                Permission.Create(PermissionCode.Create, "Tạo mới", null),
                Permission.Create(PermissionCode.Read, "Xem", null),
                Permission.Create(PermissionCode.Update, "Cập nhật", null),
                Permission.Create(PermissionCode.Delete, "Xóa", null),
                Permission.Create(PermissionCode.Approve, "Phê duyệt", null),
                Permission.Create(PermissionCode.Export, "Xuất dữ liệu", null)
            };
            context.Permissions.AddRange(permissions);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedModulesAsync(ApplicationDbContext context)
    {
        if (!context.Modules.Any())
        {
            var modules = new List<Module>
            {
                Module.Create("Quản lý hợp đồng", "contract", null, 1),
                Module.Create("Tài chính công nợ", "finance", null, 2),
                Module.Create("Báo cáo", "report", null, 3),
                Module.Create("Thông báo", "notification", null, 4),
                Module.Create("Cài đặt", "setting", null, 5)
            };
            context.Modules.AddRange(modules);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedSubModulesAsync(ApplicationDbContext context)
    {
        if (await context.SubModules.AnyAsync())
        {
            return;
        }

        // Lấy Id của các Module đã seed trước đó
        var moduleIds = await context.Modules
            .Select(m => new { m.Id, m.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var subModules = new List<SubModule>
    {
    // Submodule của "Cài đặt"
        SubModule.Create(moduleIds["setting"], "Quản lý Thông tin", "manage_information", "Quản lý tài khoản, phòng ban, đối tác...", 1),
        SubModule.Create(moduleIds["setting"], "Quản lý Cấu hình", "manage_configuration", "Cấu hình thông báo, nhắc nhở, ngày hết hạn...", 2),
        SubModule.Create(moduleIds["setting"], "Quản lý Phân quyền", "manage_permissions", "Phân quyền theo phòng ban, chức vụ, cá nhân", 3),

        // Submodule của "Thông báo"
        SubModule.Create(moduleIds["notification"], "Thông báo", "manage_notifications", "Xem danh sách và quản lý thông báo hệ thống", 1),

        // Submodule của "Báo cáo"
        SubModule.Create(moduleIds["report"], "Báo cáo", "manage_reports", "Xem báo cáo tổng hợp và xuất file", 1),

        // Submodule của "Tài chính công nợ"
        SubModule.Create(moduleIds["finance"], "Quản lý công nợ", "manage_debts", "Xem tình trạng công nợ các hợp đồng", 1),
        SubModule.Create(moduleIds["finance"], "Quản lý Phiếu thanh toán", "manage_payment_vouchers", "Upload, ghi nhận và duyệt phiếu thanh toán", 2),

        // Submodule của "Quản lý hợp đồng"
        SubModule.Create(moduleIds["contract"], "Quản lý hợp đồng", "manage_contracts", "Tạo, chỉnh sửa, phê duyệt, ký hợp đồng", 1),
    };

        context.SubModules.AddRange(subModules);
        await context.SaveChangesAsync();
    }

    private static async Task SeedContractTypesAsync(ApplicationDbContext context)
    {
        if (!context.ContractTypes.Any())
        {
            var contractTypes = new List<ContractType>
            {
                ContractType.Create("Hợp đồng nguyên tắc", "template", null),
                ContractType.Create("Hợp đồng kinh tế mua", "purchase", null),
                ContractType.Create("Hợp đồng kinh tế bán", "sale", null)
            };
            context.ContractTypes.AddRange(contractTypes);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedNotificationConfigAsync(ApplicationDbContext context)
    {
        if (!context.NotificationConfigs.Any())
        {
            var configs = new List<Domain.Entities.Catalog.NotificationConfig>
            {
                // Hợp đồng sắp hết hạn - cảnh báo trước 7 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.ContractExpiring,
                    daysBefore: 7,
                    isEnabled: true
                ),

                // Quá hạn ký - cảnh báo trước 3 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.SignatureOverdue,
                    daysBefore: 3,
                    isEnabled: true
                ),

                // Sắp đến kỳ thanh toán - cảnh báo trước 7 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.PaymentDue,
                    daysBefore: 7,
                    isEnabled: true
                ),

                // Lịch nghiệm thu - cảnh báo trước 5 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.AcceptanceDue,
                    daysBefore: 5,
                    isEnabled: true
                ),

                // Hợp đồng sắp hết hiệu lực - cảnh báo trước 15 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.ContractExpirationSoon,
                    daysBefore: 15,
                    isEnabled: true
                ),

                // Đến lượt phê duyệt - cảnh báo trước 1 ngày
                Domain.Entities.Catalog.NotificationConfig.Create(
                    NotificationEventType.ApprovalRequired,
                    daysBefore: 1,
                    isEnabled: true
                )
            };
            context.NotificationConfigs.AddRange(configs);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        if (!context.Users.Any())
        {
            var defaultPassword = BCrypt.Net.BCrypt.HashPassword("123456");
            var positionMaps = context.Positions.ToDictionary(p => p.Code, p => p.Id);
            var users = new List<User>
        {

            // Admin hệ thống
            new User(
                userName: "admin",
                email: "admin@company.com",
                fullname: "Quản trị viên",
                positionId: positionMaps["admin"],
                role: UserRole.Admin,
                passwordHash: BCrypt.Net.BCrypt.HashPassword("123456")
                ),

                // Giám đốc
            new User("director", "director@company.com", "Nguyễn Văn Giám Đốc", positionMaps["director"], UserRole.Director, defaultPassword),

                // Phòng Kinh Doanh
            new User("kd_manager", "kd.manager@company.com", "Trần Thị Trưởng KD", positionMaps["manager"], UserRole.BusinessManager, defaultPassword),
            new User("kd_assistant", "kd.assistant@company.com", "Lê Văn Phó KD", positionMaps["assistant_manager"], UserRole.BusinessAssistantManager, defaultPassword),
            new User("kd_staff1", "kd.staff1@company.com", "Phạm Thị Nhân Viên KD", positionMaps["staff"], UserRole.Business, defaultPassword),

                // Phòng Kế Toán
            new User("kt_manager", "kt.manager@company.com", "Nguyễn Văn Trưởng Kế Toán", positionMaps["manager"], UserRole.AccountantManager, defaultPassword),
            new User("kt_assistant", "kt.assistant@company.com", "Nguyễn Văn Phó Kế Toán", positionMaps["assistant_manager"], UserRole.AccountantAssistantManager, defaultPassword),
            new User("kt_staff1", "kt.staff1@company.com", "Hoàng Thị Kế Toán Viên", positionMaps["staff"], UserRole.Accountant, defaultPassword),

                // Phòng Pháp Chế
            new User("pc_manager", "pc.manager@company.com", "Vũ Văn Trưởng Pháp Chế", positionMaps["manager"], UserRole.LegalManager, defaultPassword),
            new User("pc_assistant", "pc.assistant@company.com", "Vũ Văn Phó Pháp Chế", positionMaps["assistant_manager"], UserRole.LegalAssistantManager, defaultPassword),
            new User("pc_staff1", "pc.staff1@company.com", "Đỗ Thị Pháp Chế Viên", positionMaps["staff"], UserRole.Legal, defaultPassword),
        };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedUserSignaturesAsync(ApplicationDbContext context)
    {
        if (!context.UserSignatures.Any())
        {
            var users = await context.Users.ToListAsync();
            var signatures = new List<UserSignature>();

            foreach (var user in users)
            {
                // Mọi user đều có chữ ký thường (normal)
                signatures.Add(UserSignature.Create(
                    userId: user.Id,
                    signatureType: SignatureType.Normal,
                    signatureFile: $"/signatures/normal_{user.UserName}.png"
                ));

                // Một số user có ký số (digital) + lưu PIN (đã hash)
                if (new[] { "director", "kd_manager", "kt_manager", "pc_manager" }.Contains(user.UserName))
                {
                    signatures.Add(UserSignature.Create(
                        userId: user.Id,
                        signatureType: SignatureType.Digital,
                        signatureFile: $"/signatures/digital_{user.UserName}.pfx",
                        certificateId: $"CERT-{user.UserName.ToUpper()}",
                        pinHash: BCrypt.Net.BCrypt.HashPassword("123456", workFactor: 12), // PIN mẫu: 123456
                        isPinSaved: true
                    ));
                }
            }

            context.UserSignatures.AddRange(signatures);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedUserDepartmentsAsync(ApplicationDbContext context)
    {
        if (await context.UserDepartments.AnyAsync())
        {
            return;
        }

        // Lấy danh sách Id của user và department theo username/code
        var userIds = await context.Users
            .Where(u => new[] { "admin", "director", "kd_manager", "kd_assistant", "kd_staff1",
                            "kt_manager", "kt_assistant", "kt_staff1", "pc_manager", "pc_assistant", "pc_staff1" }
                        .Contains(u.UserName))
            .Select(u => new { u.Id, u.UserName })
            .ToDictionaryAsync(x => x.UserName, x => x.Id);

        var departmentIds = await context.Departments
            .Select(d => new { d.Id, d.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var userDepts = new List<UserDepartment>
    {
        // Admin & Giám đốc thuộc HR (primary)
        UserDepartment.Create(userIds["admin"], departmentIds["admin"], true),
        UserDepartment.Create(userIds["director"], departmentIds["director"], true),

        // Kinh Doanh
        UserDepartment.Create(userIds["kd_manager"], departmentIds["business"], true),
        UserDepartment.Create(userIds["kd_assistant"], departmentIds["business"], true),
        UserDepartment.Create(userIds["kd_staff1"], departmentIds["business"], true),

        // Kế Toán
        UserDepartment.Create(userIds["kt_manager"], departmentIds["accountant"], true),
        UserDepartment.Create(userIds["kt_assistant"], departmentIds["accountant"], true),
        UserDepartment.Create(userIds["kt_staff1"], departmentIds["accountant"], true),

        // Pháp Chế
        UserDepartment.Create(userIds["pc_manager"], departmentIds["legal"], true),
        UserDepartment.Create(userIds["pc_assistant"], departmentIds["legal"], true),
        UserDepartment.Create(userIds["pc_staff1"], departmentIds["legal"], true),
    };

        context.UserDepartments.AddRange(userDepts);
        await context.SaveChangesAsync();
    }

    // Phân quyền cấp 1: Phòng ban → Module (ví dụ: phòng nào được truy cập module nào)
    private static async Task SeedDepartmentModulePermissionsAsync(ApplicationDbContext context)
    {
        if (await context.DepartmentModulePermissions.AnyAsync())
        {
            return;
        }

        var deptIds = await context.Departments
            .Select(d => new { d.Id, d.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var moduleIds = await context.Modules
            .Select(m => new { m.Id, m.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var readPermId = await context.Permissions
            .Where(p => p.Code == PermissionCode.Read)
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        var list = new List<DepartmentModulePermission>();

        // Tất cả phòng ban đều đọc được Notification
        list.Add(DepartmentModulePermission.Create(deptIds["business"], moduleIds["notification"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["accountant"], moduleIds["notification"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["legal"], moduleIds["notification"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["director"], moduleIds["notification"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["admin"], moduleIds["notification"], readPermId, true));

        // Phòng Kinh Doanh: Quản lý hợp đồng
        list.Add(DepartmentModulePermission.Create(deptIds["business"], moduleIds["contract"], readPermId, true));

        // Phòng Kế Toán: Tài chính công nợ
        list.Add(DepartmentModulePermission.Create(deptIds["accountant"], moduleIds["finance"], readPermId, true));

        // Phòng Pháp Chế: Quản lý hợp đồng
        list.Add(DepartmentModulePermission.Create(deptIds["legal"], moduleIds["contract"], readPermId, true));

        // Phòng Giám đốc: Tất cả
        list.Add(DepartmentModulePermission.Create(deptIds["director"], moduleIds["contract"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["director"], moduleIds["finance"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["director"], moduleIds["report"], readPermId, true));


        list.Add(DepartmentModulePermission.Create(deptIds["admin"], moduleIds["contract"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["admin"], moduleIds["finance"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["admin"], moduleIds["report"], readPermId, true));
        list.Add(DepartmentModulePermission.Create(deptIds["admin"], moduleIds["setting"], readPermId, true));

        context.DepartmentModulePermissions.AddRange(list);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPositionSubmodulePermissionsAsync(ApplicationDbContext context)
    {
        if (await context.PositionSubmodulePermissions.AnyAsync())
        {
            return;
        }

        var positionIds = await context.Positions
            .Select(p => new { p.Id, p.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var submoduleIds = await context.SubModules
            .Select(sm => new { sm.Id, sm.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var permissionIds = await context.Permissions
            .ToDictionaryAsync(p => p.Code, p => p.Id);

        var list = new List<PositionSubmodulePermission>();

        void Add(string posCode, string subCode, PermissionCode permCode)
        {
            if (positionIds.TryGetValue(posCode, out Guid posId) &&
                submoduleIds.TryGetValue(subCode, out Guid smId) &&
                permissionIds.TryGetValue(permCode, out Guid permId))
            {
                list.Add(PositionSubmodulePermission.Create(posId, smId, permId, true));
            }
        }

        // Giám đốc - quyền cao nhất
        Add("director", "manage_contracts", PermissionCode.Create);
        Add("director", "manage_contracts", PermissionCode.Read);
        Add("director", "manage_contracts", PermissionCode.Update);
        Add("director", "manage_contracts", PermissionCode.Approve);
        Add("director", "manage_payment_vouchers", PermissionCode.Approve);
        Add("director", "manage_payment_vouchers", PermissionCode.Read);
        Add("director", "manage_reports", PermissionCode.Read);
        Add("director", "manage_reports", PermissionCode.Export);

        // Trưởng phòng Kinh Doanh
        Add("manager", "manage_contracts", PermissionCode.Create);
        Add("manager", "manage_contracts", PermissionCode.Read);
        Add("manager", "manage_contracts", PermissionCode.Update);

        // Nhân viên Kinh Doanh
        Add("staff", "manage_contracts", PermissionCode.Create);
        Add("staff", "manage_contracts", PermissionCode.Read);

        // Trưởng phòng Kế Toán
        Add("accountant_manager", "manage_payment_vouchers", PermissionCode.Approve);
        Add("accountant_manager", "manage_payment_vouchers", PermissionCode.Read);
        Add("accountant_manager", "manage_payment_vouchers", PermissionCode.Update);
        Add("accountant_manager", "manage_debts", PermissionCode.Read);

        // Nhân viên Kế Toán
        Add("accountant", "manage_payment_vouchers", PermissionCode.Create);
        Add("accountant", "manage_payment_vouchers", PermissionCode.Read);
        Add("accountant", "manage_debts", PermissionCode.Read);

        // Trưởng phòng Pháp Chế
        Add("legal_manager", "manage_contracts", PermissionCode.Approve);
        Add("legal_manager", "manage_contracts", PermissionCode.Update);
        Add("legal_manager", "manage_contracts", PermissionCode.Read);

        // Nhân viên Pháp Chế
        Add("legal", "manage_contracts", PermissionCode.Read);

        // Nhân sự / Admin - Quản lý phân quyền
        Add("admin", "manage_permissions", PermissionCode.Create);
        Add("admin", "manage_permissions", PermissionCode.Read);
        Add("admin", "manage_permissions", PermissionCode.Update);

        Add("admin", "manage_configuration", PermissionCode.Create);
        Add("admin", "manage_configuration", PermissionCode.Read);
        Add("admin", "manage_configuration", PermissionCode.Update);

        Add("admin", "manage_information", PermissionCode.Create);
        Add("admin", "manage_information", PermissionCode.Read);
        Add("admin", "manage_information", PermissionCode.Update);
        Add("admin", "manage_information", PermissionCode.Delete);

        Add("admin", "manage_notifications", PermissionCode.Create);
        Add("admin", "manage_notifications", PermissionCode.Read);
        Add("admin", "manage_notifications", PermissionCode.Update);
        Add("admin", "manage_notifications", PermissionCode.Delete);

        Add("admin", "manage_contracts", PermissionCode.Create);
        Add("admin", "manage_contracts", PermissionCode.Read);
        Add("admin", "manage_contracts", PermissionCode.Update);
        Add("admin", "manage_contracts", PermissionCode.Approve);

        Add("admin", "manage_payment_vouchers", PermissionCode.Approve);
        Add("admin", "manage_payment_vouchers", PermissionCode.Update);
        Add("admin", "manage_payment_vouchers", PermissionCode.Read);

        Add("admin", "manage_debts", PermissionCode.Read);

        Add("admin", "manage_reports", PermissionCode.Read);
        Add("admin", "manage_reports", PermissionCode.Export);

        context.PositionSubmodulePermissions.AddRange(list);
        await context.SaveChangesAsync();
    }
    private static DepartmentModulePermission Create(Guid deptId, Guid moduleId, Guid permId)
    => DepartmentModulePermission.Create(deptId, moduleId, permId, isGranted: true);

    private static async Task SeedUserPermissionOverridesAsync(ApplicationDbContext context)
    {
        if (await context.UserPermissionOverrides.AnyAsync())
        {
            return;
        }

        var userIds = await context.Users
            .Where(u => new[] { "kt_manager", "kd_staff1" }.Contains(u.UserName))
            .Select(u => new { u.Id, u.UserName })
            .ToDictionaryAsync(x => x.UserName, x => x.Id);

        var submoduleIds = await context.SubModules
            .Where(sm => new[] { "manage_payment_vouchers", "manage_contracts" }.Contains(sm.Code))
            .Select(sm => new { sm.Id, sm.Code })
            .ToDictionaryAsync(x => x.Code, x => x.Id);

        var createPermId = await context.Permissions
            .Where(p => p.Code == PermissionCode.Create)
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        var readPermId = await context.Permissions
            .Where(p => p.Code == PermissionCode.Read)
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        var overrides = new List<UserPermissionOverride>
        {
            UserPermissionOverride.Create(
                userIds["kt_manager"],
                submoduleIds["manage_payment_vouchers"],
                createPermId,
                false,
                "Trưởng phòng chỉ duyệt, không tạo phiếu"
            ),
            UserPermissionOverride.Create(
                userIds["kd_staff1"],
                submoduleIds["manage_contracts"],
                readPermId,
                false,
                "Tạm khóa quyền xem hợp đồng"
            ),
        };

        context.UserPermissionOverrides.AddRange(overrides);
        await context.SaveChangesAsync();
    }
}