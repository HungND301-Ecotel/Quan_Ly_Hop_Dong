import * as z from 'zod';

export const PartnerSchema = z.object({
  name: z.string().min(1, 'Tên đối tác không được để trống'),
  taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  contactPerson: z.string().min(1, 'Người đại diện không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
});

export type PartnerInformationValues = z.infer<typeof PartnerSchema>;

export const PartnerInformationDefault: PartnerInformationValues = {
  name: '',
  taxCode: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
};
