import { z } from 'zod';

export const createUserSchema = z.object({
  userName: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  fullname: z.string().min(1, 'Họ và tên là bắt buộc'),
  phoneNumber: z
    .string()
    .min(10, 'Số điện thoại không hợp lệ')
    .max(11, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  userRole: z.string().min(1, 'Vui lòng chọn vai trò'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  positionId: z.string().min(1, 'Vui lòng chọn chức vụ'),
  employeeCode: z.string().optional(),
  note: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
