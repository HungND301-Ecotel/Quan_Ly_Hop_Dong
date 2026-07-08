import { z } from 'zod';

export const BankAccountSchema = z.object({
  bankName: z.string().min(1, 'Tên ngân hàng không được để trống'),
  accountNumber: z.string().min(1, 'Số tài khoản không được để trống'),
  accountHolder: z.string().min(1, 'Tên chủ tài khoản không được để trống'),
  isActive: z.boolean(),
  note: z.string().optional(),
});

export type BankAccountValues = z.infer<typeof BankAccountSchema>;

export const BankAccountDefault: BankAccountValues = {
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  isActive: true,
  note: '',
};
