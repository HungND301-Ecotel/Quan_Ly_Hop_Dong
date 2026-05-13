import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { level1CodeService } from '@/services/level1code';
import { LEVEL1_CODE_COLUMNS } from './columns';
import { Level1CodeDelete } from './delete/page';
import { EditLevel1CodeAction } from './edit/page';

export function Level1CodeManagementPage() {
  const dataTable = useDataTable({
    keys: ['level1Code'],
    service: level1CodeService.getLevel1CodeList,
    columns: LEVEL1_CODE_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <Level1CodeDelete table={dataTable.table} />
        <EditLevel1CodeAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}