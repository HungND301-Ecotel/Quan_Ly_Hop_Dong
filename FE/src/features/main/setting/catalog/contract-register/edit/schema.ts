import * as z from 'zod';

export const ContractRegisterSchema = z.object({
  name: z.string().min(1, 'Tên sổ theo dõi không được để trống'),
  year: z.number().int().min(1900, 'Năm không hợp lệ'),
  description: z.string().optional().nullable(),
});

export type ContractRegisterInformationValues = z.infer<
  typeof ContractRegisterSchema
>;

export const ContractRegisterInformationDefault: ContractRegisterInformationValues =
  {
    name: '',
    year: new Date().getFullYear(),
    description: '',
  };
