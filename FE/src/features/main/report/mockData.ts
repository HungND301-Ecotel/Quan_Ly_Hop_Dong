// ============================================================
// TYPES – khớp đúng cấu trúc sổ theo dõi HĐ Excel
// ============================================================

export type ContractCategory = 'XDCB' | 'VAT_TU' | 'DICH_VU' | 'DOANH_THU';

export type BiddingForm =
  | 'DAU_THAU_RONG_RAI'
  | 'CHI_DINH_THAU_RUT_GON'
  | 'CHAO_HANG_CANH_TRANH'
  | 'KY_TRUC_TIEP'
  | 'KY_THEO_KE_HOACH_TKV';

export type ContractFormType =
  | 'TRON_GOI'
  | 'DON_GIA_CO_DINH'
  | 'DON_GIA_DIEU_CHINH'
  | 'NGUYEN_TAC';

export type PaymentCycle = 'THANG' | 'QUY' | 'NAM' | 'TRON_GOI' | 'GIAI_DOAN';

/** R = Đã thanh lý | TTL = Tự thanh lý | C = Chưa thanh lý */
export type LiquidationStatus = 'R' | 'TTL' | 'C';

export type ContractStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'LIQUIDATED';

/** Thực hiện từng tháng (cột 22-45 trong Excel) */
export interface MonthlyExecution {
  month: number;        // 1–12
  year: number;
  quantity?: number;    // Khối lượng
  amount: number;       // Thành tiền (VNĐ)
}

/** Bảo lãnh / bảo hành / đặt cọc (cột 20-21) */
export interface Guarantee {
  valuePercent?: number;   // % HĐ
  valueAmount?: number;    // Giá trị tuyệt đối (VNĐ)
  deadline?: string;       // Thời hạn
  bank?: string;           // Ngân hàng bảo lãnh
}

// ============================================================
// INTERFACE CHÍNH – sổ theo dõi hợp đồng
// ============================================================
export interface ContractRecord {
  id: string;
  stt: number;                          // Cột 1: STT

  // --- Cột 2 (Mã I/II/III): Phân nhóm/loại HĐ ---
  category: ContractCategory;           // Loại cao nhất (XDCB / Vật tư / Dịch vụ / Doanh thu)
  categoryCode1: string;                // Mã cấp I   (ví dụ: "ĐT", "VT", "DV")
  categoryCode2: string;                // Mã cấp II  (ví dụ: "TVUB", "NSĐB")
  categoryCode3: string;                // Mã cấp III (ví dụ: "ĐT02", "GỖ")

  // --- Cột 3: Hình thức lựa chọn nhà thầu / NCC ---
  biddingForm: BiddingForm;

  // --- Cột 4: Hình thức hợp đồng ---
  contractForm: ContractFormType;

  // --- Cột 5: Tên/nội dung ký kết HĐ ---
  name: string;

  // --- Cột 6: Sổ theo dõi HĐ ---
  trackingBook: string;                 // "Sổ 01-2025", "Sổ 02-2025", "Sổ 03-2025"

  // --- Cột 7: Số ký hiệu HĐ ---
  contractNumber: string;
  contractNumberNote?: string;          // Ghi chú nếu là số của đối tác

  // --- Cột 8: Số ký hiệu PLHĐ (nếu có) ---
  appendixNumber?: string;

  // --- Cột 9-12: Đối tác / khách hàng ---
  partner: string;
  partnerAddress?: string;
  partnerTaxCode?: string;
  partnerRepresentative?: string;

  // --- Cột 13: Ngày, tháng, năm ký hợp đồng ---
  signedDate: string;

  // --- Cột 14: Thời hạn hết hiệu lực của HĐ ---
  expiryDate: string;

  // --- Cột 15: Thời hạn thanh toán, đối chiếu ---
  paymentCycle: PaymentCycle;
  paymentCycleNote?: string;

  // --- Cột 16 (Vật tư/DV): Giá trị TH HĐ gần nhất (năm trước) ---
  previousYearAmount?: number;

  // --- Cột 17-19: Giá trị HĐ (sau thuế) ---
  totalAmount: number;                  // Thành tiền / Giá trị HĐ
  quantity?: number;                    // Khối lượng (nếu có)
  unit?: string;                        // Đơn vị tính
  unitPrice?: number;                   // Đơn giá (nếu có)

  // --- Cột 20-21: Bảo lãnh, bảo hành, đặt cọc ---
  guarantee?: Guarantee;

