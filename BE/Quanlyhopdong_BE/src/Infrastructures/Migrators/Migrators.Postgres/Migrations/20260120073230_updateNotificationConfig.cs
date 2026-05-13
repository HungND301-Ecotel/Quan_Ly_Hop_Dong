using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateNotificationConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NotificationConfigs_Departments_DepartmentId",
                table: "NotificationConfigs");

            migrationBuilder.DropIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "NotificationConfigs");

            migrationBuilder.DropColumn(
                name: "NotificationChannels",
                table: "NotificationConfigs");

            migrationBuilder.DropColumn(
                name: "Recipients",
                table: "NotificationConfigs");

            migrationBuilder.RenameColumn(
                name: "ConfigType",
                table: "NotificationConfigs",
                newName: "EventType");

            migrationBuilder.AlterColumn<int>(
                name: "DaysBefore",
                table: "NotificationConfigs",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationConfigs_EventType",
                table: "NotificationConfigs",
                column: "EventType",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NotificationConfigs_EventType",
                table: "NotificationConfigs");

            migrationBuilder.RenameColumn(
                name: "EventType",
                table: "NotificationConfigs",
                newName: "ConfigType");

            migrationBuilder.AlterColumn<int>(
                name: "DaysBefore",
                table: "NotificationConfigs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "NotificationConfigs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotificationChannels",
                table: "NotificationConfigs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Recipients",
                table: "NotificationConfigs",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationConfigs_DepartmentId_ConfigType",
                table: "NotificationConfigs",
                columns: new[] { "DepartmentId", "ConfigType" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationConfigs_Departments_DepartmentId",
                table: "NotificationConfigs",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");
        }
    }
}
