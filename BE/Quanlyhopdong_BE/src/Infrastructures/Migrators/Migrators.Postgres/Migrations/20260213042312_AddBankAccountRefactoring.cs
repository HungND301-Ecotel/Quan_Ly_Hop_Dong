using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddBankAccountRefactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankAccount",
                table: "ContractGuarantees");

            migrationBuilder.DropColumn(
                name: "BankAccountHolder",
                table: "ContractGuarantees");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "ContractGuarantees");

            migrationBuilder.AddColumn<Guid>(
                name: "BankAccountId",
                table: "ContractGuarantees",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: false),
                    AccountNumber = table.Column<string>(type: "text", nullable: false),
                    AccountHolder = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractGuarantees_BankAccountId",
                table: "ContractGuarantees",
                column: "BankAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractGuarantees_BankAccounts_BankAccountId",
                table: "ContractGuarantees",
                column: "BankAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractGuarantees_BankAccounts_BankAccountId",
                table: "ContractGuarantees");

            migrationBuilder.DropTable(
                name: "BankAccounts");

            migrationBuilder.DropIndex(
                name: "IX_ContractGuarantees_BankAccountId",
                table: "ContractGuarantees");

            migrationBuilder.DropColumn(
                name: "BankAccountId",
                table: "ContractGuarantees");

            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                table: "ContractGuarantees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankAccountHolder",
                table: "ContractGuarantees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "ContractGuarantees",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