  // --- Cột 22-45: Tình hình thực hiện HĐ (12 tháng × KL + Thành tiền) ---
  reportYear: number;
  monthlyExecutions: MonthlyExecution[];

  // --- Cột 46-47: Lũy kế năm (KL + Thành tiền) ---
  yearCumulativeQuantity?: number;
  yearCumulativeAmount: number;

  // --- Cột 48-49: Giá trị/khối lượng dở dang ---
  pendingQuantity?: number;
  pendingAmount?: number;

  // --- Cột 50-51: Ước thực hiện HĐ ---
  estimatedQuantity?: number;
  estimatedAmount?: number;

  // --- Cột 52: Kiểm điểm, thanh lý HĐ ---
  liquidationStatus: LiquidationStatus;

  // --- Cột 53-55: Phân công quản lý HĐ ---
  draftedBy?: string;                   // Người soạn thảo, lưu file
  managedBy?: string;                   // Người trực tiếp quản lý HĐ
  receivedBy?: string;                  // Đơn vị/cá nhân tiếp nhận HĐ

  // --- Cột 56: Ghi chú (vướng mắc) ---
  notes?: string;

  // Trạng thái nội bộ
  status: ContractStatus;
}

// ============================================================
// HELPER
// ============================================================
function makeMonthly(
  year: number,
  data: Partial<Record<number, { quantity?: number; amount: number }>>
): MonthlyExecution[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const d = data[m];
    return { month: m, year, quantity: d?.quantity ?? 0, amount: d?.amount ?? 0 };
  });
}

// ============================================================
// MOCK DATA
// ============================================================

