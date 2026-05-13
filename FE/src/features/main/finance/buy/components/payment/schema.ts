import { z } from 'zod';

export const ImplementationProgressSchema = z.object({
  id: z.string(),
  period: z.string(), // Ví dụ: "Q1/2024", "01/2024", "01/01/2024 - 31/01/2024"
  quantity: z.number(), // Khối lượng thực hiện
  value: z.number(), // Giá trị thực hiện
});

export const PaymentSchema = z.object({
  installments: z.array(
    z.object({
      id: z.string().optional(),
      scheduleId: z.string().optional(),
      period: z.number().nonnegative({ error: 'Không được âm' }),
      periodLabel: z.string().optional(),
      paidAmount: z.coerce
        .number<number>({ error: 'Không được để trống' })
        .nonnegative({ error: 'Số lượng không được âm' }),
      scheduledAmount: z.number().optional(),
      paymentStatus: z.number().optional(),
      paymentDate: z.string().nonempty({ message: 'Không được để trống' }),
      documents: z.object({
        acceptanceMinute: z.array(z.string()).optional(),
        invoice: z.array(z.string()).optional(),
        tax: z.array(z.string()).optional(),
      }),
    })
  ),
});

export type PaymentFormValues = z.infer<typeof PaymentSchema>;

export const PaymentDefault: PaymentFormValues = {
  installments: [],
};
