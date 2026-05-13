import { z } from 'zod';

export const ProgressItemSchema = z.object({
  contractProgressId: z.string().nonempty({ error: 'Không được để trống' }),
  items: z.array(
    z.object({
      id: z.string().nonempty({ error: 'Không được để trống' }),
      contractItemId: z.string().nonempty({ error: 'Không được để trống' }),
      executedQuantity: z.coerce
        .number<number>({ error: 'Không được để trống' })
        .nonnegative({ error: 'Số lượng không được âm' }),
      maxExecutableQuantity: z.coerce.number<number>().optional(),
    })
  ),
});
export type ProgressItemFormValues = z.infer<typeof ProgressItemSchema>;
export const ProgressItemDefault: ProgressItemFormValues = {
  contractProgressId: '',
  items: [
    {
      id: '',
      contractItemId: '',
      executedQuantity: 0,
    },
  ],
};

export const ContractProgressBatchSchema = z.object({
  contractId: z.string(),
  items: z.array(
    z.object({
      contractProgressId: z.string().optional(),
      periodStart: z.string().min(1, { message: 'Vui lòng chọn ngày bắt đầu' }),
      periodEnd: z.string().min(1, { message: 'Vui lòng chọn ngày kết thúc' }),
      progressTotal: z.coerce.number<number>().optional(),
    })
  ),
});

export type ContractProgressBatchFormValues = z.infer<
  typeof ContractProgressBatchSchema
>;

export type ContractProgressFormItem =
  ContractProgressBatchFormValues['items'][number];

export const ContractProgressBatchDefault: ContractProgressBatchFormValues = {
  contractId: '',
  items: [],
};
