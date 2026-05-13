using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class MaterialUnitOfMeasureRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UnitOfMeasure",
                table: "Materials");

            // Bước 1: Tạo bảng UnitOfMeasures trước
            migrationBuilder.CreateTable(
                name: "UnitOfMeasures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasures", x => x.Id);
                });

            // Bước 2: Seed 1 UoM mặc định, dùng Id cố định
            var defaultUoMId = new Guid("11111111-1111-1111-1111-111111111111");
            var systemUserId = new Guid("44edcf1e-24db-41a7-a644-1eee77155fc4"); 

            migrationBuilder.InsertData(
                table: "UnitOfMeasures",
                columns: new[] { "Id", "Code", "Name", "IsActive", "CreatedBy", "CreatedOn", "LastModifiedBy" },
                values: new object[] { defaultUoMId, "N/A", "Chưa phân loại", true, systemUserId, DateTimeOffset.UtcNow, systemUserId });

            // Bước 3: Add cột với defaultValue trỏ đúng vào UoM vừa seed
            migrationBuilder.AddColumn<Guid>(
                name: "UnitOfMeasureId",
                table: "Materials",
                type: "uuid",
                nullable: false,
                defaultValue: defaultUoMId); // ← trỏ vào Id thật

            migrationBuilder.CreateIndex(
                name: "IX_Materials_UnitOfMeasureId",
                table: "Materials",
                column: "UnitOfMeasureId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitOfMeasures_Code",
                table: "UnitOfMeasures",
                column: "Code",
                unique: true,
                filter: "\"DeletedOn\" IS NULL");

            // Bước 4: Giờ mới add FK — tất cả row đã có UnitOfMeasureId hợp lệ
            migrationBuilder.AddForeignKey(
                name: "FK_Materials_UnitOfMeasures_UnitOfMeasureId",
                table: "Materials",
                column: "UnitOfMeasureId",
                principalTable: "UnitOfMeasures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Materials_UnitOfMeasures_UnitOfMeasureId",
                table: "Materials");

            migrationBuilder.DropTable(
                name: "UnitOfMeasures");

            migrationBuilder.DropIndex(
                name: "IX_Materials_UnitOfMeasureId",
                table: "Materials");

            migrationBuilder.DropColumn(
                name: "UnitOfMeasureId",
                table: "Materials");

            migrationBuilder.AddColumn<string>(
                name: "UnitOfMeasure",
                table: "Materials",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
