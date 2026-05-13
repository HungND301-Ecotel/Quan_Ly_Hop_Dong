import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { signedContentService } from '@/services/signedContent';
import { SIGNED_CONTENT_COLUMNS } from './columns';
import { SignedContentDelete } from './delete/page';
import { EditSignedContentAction } from './edit/page';

export function SignedContentManagementPage() {
  const dataTable = useDataTable({
    keys: ['signedContent'],
    service: signedContentService.getSignedContentList,
    columns: SIGNED_CONTENT_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <SignedContentDelete table={dataTable.table} />
        <EditSignedContentAction table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}