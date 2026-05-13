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

export function ContractEconomicBuyPage() {
  const { setAction } = useMainLayoutContext();

  const ContractEconomicBuyList = useCallback(async () => {
    return contractService.getMyVisibleContractList({
      formats: [2],
      isArchiveContract: true,
      isDebtTrackingEnabled: true, // ← Theo dõi công nợ
    });
  }, []);

  const dataTable = useDataTable({
    columns: ArchiveContractColumns,
    service: ContractEconomicBuyList,
    keys: ['contract-economic-buy-debt'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} defaultFormat={2} defaultIsDebtTracking={true}/>);
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