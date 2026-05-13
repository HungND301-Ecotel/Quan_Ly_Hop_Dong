import { Button } from '@/components/ui/button';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { Row, Table } from '@tanstack/react-table';
import { EyeIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { ProcurementMethodDetailDialog } from './components/detail/procurement-method-detail-dialog';
import { EditProcurementMethodDialog } from './components/edit/edit-procurement-method-dialog';
import { DeleteProcurementMethodDialog } from './components/delete/procurement-method-dialog';

interface ProcurementMethodActionCellProps {
  row: Row<ProcurementMethod>;
  table: Table<ProcurementMethod>;
}

export function ProcurementMethodActionCell({
  row,
  table,
}: ProcurementMethodActionCellProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { refresh } = (table.options.meta as any) || {};
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
        <EditProcurementMethodDialog
          procurement_method={row.original}
          open={open}
          onOpenChange={setOpen}
          refresh={refresh || (() => {})}
        />
      )}

      {openDelete && (
        <DeleteProcurementMethodDialog
          ids={[row.original.id]}
          open={openDelete}
          onOpenChange={setOpenDelete}
          onSuccess={refresh || (() => {})}
        />
      )}

      {openDetail && (
        <ProcurementMethodDetailDialog
          procurement_method={row.original}
          open={openDetail}
          onOpenChange={setOpenDetail}
        />
      )}
    </>
  );
}
