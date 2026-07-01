import { z } from 'zod';

export const createProcurementMethodSchema = z.object({
  code: z.string().min(1, 'Mã hình thức là bắt buộc'),
  name: z.string().min(1, 'Tên hình thức là bắt buộc'),
  description: z
    .string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
});

export type CreateProcurementMethodValues = z.infer<
  typeof createProcurementMethodSchema
>;