// ── XDCB ────────────────────────────────────────────────────
export const mockXDCBContracts: ContractRecord[] = [
  {
    id: 'XDCB-001', stt: 1,
    category: 'XDCB', categoryCode1: 'ĐT', categoryCode2: 'TVUB', categoryCode3: 'ĐT02',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'TRON_GOI',
    name: 'Gói số 1: Lập BCNCKT thuộc Dự án đầu tư phục vụ SX năm 2025 - Công ty than Uông Bí',
    trackingBook: 'Sổ 03-2025', contractNumber: '01/HĐTV-TUB',
    partner: 'Công ty CP Tư vấn Đầu tư Than Uông Bí',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5700123456',
    partnerRepresentative: 'Nguyễn Văn Tư',
    signedDate: '2025-01-12', expiryDate: '2026-02-12',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau nghiệm thu',
    totalAmount: 253592420,
    liquidationStatus: 'R', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, { 10: { amount: 253592420 } }),
    yearCumulativeAmount: 253592420, estimatedAmount: 253592420,
    draftedBy: 'Sơn', managedBy: 'Sơn', status: 'LIQUIDATED',
  },
  {
    id: 'XDCB-002', stt: 2,
    category: 'XDCB', categoryCode1: 'ĐT', categoryCode2: 'TKXD', categoryCode3: 'ĐT03',
    biddingForm: 'CHI_DINH_THAU_RUT_GON', contractForm: 'TRON_GOI',
    name: 'Thiết kế bản vẽ thi công nhà điều hành mỏ lộ thiên Khe Chàm',
    trackingBook: 'Sổ 03-2025', contractNumber: '05/HĐTK-KCH',
    partner: 'Công ty TNHH Tư vấn Xây dựng Quảng Ninh',
    partnerAddress: 'Hạ Long, Quảng Ninh', partnerTaxCode: '5700234567',
    partnerRepresentative: 'Trần Thị Mai',
    signedDate: '2025-02-20', expiryDate: '2025-08-20',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau nghiệm thu',
    totalAmount: 185000000,
    liquidationStatus: 'R', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, { 6: { amount: 100000000 }, 8: { amount: 85000000 } }),
    yearCumulativeAmount: 185000000, estimatedAmount: 185000000,
    draftedBy: 'Hà', managedBy: 'Hà', status: 'LIQUIDATED',
  },
  {
    id: 'XDCB-003', stt: 3,
    category: 'XDCB', categoryCode1: 'ĐT', categoryCode2: 'THICONG', categoryCode3: 'ĐT04',
    biddingForm: 'DAU_THAU_RONG_RAI', contractForm: 'DON_GIA_CO_DINH',
    name: 'Thi công xây dựng kho chứa vật tư phụ tùng cơ điện khu vực mỏ lộ thiên',
    trackingBook: 'Sổ 03-2025', contractNumber: '12/HĐTC-MLT',
    partner: 'Công ty CP Xây dựng Mỏ Quảng Ninh',
    partnerAddress: 'Cẩm Phả, Quảng Ninh', partnerTaxCode: '5700345678',
    partnerRepresentative: 'Lê Văn Hùng',
    signedDate: '2025-03-15', expiryDate: '2026-03-15',
    paymentCycle: 'QUY', paymentCycleNote: 'Theo quý sau nghiệm thu',
    totalAmount: 1850000000,
    guarantee: { valuePercent: 5, valueAmount: 92500000, deadline: '2026-09-15', bank: 'Vietcombank' },
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      4: { amount: 250000000 }, 5: { amount: 300000000 }, 6: { amount: 350000000 },
      7: { amount: 400000000 }, 8: { amount: 300000000 }, 9: { amount: 250000000 },
    }),
    yearCumulativeAmount: 1850000000, estimatedAmount: 1850000000,
    draftedBy: 'Minh', managedBy: 'Minh', status: 'ACTIVE',
    notes: 'Đang thi công giai đoạn 2',
  },
  {
    id: 'XDCB-004', stt: 4,
    category: 'XDCB', categoryCode1: 'ĐT', categoryCode2: 'GSXD', categoryCode3: 'ĐT05',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'TRON_GOI',
    name: 'Giám sát thi công xây dựng kho chứa vật tư phụ tùng cơ điện',
    trackingBook: 'Sổ 03-2025', contractNumber: '13/HĐGS-KCH',
    partner: 'Công ty CP Tư vấn Giám sát Xây dựng TKV',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0100789012',
    partnerRepresentative: 'Phạm Quang Dũng',
    signedDate: '2025-03-20', expiryDate: '2026-06-20',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói',
    totalAmount: 95000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      4: { amount: 20000000 }, 5: { amount: 20000000 }, 6: { amount: 20000000 },
      7: { amount: 20000000 }, 8: { amount: 15000000 },
    }),
    yearCumulativeAmount: 95000000, estimatedAmount: 95000000,
    draftedBy: 'Linh', managedBy: 'Linh', status: 'ACTIVE',
  },
  {
    id: 'XDCB-005', stt: 5,
    category: 'XDCB', categoryCode1: 'ĐT', categoryCode2: 'SCSC', categoryCode3: 'ĐT06',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_DIEU_CHINH',
    name: 'Sửa chữa lớn đường nội bộ mỏ lộ thiên đoạn km1+200 đến km2+500',
    trackingBook: 'Sổ 03-2025', contractNumber: '08/HĐSC-MLT',
    partner: 'Công ty TNHH Xây dựng và TM Đông Bắc',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5700456789',
    partnerRepresentative: 'Nguyễn Thị Lan',
    signedDate: '2025-04-10', expiryDate: '2025-10-10',
    paymentCycle: 'QUY', paymentCycleNote: 'Theo quý',
    previousYearAmount: 320000000,
    totalAmount: 450000000, quantity: 1300, unit: 'm2', unitPrice: 346154,
    liquidationStatus: 'R', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      5: { quantity: 400, amount: 138461600 }, 6: { quantity: 400, amount: 138461600 },
      7: { quantity: 300, amount: 103846200 }, 8: { quantity: 200, amount: 69230600 },
    }),
    yearCumulativeQuantity: 1300, yearCumulativeAmount: 450000000, estimatedAmount: 450000000,
    draftedBy: 'Tuấn', managedBy: 'Tuấn', status: 'LIQUIDATED',
  },
];

