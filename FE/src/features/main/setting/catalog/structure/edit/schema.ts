import { z } from 'zod';
 
export const ContractStructureCatalogSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  code: z.string().min(1, 'Mã không được để trống'),
  description: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional().or(z.literal('')),
});
 
export type ContractStructureCatalogValues = z.infer<typeof ContractStructureCatalogSchema>;
 
export const ContractStructureCatalogDefault: ContractStructureCatalogValues = {
  name: '',
  code: '',
  description: '',
};
 