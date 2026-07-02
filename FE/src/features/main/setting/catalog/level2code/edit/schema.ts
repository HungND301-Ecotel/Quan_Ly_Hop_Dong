import { z } from 'zod';

export const Level2CodeSchema = z.object({
  code: z.string().min(1, 'Mã cấp 2 không được để trống'),
  description: z.string().optional(),
  level1CodeId: z.string().min(1, 'Vui lòng chọn mã cấp 1'),
});

export type Level2CodeValues = z.infer<typeof Level2CodeSchema>;

export const Level2CodeDefault: Level2CodeValues = {
  code: '',
  description: '',
  level1CodeId: '',
};
