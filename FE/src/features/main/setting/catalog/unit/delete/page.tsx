import { useDataTableContext } from '@/components/data-table/context';
import { DataTableEvent } from '@/components/data-table/types';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { unitOfMeasureService } from '@/services/unit';
import { UnitOfMeasure } from '@/services/unit/type';
import { Loader2, Trash2, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function UnitOfMeasureDelete({ row, table }: DataTableEvent<UnitOfMeasure>) {
  const { refresh } = useDataTableContext<UnitOfMeasure>();

  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  const idsToDelete = row ? [row.original.id] : selectedIds;
  const isBulk = !row;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await unitOfMeasureService.deleteUnitOfMeasureList(idsToDelete);

      toast.success(
        isBulk
          ? `Đã xóa ${idsToDelete.length} đơn vị tính`
          : `Xóa đơn vị tính ${row?.original?.name} thành công`
      );

      table?.options.meta?.refresh();
      await refresh();
      table.resetRowSelection();

      setOpen(false);
    } catch {
      toast.error('Lỗi khi xóa đơn vị tính');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {isBulk ? (
          <Button
            variant='destructive'
            size={'lg'}
            className='px-4'
            disabled={!idsToDelete.length}
          >
            <Trash2Icon className='w-4 h-4' />
            Xóa ({idsToDelete.length})
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            className='hover:text-destructive hover:bg-destructive/10'
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `Bạn có chắc chắn muốn xóa ${idsToDelete.length} đơn vị tính đã chọn?`
              : `Bạn có chắc chắn muốn xóa đơn vị tính ${row?.original?.name}?`}{' '}
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={onDelete}
            disabled={isDeleting || idsToDelete.length === 0}
            className='min-w-24'
          >
            {isDeleting ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : null}
            Xác nhận xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}