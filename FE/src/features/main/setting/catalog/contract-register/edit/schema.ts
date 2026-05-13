import * as z from 'zod';

export const ContractRegisterSchema = z.object({
  name: z.string().min(1, 'Tên sổ theo dõi không được để trống'),
});

export type ContractRegisterInformationValues = z.infer<
  typeof ContractRegisterSchema
>;

export const ContractRegisterInformationDefault: ContractRegisterInformationValues =
  {
    name: '',
  };
