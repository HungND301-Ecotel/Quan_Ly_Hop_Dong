using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddYearAndDescriptionToContractRegister : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ContractRegisters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "ContractRegisters",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "ContractRegisters");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "ContractRegisters");
        }
    }
}