// ── VẬT TƯ ──────────────────────────────────────────────────
export const mockVatTuContracts: ContractRecord[] = [
  {
    id: 'VT-001', stt: 1,
    category: 'VAT_TU', categoryCode1: 'VT', categoryCode2: 'NSĐB', categoryCode3: 'GỖ',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_CO_DINH',
    name: 'Gỗ chống lò',
    trackingBook: 'Sổ 01-2025', contractNumber: '01/2025/HĐL-TUB',
    partner: 'Công ty TNHH Lâm Nông sản Đông Bắc',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5700567890',
    partnerRepresentative: 'Vũ Văn Hoàn',
    signedDate: '2025-01-02', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Thanh toán hàng tháng sau nghiệm thu',
    previousYearAmount: 870000000,
    totalAmount: 957340000, quantity: 2, unit: 'm3/lần', unitPrice: 478670000,
    liquidationStatus: 'TTL', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { amount: 78000000 }, 2: { amount: 82000000 }, 3: { amount: 85000000 },
      4: { amount: 79000000 }, 5: { amount: 81000000 }, 6: { amount: 83000000 },
      7: { amount: 80000000 }, 8: { amount: 77000000 }, 9: { amount: 76000000 },
      10: { amount: 74000000 }, 11: { amount: 72000000 }, 12: { amount: 69340000 },
    }),
    yearCumulativeAmount: 957340000, estimatedAmount: 957340000,
    draftedBy: 'Sơn', managedBy: 'Sơn', status: 'ACTIVE',
  },
  {
    id: 'VT-002', stt: 2,
    category: 'VAT_TU', categoryCode1: 'VT', categoryCode2: 'NHIENLIEU', categoryCode3: 'DẦU',
    biddingForm: 'KY_THEO_KE_HOACH_TKV', contractForm: 'DON_GIA_DIEU_CHINH',
    name: 'Cung cấp dầu diesel cho xe máy khai thác lộ thiên',
    trackingBook: 'Sổ 01-2025', contractNumber: '03/2025/HĐD-TUB',
    partner: 'Công ty Xăng dầu B12 - Petrolimex',
    partnerAddress: 'Hạ Long, Quảng Ninh', partnerTaxCode: '5700678901',
    partnerRepresentative: 'Đỗ Thanh Bình',
    signedDate: '2025-01-05', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Cuối tháng',
    previousYearAmount: 3200000000,
    totalAmount: 3850000000, quantity: 1400000, unit: 'lít', unitPrice: 2750,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { quantity: 110000, amount: 302500000 }, 2: { quantity: 105000, amount: 288750000 },
      3: { quantity: 120000, amount: 330000000 }, 4: { quantity: 115000, amount: 316250000 },
      5: { quantity: 118000, amount: 324500000 }, 6: { quantity: 112000, amount: 308000000 },
      7: { quantity: 120000, amount: 330000000 }, 8: { quantity: 125000, amount: 343750000 },
      9: { quantity: 118000, amount: 324500000 }, 10: { quantity: 115000, amount: 316250000 },
      11: { quantity: 120000, amount: 330000000 }, 12: { quantity: 122000, amount: 335500000 },
    }),
    yearCumulativeQuantity: 1400000, yearCumulativeAmount: 3850000000, estimatedAmount: 3850000000,
    draftedBy: 'Hưng', managedBy: 'Hưng', status: 'ACTIVE',
    notes: 'Giá điều chỉnh theo thị trường',
  },
  {
    id: 'VT-003', stt: 3,
    category: 'VAT_TU', categoryCode1: 'VT', categoryCode2: 'PHTUNG', categoryCode3: 'XE',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_CO_DINH',
    name: 'Cung cấp phụ tùng thay thế xe Komatsu PC1250',
    trackingBook: 'Sổ 01-2025', contractNumber: '07/2025/HĐPT-TUB',
    partner: 'Công ty CP Thiết bị Komatsu Việt Nam',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0101234567',
    partnerRepresentative: 'Tanaka Hiroshi',
    signedDate: '2025-02-15', expiryDate: '2025-12-31',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau giao hàng',
    totalAmount: 1250000000,
    guarantee: { valuePercent: 3, valueAmount: 37500000, deadline: '2026-03-15', bank: 'VietinBank' },
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      3: { amount: 450000000 }, 6: { amount: 400000000 }, 9: { amount: 400000000 },
    }),
    yearCumulativeAmount: 1250000000, estimatedAmount: 1250000000,
    draftedBy: 'Quân', managedBy: 'Quân', status: 'ACTIVE',
  },
  {
    id: 'VT-004', stt: 4,
    category: 'VAT_TU', categoryCode1: 'VT', categoryCode2: 'VATTU', categoryCode3: 'NỔ MÌN',
    biddingForm: 'KY_THEO_KE_HOACH_TKV', contractForm: 'DON_GIA_CO_DINH',
    name: 'Cung cấp thuốc nổ ANFO và kíp nổ vi sai phi điện',
    trackingBook: 'Sổ 01-2025', contractNumber: '02/2025/HĐTN-TUB',
    partner: 'Công ty Công nghiệp Hóa chất Mỏ - MICCO',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0102345678',
    partnerRepresentative: 'Đinh Văn Thắng',
    signedDate: '2025-01-08', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Thanh toán hàng tháng',
    previousYearAmount: 2800000000,
    totalAmount: 3100000000, quantity: 620, unit: 'tấn', unitPrice: 5000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { quantity: 50, amount: 250000000 }, 2: { quantity: 48, amount: 240000000 },
      3: { quantity: 55, amount: 275000000 }, 4: { quantity: 52, amount: 260000000 },
      5: { quantity: 54, amount: 270000000 }, 6: { quantity: 51, amount: 255000000 },
      7: { quantity: 56, amount: 280000000 }, 8: { quantity: 53, amount: 265000000 },
      9: { quantity: 50, amount: 250000000 }, 10: { quantity: 52, amount: 260000000 },
      11: { quantity: 49, amount: 245000000 }, 12: { quantity: 50, amount: 250000000 },
    }),
    yearCumulativeQuantity: 620, yearCumulativeAmount: 3100000000, estimatedAmount: 3100000000,
    draftedBy: 'Sơn', managedBy: 'Sơn', status: 'ACTIVE',
  },
  {
    id: 'VT-005', stt: 5,
    category: 'VAT_TU', categoryCode1: 'VT', categoryCode2: 'SCRB', categoryCode3: 'BĂNG TẢI',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_CO_DINH',
    name: 'Cung cấp băng tải cao su và phụ kiện đường lò',
    trackingBook: 'Sổ 01-2025', contractNumber: '09/2025/HĐBT-TUB',
    partner: 'Công ty CP Cao su - Kỹ thuật Hà Nội',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0103456789',
    partnerRepresentative: 'Hoàng Văn Nam',
    signedDate: '2025-03-01', expiryDate: '2025-12-31',
    paymentCycle: 'QUY', paymentCycleNote: 'Theo quý sau nghiệm thu',
    totalAmount: 680000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      3: { amount: 150000000 }, 6: { amount: 180000000 },
      9: { amount: 180000000 }, 12: { amount: 170000000 },
    }),
    yearCumulativeAmount: 680000000, estimatedAmount: 680000000,
    draftedBy: 'Lan', managedBy: 'Lan', status: 'ACTIVE',
  },
];

