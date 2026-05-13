import { z } from 'zod';

export const ContractRejectSchema = z.object({
  reason: z.string().nonempty('Vui lòng nhập lý do từ chối hợp đồng'),
});

export type ContractRejectValue = z.infer<typeof ContractRejectSchema>;

export const ContractRejectDefault: ContractRejectValue = {
  reason: '',
};
