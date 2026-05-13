import { Button } from '@/components/ui/button';
import { User } from '@/types/user.type';
import { Row, Table } from '@tanstack/react-table';
import { EyeIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { DeleteUserDialog } from './components/delete/delete-user-dialog';
import { UserDetailDialog } from './components/detail/user-detail-dialog';
import { EditUserDialog } from './components/edit/edit-user-dialog';

interface AccountActionCellProps {
  row: Row<User>;
  table: Table<User>;
}

export function AccountActionCell({ row, table }: AccountActionCellProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { positions, departments, refresh } = (table.options.meta as any) || {};
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpenDetail(true)}
          className='size-8 p-0'
        >
          <EyeIcon className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpen(true)}
          className='size-8 p-0'
        >
          <SquarePenIcon className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpenDelete(true)}
          className='size-8 p-0 hover:text-destructive hover:bg-destructive/10'
        >
          <Trash2Icon className='size-4' />
        </Button>
      </div>

      {open && (
        <EditUserDialog
          user={row.original}
          open={open}
          onOpenChange={setOpen}
          positions={positions || []}
          departments={departments || []}
          refresh={refresh || (() => {})}
        />
      )}

      {openDelete && (
        <DeleteUserDialog
          ids={[row.original.id]}
          open={openDelete}
          onOpenChange={setOpenDelete}
          onSuccess={refresh || (() => {})}
        />
      )}

      {openDetail && (
        <UserDetailDialog
          user={row.original}
          open={openDetail}
          onOpenChange={setOpenDetail}
          positions={positions || []}
          departments={departments || []}
        />
      )}
    </>
  );
}
