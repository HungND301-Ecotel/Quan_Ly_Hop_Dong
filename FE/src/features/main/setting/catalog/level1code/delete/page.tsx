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
import { level1CodeService } from '@/services/level1code';
import { Level1Code } from '@/services/level1code/type';
import { Loader2, Trash2, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Level1CodeDelete({ row, table }: DataTableEvent<Level1Code>) {
  const { refresh } = useDataTableContext<Level1Code>();

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
      await level1CodeService.deleteLevel1CodeList(idsToDelete);

      toast.success(
        isBulk
          ? `Đã xóa ${idsToDelete.length} mã cấp 1`
          : `Xóa mã cấp 1 "${row?.original?.code}" thành công`
      );

      table?.options.meta?.refresh();
      await refresh();
      table.resetRowSelection();
      setOpen(false);
    } catch {
      toast.error('Lỗi khi xóa mã cấp 1');
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
            size='lg'
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
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `Bạn có chắc chắn muốn xóa ${idsToDelete.length} mã cấp 1 đã chọn?`
              : `Bạn có chắc chắn muốn xóa mã cấp 1 "${row?.original?.code}"?`}{' '}
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