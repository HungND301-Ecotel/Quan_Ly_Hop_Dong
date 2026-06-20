using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class RefactorPaymentScheduleToSimpleDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "FromDate",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "Month",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "Quarter",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "QuarterlyPaymentSchedule_Year",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "ToDate",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "YearlyPaymentSchedule_Year",
                table: "PaymentSchedules");

            migrationBuilder.RenameColumn(
                name: "ScheduleType",
                table: "PaymentSchedules",
                newName: "Days");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Days",
                table: "PaymentSchedules",
                newName: "ScheduleType");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DueDate",
                table: "PaymentSchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "FromDate",
                table: "PaymentSchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Month",
                table: "PaymentSchedules",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quarter",
                table: "PaymentSchedules",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuarterlyPaymentSchedule_Year",
                table: "PaymentSchedules",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ToDate",
                table: "PaymentSchedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "PaymentSchedules",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearlyPaymentSchedule_Year",
                table: "PaymentSchedules",
                type: "integer",
                nullable: true);
        }
    }
}
