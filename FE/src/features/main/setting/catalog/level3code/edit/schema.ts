import { z } from 'zod';
 
export const Level3CodeSchema = z.object({
  code: z.string().min(1, 'Mã cấp 3 không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  level1CodeId: z.string().min(1, 'Vui lòng chọn mã cấp 1'),
});
 
export type Level3CodeValues = z.infer<typeof Level3CodeSchema>;
 
export const Level3CodeDefault: Level3CodeValues = {
  code: '',
  description: '',
  level1CodeId: '',
};