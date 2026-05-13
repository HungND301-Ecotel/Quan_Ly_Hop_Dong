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

export function ContractPendingPage() {
  const ContractPendingList = useCallback(async () => {
    return contractService.getContractPendingList();
  }, []);

  const dataTable = useDataTable({
    columns: ContractColumns,
    service: ContractPendingList,
    keys: ['contract-pending'],
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
