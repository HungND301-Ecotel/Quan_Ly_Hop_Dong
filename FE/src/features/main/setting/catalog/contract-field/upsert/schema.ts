import { z } from 'zod';

export const ContractFieldSchema = z.object({
  name: z.string().min(1, 'Tên lĩnh vực không được để trống'),
  code: z.string().min(1, 'Mã lĩnh vực không được để trống'),
  description: z.string().nullable().optional().or(z.literal('')),
});

export type ContractFieldInformationValues = z.infer<typeof ContractFieldSchema>;

export const ContractFieldInformationDefault: ContractFieldInformationValues = {
  name: '',
  code: '',
  description: '',
};
