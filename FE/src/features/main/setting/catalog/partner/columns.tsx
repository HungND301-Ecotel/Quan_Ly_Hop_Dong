import { DataTableSelectColumn } from '@/components/data-table';
import { Partner } from '@/services/partner/type';
import { ColumnDef } from '@tanstack/react-table';
import { PartnerDelete } from './delete/page';
import { PartnerDetail } from './detail/page';
import { EditPartnerAction } from './edit/page';

export const PARTNER_COLUMNS: ColumnDef<Partner>[] = [
  DataTableSelectColumn as ColumnDef<Partner>,
  {
    accessorKey: 'name',
    header: 'Tên đối tác',
  },
  {
    accessorKey: 'taxCode',
    header: 'Mã số thuế',
  },
  {
    accessorKey: 'contactPerson',
    header: 'Người đại diện',
  },
  {
    accessorKey: 'address',
    header: 'Địa chỉ',
  },
  {
    accessorKey: 'ContactInformation',
    header: 'Liên hệ',
    cell: ({ row }) => {
      return (
        <div className='space-y-1'>
          <p className='text-sm'>{row.original.email}</p>
          <p className='text-xs text-muted-foreground italic'>
            {row.original.phone}
          </p>
        </div>
      );
    },
  },
  {
    id: 'action',
    header: 'Thao tác',
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <PartnerDetail {...props} />
          <EditPartnerAction {...props} />
          <PartnerDelete {...props} />
        </div>
      );
    },
  },
];
