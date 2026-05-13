import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTablePagination,
  useDataTable,
} from '@/components/data-table';
import { contractPaymentService } from '@/services/contract-payment';
import {
  PaymentInstallment,
  PaymentSchedule,
} from '@/services/contract-payment/type';
import { ReceiptTextIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createColumns } from './columns';
import { LiquidationSection } from './liquidation';

export type PaymentSectionProps = {
  contractId: string;
  contractValue: number;
  onSaved?: () => void;
  onNavigateToDocument?: () => void;
};

const ensureUniqueFilePaths = (paths: string[]) =>
  Array.from(new Set(paths.filter(Boolean)));

const formatPeriodDate = (value: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('vi-VN');
};

/** Thời gian thanh toán kế hoạch — chỉ hiện month/year/quarter/dateRange */
const getPeriodLabel = (schedule: PaymentSchedule): string => {
  if (schedule.month && schedule.year) {
    return `Tháng ${schedule.month}/${schedule.year}`;
  }
  if (schedule.quarter && schedule.year) {
    return `Quý ${schedule.quarter}/${schedule.year}`;
  }
  const fromDate = formatPeriodDate(schedule.fromDate);
  const toDate = formatPeriodDate(schedule.toDate);
  if (fromDate && toDate) return `${fromDate} - ${toDate}`;
  return '—';
};

const mapSchedulesToInstallments = (
  schedules: PaymentSchedule[]
): PaymentInstallment[] => {
  // Sắp xếp theo year → month/quarter để kỳ nhất quán
  const sortedSchedules = [...schedules].sort((a, b) => {
    const aYear = a.year ?? 0;
    const bYear = b.year ?? 0;
    if (aYear !== bYear) return aYear - bYear;
    const aMonth = a.month ?? (a.quarter != null ? a.quarter * 3 : 0);
    const bMonth = b.month ?? (b.quarter != null ? b.quarter * 3 : 0);
    return aMonth - bMonth;
  });

  return sortedSchedules.map((schedule, index) => {
    const period = index + 1; // Kỳ = số thứ tự 1-based
    const payments = schedule.contractPayments || [];
    const contractProgresses = schedule.contractProgresses || [];

    const acceptanceMinute = ensureUniqueFilePaths(
      payments.flatMap((p) => p.acceptanceReportFilePaths || [])
    );
    const invoice = ensureUniqueFilePaths(
      payments.flatMap((p) => p.invoiceFilePaths || [])
    );
    const tax = ensureUniqueFilePaths(
      payments.flatMap((p) => p.taxFilePaths || [])
    );

    // Số tiền TT thực tế: tổng amount của tất cả contractPayments
    const actualPaymentAmount = payments.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0
    );

    // Ngày TT thực tế: lấy paymentDate mới nhất
    const paymentDates = payments
      .map((p) => p.paymentDate)
      .filter((d): d is string => !!d)
      .sort();
    const actualPaymentDate =
      paymentDates.length > 0 ? paymentDates[paymentDates.length - 1] : null;

    // existingPaymentId: id của contractPayment đầu tiên nếu có
    const existingPaymentId = payments[0]?.id;

    // progressTotal: tổng từ tất cả contractProgresses trong kỳ
    const progressTotal = contractProgresses.reduce(
      (sum, p) => sum + (p.progressTotal ?? 0),
      0
    );

    // progresses: flatten contractProgressItems (hiện tại API trả về rỗng)
    const progresses = contractProgresses.flatMap(
      (p) => p.contractProgressItems || []
    );

    return {
      id: schedule.id,
      period,
      periodLabel: getPeriodLabel(schedule),
      paymentAmount: schedule.paymentAmount ?? 0,
      actualPaymentAmount,
      actualPaymentDate,
      existingPaymentId,
      contractProgresses,
      progresses,
      progressTotal,
      documents: {
        acceptanceMinute,
        invoice,
        tax,
      },
    };
  });
};

export function PaymentSection({ contractId, onSaved, onNavigateToDocument }: PaymentSectionProps) {
  const [liquidationFile, setLiquidationFile] = useState<string | undefined>();

  const fetchService = useCallback(async () => {
    try {
      const [paymentSchedules, paymentDetail] = await Promise.all([
        contractPaymentService.getPaymentSchedules(contractId),
        contractPaymentService.getContractPaymentDetail(contractId),
      ]);

      setLiquidationFile(paymentDetail?.liquidationFilePath || undefined);

      return mapSchedulesToInstallments(paymentSchedules || []);
    } catch (error) {
      console.error('Error fetching payment schedules:', error);
      toast.error('Lỗi khi tải thông tin thanh toán');
      return [];
    }
  }, [contractId]);

  const columns = useMemo(
    () =>
      createColumns({
        contractId,
        onSaved: () => {
          table.refresh?.();
          onSaved?.();
        },
        onNavigateToDocument, // ← thêm
      }),
    [contractId, onNavigateToDocument]
  );

  const table = useDataTable<PaymentInstallment>({
    keys: ['payment', contractId],
    service: fetchService,
    columns,
  });

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
        <ReceiptTextIcon className='size-5' />
        <h3>Thanh toán hợp đồng</h3>
      </div>

      <DataTable dataTable={table}>
        <DataTableContent />
        <DataTableFooter>
          <DataTablePagination />
        </DataTableFooter>
      </DataTable>

      <LiquidationSection
        contractId={contractId}
        initialFile={liquidationFile}
        onSuccess={onSaved}
        onSave={async (file: File) => {
          try {
            const response = await contractPaymentService.uploadPaymentFile(
              file,
              contractId,
              'Liquidation'
            );
            if (!response) throw new Error('No response from upload');

            await contractPaymentService.updateLiquidationFile(
              contractId,
              response.filePath
            );

            toast.success('Đã lưu file thanh lý');
            setLiquidationFile(response.filePath);
          } catch (error) {
            console.error('Error uploading liquidation file:', error);
            toast.error('Lỗi khi tải file thanh lý');
          }
        }}
        onDelete={async () => {
          try {
            await contractPaymentService.updateLiquidationFile(contractId, '');
            toast.success('Đã xóa file thanh lý');
            setLiquidationFile(undefined);
          } catch (error) {
            console.error('Error deleting liquidation file:', error);
            toast.error('Lỗi khi xóa file thanh lý');
          }
        }}
      />
    </section>
  );
}