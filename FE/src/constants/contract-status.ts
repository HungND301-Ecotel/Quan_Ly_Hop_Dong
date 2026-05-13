export type Status = {
  id: number;
  title: string;
  background: string;
  foreground: string;
};

export const ContractStatus: Record<string, Status> = {
  Draft: {
    id: 1,
    title: 'Soạn thảo',
    background: 'bg-pink-500',
    foreground: 'text-white',
  },
  PendingApproval: {
    id: 2,
    title: 'Chờ phê duyệt',
    background: 'bg-blue-500',
    foreground: 'text-white',
  },
  Active: {
    id: 3,
    title: 'Hiệu lực',
    background: 'bg-green-500',
    foreground: 'text-white',
  },
  Expired: {
    id: 4,
    title: 'Hết hạn',
    background: 'bg-yellow-500',
    foreground: 'text-white',
  },
  Cancelled: {
    id: 7,
    title: 'Hủy',
    background: 'bg-red-500',
    foreground: 'text-white',
  },
  Liquidated: {
    id: 5,
    title: 'Thanh lý',
    background: 'bg-orange-500',
    foreground: 'text-white',
  },
  Archive: {
    id: 6,
    title: 'Lưu trữ',
    background: 'bg-gray-500',
    foreground: 'text-white',
  },
} as const;

export const ContractSubStatus: Record<string, Status> = {
  // DRAFT — hồng nhạt
  SavedDraft: {
    id: 0,
    title: 'Lưu nháp',
    background: 'bg-pink-400',
    foreground: 'text-white',
  },

  // PENDING_APPROVAL — xanh dương nhạt
  AwaitingSigning: {
    id: 1,
    title: 'Chờ ',
    background: 'bg-blue-400',
    foreground: 'text-white',
  },
  Rejected: {
    id: 2,
    title: 'Từ chối',
    background: 'bg-blue-400',
    foreground: 'text-white',
  },
  WaitPartnerSign: {
    id: 3,
    title: 'Chờ đối tác ký',
    background: 'bg-blue-400',
    foreground: 'text-white',
  },

  // ACTIVE — xanh lá nhạt
  NotStarted: {
    id: 15,
    title: 'Chưa thực hiện',
    background: 'bg-green-400',
    foreground: 'text-white',
  },
  InProgress: {
    id: 4,
    title: 'Đang thực hiện',
    background: 'bg-green-400',
    foreground: 'text-white',
  },
  InPayment: {
    id: 5,
    title: 'Đang nghiệm thu',
    background: 'bg-green-400',
    foreground: 'text-white',
  },
  InAcceptance: {
    id: 6,
    title: 'Đang thanh toán',
    background: 'bg-green-400',
    foreground: 'text-white',
  },
  Paused: {
    id: 7,
    title: 'Tạm dừng',
    background: 'bg-green-400',
    foreground: 'text-white',
  },

  // EXPIRED — vàng nhạt
  NearExpiry: {
    id: 8,
    title: 'Sắp hết hạn',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },
  Overdue: {
    id: 9,
    title: 'Đã hết hạn',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },
  ExtensionAwaiting: {
    id: 10,
    title: 'Chờ gia hạn',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },
  ExpiredMissingAcceptance: {
    id: 16,
    title: 'Thiếu file nghiệm thu',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },
  ExpiredMissingPayment: {
    id: 17,
    title: 'Thiếu file thanh toán',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },
  ExpiredMissingLiquidation: {
    id: 18,
    title: 'Thiếu file thanh lý',
    background: 'bg-yellow-400',
    foreground: 'text-white',
  },

  // LIQUIDATED — cam nhạt
  LiquidatedDone: {
    id: 11,
    title: 'Đã thanh lý',
    background: 'bg-orange-400',
    foreground: 'text-white',
  },
  CancelledBeforeEffective: {
    id: 12,
    title: 'Hủy trước hiệu lực',
    background: 'bg-red-400',
    foreground: 'text-white',
  },
  TerminatedEarly: {
    id: 13,
    title: 'Hủy khi đang hiệu lực',
    background: 'bg-red-400',
    foreground: 'text-white',
  },
  Closed: {
    id: 14,
    title: 'Đóng hợp đồng',
    background: 'bg-orange-400',
    foreground: 'text-white',
  },

  // ARCHIVE — xám nhạt
  ArchivedAfterLiquidation: {
    id: 19,
    title: 'Sau thanh lý',
    background: 'bg-gray-400',
    foreground: 'text-white',
  },
  ArchivedAfterCancellation: {
    id: 20,
    title: 'Sau hủy',
    background: 'bg-gray-400',
    foreground: 'text-white',
  },
} as const;

export const StatusMapping: Record<string, string[]> = {
  Draft: ['SavedDraft'],
  PendingApproval: ['AwaitingSigning', 'Rejected', 'WaitPartnerSign'],
  Active: ['NotStarted', 'InProgress', 'InPayment', 'InAcceptance', 'Paused'],
  Expired: [
    'NearExpiry',
    'Overdue',
    'ExtensionAwaiting',
    'ExpiredMissingAcceptance',
    'ExpiredMissingPayment',
    'ExpiredMissingLiquidation',
  ],
  Cancelled: ['CancelledBeforeEffective', 'TerminatedEarly'],
  Liquidated: [
    'LiquidatedDone',
    'Closed',
  ],
  Archive: ['ArchivedAfterLiquidation', 'ArchivedAfterCancellation'],
};