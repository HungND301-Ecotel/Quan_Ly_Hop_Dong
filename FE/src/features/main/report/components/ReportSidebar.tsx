import { Search } from 'lucide-react';

export const REPORT_TYPES = [
  { id: 'by-category', label: 'Theo phân loại/lĩnh vực HĐ' },
  { id: 'by-sector', label: 'Theo HĐ trong ngành/ngoài ngành' },
  { id: 'by-form', label: 'Theo hình thức hợp đồng' },
  { id: 'by-bidding', label: 'Theo hình thức đấu thầu/lựa chọn NCC' },
  { id: 'by-cost', label: 'Theo hạch toán chi phí' },
  { id: 'by-partner', label: 'Theo tên khách hàng/nhà cung cấp' },
  { id: 'by-time', label: 'Theo thời gian/tiến độ báo cáo' },
  { id: 'by-expiry', label: 'Theo thời hạn kết thúc HĐ' },
  { id: 'by-liquidation', label: 'Theo điều khoản thanh lý HĐ' },
  { id: 'material-unit-price', label: 'Tổng hợp đơn giá vật tư theo HĐ' },
];

interface ReportSidebarProps {
  activeReport: string;
  onReportChange: (id: string) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export function ReportSidebar({
  activeReport,
  onReportChange,
  searchText,
  onSearchChange,
}: ReportSidebarProps) {
  return (
    <aside
      className="w-64 shrink-0 flex flex-col border-r"
      style={{ background: '#fff', borderColor: '#e2e8f0' }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: '#f1f5f9' }}>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            style={{ width: 13, height: 13 }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-8 pr-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ fontSize: 11, borderColor: '#e2e8f0' }}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-3 pt-3 pb-1">
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#2563eb',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Loại báo cáo
        </p>
      </div>

      {/* Nav */}
      <nav className="px-2 flex-1 overflow-y-auto pb-3">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => onReportChange(r.id)}
            className="w-full text-left rounded mb-0.5 transition-all"
            style={{
              padding: '7px 12px',
              fontSize: 11,
              lineHeight: 1.4,
              fontWeight: activeReport === r.id ? 700 : 400,
              background: activeReport === r.id ? '#2563eb' : 'transparent',
              color: activeReport === r.id ? '#fff' : '#374151',
            }}
          >
            {r.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}