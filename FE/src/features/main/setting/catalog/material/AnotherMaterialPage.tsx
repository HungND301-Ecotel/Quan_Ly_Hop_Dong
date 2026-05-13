// features/main/other-material/page.tsx
import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { materialService } from '@/services/material';
import { MaterialDelete } from './delete/page';
import { EditOtherMaterialAction } from './edit/EditOtherMaterialAction';
import { OTHER_MATERIAL_COLUMNS } from './columnsOtherMaterials';

export function OtherMaterialManagementPage() {
  const dataTable = useDataTable({
    keys: ['other-material'],
    service: materialService.getOtherMaterialList,
    columns: OTHER_MATERIAL_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <MaterialDelete table={dataTable.table} />
        <EditOtherMaterialAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}