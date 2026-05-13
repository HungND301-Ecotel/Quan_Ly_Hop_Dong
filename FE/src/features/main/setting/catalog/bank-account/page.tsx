import {
  DataTable, DataTableContent, DataTableFooter,
  DataTableHeader, DataTablePagination, DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { BankAccountService } from '@/services/bank-account';
import { BANK_ACCOUNT_COLUMNS } from './columns';
import { BankAccountDelete } from './delete/page';
import { BankAccountEdit } from './edit/page';

export function BankAccountManagementPage() {
  const dataTable = useDataTable({
    keys: ['bank-accounts'],
    columns: BANK_ACCOUNT_COLUMNS,
    service: BankAccountService.getBankAccountList,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <BankAccountDelete table={dataTable.table} />
        <BankAccountEdit table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}