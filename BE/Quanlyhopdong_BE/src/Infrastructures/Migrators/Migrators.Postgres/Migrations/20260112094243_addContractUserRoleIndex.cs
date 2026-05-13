using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class addContractUserRoleIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContractUserRoles_ContractId",
                table: "ContractUserRoles");

            migrationBuilder.CreateIndex(
                name: "IX_ContractUserRoles_ContractId_UserId",
                table: "ContractUserRoles",
                columns: new[] { "ContractId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContractUserRoles_ContractId_UserId",
                table: "ContractUserRoles");

            migrationBuilder.CreateIndex(
                name: "IX_ContractUserRoles_ContractId",
                table: "ContractUserRoles",
                column: "ContractId");
        }
    }
}
