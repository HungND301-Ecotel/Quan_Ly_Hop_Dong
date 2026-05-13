export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  createdAt: string;
  link?: string;
}

export const mockNotifications: Notification[] = [
  // 1. Hợp đồng nguyên tắc chờ duyệt
  {
    id: 'N001',
    userId: '2', // Trần Thị B - Trưởng phòng KD
    title: 'Hợp đồng nguyên tắc cần duyệt',
    message: 'HĐNT-004 đang chờ bạn phê duyệt (Pháp chế)',
    type: 'WARNING',
    read: false,
    createdAt: '2024-12-15T08:30:00',
    link: '/contracts/NT-004',
  },
  {
    id: 'N002',
    userId: '4', // Phạm Thị D - Pháp chế
    title: 'Hợp đồng nguyên tắc cần duyệt',
    message: 'HĐNT-004 đang chờ bạn duyệt pháp lý',
    type: 'WARNING',
    read: false,
    createdAt: '2024-12-15T08:30:00',
    link: '/contracts/NT-004',
  },
  {
    id: 'N003',
    userId: '1', // Nguyễn Văn A - Giám đốc
    title: 'Hợp đồng nguyên tắc cần ký',
    message: 'HĐNT-007 đang chờ bạn ký phê duyệt',
    type: 'WARNING',
    read: false,
    createdAt: '2024-06-20T09:30:00',
    link: '/contracts/NT-007',
  },
  {
    id: 'N004',
    userId: '2',
    title: 'Hợp đồng nguyên tắc cần duyệt',
    message: 'HĐNT-012 đang chờ bạn kiểm tra (Kế toán)',
    type: 'WARNING',
    read: false,
    createdAt: '2024-11-30T09:15:00',
    link: '/contracts/NT-012',
  },
  {
    id: 'N005',
    userId: '5', // Hoàng Văn E - Kế toán
    title: 'Hợp đồng nguyên tắc cần duyệt',
    message: 'HĐNT-012 đang chờ bạn duyệt ngân sách',
    type: 'WARNING',
    read: false,
    createdAt: '2024-11-30T09:15:00',
    link: '/contracts/NT-012',
  },

  // 2. Hợp đồng kinh tế chờ duyệt
  {
    id: 'N006',
    userId: '1',
    title: 'Hợp đồng kinh tế cần ký',
    message: 'HĐKT-BAN-003 đang chờ bạn ký phê duyệt (500,000,000 VND)',
    type: 'WARNING',
    read: false,
    createdAt: '2024-08-22T10:00:00',
    link: '/contracts/EC-S003',
  },
  {
    id: 'N007',
    userId: '5',
    title: 'Hợp đồng kinh tế cần duyệt',
    message: 'HĐKT-BAN-007 đang chờ bạn duyệt ngân sách',
    type: 'WARNING',
    read: false,
    createdAt: '2024-06-22T09:30:00',
    link: '/contracts/EC-S007',
  },
  {
    id: 'N008',
    userId: '4',
    title: 'Hợp đồng kinh tế cần duyệt',
    message: 'HĐKT-BAN-012 đang chờ bạn kiểm tra pháp lý',
    type: 'WARNING',
    read: false,
    createdAt: '2024-11-30T09:20:00',
    link: '/contracts/EC-S012',
  },
  {
    id: 'N009',
    userId: '1',
    title: 'Hợp đồng kinh tế cần ký',
    message: 'HĐKT-MUA-003 đang chờ bạn ký phê duyệt (320,000,000 VND)',
    type: 'WARNING',
    read: false,
    createdAt: '2024-12-10T10:00:00',
    link: '/contracts/EC-B003',
  },

  // 3. Công nợ quá hạn
  {
    id: 'N010',
    userId: '3', // Lê Văn C - Sales
    title: 'Công nợ quá hạn',
    message: 'HĐKT-BAN-002: Công nợ quá hạn 145 ngày (40,000,000 VND)',
    type: 'ERROR',
    read: false,
    createdAt: '2024-10-14T09:00:00',
    link: '/debt/DR002',
  },
  {
    id: 'N011',
    userId: '3',
    title: 'Công nợ quá hạn',
    message: 'HĐKT-MUA-015: Công nợ quá hạn (11,600,000 VND)',
    type: 'ERROR',
    read: false,
    createdAt: '2024-10-01T08:00:00',
    link: '/debt/EC-B015',
  },

  // 4. Hợp đồng sắp hết hạn
  {
    id: 'N012',
    userId: '1',
    title: 'HĐNT sắp hết hạn',
    message: 'HĐNT-001 sắp hết hạn',
    type: 'WARNING',
    read: false,
    createdAt: '2025-11-05T08:00:00',
    link: '/contracts/NT-001',
  },
  {
    id: 'N013',
    userId: '1',
    title: 'HĐNT sắp hết hạn',
    message: 'HĐNT-003 sắp hết hạn',
    type: 'ERROR',
    read: false,
    createdAt: '2025-11-05T08:00:00',
    link: '/contracts/NT-003',
  },

  // 5. Thanh toán thành công
  {
    id: 'N014',
    userId: '5',
    title: 'Thanh toán thành công',
    message:
      'Đã ghi nhận thanh toán PTT-2024/005 cho HĐKT-BAN-004 (30,000,000 VND)',
    type: 'SUCCESS',
    read: true,
    createdAt: '2024-10-01T15:30:00',
    link: '/payments/PV005',
  },
  {
    id: 'N015',
    userId: '3',
    title: 'Thanh toán thành công',
    message: 'Đã thanh toán 50% cho HĐKT-MUA-002 (336,000,000 VND)',
    type: 'SUCCESS',
    read: true,
    createdAt: '2024-11-06T11:00:00',
    link: '/payments/PV002',
  },

  // 6. Giao hàng / Nghiệm thu
  {
    id: 'N016',
    userId: '6', // Vũ Thị F - Kho
    title: 'Giao hàng thành công',
    message: 'PGH-2024/001 đã được nghiệm thu (495/500 bao xi măng)',
    type: 'SUCCESS',
    read: true,
    createdAt: '2024-03-16T10:00:00',
    link: '/delivery/DN001',
  },
  {
    id: 'N017',
    userId: '3',
    title: 'Nghiệm thu có từ chối',
    message: 'BBNT-2024/001: Từ chối 5 bao do bao bì rách',
    type: 'INFO',
    read: true,
    createdAt: '2024-03-16T11:00:00',
    link: '/acceptance/AR001',
  },

  // 7. Hợp đồng mới được tạo
  {
    id: 'N018',
    userId: '2',
    title: 'Hợp đồng mới được tạo',
    message: 'HĐKT-BAN-018 đã được tạo (Dự thảo - Văn phòng chia sẻ)',
    type: 'INFO',
    read: true,
    createdAt: '2024-08-22T08:45:00',
    link: '/contracts/EC-S018',
  },
  {
    id: 'N019',
    userId: '3',
    title: 'Hợp đồng mới được tạo',
    message: 'HĐKT-MUA-018 đang chờ duyệt (Văn phòng phẩm)',
    type: 'INFO',
    read: true,
    createdAt: '2024-08-20T08:00:00',
    link: '/contracts/EC-B018',
  },

  // 8. Hợp đồng thanh lý
  {
    id: 'N020',
    userId: '1',
    title: 'Hợp đồng đã thanh lý',
    message: 'HĐNT-014 đã được thanh lý thành công',
    type: 'SUCCESS',
    read: true,
    createdAt: '2025-01-28T14:30:00',
    link: '/contracts/NT-014',
  },
];
