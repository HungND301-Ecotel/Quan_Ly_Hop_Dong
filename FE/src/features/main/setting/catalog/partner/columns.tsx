import { DataTableSelectColumn } from '@/components/data-table';
import { Partner } from '@/services/partner/type';
import { ColumnDef } from '@tanstack/react-table';
import { PartnerDelete } from './delete/page';
import { EditPartnerAction } from './edit/page';

export const PARTNER_COLUMNS: ColumnDef<Partner>[] = [
  DataTableSelectColumn as ColumnDef<Partner>,
  {
    accessorKey: 'partnerContractCode',
    header: 'Mã đối tác hợp đồng',
  },
  {
    accessorKey: 'name',
    header: 'Đối tác hợp đồng',
  },
  {
    accessorKey: 'address',
    header: 'Địa chỉ',
  },
  {
    accessorKey: 'bankAccountName',
    header: 'Tài khoản ngân hàng',
  },
  {
    accessorKey: 'taxCode',
    header: 'Mã số thuế',
  },
  {
    accessorKey: 'phone',
    header: 'Điện thoại',
  },
  {
    accessorKey: 'fax',
    header: 'Fax',
  },
  {
    accessorKey: 'contactPerson',
    header: 'Người đại diện',
  },
  {
    accessorKey: 'position',
    header: 'Chức vụ',
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
  },
  {
    id: 'action',
    header: 'Thao tác',
    cell: (props) => {
      return (
        <div className='flex items-center gap-1 justify-end'>
          <EditPartnerAction {...props} />
          <PartnerDelete {...props} />
        </div>
      );
    },
  },
];
