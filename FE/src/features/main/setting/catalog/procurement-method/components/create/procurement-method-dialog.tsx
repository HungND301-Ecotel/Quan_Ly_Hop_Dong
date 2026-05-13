import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProcurementMethodForm } from '../form/procurement-method-form';
import { CreateProcurementMethodValues } from './procurement-method-schema';
import { procurementMethodService } from '@/services/procurement-method';

interface CreateProcurementMethodDialogProps {
  refresh: () => void;
}

export function CreateProcurementMethodDialog({
  refresh,
}: CreateProcurementMethodDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CreateProcurementMethodValues) => {
    try {
      setIsSubmitting(true);

      await procurementMethodService.createProcurementMethod({
        ...values,
      });
      toast.success('Tạo mới phương thức lựa chọn nhà thầu thành công');
      setOpen(false);
      refresh();
    } catch {
      toast.error('Tạo mới phương thức lựa chọn nhà thầu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'default'} size={'lg'} className='px-4'>
          <PlusIcon size={16} className='mr-2' />
          <span>Tạo mới</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle>Tạo mới phương thức lựa chọn nhà thầu</DialogTitle>
        </DialogHeader>
        <ProcurementMethodForm
          id='create-procurement-method-form'
          onSubmit={handleSubmit}
        />
        <DialogFooter>
          <Button
            variant={'outline'}
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type='submit'
            form='create-procurement-method-form'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
