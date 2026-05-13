using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentScheduleIdToProgressAndPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PaymentScheduleId",
                table: "ContractProgresses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentScheduleId",
                table: "ContractPayments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgresses_PaymentScheduleId",
                table: "ContractProgresses",
                column: "PaymentScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_PaymentScheduleId",
                table: "ContractPayments",
                column: "PaymentScheduleId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractPayments_PaymentSchedules_PaymentScheduleId",
                table: "ContractPayments",
                column: "PaymentScheduleId",
                principalTable: "PaymentSchedules",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractProgresses_PaymentSchedules_PaymentScheduleId",
                table: "ContractProgresses",
                column: "PaymentScheduleId",
                principalTable: "PaymentSchedules",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractPayments_PaymentSchedules_PaymentScheduleId",
                table: "ContractPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_ContractProgresses_PaymentSchedules_PaymentScheduleId",
                table: "ContractProgresses");

            migrationBuilder.DropIndex(
                name: "IX_ContractProgresses_PaymentScheduleId",
                table: "ContractProgresses");

            migrationBuilder.DropIndex(
                name: "IX_ContractPayments_PaymentScheduleId",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "PaymentScheduleId",
                table: "ContractProgresses");

            migrationBuilder.DropColumn(
                name: "PaymentScheduleId",
                table: "ContractPayments");
        }
    }
}
