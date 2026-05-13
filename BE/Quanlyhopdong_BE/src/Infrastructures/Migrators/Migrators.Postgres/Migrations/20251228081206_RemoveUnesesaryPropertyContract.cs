using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnesesaryPropertyContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SigningDate",
                table: "Contracts",
                newName: "DraftDate");

            migrationBuilder.Sql("""
                ALTER TABLE "ContractApprovalHistories"
                ALTER COLUMN "Action" TYPE integer
                USING "Action"::integer;
            """);

            migrationBuilder.AlterColumn<int>(
                name: "Action",
                table: "ContractApprovalHistories",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DraftDate",
                table: "Contracts",
                newName: "SigningDate");

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "ContractApprovalHistories",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
