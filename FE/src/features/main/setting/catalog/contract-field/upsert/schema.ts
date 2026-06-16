import { z } from 'zod';

export const ContractFieldSchema = z.object({
  name: z.string().min(1, 'Lĩnh vực hợp đồng không được để trống'),
  description: z.string().nullable().optional(),
});

export type ContractFieldInformationValues = z.infer<typeof ContractFieldSchema>;

export const ContractFieldInformationDefault: ContractFieldInformationValues = {
  name: '',
  description: '',
};
