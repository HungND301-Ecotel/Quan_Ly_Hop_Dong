import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phương thức lựa chọn nhà thầu</DialogTitle>
        </DialogHeader>
        <ProcurementMethodForm
          id='edit-procurement-method-form'
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        />
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
      </DialogContent>
    </Dialog>
  );
}
