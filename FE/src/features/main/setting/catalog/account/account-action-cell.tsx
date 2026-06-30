import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/features/context';
import { User } from '@/types/user.type';
import { Row, Table } from '@tanstack/react-table';
import { EyeIcon, KeyRoundIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { DeleteUserDialog } from './components/delete/delete-user-dialog';
import { UserDetailDialog } from './components/detail/user-detail-dialog';
import { EditUserDialog } from './components/edit/edit-user-dialog';
import { ResetPasswordDialog } from './components/reset/reset-password-dialog';

interface AccountActionCellProps {
  row: Row<User>;
  table: Table<User>;
}

export function AccountActionCell({ row, table }: AccountActionCellProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { positions, departments, refresh } = (table.options.meta as any) || {};
  const { user } = useAuthContext();
  const isAdmin = user?.role === '0' || user?.role === 'Admin';
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openReset, setOpenReset] = useState(false);

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
        {isAdmin && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setOpenReset(true)}
            className='size-8 p-0 hover:text-primary hover:bg-primary/10'
            title='Reset mật khẩu'
          >
            <KeyRoundIcon className='size-4' />
          </Button>
        )}
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

      {openReset && (
        <ResetPasswordDialog
          user={row.original}
          open={openReset}
          onOpenChange={setOpenReset}
        />
      )}
    </>
  );
}
