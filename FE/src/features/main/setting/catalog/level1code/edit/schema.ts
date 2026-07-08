import { z } from 'zod';

export const Level1CodeSchema = z.object({
  code: z.string().min(1, 'Mã cấp 1 không được để trống'),
  description: z.string().optional(),
  contractTypeId: z.string().min(1, 'Loại hợp đồng không được để trống'),
  contractRegisterId: z.string().optional().nullable().or(z.literal('')),
});

export type Level1CodeValues = z.infer<typeof Level1CodeSchema>;

export const Level1CodeDefault: Level1CodeValues = {
  code: '',
  description: '',
  contractTypeId: '',
  contractRegisterId: '',
};
