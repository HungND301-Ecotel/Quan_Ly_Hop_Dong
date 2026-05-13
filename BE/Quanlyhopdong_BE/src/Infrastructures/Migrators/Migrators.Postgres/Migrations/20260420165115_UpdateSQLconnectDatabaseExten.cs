using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSQLconnectDatabaseExten : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExternalSyncConnections_Code",
                table: "ExternalSyncConnections");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "ExternalSyncConnections");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ExternalSyncConnections");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "ExternalSyncConnections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ExternalSyncConnections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalSyncConnections_Code",
                table: "ExternalSyncConnections",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }
    }
}
