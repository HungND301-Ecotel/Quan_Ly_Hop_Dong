import { z } from 'zod';

export const ContractAppendixSchema = z.object({
  appendixNumber: z.string().min(1, 'Số phụ lục hợp đồng không được để trống'),
  contractNumberId: z.string().min(1, 'Số hợp đồng không được để trống'),
  description: z.string().nullable().optional(),
});

export type ContractAppendixInformationValues = z.infer<
  typeof ContractAppendixSchema
>;

export const ContractAppendixInformationDefault: ContractAppendixInformationValues =
  {
    appendixNumber: '',
    contractNumberId: '',
    description: '',
  };
