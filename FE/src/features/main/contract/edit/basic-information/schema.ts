import { DiscountType } from '@/constants/discount-type';
import { z } from 'zod';

const ContractGuaranteeItemSchema = z
  .object({
    value: z.coerce
      .number<number>({ error: 'Số không hợp lệ' })
      .nonnegative({ error: 'Phải lớn hơn 0' })
      .optional(),
    valueType: z.coerce.number<number>().optional(),
    durationDate: z.string().optional(),
    bankAccountId: z.string().optional().nullable(),
  })
  .optional();

const uniqueUserIds = (items: { userId: string }[]) => {
  const ids = items.map((item) => item.userId).filter(Boolean);
  return new Set(ids).size === ids.length;
};

export const ContractUserRolesSchema = z.object({
  draftingOfficer: z.array(
    z.object({
      departmentId: z.string().nonempty({ error: 'Không được để trống' }),
      userId: z.string().nonempty({ error: 'Không được để trống' }),
    })
  ).refine(uniqueUserIds, { message: 'Cán bộ, nhân viên không được trùng nhau' }),
  manager: z.array(
    z.object({
      departmentId: z.string().nonempty({ error: 'Không được để trống' }),
      userId: z.string().nonempty({ error: 'Không được để trống' }),
    })
  ).refine(uniqueUserIds, { message: 'Cán bộ, nhân viên không được trùng nhau' }),
  coordinator: z.array(
    z.object({
      departmentId: z.string().nonempty({ error: 'Không được để trống' }),
      userId: z.string().nonempty({ error: 'Không được để trống' }),
    })
  ).refine(uniqueUserIds, { message: 'Cán bộ, nhân viên không được trùng nhau' }),
  receivingOfficer: z.array(
    z.object({
      departmentId: z.string().nonempty({ error: 'Không được để trống' }),
      userId: z.string().nonempty({ error: 'Không được để trống' }),
    })
  ).refine(uniqueUserIds, { message: 'Cán bộ, nhân viên không được trùng nhau' }),
});

export type ContractUserRolesValues = z.infer<typeof ContractUserRolesSchema>;

export const ContractUserRolesDefault: ContractUserRolesValues = {
  draftingOfficer: [{ departmentId: '', userId: '' }],
  manager: [{ departmentId: '', userId: '' }],
  coordinator: [{ departmentId: '', userId: '' }],
  receivingOfficer: [{ departmentId: '', userId: '' }],
};

