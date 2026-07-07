import { z } from 'zod';

export const createProcurementMethodSchema = z.object({
  code: z.string().min(1, 'Mã hình thức lựa chọn nhà thầu không được để trống'),
  name: z.string().min(1, 'Hình thức lựa chọn nhà thầu không được để trống'),
  description: z
    .string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
});

export type CreateProcurementMethodValues = z.infer<
  typeof createProcurementMethodSchema
>;
