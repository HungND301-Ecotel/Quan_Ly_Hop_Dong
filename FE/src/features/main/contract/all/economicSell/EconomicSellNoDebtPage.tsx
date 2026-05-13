// features/main/contract/economic-sell-no-debt/page.tsx
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

export function ContractEconomicSellNoDebtPage() {
  const { setAction } = useMainLayoutContext();

  const ContractEconomicSellNoDebtList = useCallback(async () => {
    return contractService.getMyVisibleContractList({
      formats: [3],
      isArchiveContract: true,
      isDebtTrackingEnabled: false, // ← Không theo dõi công nợ
    });
  }, []);

  const dataTable = useDataTable({
    columns: ArchiveContractColumns,
    service: ContractEconomicSellNoDebtList,
    keys: ['contract-economic-sell-no-debt'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} defaultFormat={3} defaultIsDebtTracking={false}/>);
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