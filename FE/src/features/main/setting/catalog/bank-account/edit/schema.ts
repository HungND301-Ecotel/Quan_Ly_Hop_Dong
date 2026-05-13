import { z } from 'zod';

export const BankAccountSchema = z.object({
  bankName: z.string().min(1, 'Vui lòng nhập tên ngân hàng'),
  accountNumber: z.string().min(1, 'Vui lòng nhập số tài khoản'),
  accountHolder: z.string().min(1, 'Vui lòng nhập tên chủ tài khoản'),
  isActive: z.boolean(),
});

export type BankAccountValues = z.infer<typeof BankAccountSchema>;

export const BankAccountDefault: BankAccountValues = {
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  isActive: true,
};