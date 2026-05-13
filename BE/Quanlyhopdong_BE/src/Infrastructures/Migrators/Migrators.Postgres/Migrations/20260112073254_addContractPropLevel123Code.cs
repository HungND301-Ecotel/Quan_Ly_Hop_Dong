using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class addContractPropLevel123Code : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Contracts");

            migrationBuilder.AddColumn<string>(
                name: "ContractContent",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level1Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level2Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level3Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractContent",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level1Code",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level2Code",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level3Code",
                table: "Contracts");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Contracts",
                type: "text",
                nullable: true);
        }
    }
}
