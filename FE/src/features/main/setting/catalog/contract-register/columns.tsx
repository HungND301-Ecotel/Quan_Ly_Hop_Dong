import { DataTableSelectColumn } from '@/components/data-table';
import { ContractRegister } from '@/services/contract-register/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractRegisterDelete } from './delete/page';
import { ContractRegisterEdit } from './edit/page';

export const CONTRACT_REGISTER_COLUMNS: ColumnDef<ContractRegister>[] = [
  DataTableSelectColumn as ColumnDef<ContractRegister>,
  {
    accessorKey: 'name',
    header: 'Sổ theo dõi hợp đồng',
  },
  {
    accessorKey: 'year',
    header: 'Thời gian',
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
          <ContractRegisterEdit {...props} />
          <ContractRegisterDelete {...props} />
        </div>
      );
    },
  },
];
