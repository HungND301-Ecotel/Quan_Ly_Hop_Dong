using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class Level1CodeContractType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Level1Code",
                table: "Contracts");

            migrationBuilder.AddColumn<Guid?>(
                name: "Level1CodeId",
                table: "Contracts",
                type: "uuid",
                nullable: true,
                defaultValue: null);

            migrationBuilder.CreateTable(
                name: "Level1Codes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ContractTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Level1Codes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Level1Codes_ContractTypes_ContractTypeId",
                        column: x => x.ContractTypeId,
                        principalTable: "ContractTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_Level1CodeId",
                table: "Contracts",
                column: "Level1CodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Level1Codes_Code",
                table: "Level1Codes",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Level1Codes_ContractTypeId",
                table: "Level1Codes",
                column: "ContractTypeId",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Level1Codes_Level1CodeId",
                table: "Contracts",
                column: "Level1CodeId",
                principalTable: "Level1Codes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Level1Codes_Level1CodeId",
                table: "Contracts");

            migrationBuilder.DropTable(
                name: "Level1Codes");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_Level1CodeId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level1CodeId",
                table: "Contracts");

            migrationBuilder.AddColumn<string>(
                name: "Level1Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
