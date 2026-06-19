import { DataTableSelectColumn } from '@/components/data-table';
import { SignedContent } from '@/services/signedContent/type';
import { ColumnDef } from '@tanstack/react-table';
import { SignedContentDelete } from './delete/page';
import { EditSignedContentAction } from './edit/page';

export const SIGNED_CONTENT_COLUMNS: ColumnDef<SignedContent>[] = [
  DataTableSelectColumn as ColumnDef<SignedContent>,
  {
    accessorKey: 'title',
    header: 'Tên nội dung ký kết hợp đồng',
  },
  {
    accessorKey: 'level3CodeName',
    header: 'Mã cấp 3',
  },
  {
    id: 'action',
    header: () => <div className='text-right w-full pr-4'>Thao tác</div>,
    cell: (props) => (
      <div className='flex items-center gap-1 justify-end'>
        <EditSignedContentAction {...props} />
        <SignedContentDelete {...props} />
      </div>
    ),
  },
];
