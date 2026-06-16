using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePartner16062026 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BankId",
                table: "Partners",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fax",
                table: "Partners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PositionId",
                table: "Partners",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Partners_BankId",
                table: "Partners",
                column: "BankId");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_PositionId",
                table: "Partners",
                column: "PositionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_BankAccounts_BankId",
                table: "Partners",
                column: "BankId",
                principalTable: "BankAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_Positions_PositionId",
                table: "Partners",
                column: "PositionId",
                principalTable: "Positions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Partners_BankAccounts_BankId",
                table: "Partners");

            migrationBuilder.DropForeignKey(
                name: "FK_Partners_Positions_PositionId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_BankId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_PositionId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "BankId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "Fax",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "Partners");
        }
    }
}
