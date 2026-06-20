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
      contractPaymentId: z.string().nullable().optional(),
      executedAmount: z.coerce.number().optional(),
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

// Schema cho một vật tư trong progress
export const ContractProgressItemSchema = z.object({
  id: z.string(),
  contractItemId: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  unit: z.string(),
  unitPrice: z.number(),
  contractQuantity: z.number(),
  contractAmount: z.number(),
  executedQuantity: z.number(),
  remainingQuantity: z.number(),
  currentExecutedQuantity: z.number().min(0, 'Khối lượng phải lớn hơn 0'),
  currentExecutedAmount: z.number(),
});

export const ContractProgressFormSchema = z
  .object({
    id: z.string(),
    paymentScheduleId: z.string().nullable().optional(),
    totalExecutedQuantity: z.number(),
    totalExecutedAmount: z.number(),
    periodStart: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    periodEnd: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    contractProgressItems: z.array(ContractProgressItemSchema),
    isHasValue: z.boolean().optional(),
    isHasMaterial: z.boolean().optional(),
    contractPaymentId: z.string().optional().nullable(),
    executedAmount: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (!data.periodStart || !data.periodEnd) return true;
      return new Date(data.periodStart) <= new Date(data.periodEnd);
    },
    {
      message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
      path: ['periodEnd'],
    }
  )
  // Khối lượng vật tư chỉ để theo dõi, không bắt buộc nhập
  .refine(
    (data) => {
      if (data.isHasMaterial === false) return true;
      // Kiểm tra khối lượng thực hiện không vượt quá remaining
      return data.contractProgressItems.every(
        (item) => item.currentExecutedQuantity <= item.remainingQuantity
      );
    },
    {
      message: 'Khối lượng thực hiện không được vượt quá khối lượng còn lại',
      path: ['contractProgressItems'],
    }
  )
  .refine(
    (data) => {
      return (data.executedAmount ?? 0) > 0;
    },
    {
      message: 'Vui lòng nhập số tiền thực hiện lớn hơn 0',
      path: ['executedAmount'],
    }
  );

export type ContractProgressFormValues = z.infer<
  typeof ContractProgressFormSchema
>;

// Default values cho form mới
export const ContractProgressFormDefault: Partial<ContractProgressFormValues> =
  {
    id: '',
    paymentScheduleId: '',
    periodStart: '',
    periodEnd: '',
    totalExecutedQuantity: 0,
    totalExecutedAmount: 0,
    contractProgressItems: [],
    isHasValue: false,
    isHasMaterial: false,
    contractPaymentId: '',
    executedAmount: 0,
  };
