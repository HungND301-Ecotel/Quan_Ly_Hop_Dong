import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { level3CodeService } from '@/services/level3code';
import { LEVEL3_CODE_COLUMNS } from './columns';
import { Level3CodeDelete } from './delete/page';
import { EditLevel3CodeAction } from './edit/page';

export function Level3CodeManagementPage() {
  const dataTable = useDataTable({
    keys: ['level3Code'],
    service: level3CodeService.getLevel3CodeList,
    columns: LEVEL3_CODE_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <Level3CodeDelete table={dataTable.table} />
        <EditLevel3CodeAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}