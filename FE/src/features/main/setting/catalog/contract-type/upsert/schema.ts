import { z } from 'zod';

export const ContractTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại hợp đồng không được để trống'),
  code: z.string().min(1, 'Mã loại hợp đồng không được để trống'),
  description: z.string().nullable().optional(),
});

export type ContractTypeInformationValues = z.infer<typeof ContractTypeSchema>;

export const ContractTypeInformationDefault: ContractTypeInformationValues = {
  name: '',
  code: '',
  description: '',
};
