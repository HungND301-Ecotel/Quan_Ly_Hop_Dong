using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateIsUniqueFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissionOverrides_UserId_SubModuleId_PermissionId",
                table: "UserPermissionOverrides");

            migrationBuilder.DropIndex(
                name: "IX_UserDepartments_UserId_DepartmentId",
                table: "UserDepartments");

            migrationBuilder.DropIndex(
                name: "IX_SubModules_ModuleId_Code",
                table: "SubModules");

            migrationBuilder.DropIndex(
                name: "IX_PositionSubmodulePermissions_PositionId_SubModuleId_Permiss~",
                table: "PositionSubmodulePermissions");

            migrationBuilder.DropIndex(
                name: "IX_Positions_Code",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_Permissions_Code",
                table: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs");

            migrationBuilder.DropIndex(
                name: "IX_Modules_Code",
                table: "Modules");

            migrationBuilder.DropIndex(
                name: "IX_Departments_Code",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_DepartmentModulePermissions_DepartmentId_ModuleId_Permissio~",
                table: "DepartmentModulePermissions");

            migrationBuilder.DropIndex(
                name: "IX_ContractTypes_Code",
                table: "ContractTypes");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractNumber",
                table: "Contracts");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "Identity",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionOverrides_UserId_SubModuleId_PermissionId",
                table: "UserPermissionOverrides",
                columns: new[] { "UserId", "SubModuleId", "PermissionId" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserDepartments_UserId_DepartmentId",
                table: "UserDepartments",
                columns: new[] { "UserId", "DepartmentId" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SubModules_ModuleId_Code",
                table: "SubModules",
                columns: new[] { "ModuleId", "Code" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PositionSubmodulePermissions_PositionId_SubModuleId_Permiss~",
                table: "PositionSubmodulePermissions",
                columns: new[] { "PositionId", "SubModuleId", "PermissionId" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_Code",
                table: "Positions",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                table: "Permissions",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments",
                column: "PaymentNumber",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs",
                columns: new[] { "DepartmentId", "ConfigType" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_Code",
                table: "Modules",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentModulePermissions_DepartmentId_ModuleId_Permissio~",
                table: "DepartmentModulePermissions",
                columns: new[] { "DepartmentId", "ModuleId", "PermissionId" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTypes_Code",
                table: "ContractTypes",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractNumber",
                table: "Contracts",
                column: "ContractNumber",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissionOverrides_UserId_SubModuleId_PermissionId",
                table: "UserPermissionOverrides");

            migrationBuilder.DropIndex(
                name: "IX_UserDepartments_UserId_DepartmentId",
                table: "UserDepartments");

            migrationBuilder.DropIndex(
                name: "IX_SubModules_ModuleId_Code",
                table: "SubModules");

            migrationBuilder.DropIndex(
                name: "IX_PositionSubmodulePermissions_PositionId_SubModuleId_Permiss~",
                table: "PositionSubmodulePermissions");

            migrationBuilder.DropIndex(
                name: "IX_Positions_Code",
                table: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_Permissions_Code",
                table: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs");

            migrationBuilder.DropIndex(
                name: "IX_Modules_Code",
                table: "Modules");

            migrationBuilder.DropIndex(
                name: "IX_Departments_Code",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_DepartmentModulePermissions_DepartmentId_ModuleId_Permissio~",
                table: "DepartmentModulePermissions");

            migrationBuilder.DropIndex(
                name: "IX_ContractTypes_Code",
                table: "ContractTypes");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractNumber",
                table: "Contracts");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "Identity",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionOverrides_UserId_SubModuleId_PermissionId",
                table: "UserPermissionOverrides",
                columns: new[] { "UserId", "SubModuleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDepartments_UserId_DepartmentId",
                table: "UserDepartments",
                columns: new[] { "UserId", "DepartmentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubModules_ModuleId_Code",
                table: "SubModules",
                columns: new[] { "ModuleId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionSubmodulePermissions_PositionId_SubModuleId_Permiss~",
                table: "PositionSubmodulePermissions",
                columns: new[] { "PositionId", "SubModuleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_Code",
                table: "Positions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments",
                column: "PaymentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs",
                columns: new[] { "DepartmentId", "ConfigType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Modules_Code",
                table: "Modules",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentModulePermissions_DepartmentId_ModuleId_Permissio~",
                table: "DepartmentModulePermissions",
                columns: new[] { "DepartmentId", "ModuleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractTypes_Code",
                table: "ContractTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractNumber",
                table: "Contracts",
                column: "ContractNumber",
                unique: true);
        }
    }
}
