using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContractAppendixAndContractNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContractAppendixId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContractNumberId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContractNumber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<string>(type: "text", nullable: false),
                    SignNumber = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractNumber", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContractAppendix",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppendixNumber = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ContractNumberId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractAppendix", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractAppendix_ContractNumber_ContractNumberId",
                        column: x => x.ContractNumberId,
                        principalTable: "ContractNumber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractAppendixId",
                table: "Contracts",
                column: "ContractAppendixId");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractNumberId",
                table: "Contracts",
                column: "ContractNumberId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractAppendix_ContractNumberId",
                table: "ContractAppendix",
                column: "ContractNumberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_ContractAppendix_ContractAppendixId",
                table: "Contracts",
                column: "ContractAppendixId",
                principalTable: "ContractAppendix",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_ContractNumber_ContractNumberId",
                table: "Contracts",
                column: "ContractNumberId",
                principalTable: "ContractNumber",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_ContractAppendix_ContractAppendixId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_ContractNumber_ContractNumberId",
                table: "Contracts");

            migrationBuilder.DropTable(
                name: "ContractAppendix");

            migrationBuilder.DropTable(
                name: "ContractNumber");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractAppendixId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractNumberId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ContractAppendixId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ContractNumberId",
                table: "Contracts");
        }
    }
}
