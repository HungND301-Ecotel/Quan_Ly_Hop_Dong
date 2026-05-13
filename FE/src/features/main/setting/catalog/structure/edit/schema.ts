import { z } from 'zod';
 
export const ContractStructureCatalogSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
});
 
export type ContractStructureCatalogValues = z.infer<typeof ContractStructureCatalogSchema>;
 
export const ContractStructureCatalogDefault: ContractStructureCatalogValues = {
  name: '',
};
 