using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddLevel2CodeAndUpdateLevelCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AddColumn<Guid>(
                name: "Level2CodeId",
                table: "Level3Codes",
                type: "uuid",
                nullable: true);


            migrationBuilder.CreateTable(
                name: "Level2Code",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Level1CodeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Level2Code", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Level2Code_Level1Codes_Level1CodeId",
                        column: x => x.Level1CodeId,
                        principalTable: "Level1Codes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Level3Codes_Level2CodeId",
                table: "Level3Codes",
                column: "Level2CodeId");



            migrationBuilder.CreateIndex(
                name: "IX_Level2Code_Level1CodeId",
                table: "Level2Code",
                column: "Level1CodeId");



            migrationBuilder.AddForeignKey(
                name: "FK_Level3Codes_Level2Code_Level2CodeId",
                table: "Level3Codes",
                column: "Level2CodeId",
                principalTable: "Level2Code",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Level2Code_Level2CodeId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Level3Codes_Level2Code_Level2CodeId",
                table: "Level3Codes");

            migrationBuilder.DropTable(
                name: "Level2Code");

            migrationBuilder.DropIndex(
                name: "IX_Level3Codes_Level2CodeId",
                table: "Level3Codes");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_Level2CodeId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level2CodeId",
                table: "Level3Codes");

            migrationBuilder.DropColumn(
                name: "Level2CodeId",
                table: "Contracts");

            migrationBuilder.AddColumn<string>(
                name: "Level2Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
