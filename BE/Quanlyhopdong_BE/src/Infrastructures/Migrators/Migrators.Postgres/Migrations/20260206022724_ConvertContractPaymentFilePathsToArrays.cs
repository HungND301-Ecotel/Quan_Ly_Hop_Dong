using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class ConvertContractPaymentFilePathsToArrays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add new array columns
            migrationBuilder.AddColumn<string[]>(
                name: "AcceptanceReportFilePaths",
                table: "ContractPayments",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "InvoiceFilePaths",
                table: "ContractPayments",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "TaxFilePaths",
                table: "ContractPayments",
                type: "text[]",
                nullable: true);

            // 2. Migrate data
            migrationBuilder.Sql(@"
                UPDATE ""ContractPayments""
                SET 
                    ""AcceptanceReportFilePaths"" = CASE 
                        WHEN ""AcceptanceReportFilePath"" IS NOT NULL AND ""AcceptanceReportFilePath"" != '' 
                        THEN ARRAY[""AcceptanceReportFilePath""]::text[]
                        ELSE NULL
                    END,
                    ""InvoiceFilePaths"" = CASE 
                        WHEN ""InvoiceFilePath"" IS NOT NULL AND ""InvoiceFilePath"" != '' 
                        THEN ARRAY[""InvoiceFilePath""]::text[]
                        ELSE NULL
                    END,
                    ""TaxFilePaths"" = CASE 
                        WHEN ""TaxFilePath"" IS NOT NULL AND ""TaxFilePath"" != '' 
                        THEN ARRAY[""TaxFilePath""]::text[]
                        ELSE NULL
                    END;
            ");

            // 3. Drop old columns
            migrationBuilder.DropColumn(
                name: "AcceptanceReportFilePath",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "InvoiceFilePath",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "TaxFilePath",
                table: "ContractPayments");
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Add old columns
            migrationBuilder.AddColumn<string>(
                name: "AcceptanceReportFilePath",
                table: "ContractPayments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceFilePath",
                table: "ContractPayments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxFilePath",
                table: "ContractPayments",
                type: "text",
                nullable: true);

            // 2. Rollback data
            migrationBuilder.Sql(@"
                UPDATE ""ContractPayments""
                SET 
                    ""AcceptanceReportFilePath"" = CASE 
                        WHEN ""AcceptanceReportFilePaths"" IS NOT NULL AND array_length(""AcceptanceReportFilePaths"", 1) > 0
                        THEN ""AcceptanceReportFilePaths""[1]
                        ELSE NULL
                    END,
                    ""InvoiceFilePath"" = CASE 
                        WHEN ""InvoiceFilePaths"" IS NOT NULL AND array_length(""InvoiceFilePaths"", 1) > 0
                        THEN ""InvoiceFilePaths""[1]
                        ELSE NULL
                    END,
                    ""TaxFilePath"" = CASE 
                        WHEN ""TaxFilePaths"" IS NOT NULL AND array_length(""TaxFilePaths"", 1) > 0
                        THEN ""TaxFilePaths""[1]
                        ELSE NULL
                    END;
            ");

            // 3. Drop array columns
            migrationBuilder.DropColumn(
                name: "AcceptanceReportFilePaths",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "InvoiceFilePaths",
                table: "ContractPayments");

            migrationBuilder.DropColumn(
                name: "TaxFilePaths",
                table: "ContractPayments");
        }
    }
}
