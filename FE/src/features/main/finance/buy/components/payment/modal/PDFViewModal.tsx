import { PdfViewer } from '@/components/pdf-viewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FileViewerModalProps = {
  file: File | null;
  fileName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FileViewerModal({
  file,
  fileName,
  open,
  onOpenChange,
}: FileViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-7xl! h-[95vh] flex flex-col p-0'>
        <DialogHeader className='px-6 pt-6 pb-4 shrink-0'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1 min-w-0'>
              <DialogTitle className='truncate' title={fileName}>
                {fileName || 'Xem tài liệu'}
              </DialogTitle>
              <DialogDescription>
                Xem trước nội dung file PDF
              </DialogDescription>
            </div>

          </div>
        </DialogHeader>

        <div className='flex-1 min-h-0 px-6 pb-6'>
          {!file && (
            <div className='flex items-center justify-center h-full'>
              <p className='text-sm text-muted-foreground'>
                Không có file để hiển thị
              </p>
            </div>
          )}

          {file && (
            <div className='h-full overflow-auto'>
              <PdfViewer file={file} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}