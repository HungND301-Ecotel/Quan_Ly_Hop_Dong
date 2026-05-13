import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { ContractRegisterService } from '@/services/contract-register';
import { CONTRACT_REGISTER_COLUMNS } from './columns';
import { ContractRegisterDelete } from './delete/page';
import { ContractRegisterEdit } from './edit/page';

export function ContractRegisterManagementPage() {
  const dataTable = useDataTable({
    keys: ['contract-register'],
    columns: CONTRACT_REGISTER_COLUMNS,
    service: ContractRegisterService.getContractRegisterList,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractRegisterDelete table={dataTable.table} />
        <ContractRegisterEdit table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
