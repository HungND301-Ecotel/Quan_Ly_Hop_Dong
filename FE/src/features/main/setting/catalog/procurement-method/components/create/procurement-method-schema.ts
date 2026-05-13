import { z } from 'zod';

export const createProcurementMethodSchema = z.object({
  code: z.string().min(1, 'Mã phương thức là bắt buộc'),
  name: z.string().min(1, 'Tên phương thức là bắt buộc'),
});

export type CreateProcurementMethodValues = z.infer<
  typeof createProcurementMethodSchema
>;
