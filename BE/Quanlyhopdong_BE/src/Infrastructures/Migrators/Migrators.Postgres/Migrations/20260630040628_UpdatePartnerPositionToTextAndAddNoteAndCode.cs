using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePartnerPositionToTextAndAddNoteAndCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Partners_Positions_PositionId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_PositionId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "Partners");

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Partners",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PartnerContractCode",
                table: "Partners",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Partners",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Note",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "PartnerContractCode",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Partners");

            migrationBuilder.AddColumn<Guid>(
                name: "PositionId",
                table: "Partners",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Partners_PositionId",
                table: "Partners",
                column: "PositionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_Positions_PositionId",
                table: "Partners",
                column: "PositionId",
                principalTable: "Positions",
                principalColumn: "Id");
        }
    }
}
