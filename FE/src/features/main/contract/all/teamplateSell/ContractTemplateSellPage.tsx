// features/main/contract/economic-buy/page.tsx
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

export function ContractTemplateSellPage() {
  const { setAction } = useMainLayoutContext();

  const ContractEconomicBuyList = useCallback(async () => {
    return contractService.getMyVisibleContractList({
      formats: [1],
      isArchiveContract: true,
    });
  }, []);

  const dataTable = useDataTable({
    columns: ArchiveContractColumns,
    service: ContractEconomicBuyList,
    keys: ['contract-economic-buy'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} defaultFormat={1}/>);
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