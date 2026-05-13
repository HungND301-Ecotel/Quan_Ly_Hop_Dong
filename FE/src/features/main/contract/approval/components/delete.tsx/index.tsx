import { useDataTableContext } from '@/components/data-table/context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ContractDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { table, refresh } = useDataTableContext<Contract>();

  const handleDelete = async () => {
    const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (ids.length === 0) return;

    try {
      setIsDeleting(true);
      await contractService.deleteContract(ids);
      await refresh();
      table.resetRowSelection();
      toast.success(`Đã xóa ${ids.length} hợp đồng thành công`);
    } catch {
      toast.error('Lỗi khi xóa hợp đồng');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={'destructive'}
          size={'lg'}
          className='px-4'
          disabled={table.getSelectedRowModel().rows.length === 0 || isDeleting}
        >
          <Trash2Icon />
          <span>Xóa ({table.getSelectedRowModel().rows.length})</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa {table.getSelectedRowModel().rows.length}{' '}
            hợp đồng đã chọn? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant={'destructive'}>
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
