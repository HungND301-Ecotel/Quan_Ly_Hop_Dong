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
import { User } from '@/types/user.type';
import { CreateUserFormValues } from '../create/user-form-schema';
import { UserForm } from '../form/user-form';

interface UserDetailDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: Position[];
  departments: Department[];
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  positions,
  departments,
}: UserDetailDialogProps) {
  const defaultValues: Partial<CreateUserFormValues> = {
    userName: user.userName,
    fullname: user.fullname,
    phoneNumber: user.phoneNumber,
    email: user.email,
    positionId: user.positionId,
    departmentId: user.departmentId || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>
        <UserForm
          id='view-user-form'
          positions={positions}
          departments={departments}
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
