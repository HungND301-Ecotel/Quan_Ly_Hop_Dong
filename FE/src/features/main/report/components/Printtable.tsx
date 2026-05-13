import { format } from 'date-fns';
import { ContractRecord } from '../api/Apimapper';

export const MONTH_NAMES = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
];

export const CATEGORY_LABEL: Record<string, string> = {
  XDCB: 'Hợp đồng XDCB',
  VAT_TU: 'Hợp đồng Vật tư',
  DICH_VU: 'Hợp đồng Dịch vụ',
  DOANH_THU: 'Hợp đồng Doanh thu',
};

export const LIQUIDATION_LABEL: Record<string, string> = {
  R: 'Chỉ định',
  TTL: 'Thanh lý',
  C: 'Chờ xử lý',
};

export const LIQUIDATION_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  R: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  TTL: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  C: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
};

const S = {
  th: {
    border: '1px solid #000',
    padding: '3px 4px',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    lineHeight: 1.3,
    background: '#fff',
  },
  thDark: {
    border: '1px solid #000',
    padding: '3px 4px',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    lineHeight: 1.3,
    background: '#fff',
  },
  td: {
    border: '1px solid #999',
    padding: '2px 4px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
  },
  tdC: {
    border: '1px solid #999',
    padding: '2px 4px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
    textAlign: 'center' as const,
  },
  tdR: {
    border: '1px solid #999',
    padding: '2px 4px',
    fontSize: 8,
    verticalAlign: 'middle' as const,
    textAlign: 'right' as const,
  },
  tdTotal: {
    border: '1px solid #888',
    padding: '2px 4px',
    fontSize: 8,
    fontWeight: 700,
    verticalAlign: 'middle' as const,
    background: '#fff',
    textAlign: 'right' as const,
  },
} as const;

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n));

export const BIDDING_LABEL: Record<string, string> = {
  'Chỉ định': 'Chỉ định',
  'Đấu thầu': 'Đấu thầu',
  'Lựa chọn': 'Lựa chọn',
};

export const CONTRACT_FORM_LABEL: Record<string, string> = {
  'Cố định': 'Cố định',
  'Thời vụ': 'Thời vụ',
  'Khác': 'Khác',
};

export const PAYMENT_CYCLE_LABEL: Record<string, string> = {
  'Tháng': 'Hàng tháng',
  'Quý': 'Hàng quý',
  'Năm': 'Hàng năm',
};

interface PrintTableProps {
  contracts: ContractRecord[];
  reportYear: string;
}

