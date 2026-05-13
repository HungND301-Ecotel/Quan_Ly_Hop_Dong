import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { contractTypeService } from '@/services/contract-type';
import { CONTRACT_TYPE_COLUMNS } from './columns';
import { ContractTypeDelete } from './delete';
import { ContractTypeUpsert } from './upsert';

export function ContractTypePage() {
  const dataTable = useDataTable({
    keys: ['contract-type'],
    service: contractTypeService.getContractTypeList,
    columns: CONTRACT_TYPE_COLUMNS,
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractTypeDelete table={dataTable.table} />
        <ContractTypeUpsert table={dataTable.table} />
        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
