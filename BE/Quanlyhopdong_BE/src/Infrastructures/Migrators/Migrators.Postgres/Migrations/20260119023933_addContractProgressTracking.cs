using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class addContractProgressTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContractProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    PeriodStart = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PeriodEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    EstimatedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    EstimatedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractProgresses_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractProgressItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractProgressId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExecutedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ExecutedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractProgressItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractProgressItems_ContractItems_ContractItemId",
                        column: x => x.ContractItemId,
                        principalTable: "ContractItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContractProgressItems_ContractProgresses_ContractProgressId",
                        column: x => x.ContractProgressId,
                        principalTable: "ContractProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgresses_ContractId",
                table: "ContractProgresses",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgresses_ContractId_PeriodStart_PeriodEnd",
                table: "ContractProgresses",
                columns: new[] { "ContractId", "PeriodStart", "PeriodEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgresses_Status",
                table: "ContractProgresses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgressItems_ContractItemId",
                table: "ContractProgressItems",
                column: "ContractItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgressItems_ContractProgressId",
                table: "ContractProgressItems",
                column: "ContractProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractProgressItems_ContractProgressId_ContractItemId",
                table: "ContractProgressItems",
                columns: new[] { "ContractProgressId", "ContractItemId" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractProgressItems");

            migrationBuilder.DropTable(
                name: "ContractProgresses");
        }
    }
}
