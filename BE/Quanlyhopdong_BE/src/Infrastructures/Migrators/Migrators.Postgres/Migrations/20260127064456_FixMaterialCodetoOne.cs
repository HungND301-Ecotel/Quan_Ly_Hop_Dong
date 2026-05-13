using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class FixMaterialCodetoOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Level1Code",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "Level2Code",
                table: "Materials");

            migrationBuilder.RenameColumn(
                name: "Level3Code",
                table: "Materials",
                newName: "MaterialCode");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_Level3Code",
                table: "Materials",
                newName: "IX_Materials_MaterialCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaterialCode",
                table: "Materials",
                newName: "Level3Code");

            migrationBuilder.RenameIndex(
                name: "IX_Materials_MaterialCode",
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
        }
    }
}
