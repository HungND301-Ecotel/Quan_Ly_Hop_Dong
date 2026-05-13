using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateContractPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LiquidationFilePath",
                table: "Contracts",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContractPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    PeriodNumber = table.Column<int>(type: "integer", nullable: false),
                    AcceptanceReportFilePath = table.Column<string>(type: "text", nullable: true),
                    InvoiceFilePath = table.Column<string>(type: "text", nullable: true),
                    TaxFilePath = table.Column<string>(type: "text", nullable: true),
                    PaymentDateFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PaymentDateTo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractPayments_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_ContractId",
                table: "ContractPayments",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_ContractId_PeriodNumber",
                table: "ContractPayments",
                columns: new[] { "ContractId", "PeriodNumber" },
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ContractPayments_PaymentDateFrom_PaymentDateTo",
                table: "ContractPayments",
                columns: new[] { "PaymentDateFrom", "PaymentDateTo" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "LiquidationFilePath",
                table: "Contracts");
        }
    }
}