export function PrintTable({
  contracts,
  reportYear,
}: PrintTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: 2400,
        }}
      >
        <thead>
          {/* Header Row 1 */}
          <tr>
            <th rowSpan={3} style={{ ...S.thDark, width: 22 }}>
              STT
            </th>
            <th colSpan={3} style={{ ...S.thDark }}>
              Phân nhóm/loại HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 60 }}>
              HTLC NTC/NCC
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 55 }}>
              Hình thức HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 130 }}>
              Tên/nội dung ký kết HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 52 }}>
              Sổ theo dõi
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 68 }}>
              Số ký hiệu HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 50 }}>
              Số PLHĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 100 }}>
              Tên đối tác/KH
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 80 }}>
              Địa chỉ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 60 }}>
              MST
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 80 }}>
              Người đại diện PL
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 50 }}>
              Ngày ký HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 50 }}>
              Hết hiệu lực
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 55 }}>
              TH thanh toán
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 60 }}>
              GT TH năm trước (đ)
            </th>
            <th colSpan={3} style={{ ...S.thDark }}>
              Giá trị HĐ (sau thuế)
            </th>
            <th colSpan={2} style={{ ...S.thDark }}>
              Bảo lãnh/BH/đặt cọc
            </th>
            {MONTH_NAMES.map((m) => (
              <th key={m} colSpan={2} style={{ ...S.thDark, minWidth: 80 }}>
                {m}/{reportYear}
              </th>
            ))}
            <th colSpan={2} style={{ ...S.thDark }}>
              Lũy kế năm
            </th>
            <th colSpan={2} style={{ ...S.thDark }}>
              KL/GT dở dang
            </th>
            <th colSpan={2} style={{ ...S.thDark }}>
              Ước TH HĐ
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 50 }}>
              KĐ/Thanh lý
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 40 }}>
              Người soạn
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 40 }}>
              Người QL
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 50 }}>
              ĐV tiếp nhận
            </th>
            <th rowSpan={3} style={{ ...S.thDark, width: 80 }}>
              Ghi chú
            </th>
          </tr>
          {/* Header Row 2 */}
          <tr>
            <th style={{ ...S.th, width: 28 }}>Mã I</th>
            <th style={{ ...S.th, width: 36 }}>Mã II</th>
            <th style={{ ...S.th, width: 40 }}>Mã III</th>
            <th style={{ ...S.th, width: 44 }}>KL</th>
            <th style={{ ...S.th, width: 52 }}>Đơn giá</th>
            <th style={{ ...S.th, width: 64 }}>Thành tiền</th>
            <th style={{ ...S.th, width: 56 }}>GT (% HĐ)</th>
            <th style={{ ...S.th, width: 60 }}>TH/Ngân hàng</th>
            {MONTH_NAMES.map((m) => (
              <>
                <th key={`${m}-kl`} style={{ ...S.th, width: 32 }}>
                  KL
                </th>
                <th key={`${m}-tt`} style={{ ...S.th, width: 52 }}>
                  TT (đ)
                </th>
              </>
            ))}
            <th style={{ ...S.th, width: 40 }}>KL</th>
            <th style={{ ...S.th, width: 64 }}>Thành tiền (đ)</th>
            <th style={{ ...S.th, width: 40 }}>KL</th>
            <th style={{ ...S.th, width: 64 }}>Thành tiền (đ)</th>
            <th style={{ ...S.th, width: 40 }}>KL</th>
            <th style={{ ...S.th, width: 64 }}>Thành tiền (đ)</th>
          </tr>
        </thead>

        <tbody>
          {/* Total Row */}
          <tr>
            <td colSpan={20} style={{ ...S.tdTotal, textAlign: 'left' }}>
              TỔNG CỘNG
            </td>
            <td style={{ ...S.tdTotal }}>
              {fmt(contracts.reduce((s, c) => s + c.totalAmount, 0))}
            </td>
            <td style={S.tdTotal} />
            <td style={S.tdTotal} />
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const tot = contracts.reduce((s, c) => {
                const ex = c.monthlyExecutions.find((e) => e.month === m);
                return s + (ex?.amount ?? 0);
              }, 0);
              return (
                <>
                  <td key={`tc-kl-${m}`} style={S.tdTotal} />
                  <td key={`tc-tt-${m}`} style={S.tdTotal}>
                    {tot > 0 ? fmt(tot) : ''}
                  </td>
                </>
              );
            })}
            <td style={S.tdTotal} />
            <td style={{ ...S.tdTotal }}>
              {fmt(contracts.reduce((s, c) => s + c.yearCumulativeAmount, 0))}
            </td>
            <td colSpan={9} style={S.tdTotal} />
          </tr>

          {/* Data Rows */}
          {contracts.map((c) => {
            const liq = LIQUIDATION_COLOR[c.liquidationStatus] || LIQUIDATION_COLOR.C;
            return (
              <tr
                key={c.id}
                style={{ background: '#fff' }}
              >
                <td style={{ ...S.tdC, fontWeight: 600 }}>{c.stt}</td>
                <td
                  style={{
                    ...S.tdC,
                    fontWeight: 700,
                    color: '#1a3a7c',
                  }}
                >
                  {c.categoryCode1}
                </td>
                <td style={S.tdC}>{c.categoryCode2}</td>
                <td style={S.tdC}>{c.categoryCode3}</td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {BIDDING_LABEL[c.biddingForm] || c.biddingForm}
                </td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {CONTRACT_FORM_LABEL[c.contractForm] || c.contractForm}
                </td>
                <td style={{ ...S.td, fontSize: 7, maxWidth: 130 }}>
                  {c.name}
                </td>
                <td style={{ ...S.tdC, color: '#1a3a7c' }}>
                  {c.trackingBook}
                </td>
                <td
                  style={{
                    ...S.tdC,
                    fontWeight: 600,
                    color: '#1a3a7c',
                  }}
                >
                  {c.contractNumber}
                </td>
                <td style={S.tdC}>{c.appendixNumber ?? '—'}</td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {c.partner}
                </td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {c.partnerAddress ?? '—'}
                </td>
                <td style={S.tdC}>{c.partnerTaxCode ?? '—'}</td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {c.partnerRepresentative ?? '—'}
                </td>
                <td style={S.tdC}>
                  {c.signedDate
                    ? format(new Date(c.signedDate), 'dd/MM/yy')
                    : '—'}
                </td>
                <td style={S.tdC}>
                  {c.expiryDate
                    ? format(new Date(c.expiryDate), 'dd/MM/yy')
                    : '—'}
                </td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {PAYMENT_CYCLE_LABEL[c.paymentCycle] || c.paymentCycle}
                </td>
                <td style={S.tdR}>
                  {c.previousYearAmount ? fmt(c.previousYearAmount) : '—'}
                </td>
                <td style={S.tdR}>
                  {c.quantity != null
                    ? fmt(c.quantity) + (c.unitPrice ? '' : '')
                    : '—'}
                </td>
                <td style={S.tdR}>
                  {c.unitPrice != null ? fmt(c.unitPrice) : '—'}
                </td>
                <td
                  style={{
                    ...S.tdR,
                    fontWeight: 700,
                    color: '#1a3a7c',
                  }}
                >
                  {fmt(c.totalAmount)}
                </td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {c.guarantee
                    ? `${c.guarantee.valuePercent ?? ''}% - ${fmt(
                        c.guarantee.valueAmount ?? 0
                      )}`
                    : '—'}
                </td>
                <td style={{ ...S.td, fontSize: 7 }}>
                  {c.guarantee
                    ? `${c.guarantee.deadline ?? ''} / ${
                        c.guarantee.bank ?? ''
                      }`
                    : '—'}
                </td>
                {c.monthlyExecutions.map((ex) => (
                  <>
                    <td
                      key={`${c.id}-m${ex.month}-kl`}
                      style={S.tdR}
                    >
                      {ex.quantity ? fmt(ex.quantity) : ''}
                    </td>
                    <td
                      key={`${c.id}-m${ex.month}-tt`}
                      style={{
                        ...S.tdR,
                        color:
                          ex.amount > 0
                            ? '#14532d'
                            : '#aaa',
                      }}
                    >
                      {ex.amount > 0 ? fmt(ex.amount) : ''}
                    </td>
                  </>
                ))}
                <td style={S.tdR}>
                  {c.yearCumulativeQuantity
                    ? fmt(c.yearCumulativeQuantity)
                    : '—'}
                </td>
                <td
                  style={{
                    ...S.tdR,
                    fontWeight: 600,
                    color: '#14532d',
                  }}
                >
                  {fmt(c.yearCumulativeAmount)}
                </td>
                <td style={S.tdR}>
                  {c.pendingQuantity
                    ? fmt(c.pendingQuantity)
                    : '—'}
                </td>
                <td
                  style={{
                    ...S.tdR,
                    color: '#92400e',
                  }}
                >
                  {c.pendingAmount ? fmt(c.pendingAmount) : '—'}
                </td>
                <td style={S.tdR}>
                  {c.estimatedQuantity
                    ? fmt(c.estimatedQuantity)
                    : '—'}
                </td>
                <td style={S.tdR}>
                  {c.estimatedAmount
                    ? fmt(c.estimatedAmount)
                    : '—'}
                </td>
                <td style={S.tdC}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 4px',
                      fontSize: 7,
                      fontWeight: 700,
                      borderRadius: 3,
                      border: `1px solid ${liq.border}`,
                      background: liq.bg,
                      color: liq.text,
                    }}
                  >
                    {c.liquidationStatus} –{' '}
                    {LIQUIDATION_LABEL[
                      c.liquidationStatus
                    ] || c.liquidationStatus}
                  </span>
                </td>
                <td style={S.tdC}>{c.draftedBy ?? '—'}</td>
                <td style={S.tdC}>{c.managedBy ?? '—'}</td>
                <td style={S.tdC}>{c.receivedBy ?? '—'}</td>
                <td style={{ ...S.td, fontSize: 7, color: '#555' }}>
                  {c.notes ?? ''}
                </td>
              </tr>
            );
          })}

          {contracts.length === 0 && (
            <tr>
              <td
                colSpan={56}
                style={{
                  ...S.tdC,
                  padding: '16px 8px',
                  color: '#888',
                  fontSize: 9,
                }}
              >
                Không có dữ liệu phù hợp
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}