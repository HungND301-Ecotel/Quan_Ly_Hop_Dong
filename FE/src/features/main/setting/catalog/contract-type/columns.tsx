import { DataTableSelectColumn } from '@/components/data-table';
import { ContractType } from '@/services/contract-type/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractTypeDelete } from './delete';
import { ContractTypeDetail } from './detail';
import { ContractTypeUpsert } from './upsert';

export const CONTRACT_TYPE_COLUMNS: ColumnDef<ContractType>[] = [
  DataTableSelectColumn as ColumnDef<ContractType>,
  {
    accessorKey: 'code',
    header: 'Mã loại hợp đồng',
  },
  {
    accessorKey: 'name',
    header: 'Tên loại hợp đồng',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <ContractTypeDetail {...props} />
          <ContractTypeUpsert {...props} />
          <ContractTypeDelete {...props} />
        </div>
      );
    },
  },
];
