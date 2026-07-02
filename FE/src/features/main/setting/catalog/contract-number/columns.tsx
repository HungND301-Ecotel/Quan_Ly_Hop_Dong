import { DataTableSelectColumn } from '@/components/data-table';
import { ContractNumber } from '@/services/contract-number/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractNumberDelete } from './delete';
import { ContractNumberUpsert } from './upsert';

export const CONTRACT_NUMBER_COLUMNS: ColumnDef<ContractNumber>[] = [
  DataTableSelectColumn as ColumnDef<ContractNumber>,
  {
    accessorKey: 'number',
    header: 'Số hợp đồng',
  },
  {
    accessorKey: 'description',
    header: 'Ghi chú',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <ContractNumberUpsert {...props} />
          <ContractNumberDelete {...props} />
        </div>
      );
    },
  },
];
