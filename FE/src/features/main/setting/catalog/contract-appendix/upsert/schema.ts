import { z } from 'zod';

export const ContractAppendixSchema = z.object({
  appendixNumber: z.string().min(1, 'Số phụ lục hợp đồng không được để trống'),
  contractNumberId: z.string().min(1, 'Vui lòng chọn Số hợp đồng'),
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
