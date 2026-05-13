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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractFormat } from '@/constants/contract-format';
import { ContractArchiveCreate } from '@/features/main/contract/archive/create';
import { ContractArchiveDelete } from '@/features/main/contract/archive/delete';
import { ContractColumns } from '@/features/main/contract/columns';
import { useMainLayoutContext } from '@/features/main/layout/context';
import { contractService } from '@/services/contract';
import { useCallback, useEffect } from 'react';

export const ContractArchivePage = () => {
  const { setAction } = useMainLayoutContext();

  const getContractList = useCallback(() => {
    return contractService.getMyVisibleContractList({ isArchiveContract: true });
  }, []);

  const dataTable = useDataTable({
    service: getContractList,
    columns: ContractColumns,
    keys: ['contract-archive'],
  });

  useEffect(() => {
    setAction(<ContractArchiveCreate callback={dataTable.refresh} />);
  }, [setAction, dataTable.refresh]);

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <ContractArchiveDelete />
        <DataTableSearch />
        <Select
          defaultValue='all'
          onValueChange={(value) => {
            dataTable.table
              .getColumn('contractFormat')
              ?.setFilterValue(value === 'all' ? undefined : Number(value));
          }}
        >
          <SelectTrigger size='lg'>
            <SelectValue placeholder='Select' />
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
        <DataTableFilterContractStatus />
      </DataTableHeader>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
};
