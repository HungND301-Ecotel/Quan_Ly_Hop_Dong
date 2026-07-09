import { z } from 'zod';

export const ContractStructureCatalogSchema = z.object({
  name: z.string().min(1, 'Hình thức hợp đồng không được để trống'),
  code: z.string().optional().nullable().or(z.literal('')),
  description: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type ContractStructureCatalogValues = z.infer<
  typeof ContractStructureCatalogSchema
>;

export const ContractStructureCatalogDefault: ContractStructureCatalogValues = {
  name: '',
  code: '',
  description: '',
  isActive: true,
};
