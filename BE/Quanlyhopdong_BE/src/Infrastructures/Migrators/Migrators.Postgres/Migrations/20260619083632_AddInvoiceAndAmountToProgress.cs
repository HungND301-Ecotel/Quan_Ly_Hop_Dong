using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceAndAmountToProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractPaymentId",
                table: "ContractProgresses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExecutedAmount",
                table: "ContractProgresses",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgresses_ContractPaymentId",
                table: "ContractProgresses",
                column: "ContractPaymentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractProgresses_ContractPayments_ContractPaymentId",
                table: "ContractProgresses",
                column: "ContractPaymentId",
                principalTable: "ContractPayments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractProgresses_ContractPayments_ContractPaymentId",
                table: "ContractProgresses");

            migrationBuilder.DropIndex(
                name: "IX_ContractProgresses_ContractPaymentId",
                table: "ContractProgresses");

            migrationBuilder.DropColumn(
                name: "ContractPaymentId",
                table: "ContractProgresses");

            migrationBuilder.DropColumn(
                name: "ExecutedAmount",
                table: "ContractProgresses");
        }
    }
}
