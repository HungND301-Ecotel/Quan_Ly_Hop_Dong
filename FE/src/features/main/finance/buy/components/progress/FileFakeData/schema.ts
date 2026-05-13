import { z } from 'zod';

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

// Schema cho một progress period
export const ContractProgressFormSchema = z
  .object({
    id: z.string(),
    paymentScheduleId: z.string().nonempty('Vui lòng chọn đợt thanh toán'),
    totalExecutedQuantity: z.number(),
    totalExecutedAmount: z.number(),
    periodStart: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    periodEnd: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    contractProgressItems: z.array(ContractProgressItemSchema),
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
  .refine(
    (data) => {
      // Kiểm tra ít nhất một vật tư có khối lượng > 0
      return data.contractProgressItems.some(
        (item) => item.currentExecutedQuantity > 0
      );
    },
    {
      message: 'Phải nhập khối lượng thực hiện cho ít nhất một vật tư',
      path: ['contractProgressItems'],
    }
  )
  .refine(
    (data) => {
      // Kiểm tra khối lượng thực hiện không vượt quá remaining
      return data.contractProgressItems.every(
        (item) => item.currentExecutedQuantity <= item.remainingQuantity
      );
    },
    {
      message: 'Khối lượng thực hiện không được vượt quá khối lượng còn lại',
      path: ['contractProgressItems'],
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
  };
