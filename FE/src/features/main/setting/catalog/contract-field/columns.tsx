import { DataTableSelectColumn } from '@/components/data-table';
import { ContractField } from '@/services/contract-field/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractFieldDelete } from './delete';
import { ContractFieldDetail } from './detail';
import { ContractFieldUpsert } from './upsert';

export const CONTRACT_FIELD_COLUMNS: ColumnDef<ContractField>[] = [
  DataTableSelectColumn as ColumnDef<ContractField>,
  {
    accessorKey: 'name',
    header: 'Lĩnh vực hợp đồng',
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <ContractFieldDetail {...props} />
          <ContractFieldUpsert {...props} />
          <ContractFieldDelete {...props} />
        </div>
      );
    },
  },
];
