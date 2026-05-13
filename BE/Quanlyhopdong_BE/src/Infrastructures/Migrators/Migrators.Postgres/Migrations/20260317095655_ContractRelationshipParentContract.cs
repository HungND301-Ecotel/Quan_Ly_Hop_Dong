using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class ContractRelationshipParentContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "ContractRelationships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChildContractId = table.Column<Guid>(type: "uuid", nullable: false),
                    RelationType = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractRelationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractRelationships_Contracts_ChildContractId",
                        column: x => x.ChildContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContractRelationships_Contracts_ParentContractId",
                        column: x => x.ParentContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractRelationships_ChildContractId",
                table: "ContractRelationships",
                column: "ChildContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractRelationships_ParentContractId_ChildContractId",
                table: "ContractRelationships",
                columns: new[] { "ParentContractId", "ChildContractId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractRelationships_RelationType",
                table: "ContractRelationships",
                column: "RelationType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractRelationships");

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
    }
}