export const BasicInformationSchema = z
  .object({
    departmentId: z.string().nonempty({ error: 'Không được để trống' }),

    level1CodeId: z.string().nonempty({ error: 'Không được để trống' }),
    level2CodeId: z.string().nonempty({ error: 'Không được để trống' }),
    level3CodeId: z.string().nonempty({ error: 'Không được để trống' }),

    procurementMethodId: z.string().nonempty({ error: 'Không được để trống' }),
    contractStructureId: z.string().nonempty({ error: 'Không được để trống' }),

    contractTypeId: z.string().nonempty({ error: 'Không được để trống' }),
    contractFieldId: z.string().optional().nullable(),
    title: z.string().nonempty({ error: 'Không được để trống' }),
    contractRegisterId: z.string().nonempty({ error: 'Không được để trống' }),
    contractNumber: z.string().nonempty({ error: 'Không được để trống' }),
    appendixNumber: z.string().optional(),

    partnerId: z.string().nonempty({ error: 'Không được để trống' }),

    contractUserRoles: ContractUserRolesSchema,

    startDate: z.iso.date({ error: 'Ngày không hợp lệ' }),
    endDate: z.iso.date({ error: 'Ngày không hợp lệ' }),

    contractFile: z.array(z.file()).nonempty({ error: 'Không được để trống' }),
    attachmentFiles: z.array(z.file()).optional().nullable(),

    discountType: z.coerce
      .number<number>({ error: 'Không hợp lệ' })
      .min(0, { error: 'Không hợp lệ' })
      .max(1, { error: 'Không hợp lệ' })
      .optional(),
    discountValue: z.coerce
      .number<number>({ error: 'Số không hợp lệ' })
      .nonnegative({ error: 'Phải không âm' })
      .optional(),

    contractValue: z.coerce
      .number<number>({ error: 'Số không hợp lệ' })
      .nonnegative({ error: 'Phải lớn hơn 0' })
      .nullable()
      .optional(),
    contractItems: z.array(
      z.object({
        materialId: z.string().nonempty({ error: 'Không được để trống' }),
        quantity: z.coerce
          .number<number>()
          .nonnegative({ error: 'Phải lớn hơn 0' }),
      })
    ),

    contractOthersValue: z.coerce
      .number<number>({ error: 'Số không hợp lệ' })
      .nonnegative({ error: 'Không được âm' })
      .nullable()
      .optional(),
    contractOtherItems: z.array(
      z.object({
        materialId: z.string().nonempty({ error: 'Không được để trống' }),
        quantity: z.coerce
          .number<number>()
          .nonnegative({ error: 'Phải lớn hơn 0' }),
      })
    ),

    paymentSchedules: z.object({
      scheduleType: z.coerce.number<number>().optional().nullable(),

      schedules: z.array(
        z.object({
          amountType: z.coerce
            .number<number>({ error: 'Không hợp lệ' })
            .min(0, { error: 'Không hợp lệ' })
            .max(1, { error: 'Không hợp lệ' }),
          amount: z.coerce
            .number<number>({ error: 'Số không hợp lệ' })
            .optional()
            .nullable(),
          month: z.coerce
            .number<number>({ error: 'Số không hợp lệ' })
            .optional()
            .nullable(),
          year: z.coerce
            .number<number>({ error: 'Số không hợp lệ' })
            .optional()
            .nullable(),
          quarter: z.coerce
            .number<number>({ error: 'Số không hợp lệ' })
            .optional()
            .nullable(),
          fromDate: z.string().optional().nullable(),
          toDate: z.string().optional().nullable(),
          dueDate: z.string().optional().nullable(),
        })
      ),
    }),

    contractGuarantee: z
      .object({
        performanceBondGuarantee: ContractGuaranteeItemSchema,
        warrantyBondGuarantee: ContractGuaranteeItemSchema,
        depositGuarantee: ContractGuaranteeItemSchema,
      })
      .nullable()
      .optional(),

    notes: z.string().optional(),
  })
  .superRefine(
    ({ discountType, discountValue }, ctx) => {
      // if (!contractValue && contractItems.length === 0) {
      //   ctx.addIssue({
      //     code: 'custom',
      //     message: 'Không được bỏ trống',
      //     path: ['contractValue'],
      //   });
      // }

      if (
        discountValue &&
        discountType == DiscountType.Percent.id &&
        (discountValue < 0 || discountValue > 100)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Phải nằm trong khoảng 0-100',
          path: ['discountValue'],
        });
      }
    }
  );

export type BasicInformationValues = z.infer<typeof BasicInformationSchema>;

export const BasicInformationDefault: BasicInformationValues = {
  departmentId: '',

  level1CodeId: '',
  level2CodeId: '',
  level3CodeId: '',

  procurementMethodId: '',
  contractStructureId: '',

  contractTypeId: '',
  contractFieldId: '',
  title: '',
  contractRegisterId: '',
  contractNumber: '',
  appendixNumber: '',

  partnerId: '',

  startDate: '',
  endDate: '',

  contractFile: [] as unknown as File[],
  attachmentFiles: undefined,

  discountType: '' as unknown as number,
  discountValue: '' as unknown as number,

  contractUserRoles: ContractUserRolesDefault,

  contractValue: '' as unknown as number,
  contractItems: [
    {
      materialId: '',
      quantity: '' as unknown as number,
    },
  ],

  contractOthersValue: '' as unknown as number,
  contractOtherItems: [
    {
      materialId: '',
      quantity: '' as unknown as number,
    },
  ],

  paymentSchedules: {
    scheduleType: '' as unknown as number,
    schedules: [],
  },

  contractGuarantee: {
    performanceBondGuarantee: {
      value: '' as unknown as number,
      valueType: '' as unknown as number,
      durationDate: '',
      bankAccountId: '',
    },
    warrantyBondGuarantee: {
      value: '' as unknown as number,
      valueType: '' as unknown as number,
      durationDate: '',
      bankAccountId: '',
    },
    depositGuarantee: {
      value: '' as unknown as number,
      valueType: '' as unknown as number,
      durationDate: '',
      bankAccountId: '',
    },
  },

  notes: '',
};

// End of file
