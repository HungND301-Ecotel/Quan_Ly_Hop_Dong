// components/evidence/index.tsx

import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, FileCheck, FileText, Receipt } from 'lucide-react';
import { PaymentSchedule } from '@/services/contract-payment/type';

export type ContractEvidenceProps = {
  schedules: PaymentSchedule[];
  loading?: boolean;
};

// ─── helpers ────────────────────────────────────────────────────────────────

const unique = (paths: string[]) => Array.from(new Set(paths.filter(Boolean)));

function getFiles(schedule: PaymentSchedule, key: 'acceptanceReportFilePaths' | 'invoiceFilePaths' | 'taxFilePaths') {
  return unique(
    (schedule.contractPayments || []).flatMap((p) => p[key] || [])
  );
}

function getPeriodLabel(s: PaymentSchedule, index: number): string {
  if (s.month && s.year) return `Tháng ${s.month}/${s.year}`;
  if (s.quarter && s.year) return `Quý ${s.quarter}/${s.year}`;
  if (s.fromDate && s.toDate) {
    const from = new Date(s.fromDate).toLocaleDateString('vi-VN');
    const to = new Date(s.toDate).toLocaleDateString('vi-VN');
    return `${from} – ${to}`;
  }
  return `Kỳ ${index + 1}`;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  label,
  icon: Icon,
  missing,
  uploaded,
  total,
}: {
  label: string;
  icon: React.ElementType;
  missing: number;
  uploaded: number;
  total: number;
}) {
  const ok = missing === 0;
  return (
    <div className="rounded-lg bg-muted/50 p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={`text-xl font-semibold ${ok ? 'text-green-600' : 'text-destructive'}`}>
        {ok ? 'Đầy đủ' : `${missing} thiếu`}
      </p>
      <p className="text-xs text-muted-foreground">
        {uploaded} file đã có / {total} kỳ
      </p>
    </div>
  );
}

function FileCell({ files }: { files: string[] }) {
  if (files.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle2 className="size-3.5" />
        <span className="text-muted-foreground">{files.length} file</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-destructive text-sm">
      <AlertCircle className="size-3.5" />
      Thiếu
    </span>
  );
}

function StatusBadge({ bbnt, hd, tax }: { bbnt: boolean; hd: boolean; tax: boolean }) {
  const all = bbnt && hd && tax;
  const none = !bbnt && !hd && !tax;
  if (all) return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">Đầy đủ</span>;
  if (none) return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">Chưa có</span>;
  return <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">Thiếu một phần</span>;
}

// ─── main component ──────────────────────────────────────────────────────────

export function ContractEvidence({ schedules, loading }: ContractEvidenceProps) {
  const sorted = useMemo(
    () =>
      [...schedules].sort((a, b) => {
        const ay = a.year ?? 0, by = b.year ?? 0;
        if (ay !== by) return ay - by;
        const am = a.month ?? (a.quarter ?? 0) * 3;
        const bm = b.month ?? (b.quarter ?? 0) * 3;
        return am - bm;
      }),
    [schedules]
  );

  const rows = useMemo(
    () =>
      sorted.map((s, idx) => {
        const bbntFiles = getFiles(s, 'acceptanceReportFilePaths');
        const hdFiles   = getFiles(s, 'invoiceFilePaths');
        const taxFiles  = getFiles(s, 'taxFilePaths');
        return {
          schedule: s,
          index: idx,
          bbntFiles,
          hdFiles,
          taxFiles,
          hasBBNT: bbntFiles.length > 0,
          hasHD: hdFiles.length > 0,
          hasTax: taxFiles.length > 0,
        };
      }),
    [sorted]
  );

  const total    = rows.length;
  const missBBNT = rows.filter((r) => !r.hasBBNT).length;
  const missHD   = rows.filter((r) => !r.hasHD).length;
  const missTax  = rows.filter((r) => !r.hasTax).length;
  const uploadedBBNT = rows.reduce((s, r) => s + r.bbntFiles.length, 0);
  const uploadedHD   = rows.reduce((s, r) => s + r.hdFiles.length, 0);
  const uploadedTax  = rows.reduce((s, r) => s + r.taxFiles.length, 0);

  const allOk = missBBNT === 0 && missHD === 0 && missTax === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Đang tải...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <FileText className="size-8" />
        <p className="text-sm">Không có kỳ thanh toán nào</p>
      </div>
    );
  }

  const missingParts: string[] = [];
  if (missBBNT) missingParts.push(`${missBBNT} biên bản nghiệm thu`);
  if (missHD)   missingParts.push(`${missHD} hóa đơn`);
  if (missTax)  missingParts.push(`${missTax} chứng từ thuế`);

  return (
    <div className="space-y-5 py-2">
      {/* Alert banner */}
      {allOk ? (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          <CheckCircle2 className="size-4 shrink-0" />
          Hợp đồng đã có đầy đủ chứng từ cho tất cả các kỳ thanh toán.
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            Hợp đồng còn thiếu: <strong>{missingParts.join(', ')}</strong> — cần bổ sung trước khi thanh toán đầy đủ.
          </span>
        </div>
      )}

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Biên bản nghiệm thu" icon={FileCheck}  missing={missBBNT} uploaded={uploadedBBNT} total={total} />
        <MetricCard label="Hóa đơn"             icon={Receipt}    missing={missHD}   uploaded={uploadedHD}   total={total} />
        <MetricCard label="Chứng từ thuế"        icon={FileText}   missing={missTax}  uploaded={uploadedTax}  total={total} />
      </div>

      {/* Detail table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Kỳ</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Thời gian</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Biên bản NT</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Hóa đơn</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Thuế</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.schedule.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="px-4 py-3 font-medium">Kỳ {row.index + 1}</td>
                <td className="px-4 py-3 text-muted-foreground">{getPeriodLabel(row.schedule, row.index)}</td>
                <td className="px-4 py-3"><FileCell files={row.bbntFiles} /></td>
                <td className="px-4 py-3"><FileCell files={row.hdFiles} /></td>
                <td className="px-4 py-3"><FileCell files={row.taxFiles} /></td>
                <td className="px-4 py-3">
                  <StatusBadge bbnt={row.hasBBNT} hd={row.hasHD} tax={row.hasTax} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}