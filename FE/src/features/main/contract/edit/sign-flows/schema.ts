import z from 'zod';

export const SignFlowsSchema = z.object({
  signers: z.array(
    z.object({
      departmentId: z
        .string({ error: 'Không được để trống' })
        .nonempty({ error: 'Phòng ban không được để trống' }),
      signerId: z
        .string({ error: 'Không được để trống' })
        .nonempty({ error: 'Thành phần ký không được để trống' }),
      signTypeId: z
        .string({ error: 'Không được để trống' })
        .nonempty({ error: 'Loại chữ ký không được để trống' }),
      // id: z.string().optional(),),
    })
  ),
});

export type SignFlowsValues = z.infer<typeof SignFlowsSchema>;

export const SignFlowsDefault: SignFlowsValues = {
  signers: [
    {
      departmentId: '',
      signerId: '',
      signTypeId: '',
    },
  ],
};
