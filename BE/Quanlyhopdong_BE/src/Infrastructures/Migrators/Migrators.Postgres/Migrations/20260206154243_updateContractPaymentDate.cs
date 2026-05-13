using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateContractPaymentDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContractPayments_PaymentDateFrom_PaymentDateTo",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "PaymentDateFrom",
                table: "ContractPayments");

            migrationBuilder.RenameColumn(
                name: "PaymentDateTo",
                table: "ContractPayments",
                newName: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_PaymentDate",
                table: "ContractPayments",
                column: "PaymentDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContractPayments_PaymentDate",
                table: "ContractPayments");

            migrationBuilder.RenameColumn(
                name: "PaymentDate",
                table: "ContractPayments",
                newName: "PaymentDateTo");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PaymentDateFrom",
                table: "ContractPayments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_PaymentDateFrom_PaymentDateTo",
                table: "ContractPayments",
                columns: new[] { "PaymentDateFrom", "PaymentDateTo" });
        }
    }
}
