import { z } from 'zod';

export const ContractNumberSchema = z.object({
  number: z.string().min(1, 'Số hợp đồng không được để trống'),
  signNumber: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type ContractNumberInformationValues = z.infer<
  typeof ContractNumberSchema
>;

export const ContractNumberInformationDefault: ContractNumberInformationValues =
  {
    number: '',
    signNumber: '',
    description: '',
  };
