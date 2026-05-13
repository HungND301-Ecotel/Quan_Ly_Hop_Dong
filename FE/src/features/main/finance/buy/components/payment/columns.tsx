import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { format } from '@/lib/format';
import {
  ContractProgressOfSchedule,
  PaymentInstallment,
} from '@/services/contract-payment/type';
import { ColumnDef } from '@tanstack/react-table';
import { format as dateFnsFormat } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  EyeIcon,
  FilesIcon,
  FileTextIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FileViewerModal } from './modal/PDFViewModal';
import { PaymentEditDialog } from './modal/PaymentEditDialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileName = (filePath: string) => {
  const fileName = filePath.split('/').pop() || filePath;
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

// ─── File list popover ────────────────────────────────────────────────────────

type FileListProps = { files: string[] };

const FileList = ({ files }: FileListProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handlePreviewFile = async (filePath: string) => {
    try {
      setIsLoadingFile(true);
      // Strip domain nếu là full URL
      let s3Key = filePath.replace(/^https?:\/\/[^/]+\//, '');
      // Thêm prefix "contracts/" nếu chưa có
      if (!s3Key.startsWith('contracts/')) {
        s3Key = `contracts/${s3Key}`;
      }
      const file = await api.file(s3Key, false);
      setSelectedFile(file);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error getting file:', error);
      toast.error('Không thể mở file');
    } finally {
      setIsLoadingFile(false);
    }
  };

  if (files.length === 0) {
    return <span className='text-xs text-muted-foreground'>—</span>;
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button size='sm' variant='outline' type='button' className='gap-2'>
            <FilesIcon className='size-3.5 shrink-0' />
            <span>{files.length} file{files.length > 1 ? 's' : ''}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-1.5'>
          <ScrollArea className='max-h-96'>
            <div className='flex flex-col gap-1.5'>
              {files.map((file, index) => (
                <button
                  key={`${file}-${index}`}
                  type='button'
                  className='flex w-full items-start gap-2 rounded-md border p-2 text-left transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60'
                  disabled={isLoadingFile}
                  onClick={() => handlePreviewFile(file)}
                >
                  <FileTextIcon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                  <span className='min-w-0 flex-1 break-all text-xs'>
                    {getFileName(file)}
                  </span>
                  <EyeIcon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <FileViewerModal
        file={selectedFile}
        fileName={selectedFile?.name}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

// ─── Progress inline ──────────────────────────────────────────────────────────

type ProgressInlineProps = {
  contractProgresses: ContractProgressOfSchedule[];
  onNavigateToProgress?: () => void;
};

const ProgressInline = ({ contractProgresses, onNavigateToProgress }: ProgressInlineProps) => {
  if (contractProgresses.length === 0) {
    return <span className='text-xs text-muted-foreground'>—</span>;
  }

  return (
    <div className='space-y-1'>
      {contractProgresses.map((progress) => (
        <div key={progress.id} className='text-xs text-muted-foreground whitespace-nowrap'>
          {progress.periodStart
            ? dateFnsFormat(new Date(progress.periodStart), 'dd/MM/yyyy', { locale: vi })
            : '—'}
          {' → '}
          {progress.periodEnd
            ? dateFnsFormat(new Date(progress.periodEnd), 'dd/MM/yyyy', { locale: vi })
            : '—'}
        </div>
      ))}
      {onNavigateToProgress && (
        <button
          type='button'
          onClick={onNavigateToProgress}
          className='text-xs text-primary underline underline-offset-2 hover:opacity-70 transition-opacity'
        >
          Xem tiến độ →
        </button>
      )}
    </div>
  );
};

// ─── Column definitions ───────────────────────────────────────────────────────

type CreateColumnsOptions = {
  contractId: string;
  onSaved?: () => void;
  onNavigateToProgress?: () => void;
  onNavigateToDocument?: () => void;
};

export const createColumns = ({
  contractId,
  onSaved,
  onNavigateToProgress,
  onNavigateToDocument,
}: CreateColumnsOptions): ColumnDef<PaymentInstallment>[] => {
  return [
    // Kỳ — số thứ tự
    {
      accessorKey: 'period',
      header: 'Kỳ',
      cell: ({ row }) => (
        <span className='font-bold whitespace-nowrap'>
          Kỳ {row.original.period}
        </span>
      ),
    },
    // Tiến độ (inline, chỉ hiện ngày từ → đến, kèm link chuyển tab)
    {
      id: 'progresses',
      header: 'Tiến độ thực hiện',
      cell: ({ row }) => (
        <ProgressInline
          contractProgresses={row.original.contractProgresses}
          onNavigateToProgress={onNavigateToProgress}
        />
      ),
    },
    // Biên bản nghiệm thu
    {
      accessorKey: 'documents.acceptanceMinute',
      header: 'Biên bản nghiệm thu',
      cell: ({ row }) => (
        <FileList files={row.original.documents.acceptanceMinute} />
      ),
    },
    // Hóa đơn
    {
      accessorKey: 'documents.invoice',
      header: 'Hóa đơn',
      cell: () => {
        return (
          <Button
            size='sm'
            variant='outline'
            type='button'
            className='gap-2'
            onClick={onNavigateToDocument}
          >
            <span>Xem</span>
          </Button>
        );
      },
    },

    // Thay cột Thuế
    {
      accessorKey: 'documents.tax',
      header: 'Thuế',
      cell: () => {
        return (
          <Button
            size='sm'
            variant='outline'
            type='button'
            className='gap-2'
            onClick={onNavigateToDocument}
          >
            <span>Xem</span>
          </Button>
        );
      },
    },
    // Kế hoạch thanh toán (gộp thời gian + số tiền kế hoạch)
    {
      id: 'plan',
      header: 'Thanh toán theo hợp đồng',
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='text-xs text-muted-foreground whitespace-nowrap'>
            {row.original.periodLabel || '—'}
          </div>
          <div className='font-semibold text-emerald-600 whitespace-nowrap'>
            {format.number(row.original.paymentAmount ?? 0)}
          </div>
        </div>
      ),
    },
    // Thanh toán thực tế (gộp ngày + số tiền thực tế)
    {
      id: 'actual',
      header: 'Thanh toán thực tế',
      cell: ({ row }) => {
        const date = row.original.actualPaymentDate;
        const amount = row.original.actualPaymentAmount;
        return (
          <div className='space-y-0.5'>
            <div className='text-xs text-muted-foreground whitespace-nowrap'>
              {date
                ? dateFnsFormat(new Date(date), 'dd/MM/yyyy', { locale: vi })
                : '—'}
            </div>
            <div
              className={
                amount > 0
                  ? 'font-semibold text-emerald-600 whitespace-nowrap'
                  : 'text-muted-foreground'
              }
            >
              {amount > 0 ? format.number(amount) : '—'}
            </div>
          </div>
        );
      },
    },
    // Hành động
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <PaymentEditDialog
          installment={row.original}
          contractId={contractId}
          onSaved={onSaved}
          onNavigateToDocument={onNavigateToDocument} // ← thêm
        />
      ),
    },
  ];
};