import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ContractAction, ContractActionMap } from '@/constants/contract-action';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api'; // điều chỉnh đường dẫn nếu khác
import { ContractSignHistory } from '@/services/contract/type';
import {
  CheckCircle2,
  FileEdit,
  FilePlus,
  FileText,
  History,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Sub-component: tách ra để dùng hooks hợp lệ ───────────────────────────

type LiquidationFileButtonProps = {
  rawPath: string; // S3 path lấy từ comment
};

function LiquidationFileButton({ rawPath }: LiquidationFileButtonProps) {
  const [open, setOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevBlobUrl = useRef<string | null>(null);

  // Fetch blob khi mở dialog lần đầu
  useEffect(() => {
    if (!open) return;
    if (blobUrl) return; // đã có rồi, không fetch lại

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Strip domain để lấy S3 key: "contracts/2611/.../file.pdf"
    const s3Key = rawPath.replace(/^https?:\/\/[^/]+\//, '');

    // isFullUrl = false → backend nhận fileS3Path (S3 key) và tự sign
    api.file(s3Key, false)
      .then((file) => {
        if (cancelled) return;
        const url = URL.createObjectURL(file);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Không thể tải file thanh lý. Vui lòng thử lại.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, rawPath, blobUrl]);

  // Giải phóng object URL khi unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Reset lỗi để có thể thử lại lần sau
    if (!next && error) {
      setError(null);
      setBlobUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant='outline'
        size='sm'
        className='h-6 px-2 text-[10px] gap-1 font-semibold w-fit'
        onClick={() => setOpen(true)}
      >
        <FileText className='size-3' />
        Xem file thanh lý
      </Button>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 h-[calc(100vh-4rem)] overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-lg font-semibold'>
            File thanh lý hợp đồng
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 p-6 overflow-hidden'>
          {loading && (
            <div className='h-full flex items-center justify-center gap-2 text-muted-foreground'>
              <Loader2 className='size-5 animate-spin' />
              <span className='text-sm'>Đang tải file...</span>
            </div>
          )}
          {error && (
            <div className='h-full flex flex-col items-center justify-center gap-3'>
              <p className='text-sm text-destructive'>{error}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => { setError(null); setBlobUrl(null); }}
              >
                Thử lại
              </Button>
            </div>
          )}
          {blobUrl && !loading && !error && (
            <iframe
              src={blobUrl}
              className='w-full rounded-lg h-[calc(100vh-12rem)]'
            />
          )}
        </div>

        <div className='border-t p-4 flex justify-end'>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function deriveActionFromComment(comment: string | null) {
  if (!comment) return null;
  const c = comment.toLowerCase();
  if (c.includes('paused'))    return { title: 'Tạm dừng',    background: 'bg-amber-400', foreground: 'text-white' };
  if (c.includes('resumed'))   return { title: 'Tiếp tục',    background: 'bg-green-400', foreground: 'text-white' };
  if (c.includes('activated')) return { title: 'Kích hoạt',   background: 'bg-green-500', foreground: 'text-white' };
  if (c.includes('cancelled')) return { title: 'Đã hủy',      background: 'bg-red-500',   foreground: 'text-white' };
  if (c.includes('liquidat'))  return { title: 'Đã thanh lý', background: 'bg-gray-600',  foreground: 'text-white' };
  return null;
}

function extractLiquidationFilePath(comment: string | null): string | null {
  if (!comment) return null;
  const marker = 'Liquidation file path:';
  const idx = comment.indexOf(marker);
  if (idx === -1) return null;
  let url = comment.slice(idx + marker.length).trim();
  if (!url) return null;
  // Fix backend bug: "amazonaws.com" dính với path, thiếu "/"
  url = url.replace(/(amazonaws\.com)([^/])/g, '$1/$2');
  return url;
}

// ─── Main component ──────────────────────────────────────────────────────────

export type ContractHistoryProps = {
  history: ContractSignHistory[];
  loading?: boolean;
};

export function ContractHistory({ history, loading }: ContractHistoryProps) {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Item key={i} variant='muted' className='border-none'>
            <ItemMedia className='size-10 rounded-full bg-muted animate-pulse' />
            <ItemContent className='space-y-2'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-3 w-1/4' />
            </ItemContent>
          </Item>
        ))}
      </div>
    );
  }

  if (!history) return null;

  const getActionIcon = (actionType: ContractAction | null) => {
    switch (actionType) {
      case ContractAction.Approve:         return <CheckCircle2 className='size-5' />;
      case ContractAction.Reject:          return <XCircle className='size-5' />;
      case ContractAction.RequestRevision: return <FileEdit className='size-5' />;
      case ContractAction.Created:         return <FilePlus className='size-5' />;
      default:                             return <History className='size-5' />;
    }
  };

  return (
    <div className='relative space-y-4 before:absolute before:left-9 before:top-2 before:bottom-2 before:w-0.5 before:bg-border px-4'>
      {history.map((item) => {
        const action = item.action != null
          ? ContractActionMap[item.action]
          : deriveActionFromComment(item.comment ?? null);

        const resolvedAction = action ?? {
          title: 'Cập nhật',
          background: 'bg-gray-400',
          foreground: 'text-white',
        };

        const liquidationFilePath = extractLiquidationFilePath(item.comment ?? null);

        return (
          <div key={item.id} className='relative pl-12'>
            <div
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 size-10 rounded-full border-4 border-background flex items-center justify-center z-10 transition-colors shadow-sm',
                resolvedAction.background.replace('bg-', 'bg-').replace('500', '100'),
                resolvedAction.background.replace('bg-', 'text-')
              )}
            >
              {getActionIcon(item.action ?? null)}
            </div>

            <Item
              variant='default'
              className='items-center p-4 rounded-xl border border-border shadow transition-all hover:bg-card hover:shadow-md'
            >
              <ItemContent className='flex-1'>
                <div className='flex flex-col gap-1.5'>
                  {/* Row 1: tên + chức vụ */}
                  <div className='flex items-center justify-between gap-2 overflow-hidden'>
                    <ItemTitle className='text-sm font-semibold truncate'>
                      {item.fullName}
                    </ItemTitle>
                    <span className='shrink-0 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/40'>
                      {item.positionName}
                    </span>
                  </div>

                  {/* Row 2: badge + comment + timestamp */}
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 overflow-hidden'>
                      <span
                        className={cn(
                          'font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-tight shrink-0',
                          resolvedAction.background,
                          resolvedAction.foreground
                        )}
                      >
                        {resolvedAction.title}
                      </span>
                      {item.comment && !liquidationFilePath && (
                        <ItemDescription className='text-[10px] text-muted-foreground/80 truncate font-medium border-l pl-2'>
                          {item.comment}
                        </ItemDescription>
                      )}
                    </div>
                    <span className='shrink-0 text-[10px] text-muted-foreground/60 font-medium italic'>
                      {format.dateTime(item.createdOn)}
                    </span>
                  </div>

                  {/* Row 3: button xem file thanh lý */}
                  {liquidationFilePath && (
                    <LiquidationFileButton rawPath={liquidationFilePath} />
                  )}
                </div>
              </ItemContent>
            </Item>
          </div>
        );
      })}
    </div>
  );
}