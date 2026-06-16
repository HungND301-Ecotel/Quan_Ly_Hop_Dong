import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { contractFieldService } from '@/services/contract-field';
import { CONTRACT_FIELD_COLUMNS } from './columns';
import { ContractFieldDelete } from './delete';
import { ContractFieldUpsert } from './upsert';

export function ContractFieldPage() {
  const dataTable = useDataTable({
    keys: ['contract-field'],
    service: contractFieldService.getContractFieldList,
    columns: CONTRACT_FIELD_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractFieldDelete table={dataTable.table} />
        <ContractFieldUpsert table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
