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
import { EconomicContractColumns } from '@/features/main/finance/buy/columns';
import { contractService } from '@/services/contract';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback } from 'react';

type FinancePageProps = {
  formats: number[];
  keyPrefix: string;
};

function FinanceTab({ formats, status, tableKey }: { formats: number[]; status?: number; tableKey: string }) {
  const fetchService = useCallback(async () => {
    return contractService.getContractList({
      formats,
      isDebtTrackingEnabled: true,
      ...(status !== undefined && { status }),
    });
  }, []);

  const dataTable = useDataTable({
    service: fetchService,
    columns: EconomicContractColumns,
    keys: [tableKey],
  });

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <DataTableSearch />
        <DataTableFilterContractType />
        <DataTableFilterContractStatus />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}

export function FinancePage({ formats, keyPrefix }: FinancePageProps) {
  return (
    <Tabs defaultValue='all'>
      <TabsList className='w-full'>
        <TabsTrigger value='all'>Tất cả hợp đồng</TabsTrigger>
        <TabsTrigger value='tracking'>Đang theo dõi tài chính công nợ</TabsTrigger>
        <TabsTrigger value='completed'>Đã hoàn thành tài chính công nợ</TabsTrigger>
      </TabsList>

      <TabsContent value='all'>
        <FinanceTab formats={formats} tableKey={`${keyPrefix}-all`} />
      </TabsContent>

      <TabsContent value='tracking'>
        <FinanceTab formats={formats} status={3} tableKey={`${keyPrefix}-tracking`} />
      </TabsContent>

      <TabsContent value='completed'>
        <FinanceTab formats={formats} status={5} tableKey={`${keyPrefix}-completed`} />
      </TabsContent>
    </Tabs>
  );
}