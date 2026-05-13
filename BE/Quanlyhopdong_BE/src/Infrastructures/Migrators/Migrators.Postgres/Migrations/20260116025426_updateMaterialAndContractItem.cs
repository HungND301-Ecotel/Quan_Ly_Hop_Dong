using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateMaterialAndContractItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Code",
                table: "Materials",
                newName: "Level3Code");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_Code",
                table: "Materials",
                newName: "IX_Materials_Level3Code");

            migrationBuilder.AddColumn<string>(
                name: "Level1Code",
                table: "Materials",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Level2Code",
                table: "Materials",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Materials",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_Level3Code",
                table: "Contracts",
                column: "Level3Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contracts_Level3Code",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level1Code",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "Level2Code",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Materials");

            migrationBuilder.RenameColumn(
                name: "Level3Code",
                table: "Materials",
                newName: "Code");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_Level3Code",
                table: "Materials",
                newName: "IX_Materials_Code");
        }
    }
}
