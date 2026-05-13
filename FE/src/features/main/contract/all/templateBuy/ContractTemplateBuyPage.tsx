// features/main/contract/template-buy/page.tsx
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
import { ContractArchiveCreate } from '../../archive/create';
import { ArchiveContractColumns } from '../../columnsArchive';

export function ContractTemplateBuyPage() {
  const { setAction } = useMainLayoutContext();

  const ContractTemplateBuyList = useCallback(async () => {
    return contractService.getMyVisibleContractList({
      formats: [0],
      isArchiveContract: true,
    });
  }, []);

  const dataTable = useDataTable({
    columns: ArchiveContractColumns,
    service: ContractTemplateBuyList,
    keys: ['contract-template-buy'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} defaultFormat={0}/>);
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