import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { contractStructureCatalogService } from '@/services/structure';
import { CONTRACT_STRUCTURE_CATALOG_COLUMNS } from './columns';
import { ContractStructureCatalogDelete } from './delete/page';
import { EditContractStructureCatalogAction } from './edit/page';

export function ContractStructureCatalogManagementPage() {
  const dataTable = useDataTable({
    keys: ['contractStructureCatalog'],
    service: contractStructureCatalogService.getContractStructureCatalogList,
    columns: CONTRACT_STRUCTURE_CATALOG_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractStructureCatalogDelete table={dataTable.table} />
        <EditContractStructureCatalogAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}