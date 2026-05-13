import { z } from 'zod';

export const ContractFormatSchema = z.object({
  contractFormat: z.coerce.number<number>().min(0).max(3),
  parentContractId: z.string().optional().nullable(),
  linkedContractId: z.string().optional(),
  isDebtTrackingEnabled: z.boolean().optional(),
});

export type ContractFormatValues = z.infer<typeof ContractFormatSchema>;

export const ContractFormatDefault: ContractFormatValues = {
  contractFormat: 0,
  parentContractId: '',
  linkedContractId: '',
  isDebtTrackingEnabled: true,
};
