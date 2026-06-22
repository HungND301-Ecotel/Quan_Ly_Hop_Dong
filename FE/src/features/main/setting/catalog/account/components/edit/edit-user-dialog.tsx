import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Department } from '@/services/department/type';
import { Position } from '@/services/postion/type';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateUserFormValues } from '../create/user-form-schema';
import { UserForm } from '../form/user-form';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: Position[];
  departments: Department[];
  refresh: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  positions,
  departments,
  refresh,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<CreateUserFormValues> = {
    userName: user.userName,
    fullname: user.fullname,
    phoneNumber: user.phoneNumber,
    email: user.email,
    positionId: user.positionId,
    departmentId: user.departmentId || '',
  };

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      setIsSubmitting(true);
      await userService.updateUser({
        id: user.id,
        fullname: values.fullname,
        phoneNumber: values.phoneNumber,
        email: values.email,
        positionId: values.positionId,
        department: values.departmentId,
      });
      toast.success('Cập nhật người dùng thành công');
      onOpenChange(false);
      refresh();
    } catch {
      toast.error('Cập nhật người dùng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>
        <UserForm
          id='edit-user-form'
          positions={positions}
          departments={departments}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isEdit={true}
        />
        <DialogFooter>
          <Button
            variant={'outline'}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type='submit' form='edit-user-form' disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
