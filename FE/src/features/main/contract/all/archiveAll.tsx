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
import { useMainLayoutContext } from '@/features/main/layout/context';
import { contractService } from '@/services/contract';
import { useCallback, useEffect } from 'react';
import { ArchiveContractColumns } from '../columnsArchive';
import { ContractArchiveCreate } from '../archive/create';

export function ContractArchiveAllPage() {
  const { setAction } = useMainLayoutContext();

  const fetchList = useCallback(async () => {
    return contractService.getMyVisibleContractList({
      isArchiveContract: true,
    });
  }, []);

  const dataTable = useDataTable({
    columns: ArchiveContractColumns,
    service: fetchList,
    keys: ['contract-archive-all'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} />);
  }, [setAction, dataTable.refresh]);

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