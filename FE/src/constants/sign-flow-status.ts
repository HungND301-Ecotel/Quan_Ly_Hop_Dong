import { Status } from './contract-status';

export const SignFlowStatus: Record<string, Status> = {
  RequiresRevision: {
    id: 1,
    title: 'Yêu cầu chỉnh sửa',
    background: '',
    foreground: '',
  },
  Pending: {
    id: 2,
    title: 'Chờ ký',
    background: 'bg-blue-500',
    foreground: 'text-white',
  },
  Signed: {
    id: 3,
    title: 'Đã ký',
    background: 'bg-green-500',
    foreground: 'text-white',
  },
  Rejected: {
    id: 4,
    title: 'Từ chối',
    background: 'bg-red-500',
    foreground: 'text-white',
  },
  Skipped: {
    id: 5,
    title: 'Bỏ qua',
    background: 'bg-gray-500',
    foreground: 'text-white',
  },
} as const;
