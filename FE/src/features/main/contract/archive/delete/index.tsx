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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import { InfoIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ContractArchiveDelete() {
  const { table, refresh } = useDataTableContext<Contract>();

  const [isDeleting, setIsDeleting] = useState(false);

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

  const selectedCount = table.getSelectedRowModel().rows.length;

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
      <AlertDialogContent className='gap-0 p-0'>
        <AlertDialogHeader className='gap-0 p-6 border-b'>
          <AlertDialogTitle className='leading-tight font-semibold'>
            Xác nhận xóa
          </AlertDialogTitle>
          <AlertDialogDescription hidden />
        </AlertDialogHeader>

        <div className='p-6'>
          <Item variant={'muted'} className='bg-amber-50 border-amber-400'>
            <ItemMedia variant={'icon'} className='my-auto'>
              <InfoIcon className='text-amber-400' />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                Bạn có chắc chắn muốn xóa {selectedCount} hợp đồng đã chọn?
              </ItemTitle>
              <ItemDescription>
                Hành động này không thể hoàn tác.
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>

        <AlertDialogFooter className='p-6 border-t'>
          <AlertDialogCancel size={'lg'} className='px-4 flex-1'>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            variant={'destructive'}
            size={'lg'}
            className='px-4 flex-1'
          >
            {isDeleting ? <Spinner /> : <Trash2Icon />}
            <span>Xóa</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
