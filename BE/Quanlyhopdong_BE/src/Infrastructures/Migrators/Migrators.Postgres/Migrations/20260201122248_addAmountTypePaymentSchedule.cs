using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations;

/// <inheritdoc />
public partial class addAmountTypePaymentSchedule : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "AmountType",
            table: "PaymentSchedules",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<bool>(
            name: "IsOtherMaterial",
            table: "Materials",
            type: "boolean",
            nullable: false,
            defaultValue: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "AmountType",
            table: "PaymentSchedules");

        migrationBuilder.DropColumn(
            name: "IsOtherMaterial",
            table: "Materials");
    }
}
