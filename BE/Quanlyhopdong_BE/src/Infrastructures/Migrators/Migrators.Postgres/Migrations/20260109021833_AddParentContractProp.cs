using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddParentContractProp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentContractId",
                table: "Contracts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ParentContractId",
                table: "Contracts",
                column: "ParentContractId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Contracts_ParentContractId",
                table: "Contracts",
                column: "ParentContractId",
                principalTable: "Contracts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Contracts_ParentContractId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ParentContractId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ParentContractId",
                table: "Contracts");
        }
    }
}
