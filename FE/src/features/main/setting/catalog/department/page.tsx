import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { departmentService } from '@/services/department';
import { DEPARTMENT_COLUMNS } from './columns';
import { DepartmentDelete } from './delete/page';
import { DepartmentEdit } from './edit/page';

export function DepartmentManagementPage() {
  const dataTable = useDataTable({
    keys: ['department'],
    columns: DEPARTMENT_COLUMNS,
    service: departmentService.getDepartmentList,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <DepartmentDelete table={dataTable.table} />
        <DepartmentEdit table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