// ── DỊCH VỤ ─────────────────────────────────────────────────
export const mockDichVuContracts: ContractRecord[] = [
  {
    id: 'DV-001', stt: 1,
    category: 'DICH_VU', categoryCode1: 'DV', categoryCode2: 'SCTSC', categoryCode3: 'CƠ ĐIỆN',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_CO_DINH',
    name: 'Sửa chữa lớn máy bơm nước và hệ thống thoát nước hầm lò',
    trackingBook: 'Sổ 02-2025', contractNumber: '04/2025/HĐSC-TUB',
    partner: 'Công ty CP Cơ điện và Xây dựng Mỏ',
    partnerAddress: 'Cẩm Phả, Quảng Ninh', partnerTaxCode: '5700789012',
    partnerRepresentative: 'Bùi Đức Thịnh',
    signedDate: '2025-02-10', expiryDate: '2025-08-10',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau nghiệm thu',
    previousYearAmount: 280000000, totalAmount: 325000000,
    liquidationStatus: 'R', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      3: { amount: 100000000 }, 5: { amount: 120000000 }, 7: { amount: 105000000 },
    }),
    yearCumulativeAmount: 325000000, estimatedAmount: 325000000,
    draftedBy: 'Hà', managedBy: 'Hà', status: 'LIQUIDATED',
  },
  {
    id: 'DV-002', stt: 2,
    category: 'DICH_VU', categoryCode1: 'DV', categoryCode2: 'YTE', categoryCode3: 'KSKĐK',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'TRON_GOI',
    name: 'Khám sức khỏe định kỳ cho CBCNV năm 2025',
    trackingBook: 'Sổ 02-2025', contractNumber: '11/2025/HĐYT-TUB',
    partner: 'Bệnh viện Đa khoa tỉnh Quảng Ninh',
    partnerAddress: 'Hạ Long, Quảng Ninh', partnerTaxCode: '5700890123',
    partnerRepresentative: 'BS.CKI Nguyễn Thị Thu',
    signedDate: '2025-03-20', expiryDate: '2025-06-30',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau thực hiện',
    totalAmount: 485000000,
    liquidationStatus: 'R', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      4: { amount: 242500000 }, 5: { amount: 242500000 },
    }),
    yearCumulativeAmount: 485000000, estimatedAmount: 485000000,
    draftedBy: 'Linh', managedBy: 'Linh', status: 'LIQUIDATED',
    notes: 'Khám cho 1.200 CBCNV',
  },
  {
    id: 'DV-003', stt: 3,
    category: 'DICH_VU', categoryCode1: 'DV', categoryCode2: 'DAOTAO', categoryCode3: 'AT MỎ',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'TRON_GOI',
    name: 'Đào tạo, huấn luyện an toàn mỏ cho công nhân khai thác hầm lò',
    trackingBook: 'Sổ 02-2025', contractNumber: '06/2025/HĐĐT-TUB',
    partner: 'Trung tâm Đào tạo Mỏ - TKV',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0104567890',
    partnerRepresentative: 'ThS. Lê Đình Quang',
    signedDate: '2025-01-15', expiryDate: '2025-12-31',
    paymentCycle: 'QUY', paymentCycleNote: 'Theo quý sau mỗi khóa học',
    totalAmount: 360000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      3: { amount: 90000000 }, 6: { amount: 90000000 },
      9: { amount: 90000000 }, 12: { amount: 90000000 },
    }),
    yearCumulativeAmount: 360000000, estimatedAmount: 360000000,
    draftedBy: 'Minh', managedBy: 'Minh', status: 'ACTIVE',
  },
  {
    id: 'DV-004', stt: 4,
    category: 'DICH_VU', categoryCode1: 'DV', categoryCode2: 'BVMT', categoryCode3: 'QTMT',
    biddingForm: 'CHI_DINH_THAU_RUT_GON', contractForm: 'TRON_GOI',
    name: 'Quan trắc và phân tích môi trường khu vực mỏ lộ thiên và hầm lò năm 2025',
    trackingBook: 'Sổ 02-2025', contractNumber: '15/2025/HĐMT-TUB',
    partner: 'Viện Khoa học và Công nghệ Mỏ - Luyện kim',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0105678901',
    partnerRepresentative: 'TS. Nguyễn Văn Thành',
    signedDate: '2025-02-01', expiryDate: '2025-11-30',
    paymentCycle: 'TRON_GOI', paymentCycleNote: 'Trọn gói sau báo cáo',
    previousYearAmount: 145000000, totalAmount: 168000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      6: { amount: 84000000 }, 11: { amount: 84000000 },
    }),
    yearCumulativeAmount: 168000000, estimatedAmount: 168000000,
    draftedBy: 'Tuấn', managedBy: 'Tuấn', status: 'ACTIVE',
  },
  {
    id: 'DV-005', stt: 5,
    category: 'DICH_VU', categoryCode1: 'DV', categoryCode2: 'SCTSC', categoryCode3: 'Ô TÔ',
    biddingForm: 'CHAO_HANG_CANH_TRANH', contractForm: 'DON_GIA_CO_DINH',
    name: 'Sửa chữa định kỳ đoàn xe ô tô vận tải than và xe phụ trợ mỏ',
    trackingBook: 'Sổ 02-2025', contractNumber: '18/2025/HĐSC-TUB',
    partner: 'Công ty TNHH Sửa chữa Ô tô Tiến Đạt',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5700901234',
    partnerRepresentative: 'Phạm Tiến Đạt',
    signedDate: '2025-04-01', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Thanh toán hàng tháng',
    totalAmount: 520000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      4: { amount: 42000000 }, 5: { amount: 45000000 }, 6: { amount: 43000000 },
      7: { amount: 48000000 }, 8: { amount: 44000000 }, 9: { amount: 46000000 },
      10: { amount: 45000000 }, 11: { amount: 43000000 }, 12: { amount: 44000000 },
    }),
    yearCumulativeAmount: 400000000, estimatedAmount: 520000000, pendingAmount: 120000000,
    draftedBy: 'Hưng', managedBy: 'Hưng', status: 'ACTIVE',
    notes: 'Còn 3 tháng chưa quyết toán',
  },
];

