import { format } from '@/lib/format';
import { ColumnDef } from '@tanstack/react-table';
import { SummaryItem } from './type';

export const columns: ColumnDef<SummaryItem>[] = [
  {
    accessorKey: 'name',
    header: 'Tên hạng mục',
  },
  {
    id: 'cumulative',
    header: 'Lũy kế năm',
    columns: [
      {
        id: 'cumulative_volume',
        header: 'Khối lượng',
        cell: ({ row }) => format.number(row.original.cumulative.volume),
      },
      {
        id: 'cumulative_amount',
        header: 'Thành tiền (đồng)',
        cell: ({ row }) => format.number(row.original.cumulative.amount),
      },
    ],
  },
  {
    id: 'pending',
    header: 'Giá trị/khối lượng dở dang',
    columns: [
      {
        id: 'pending_volume',
        header: 'Khối lượng',
        cell: ({ row }) => format.number(row.original.pending.volume),
      },
      {
        id: 'pending_amount',
        header: 'Thành tiền (đồng)',
        cell: ({ row }) => format.number(row.original.pending.amount),
      },
    ],
  },
  {
    id: 'estimated',
    header: 'Ước thực hiện HĐ',
    columns: [
      {
        id: 'estimated_volume',
        header: 'Khối lượng',
        cell: ({ row }) => format.number(row.original.estimated.volume),
      },
      {
        id: 'estimated_amount',
        header: 'Thành tiền (đồng)',
        cell: ({ row }) => format.number(row.original.estimated.amount),
      },
    ],
  },
  {
    accessorKey: 'liquidation',
    header: 'Kiểm điểm, thanh lý HĐ',
    cell: ({ row }) => (
      <span className='font-bold bg-yellow-400 p-2 block text-center'>
        {row.original.liquidation}
      </span>
    ),
  },
];
