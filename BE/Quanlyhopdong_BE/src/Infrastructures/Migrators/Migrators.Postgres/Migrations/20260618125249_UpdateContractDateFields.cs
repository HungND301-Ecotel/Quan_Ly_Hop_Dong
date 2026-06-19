using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContractDateFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Contracts",
                newName: "SigningDate");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Contracts",
                newName: "EffectiveDate");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CompletionDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "WarrantyExpirationDate",
                table: "Contracts",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletionDate",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "WarrantyExpirationDate",
                table: "Contracts");

            migrationBuilder.RenameColumn(
                name: "SigningDate",
                table: "Contracts",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "EffectiveDate",
                table: "Contracts",
                newName: "EndDate");
        }
    }
}
