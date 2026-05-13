import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { format } from '@/lib/format';
import { contractPaymentService } from '@/services/contract-payment';
import {
  ContractProgressOfSchedule,
  PaymentInstallment,
} from '@/services/contract-payment/type';
import { format as dateFnsFormat } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  BanknoteIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── File upload state per document type ─────────────────────────────────────

type FileEntry = {
  filePath?: string;
  file?: File;
  name: string;
};


function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className='space-y-0.5 mb-3'>
      <h3 className='text-base font-semibold tracking-tight'>{title}</h3>
      {description && (
        <p className='text-xs text-muted-foreground'>{description}</p>
      )}
    </div>
  );
}

// ─── Info row (read-only display) ─────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between py-2'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm font-semibold'>{value}</dd>
    </div>
  );
}

// ─── File upload section ──────────────────────────────────────────────────────

type FileUploadSectionProps = {
  label: string;
  entries: FileEntry[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
};

function FileUploadSection({
  label,
  entries,
  onAdd,
  onRemove,
  disabled,
}: FileUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-medium text-muted-foreground'>{label}</Label>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          className='h-6 gap-1 px-2 text-xs'
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <PlusIcon className='size-3' />
          Thêm file
        </Button>
        <input
          ref={inputRef}
          type='file'
          accept='.pdf,.doc,.docx,.xls,.xlsx'
          className='hidden'
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onAdd(file);
              e.target.value = '';
            }
          }}
        />
      </div>

      {entries.length === 0 ? (
        <p className='rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground'>
          Chưa có file
        </p>
      ) : (
        <div className='space-y-1'>
          {entries.map((entry, index) => (
            <div
              key={index}
              className='flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5'
            >
              <FileTextIcon className='size-3.5 shrink-0 text-muted-foreground' />
              <span className='min-w-0 flex-1 truncate text-xs'>
                {entry.file ? (
                  <span className='flex items-center gap-1'>
                    <span className='rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700'>
                      Mới
                    </span>
                    {entry.name}
                  </span>
                ) : (
                  entry.name
                )}
              </span>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='size-5 shrink-0 text-destructive hover:text-destructive'
                disabled={disabled}
                onClick={() => onRemove(index)}
              >
                <XIcon className='size-3' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Progress list (read-only) ────────────────────────────────────────────────

type ProgressInfoProps = {
  contractProgresses: ContractProgressOfSchedule[];
};

function ProgressInfo({ contractProgresses }: ProgressInfoProps) {
  if (contractProgresses.length === 0) {
    return (
      <p className='text-xs text-muted-foreground'>Chưa có tiến độ trong kỳ này</p>
    );
  }

  return (
    <div className='space-y-2'>
      {contractProgresses.map((progress) => (
        <div
          key={progress.id}
          className='rounded-md border bg-muted/30 p-2.5 text-xs space-y-1'
        >
          <div className='flex items-center justify-between gap-2'>
            <span className='text-muted-foreground'>Thời gian:</span>
            <span className='font-medium'>
              {progress.periodStart
                ? dateFnsFormat(new Date(progress.periodStart), 'dd/MM/yyyy', { locale: vi })
                : '—'}{' '}
              →{' '}
              {progress.periodEnd
                ? dateFnsFormat(new Date(progress.periodEnd), 'dd/MM/yyyy', { locale: vi })
                : '—'}
            </span>
          </div>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-muted-foreground'>Giá trị tiến độ:</span>
            <span className='font-semibold text-primary'>
              {format.number(progress.progressTotal)}
            </span>
          </div>
        </div>
      ))}
      <div className='flex items-center justify-between rounded-md bg-primary/5 px-2.5 py-1.5 text-xs'>
        <span className='font-medium'>Tổng giá trị tiến độ:</span>
        <span className='font-bold text-primary'>
          {format.number(
            contractProgresses.reduce((sum, p) => sum + (p.progressTotal ?? 0), 0)
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export type PaymentEditDialogProps = {
  installment: PaymentInstallment;
  contractId: string;
  onSaved?: () => void;
  onNavigateToDocument?: () => void; // ← thêm
};

export function PaymentEditDialog({
  installment,
  contractId,
  onSaved,
  onNavigateToDocument,
}: PaymentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chỉ giữ acceptanceMinute, bỏ invoice và tax
  const [documents, setDocuments] = useState<{ acceptanceMinute: FileEntry[] }>(() => ({
    acceptanceMinute: installment.documents.acceptanceMinute.map((p) => ({
      filePath: p,
      name: p.split('/').pop() || p,
    })),
  }));

  const addFile = (file: File) => {
    setDocuments((prev) => ({
      acceptanceMinute: [...prev.acceptanceMinute, { file, name: file.name }],
    }));
  };

  const removeFile = (index: number) => {
    setDocuments((prev) => ({
      acceptanceMinute: prev.acceptanceMinute.filter((_, i) => i !== index),
    }));
  };

  const uploadPendingFiles = async (entries: FileEntry[]): Promise<string[]> => {
    const results: string[] = [];
    for (const entry of entries) {
      if (entry.filePath) {
        results.push(entry.filePath);
      } else if (entry.file) {
        const response = await contractPaymentService.uploadPaymentFile(
          entry.file,
          contractId,
          'AcceptanceReport'
        );
        if (!response?.filePath) throw new Error(`Upload ${entry.name} thất bại`);
        results.push(response.filePath);
      }
    }
    return results;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const acceptanceReportFilePaths = await uploadPendingFiles(documents.acceptanceMinute);

      await contractPaymentService.batchUpdatePayments({
        contractId,
        items: [
          {
            id: installment.existingPaymentId,
            paymentScheduleId: installment.id,
            periodNumber: installment.period,
            acceptanceReportFilePaths,
            invoiceFilePaths: installment.documents.invoice, // giữ nguyên, không chỉnh
            taxFilePaths: installment.documents.tax,         // giữ nguyên, không chỉnh
            paymentDate: installment.actualPaymentDate ?? null,
            amount: installment.actualPaymentAmount ?? 0,
          },
        ],
      });

      toast.success(`Đã lưu kỳ ${installment.period}`);
      setOpen(false);
      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='size-7 text-muted-foreground hover:text-foreground'
          title='Cập nhật thanh toán'
        >
          <PencilIcon className='size-3.5' />
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-4xl!'>
        <DialogHeader>
          <DialogTitle className='text-lg'>
            Chỉnh sửa thanh toán hợp đồng
            <span className='ml-2 text-lg font-normal text-muted-foreground'>
              — Kỳ {installment.period}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh] pr-3'>
          <div className='space-y-6 py-1'>

            {/* ── Tiến độ thực hiện ── */}
            <div>
              <SectionHeader
                title='Tiến độ thực hiện'
                description='Các lần thực hiện trong kỳ thanh toán này'
              />
              <ProgressInfo contractProgresses={installment.contractProgresses} />
            </div>

            <Separator />

            {/* ── Thông tin thanh toán (read-only hoàn toàn) ── */}
            <div>
              <SectionHeader
                title='Thông tin thanh toán'
                description='Giá trị theo hợp đồng và thực tế thanh toán'
              />

              <div className='rounded-lg border bg-muted/30 px-4 divide-y'>
                <div className='py-1'>
                  <p className='text-xs font-medium text-muted-foreground pt-2 pb-1'>
                    Thanh toán theo hợp đồng
                  </p>
                </div>
                <InfoRow
                  label='Thanh toán theo hợp đồng'
                  value={
                    <span className='flex items-center gap-1.5 text-emerald-600'>
                      <BanknoteIcon className='size-3.5' />
                      {format.number(installment.paymentAmount)}
                    </span>
                  }
                />
                <InfoRow
                  label='Kỳ thanh toán'
                  value={installment.periodLabel || '—'}
                />
                <InfoRow
                  label='Thanh toán thực tế'
                  value={
                    installment.actualPaymentAmount > 0
                      ? <span className='text-primary font-semibold'>
                        {format.number(installment.actualPaymentAmount)}
                      </span>
                      : <span className='text-muted-foreground'>—</span>
                  }
                />
                <InfoRow
                  label='Ngày thanh toán thực tế'
                  value={
                    installment.actualPaymentDate
                      ? new Date(installment.actualPaymentDate).toLocaleDateString('vi-VN')
                      : <span className='text-muted-foreground'>—</span>
                  }
                />
              </div>
            </div>

            <Separator />

            {/* ── Tài liệu đính kèm — chỉ còn Biên bản nghiệm thu ── */}
            <div>
              <div className='flex items-center justify-between mb-3'>
                <SectionHeader
                  title='Tài liệu đính kèm'
                  description='Biên bản nghiệm thu'
                />
                {/* Nút chuyển sang tab Thông tin chứng từ */}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-1.5 shrink-0'
                  onClick={() => {
                    setOpen(false);
                    onNavigateToDocument?.();
                  }}
                >
                  <FileTextIcon className='size-3.5' />
                  Xem hóa đơn &amp; thuế
                </Button>
              </div>

              <FileUploadSection
                label='Biên bản nghiệm thu'
                entries={documents.acceptanceMinute}
                onAdd={addFile}
                onRemove={removeFile}
                disabled={isSubmitting}
              />
            </div>

          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Spinner className='mr-2 size-4' />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}