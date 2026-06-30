import * as z from 'zod';

export const MaterialSchema = z.object({
  materialCode: z.string(),
  name: z.string().min(1, 'Tên vật tư không được để trống'),
  unitOfMeasureId: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  description: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional().or(z.literal('')),
});

export type MaterialInformationValues = z.infer<typeof MaterialSchema>;

export const MaterialInformationDefault: MaterialInformationValues = {
  materialCode: '',
  name: '',
  unitOfMeasureId: '',
  price: undefined,
  description: '',
};