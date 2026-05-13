import * as z from 'zod';
 
export const UnitOfMeasureSchema = z.object({
  code: z.string().min(1, 'Mã đơn vị tính không được để trống'),
  name: z.string().min(1, 'Tên đơn vị tính không được để trống'),
});
 
export type UnitOfMeasureValues = z.infer<typeof UnitOfMeasureSchema>;
 
export const UnitOfMeasureDefault: UnitOfMeasureValues = {
  code: '',
  name: '',
};
 