import { DataTableSelectColumn } from '@/components/data-table';
import { ContractField } from '@/services/contract-field/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractFieldDelete } from './delete';
import { ContractFieldUpsert } from './upsert';

export const CONTRACT_FIELD_COLUMNS: ColumnDef<ContractField>[] = [
  DataTableSelectColumn as ColumnDef<ContractField>,
  {
    accessorKey: 'code',
    header: 'Mã lĩnh vực hợp đồng',
  },
  {
    accessorKey: 'name',
    header: 'Tên lĩnh vực hợp đồng',
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
          <ContractFieldUpsert {...props} />
          <ContractFieldDelete {...props} />
        </div>
      );
    },
  },
];
