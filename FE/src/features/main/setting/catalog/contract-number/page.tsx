import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { contractNumberService } from '@/services/contract-number';
import { CONTRACT_NUMBER_COLUMNS } from './columns';
import { ContractNumberDelete } from './delete';
import { ContractNumberUpsert } from './upsert';

export function ContractNumberPage() {
  const dataTable = useDataTable({
    keys: ['contract-number'],
    service: contractNumberService.getContractNumberList,
    columns: CONTRACT_NUMBER_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractNumberDelete table={dataTable.table} />
        <ContractNumberUpsert table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
