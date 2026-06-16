import { z } from 'zod';
 
export const Level3CodeSchema = z.object({
  code: z.string(),
  description: z.string().min(1, 'Mô tả không được để trống'),
  level1CodeId: z.string().min(1, 'Vui lòng chọn mã cấp 1'),
  level2CodeId: z.string().min(1, 'Vui lòng chọn mã cấp 2'),
  suffix: z.string().min(1, 'Vui lòng nhập số đuôi'),
});
 
export type Level3CodeValues = z.infer<typeof Level3CodeSchema>;
 
export const Level3CodeDefault: Level3CodeValues = {
  code: '',
  description: '',
  level1CodeId: '',
  level2CodeId: '',
  suffix: '',
};