// ── DOANH THU (CCDV) ─────────────────────────────────────────
export const mockDoanhThuContracts: ContractRecord[] = [
  {
    id: 'DT-001', stt: 1,
    category: 'DOANH_THU', categoryCode1: 'DT', categoryCode2: 'BANTHAN', categoryCode3: 'CỤC I',
    biddingForm: 'KY_THEO_KE_HOACH_TKV', contractForm: 'DON_GIA_DIEU_CHINH',
    name: 'Bán than cục loại I cho Công ty Nhiệt điện Uông Bí',
    trackingBook: 'Sổ DT-2025', contractNumber: '01/2025/HĐBT-TKV',
    partner: 'Công ty Nhiệt điện Uông Bí',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5701012345',
    partnerRepresentative: 'GĐ Trần Văn Điện',
    signedDate: '2025-01-02', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: '15 ngày sau xuất hóa đơn',
    previousYearAmount: 18500000000,
    totalAmount: 22000000000, quantity: 220000, unit: 'tấn', unitPrice: 100000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { quantity: 18000, amount: 1800000000 }, 2: { quantity: 17000, amount: 1700000000 },
      3: { quantity: 19000, amount: 1900000000 }, 4: { quantity: 18500, amount: 1850000000 },
      5: { quantity: 18000, amount: 1800000000 }, 6: { quantity: 17500, amount: 1750000000 },
      7: { quantity: 19000, amount: 1900000000 }, 8: { quantity: 18500, amount: 1850000000 },
      9: { quantity: 17500, amount: 1750000000 }, 10: { quantity: 18000, amount: 1800000000 },
      11: { quantity: 17500, amount: 1750000000 }, 12: { quantity: 17500, amount: 1750000000 },
    }),
    yearCumulativeQuantity: 216000, yearCumulativeAmount: 21600000000,
    estimatedQuantity: 220000, estimatedAmount: 22000000000,
    draftedBy: 'Sơn', managedBy: 'Sơn', status: 'ACTIVE',
  },
  {
    id: 'DT-002', stt: 2,
    category: 'DOANH_THU', categoryCode1: 'DT', categoryCode2: 'BANTHAN', categoryCode3: 'XÔ',
    biddingForm: 'KY_THEO_KE_HOACH_TKV', contractForm: 'DON_GIA_DIEU_CHINH',
    name: 'Bán than xô cho các hộ tiêu thụ trong ngành',
    trackingBook: 'Sổ DT-2025', contractNumber: '02/2025/HĐBT-TKV',
    partner: 'Công ty Kinh doanh Than - Vinacomin',
    partnerAddress: 'Hà Nội', partnerTaxCode: '0106789012',
    partnerRepresentative: 'TGĐ Lê Minh Cường',
    signedDate: '2025-01-02', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Theo tháng',
    previousYearAmount: 32000000000,
    totalAmount: 38500000000, quantity: 350000, unit: 'tấn', unitPrice: 110000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { quantity: 28000, amount: 3080000000 }, 2: { quantity: 26000, amount: 2860000000 },
      3: { quantity: 30000, amount: 3300000000 }, 4: { quantity: 29000, amount: 3190000000 },
      5: { quantity: 28000, amount: 3080000000 }, 6: { quantity: 27000, amount: 2970000000 },
      7: { quantity: 30000, amount: 3300000000 }, 8: { quantity: 29000, amount: 3190000000 },
      9: { quantity: 28000, amount: 3080000000 }, 10: { quantity: 29000, amount: 3190000000 },
      11: { quantity: 28500, amount: 3135000000 }, 12: { quantity: 27500, amount: 3025000000 },
    }),
    yearCumulativeQuantity: 340000, yearCumulativeAmount: 37400000000,
    estimatedQuantity: 350000, estimatedAmount: 38500000000,
    draftedBy: 'Hà', managedBy: 'Hà', status: 'ACTIVE',
  },
  {
    id: 'DT-003', stt: 3,
    category: 'DOANH_THU', categoryCode1: 'DT', categoryCode2: 'DICH VU', categoryCode3: 'ĐIỆN NƯỚC',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'DON_GIA_CO_DINH',
    name: 'Cung cấp điện, nước cho các đơn vị thuê văn phòng trong khuôn viên công ty',
    trackingBook: 'Sổ DT-2025', contractNumber: '05/2025/HĐCCDN-TUB',
    partner: 'Nhiều đơn vị thuê (theo danh sách)',
    partnerAddress: 'Uông Bí, Quảng Ninh',
    signedDate: '2025-01-01', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Thanh toán hàng tháng',
    previousYearAmount: 380000000, totalAmount: 420000000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { amount: 32000000 }, 2: { amount: 30000000 }, 3: { amount: 35000000 },
      4: { amount: 36000000 }, 5: { amount: 38000000 }, 6: { amount: 40000000 },
      7: { amount: 42000000 }, 8: { amount: 40000000 }, 9: { amount: 35000000 },
      10: { amount: 34000000 }, 11: { amount: 33000000 }, 12: { amount: 32000000 },
    }),
    yearCumulativeAmount: 397000000, estimatedAmount: 420000000,
    draftedBy: 'Linh', managedBy: 'Linh', status: 'ACTIVE',
  },
  {
    id: 'DT-004', stt: 4,
    category: 'DOANH_THU', categoryCode1: 'DT', categoryCode2: 'DICH VU', categoryCode3: 'ĂN CA',
    biddingForm: 'KY_TRUC_TIEP', contractForm: 'DON_GIA_CO_DINH',
    name: 'Cung cấp suất ăn ca cho CBCNV các đơn vị thuê khai thác',
    trackingBook: 'Sổ DT-2025', contractNumber: '06/2025/HĐAC-TUB',
    partner: 'Xí nghiệp Dịch vụ Ăn uống Mỏ',
    partnerAddress: 'Uông Bí, Quảng Ninh', partnerTaxCode: '5701123456',
    partnerRepresentative: 'Nguyễn Thị Hiền',
    signedDate: '2025-01-01', expiryDate: '2025-12-31',
    paymentCycle: 'THANG', paymentCycleNote: 'Cuối tháng',
    previousYearAmount: 1200000000,
    totalAmount: 1380000000, quantity: 276000, unit: 'suất', unitPrice: 5000,
    liquidationStatus: 'C', reportYear: 2025,
    monthlyExecutions: makeMonthly(2025, {
      1: { quantity: 22000, amount: 110000000 }, 2: { quantity: 20000, amount: 100000000 },
      3: { quantity: 24000, amount: 120000000 }, 4: { quantity: 23000, amount: 115000000 },
      5: { quantity: 23000, amount: 115000000 }, 6: { quantity: 22000, amount: 110000000 },
      7: { quantity: 24000, amount: 120000000 }, 8: { quantity: 23000, amount: 115000000 },
      9: { quantity: 22000, amount: 110000000 }, 10: { quantity: 23000, amount: 115000000 },
      11: { quantity: 22000, amount: 110000000 }, 12: { quantity: 22000, amount: 110000000 },
    }),
    yearCumulativeQuantity: 270000, yearCumulativeAmount: 1350000000,
    estimatedQuantity: 276000, estimatedAmount: 1380000000,
    draftedBy: 'Minh', managedBy: 'Minh', status: 'ACTIVE',
  },
];

