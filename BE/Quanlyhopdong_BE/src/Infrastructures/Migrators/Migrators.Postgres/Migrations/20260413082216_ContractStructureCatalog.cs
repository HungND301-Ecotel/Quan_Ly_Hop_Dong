using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class ContractStructureCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractStructure",
                table: "Contracts");

            migrationBuilder.AddColumn<Guid>(
                name: "ContractStructureId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContractStructureCatalogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractStructureCatalogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractStructureId",
                table: "Contracts",
                column: "ContractStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractStructureCatalogs_Name",
                table: "ContractStructureCatalogs",
                column: "Name",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_ContractStructureCatalogs_ContractStructureId",
                table: "Contracts",
                column: "ContractStructureId",
                principalTable: "ContractStructureCatalogs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_ContractStructureCatalogs_ContractStructureId",
                table: "Contracts");

            migrationBuilder.DropTable(
                name: "ContractStructureCatalogs");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractStructureId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ContractStructureId",
                table: "Contracts");

            migrationBuilder.AddColumn<string>(
                name: "ContractStructure",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
