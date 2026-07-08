import { z } from 'zod';

export const Level3CodeSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  level1CodeId: z.string().min(1, 'Mã cấp 1 không được để trống'),
  level2CodeId: z.string().min(1, 'Mã cấp 2 không được để trống'),
  suffix: z.string().min(1, 'Mã số không được để trống'),
});

export type Level3CodeValues = z.infer<typeof Level3CodeSchema>;

export const Level3CodeDefault: Level3CodeValues = {
  code: '',
  description: '',
  level1CodeId: '',
  level2CodeId: '',
  suffix: '',
};
