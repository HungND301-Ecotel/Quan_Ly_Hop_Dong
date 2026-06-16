import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { level2CodeService } from '@/services/level2code';
import { LEVEL2_CODE_COLUMNS } from './columns';
import { Level2CodeDelete } from './delete/page';
import { EditLevel2CodeAction } from './edit/page';

export function Level2CodeManagementPage() {
  const dataTable = useDataTable({
    keys: ['level2Code'],
    service: level2CodeService.getLevel2CodeList,
    columns: LEVEL2_CODE_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <Level2CodeDelete table={dataTable.table} />
        <EditLevel2CodeAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
