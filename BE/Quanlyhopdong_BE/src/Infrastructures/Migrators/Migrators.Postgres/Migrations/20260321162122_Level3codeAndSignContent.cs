using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class Level3codeAndSignContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contracts_Level3Code",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level3Code",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Contracts");

            migrationBuilder.AlterColumn<Guid>(
                name: "Level1CodeId",
                table: "Contracts",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "Level3CodeId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SignedContentId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Level3Codes",
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
                    table.PrimaryKey("PK_Level3Codes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Level3Codes_Level1Codes_Level1CodeId",
                        column: x => x.Level1CodeId,
                        principalTable: "Level1Codes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SignedContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Level3CodeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignedContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SignedContents_Level3Codes_Level3CodeId",
                        column: x => x.Level3CodeId,
                        principalTable: "Level3Codes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_Level3CodeId",
                table: "Contracts",
                column: "Level3CodeId",
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_SignedContentId",
                table: "Contracts",
                column: "SignedContentId",
                filter: "\"DeletedOn\" IS NULL AND \"SignedContentId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Level3Codes_Code",
                table: "Level3Codes",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Level3Codes_Level1CodeId",
                table: "Level3Codes",
                column: "Level1CodeId");

            migrationBuilder.CreateIndex(
                name: "IX_SignedContents_Level3CodeId",
                table: "SignedContents",
                column: "Level3CodeId",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Level3Codes_Level3CodeId",
                table: "Contracts",
                column: "Level3CodeId",
                principalTable: "Level3Codes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_SignedContents_SignedContentId",
                table: "Contracts",
                column: "SignedContentId",
                principalTable: "SignedContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Level3Codes_Level3CodeId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_SignedContents_SignedContentId",
                table: "Contracts");

            migrationBuilder.DropTable(
                name: "SignedContents");

            migrationBuilder.DropTable(
                name: "Level3Codes");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_Level3CodeId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_SignedContentId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "Level3CodeId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "SignedContentId",
                table: "Contracts");

            migrationBuilder.AlterColumn<Guid>(
                name: "Level1CodeId",
                table: "Contracts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level3Code",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_Level3Code",
                table: "Contracts",
                column: "Level3Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }
    }
}
