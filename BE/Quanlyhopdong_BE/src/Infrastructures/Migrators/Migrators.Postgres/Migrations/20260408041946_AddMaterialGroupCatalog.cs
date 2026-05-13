using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddMaterialGroupCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MaterialGroupId",
                table: "Materials",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MaterialGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialGroups", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Materials_MaterialGroupId",
                table: "Materials",
                column: "MaterialGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_MaterialGroups_GroupCode",
                table: "MaterialGroups",
                column: "GroupCode",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Materials_MaterialGroups_MaterialGroupId",
                table: "Materials",
                column: "MaterialGroupId",
                principalTable: "MaterialGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Materials_MaterialGroups_MaterialGroupId",
                table: "Materials");

            migrationBuilder.DropTable(
                name: "MaterialGroups");

            migrationBuilder.DropIndex(
                name: "IX_Materials_MaterialGroupId",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "MaterialGroupId",
                table: "Materials");
        }
    }
}
