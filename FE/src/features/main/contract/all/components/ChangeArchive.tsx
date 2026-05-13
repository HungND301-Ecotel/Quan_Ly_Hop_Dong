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
import { ArchiveIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ContractArchiveProps = {
  contractId: string;
  callback?: () => void;
};

export function ContractArchive({ contractId, callback }: ContractArchiveProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      await contractService.archiveContract(contractId);
      toast.success('Chuyển hợp đồng sang lưu trữ thành công');
      callback?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi lưu trữ hợp đồng'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-blue-600 hover:text-blue-600 hover:bg-blue-50'
          title='Chuyển sang lưu trữ'
        >
          <ArchiveIcon className='size-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận lưu trữ hợp đồng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn chuyển hợp đồng này sang trạng thái lưu trữ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Quay lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận lưu trữ'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}