import { z } from 'zod';
 
export const SignedContentSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  level3CodeId: z.string().min(1, 'Vui lòng chọn mã cấp 3'),
});
 
export type SignedContentValues = z.infer<typeof SignedContentSchema>;
 
export const SignedContentDefault: SignedContentValues = {
  title: '',
  level3CodeId: '',
};