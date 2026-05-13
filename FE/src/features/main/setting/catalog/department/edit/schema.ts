import * as z from 'zod';

export const DepartmentSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban không được để trống'),
  code: z.string().min(1, 'Mã phòng ban không được để trống'),
});

export type DepartmentInformationValues = z.infer<typeof DepartmentSchema>;

export const DepartmentInformationDefault: DepartmentInformationValues = {
  name: '',
  code: '',
};
