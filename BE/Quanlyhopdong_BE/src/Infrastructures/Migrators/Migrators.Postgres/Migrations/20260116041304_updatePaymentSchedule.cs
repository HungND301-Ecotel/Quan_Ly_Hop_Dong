using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updatePaymentSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentSchedules_FromDate",
                table: "PaymentSchedules");

            migrationBuilder.DropIndex(
                name: "IX_PaymentSchedules_ToDate",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "PeriodType",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "PeriodValue",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "DraftDate",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "SignDeadline",
                table: "Contracts");

            migrationBuilder.RenameColumn(
                name: "Ammount",
                table: "PaymentSchedules",
                newName: "Amount");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DueDate",
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

            migrationBuilder.AddColumn<int>(
                name: "ScheduleType",
                table: "PaymentSchedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "StartDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "EndDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
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
                name: "ScheduleType",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "PaymentSchedules");

            migrationBuilder.DropColumn(
                name: "YearlyPaymentSchedule_Year",
                table: "PaymentSchedules");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "PaymentSchedules",
                newName: "Ammount");

            migrationBuilder.AddColumn<string>(
                name: "PeriodType",
                table: "PaymentSchedules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PeriodValue",
                table: "PaymentSchedules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "StartDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "EndDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DraftDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SignDeadline",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_FromDate",
                table: "PaymentSchedules",
                column: "FromDate");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentSchedules_ToDate",
                table: "PaymentSchedules",
                column: "ToDate");
        }
    }
}
