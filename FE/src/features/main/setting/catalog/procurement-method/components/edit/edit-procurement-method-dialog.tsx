import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { procurementMethodService } from '@/services/procurement-method';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateProcurementMethodValues } from '../create/procurement-method-schema';
import { ProcurementMethodForm } from '../form/procurement-method-form';

interface EditProcurementMethodDialogProps {
  procurement_method: ProcurementMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void;
}

export function EditProcurementMethodDialog({
  procurement_method,
  open,
  onOpenChange,
  refresh,
}: EditProcurementMethodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<CreateProcurementMethodValues> = {
    code: procurement_method.code,
    name: procurement_method.name,
    description: procurement_method.description || '',
  };

  const handleSubmit = async (values: CreateProcurementMethodValues) => {
    try {
      setIsSubmitting(true);
      await procurementMethodService.updateProcurementMethod({
        id: procurement_method.id,
        code: values.code,
        name: values.name,
        description: values.description || null,
      });
      toast.success('Cập nhật phương thức thành công');
      onOpenChange(false);
      refresh();
    } catch {
      toast.error('Cập nhật phương thức thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Cập nhật hình thức lựa chọn nhà thầu
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin hình thức lựa chọn nhà thầu
          </DialogDescription>
        </DialogHeader>
        <ProcurementMethodForm
          id='edit-procurement-method-form'
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        />
        <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
          <DialogFooter>
            <Button
              variant={'outline'}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              form='edit-procurement-method-form'
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
