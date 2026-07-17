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
  onNavigateToInvoice?: () => void;
  onNavigateToTax?: () => void;
  disabled?: boolean;
};

const ensureUniqueFilePaths = (paths: string[]) =>
  Array.from(new Set(paths.filter(Boolean)));

export function PaymentSection({
  contractId,
  onSaved,
  onNavigateToInvoice,
  onNavigateToTax,
  disabled = false,
}: PaymentSectionProps) {
  const [liquidationFile, setLiquidationFile] = useState<string | undefined>();

  const fetchService = useCallback(async () => {
    try {
      const [paymentSchedules, paymentDetail] = await Promise.all([
        contractPaymentService.getPaymentSchedules(contractId),
        contractPaymentService.getContractPaymentDetail(contractId),
      ]);

      setLiquidationFile(paymentDetail?.liquidationFilePath || undefined);

      const days = paymentSchedules?.[0]?.days ?? 30;
      const payments = paymentDetail?.payments || [];

      const installments: PaymentInstallment[] = payments.map((p) => {
        let calculatedDueDateStr = '';
        if (p.invoice?.dateInvoice) {
          const dateInvoice = new Date(p.invoice.dateInvoice);
          if (!Number.isNaN(dateInvoice.getTime()) && dateInvoice.getFullYear() > 1970) {
            dateInvoice.setDate(dateInvoice.getDate() + days);
            calculatedDueDateStr = dateInvoice.toLocaleDateString('vi-VN');
          }
        }

        const acceptanceMinute = ensureUniqueFilePaths(p.acceptanceReportFilePaths || []);
        const invoiceFiles = ensureUniqueFilePaths(p.invoiceFilePaths || []);
        const taxFiles = ensureUniqueFilePaths(p.taxFilePaths || []);

        return {
          id: p.id,
          period: p.periodNumber,
          periodLabel: calculatedDueDateStr ? `Hạn thanh toán: ${calculatedDueDateStr}` : `Kỳ ${p.periodNumber}`,
          paymentAmount: p.amount ?? 0,
          actualPaymentAmount: p.amount ?? 0,
          actualPaymentDate: p.paymentDate,
          existingPaymentId: p.id,
          contractProgresses: [],
          progresses: [],
          progressTotal: 0,
          documents: {
            acceptanceMinute,
            invoice: invoiceFiles,
            tax: taxFiles,
          },
        };
      });

      return installments.sort((a, b) => a.period - b.period);
    } catch (error) {
      console.error('Error fetching payment schedules:', error);
      toast.error('Lỗi khi tải thông tin thanh toán');
      return [];
    }
  }, [contractId]);

  const columns = useMemo(
    () => createColumns({
      contractId,
      onSaved: () => { table.refresh?.(); onSaved?.(); },
      onNavigateToInvoice,
      onNavigateToTax,
      disabled,
    }),
    [contractId, onNavigateToInvoice, onNavigateToTax, disabled]
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
        onSuccess={() => {
          table.refresh?.();
          onSaved?.();
        }}
        disabled={disabled}
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