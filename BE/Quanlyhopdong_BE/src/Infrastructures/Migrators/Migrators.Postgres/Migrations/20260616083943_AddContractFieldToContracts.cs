using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddContractFieldToContracts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractFieldId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractFieldId",
                table: "Contracts",
                column: "ContractFieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_ContractFields_ContractFieldId",
                table: "Contracts",
                column: "ContractFieldId",
                principalTable: "ContractFields",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_ContractFields_ContractFieldId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractFieldId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ContractFieldId",
                table: "Contracts");
        }
    }
}
