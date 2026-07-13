import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Department } from '@/services/department/type';
import { Position } from '@/services/postion/type';
import { userService } from '@/services/user';
import { PlusIcon, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserForm } from '../form/user-form';
import { CreateUserFormValues } from './user-form-schema';

interface CreateUserDialogProps {
  positions: Position[];
  departments: Department[];
  refresh: () => void;
}

export function CreateUserDialog({
  positions,
  departments,
  refresh,
}: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      setIsSubmitting(true);
      await userService.createUser({
        ...values,
        userRole: parseInt(values.userRole),
      });
      toast.success('Tạo mới nhân viên thành công');
      setOpen(false);
      refresh();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        error?.message ||
        'Tạo mới nhân viên thất bại';
      toast.error(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'default'} size={'lg'} className='px-4'>
          <PlusIcon size={16} />
          <span>Tạo mới</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-175'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>
            Tạo mới nhân viên
          </DialogTitle>
        </DialogHeader>
        <UserForm
          id='create-user-form'
          positions={positions}
          departments={departments}
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
          <Button type='submit' form='create-user-form' disabled={isSubmitting}>
            <Save className='w-4 h-4' />
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
