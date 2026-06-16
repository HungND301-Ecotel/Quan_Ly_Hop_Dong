using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddYearAndMotaforContractRegister : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractRegisterId",
                table: "Level1Codes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Level1Codes_ContractRegisterId",
                table: "Level1Codes",
                column: "ContractRegisterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Level1Codes_ContractRegisters_ContractRegisterId",
                table: "Level1Codes",
                column: "ContractRegisterId",
                principalTable: "ContractRegisters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Level1Codes_ContractRegisters_ContractRegisterId",
                table: "Level1Codes");

            migrationBuilder.DropIndex(
                name: "IX_Level1Codes_ContractRegisterId",
                table: "Level1Codes");

            migrationBuilder.DropColumn(
                name: "ContractRegisterId",
                table: "Level1Codes");
        }
    }
}
