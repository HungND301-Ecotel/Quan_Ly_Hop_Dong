import * as z from 'zod';

export const MaterialSchema = z.object({
  materialCode: z.string(),
  name: z.string().min(1, 'Tên vật tư không được để trống'),
  unitOfMeasureId: z.string().min(1, 'Đơn vị tính không được để trống'), // ✅ đổi
  price: z.coerce.number<number>().min(1, 'Giá không được để trống'),
});

export type MaterialInformationValues = z.infer<typeof MaterialSchema>;

export const MaterialInformationDefault: MaterialInformationValues = {
  materialCode: '',
  name: '',
  unitOfMeasureId: '', // ✅ đổi
  price: 0,
};