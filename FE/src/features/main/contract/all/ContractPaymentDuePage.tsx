// features/main/contract/payment-due/page.tsx
import {
  DataTable,
  DataTableContent,
  DataTableFilterContractType,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractFormat } from '@/constants/contract-format';
import { ContractDelete } from '@/features/main/contract/approval/components/delete.tsx';
import { ContractEdit } from '@/features/main/contract/edit';
import { useMainLayoutContext } from '@/features/main/layout/context';
import { contractService } from '@/services/contract';
import { useCallback, useEffect } from 'react';
import { ContractColumns } from '../all/columns';

export function ContractPaymentDuePage() {
  const { setAction } = useMainLayoutContext();

  const ContractPaymentDueList = useCallback(async () => {
    return contractService.getContractPaymentDueSoon();
  }, []);

  const dataTable = useDataTable({
    columns: ContractColumns,
    service: ContractPaymentDueList,
    keys: ['contract-payment-due'],
  });

  useEffect(() => {
    setAction(<ContractEdit callback={dataTable.refresh} />);
  }, [setAction, dataTable.refresh]);

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractDelete />
        <DataTableSearch />
        <Select
          defaultValue='all'
          onValueChange={(value) => {
            dataTable.table
              .getColumn('contractFormat')
              ?.setFilterValue(value === 'all' ? undefined : Number(value));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Chọn phân loại' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả mẫu hợp đồng</SelectItem>
            {Object.values(ContractFormat).map((format) => (
              <SelectItem key={format.code} value={format.id.toString()}>
                {format.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DataTableFilterContractType />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination className='w-full' />
      </DataTableFooter>
    </DataTable>
  );
}