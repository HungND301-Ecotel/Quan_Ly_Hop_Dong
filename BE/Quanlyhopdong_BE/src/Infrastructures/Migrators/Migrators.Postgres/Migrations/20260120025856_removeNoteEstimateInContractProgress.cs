using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class removeNoteEstimateInContractProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedAmount",
                table: "ContractProgresses");

            migrationBuilder.DropColumn(
                name: "EstimatedQuantity",
                table: "ContractProgresses");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "ContractProgresses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedAmount",
                table: "ContractProgresses",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedQuantity",
                table: "ContractProgresses",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "ContractProgresses",
                type: "text",
                nullable: true);
        }
    }
}
