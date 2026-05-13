export const ContractAction = {
  Approve: 0,
  Reject: 1,
  RequestRevision: 2,
  Created: 3,
} as const;

export type ContractAction =
  (typeof ContractAction)[keyof typeof ContractAction];

export const ContractActionMap: Record<string | number, {
  title: string;
  background: string;
  foreground: string;
}> = {
  // Số từ BE
  0: { title: 'Đã duyệt', background: 'bg-green-500', foreground: 'text-white' },
  1: { title: 'Đã từ chối', background: 'bg-red-500', foreground: 'text-white' },
  2: { title: 'Yêu cầu sửa đổi', background: 'bg-yellow-500', foreground: 'text-white' },
  3: { title: 'Đã tạo', background: 'bg-blue-500', foreground: 'text-white' },
  4: { title: 'Gửi phê duyệt', background: 'bg-blue-400', foreground: 'text-white' },
  5: { title: 'Chờ đối tác ký', background: 'bg-purple-500', foreground: 'text-white' },
  6: { title: 'Đối tác đã ký', background: 'bg-green-400', foreground: 'text-white' },
  7: { title: 'Kích hoạt', background: 'bg-green-500', foreground: 'text-white' },
  8: { title: 'Tạm dừng', background: 'bg-amber-400', foreground: 'text-white' },
  9: { title: 'Tiếp tục', background: 'bg-green-400', foreground: 'text-white' },
  10: { title: 'Đã hủy', background: 'bg-red-400', foreground: 'text-white' },
  11: { title: 'Đã thanh lý', background: 'bg-gray-600', foreground: 'text-white' },
  12: { title: 'Đóng hợp đồng', background: 'bg-black', foreground: 'text-white' },
};