// ── Gộp tất cả ───────────────────────────────────────────────
export const mockAllContracts: ContractRecord[] = [
  ...mockXDCBContracts,
  ...mockVatTuContracts,
  ...mockDichVuContracts,
  ...mockDoanhThuContracts,
];

// ── Nhãn hiển thị ────────────────────────────────────────────
export const CATEGORY_LABEL: Record<ContractCategory, string> = {
  XDCB: 'Hợp đồng XDCB',
  VAT_TU: 'Hợp đồng Vật tư',
  DICH_VU: 'Hợp đồng Dịch vụ',
  DOANH_THU: 'Hợp đồng Doanh thu (CCDV)',
};

export const BIDDING_LABEL: Record<BiddingForm, string> = {
  DAU_THAU_RONG_RAI: 'Đấu thầu rộng rãi',
  CHI_DINH_THAU_RUT_GON: 'Chỉ định thầu rút gọn',
  CHAO_HANG_CANH_TRANH: 'Chào hàng cạnh tranh',
  KY_TRUC_TIEP: 'Ký hợp đồng trực tiếp',
  KY_THEO_KE_HOACH_TKV: 'Ký theo KH PHKD TKV',
};

export const CONTRACT_FORM_LABEL: Record<ContractFormType, string> = {
  TRON_GOI: 'Trọn gói',
  DON_GIA_CO_DINH: 'Đơn giá cố định',
  DON_GIA_DIEU_CHINH: 'Đơn giá điều chỉnh',
  NGUYEN_TAC: 'Nguyên tắc',
};

export const LIQUIDATION_LABEL: Record<LiquidationStatus, string> = {
  R: 'Đã thanh lý',
  TTL: 'Tự thanh lý',
  C: 'Chưa thanh lý',
};

export const PAYMENT_CYCLE_LABEL: Record<PaymentCycle, string> = {
  THANG: 'Theo tháng',
  QUY: 'Theo quý',
  NAM: 'Theo năm',
  TRON_GOI: 'Trọn gói',
  GIAI_DOAN: 'Theo giai đoạn',
};

export const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

// ── Thống kê tổng hợp ────────────────────────────────────────
export function getContractStats(contracts: ContractRecord[]) {
  return {
    totalContracts: contracts.length,
    totalValue: contracts.reduce((s, c) => s + c.totalAmount, 0),
    totalExecuted: contracts.reduce((s, c) => s + c.yearCumulativeAmount, 0),
    totalPending: contracts.reduce((s, c) => s + (c.pendingAmount ?? 0), 0),
    liquidated: contracts.filter((c) => c.liquidationStatus === 'R').length,
    selfLiquidated: contracts.filter((c) => c.liquidationStatus === 'TTL').length,
    notLiquidated: contracts.filter((c) => c.liquidationStatus === 'C').length,
  };
}