using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class removeContractContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractContent",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "ContractGuarantees");

            migrationBuilder.RenameColumn(
                name: "Percentage",
                table: "ContractGuarantees",
                newName: "Value");

            migrationBuilder.AddColumn<int>(
                name: "ValueType",
                table: "ContractGuarantees",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValueType",
                table: "ContractGuarantees");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "ContractGuarantees",
                newName: "Percentage");

            migrationBuilder.AddColumn<string>(
                name: "ContractContent",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "ContractGuarantees",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
