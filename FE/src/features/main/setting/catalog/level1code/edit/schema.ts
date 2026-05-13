import { z } from 'zod';
 
export const Level1CodeSchema = z.object({
  code: z.string().min(1, 'Mã cấp 1 không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  contractTypeId: z.string().min(1, 'Vui lòng chọn loại hợp đồng'),
});
 
export type Level1CodeValues = z.infer<typeof Level1CodeSchema>;
 
export const Level1CodeDefault: Level1CodeValues = {
  code: '',
  description: '',
  contractTypeId: '',
};
 