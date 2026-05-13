using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateContractIsTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentPlanType",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "DurationUnit",
                table: "ContractGuarantees");

            migrationBuilder.DropColumn(
                name: "DurationValue",
                table: "ContractGuarantees");

            migrationBuilder.AddColumn<bool>(
                name: "IsDebtTrackingEnabled",
                table: "Contracts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DurationDate",
                table: "ContractGuarantees",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDebtTrackingEnabled",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "DurationDate",
                table: "ContractGuarantees");

            migrationBuilder.AddColumn<string>(
                name: "PaymentPlanType",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DurationUnit",
                table: "ContractGuarantees",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationValue",
                table: "ContractGuarantees",
                type: "integer",
                nullable: true);
        }
    }
}
