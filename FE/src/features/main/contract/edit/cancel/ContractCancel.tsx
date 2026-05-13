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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contractService } from '@/services/contract';
import { XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ContractCancelProps = {
  contractId: string;
  callback?: () => void;
};

export function ContractCancel({ contractId, callback }: ContractCancelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do hủy hợp đồng');
      return;
    }

    try {
      setIsLoading(true);
      await contractService.cancelContract(contractId, reason.trim());
      toast.success('Hủy hợp đồng thành công');
      setOpen(false);
      setReason('');
      callback?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi hủy hợp đồng'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setReason('');
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          title='Hủy hợp đồng'
        >
          <XCircleIcon className='size-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy hợp đồng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy hợp đồng này không? Hành động này không
            thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='cancel-reason'>
            Lý do hủy <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='cancel-reason'
            placeholder='Nhập lý do hủy hợp đồng...'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Quay lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            variant='destructive'
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}