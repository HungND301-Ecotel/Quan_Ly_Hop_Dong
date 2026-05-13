import {
  DataTable,
  DataTableContent,
  DataTableFilterContractStatus,
  DataTableFilterContractType,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import { ContractDelete } from '@/features/main/contract/approval/components/delete.tsx';
import { contractService } from '@/services/contract';
import { useCallback } from 'react';
import { ContractColumns } from '../../columns';

export function ContractHistoryPage() {
  const ContractHistoryList = useCallback(async () => {
    return contractService.getContractHistoryList();
  }, []);

  const dataTable = useDataTable({
    columns: ContractColumns,
    service: ContractHistoryList,
    keys: ['contract-history'],
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractDelete />
        <DataTableSearch />
        <DataTableFilterContractType />
        <DataTableFilterContractStatus />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination className='w-full' />
      </DataTableFooter>
    </DataTable>
  );
}
