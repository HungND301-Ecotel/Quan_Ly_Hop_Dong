import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
        code: values.code,
        name: values.name,
        description: values.description || null,
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
      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Tạo mới hình thức lựa chọn nhà thầu
          </DialogTitle>
          <DialogDescription>
            Tạo mới thông tin hình thức lựa chọn nhà thầu
          </DialogDescription>
        </DialogHeader>
        <ProcurementMethodForm
          id='create-procurement-method-form'
          onSubmit={handleSubmit}
        />
        <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
