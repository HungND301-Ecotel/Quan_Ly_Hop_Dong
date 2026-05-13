import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { CreateProcurementMethodValues } from '../create/procurement-method-schema';
import { ProcurementMethodForm } from '../form/procurement-method-form';

interface ProcurementMethodDetailDialogProps {
  procurement_method: ProcurementMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcurementMethodDetailDialog({
  procurement_method,
  open,
  onOpenChange,
}: ProcurementMethodDetailDialogProps) {
  const defaultValues: Partial<CreateProcurementMethodValues> = {
    code: procurement_method.code,
    name: procurement_method.name,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle>Chi tiết phương thức lựa chọn nhà thầu</DialogTitle>
        </DialogHeader>
        <ProcurementMethodForm
          id='view-procurement-method-form'
          defaultValues={defaultValues}
          readOnly
        />
        <DialogFooter>
          <Button variant={'outline'} onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
