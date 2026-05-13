import { useDataTableContext } from '@/components/data-table/context';
import { DataTableEvent } from '@/components/data-table/types';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function BankAccountDelete({ row, table }: DataTableEvent<BankAccount>) {
  const { refresh } = useDataTableContext<BankAccount>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
  const idsToDelete = row ? [row.original.id] : selectedIds;
  const isBulk = !row;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await BankAccountService.deleteBankAccountList(idsToDelete);
      toast.success(
        isBulk
          ? `Đã xóa ${idsToDelete.length} tài khoản ngân hàng`
          : `Xóa tài khoản ${row?.original?.accountNumber} thành công`
      );
      await refresh();
      table.resetRowSelection();
      setOpen(false);
    } catch {
      toast.error('Lỗi khi xóa tài khoản ngân hàng');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {isBulk ? (
          <Button variant='destructive' className='gap-2' disabled={idsToDelete.length === 0} size='lg'>
            <Trash2 className='w-4 h-4' />
            Xóa ({idsToDelete.length})
          </Button>
        ) : (
          <Button variant='ghost' size='icon-lg' className='hover:text-destructive hover:bg-destructive/10'>
            <Trash2 className='w-4 h-4' />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `Bạn có chắc muốn xóa ${idsToDelete.length} tài khoản ngân hàng đã chọn?`
              : `Bạn có chắc muốn xóa tài khoản ${row?.original?.accountNumber}?`}{' '}
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <Button variant='destructive' onClick={onDelete} disabled={isDeleting} className='min-w-24'>
            {isDeleting ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : null}
            Xác nhận xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}