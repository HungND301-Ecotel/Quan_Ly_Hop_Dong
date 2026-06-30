import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await userService.resetPassword(user.id);
      toast.success(`Đã reset mật khẩu của tài khoản "${user.userName}" về 123456 thành công`);
      onOpenChange(false);
    } catch {
      toast.error('Reset mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset mật khẩu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn reset mật khẩu của người dùng <strong>{user.fullname}</strong> ({user.userName}) về mặc định <strong>123456</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang reset...' : 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
