import * as z from 'zod';

export const DepartmentSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban không được để trống'),
  code: z.string().min(1, 'Mã phòng ban không được để trống'),
  description: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional().or(z.literal('')),
});

export type DepartmentInformationValues = z.infer<typeof DepartmentSchema>;

export const DepartmentInformationDefault: DepartmentInformationValues = {
  name: '',
  code: '',
  description: '',
};
