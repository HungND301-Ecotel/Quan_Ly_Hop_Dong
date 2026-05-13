import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { unitOfMeasureService } from '@/services/unit';
import { UNIT_OF_MEASURE_COLUMNS } from './columns';
import { UnitOfMeasureDelete } from './delete/page';
import { EditUnitOfMeasureAction } from './edit/page';

export function UnitOfMeasureManagementPage() {
  const dataTable = useDataTable({
    keys: ['unitOfMeasure'],
    service: unitOfMeasureService.getUnitOfMeasureList,
    columns: UNIT_OF_MEASURE_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <UnitOfMeasureDelete table={dataTable.table} />
        <EditUnitOfMeasureAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
