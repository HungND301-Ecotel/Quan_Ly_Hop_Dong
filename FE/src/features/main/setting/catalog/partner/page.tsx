import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { partnerService } from '@/services/partner';
import { PARTNER_COLUMNS } from './columns';
import { PartnerDelete } from './delete/page';
import { EditPartnerAction } from './edit/page';

export function PartnerManagementPage() {
  const dataTable = useDataTable({
    keys: ['partner'],
    service: partnerService.getPartnerList,
    columns: PARTNER_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <PartnerDelete table={dataTable.table} />
        <EditPartnerAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
