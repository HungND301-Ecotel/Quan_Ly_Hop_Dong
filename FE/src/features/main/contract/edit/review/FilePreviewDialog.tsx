// components/file-preview-dialog.tsx
import { PdfViewer } from '@/components/pdf-viewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface FilePreviewDialogProps {
  file: File;
  fileName: string;
  trigger?: ReactNode;
}

export function FilePreviewDialog({ 
  file, 
  fileName, 
  trigger 
}: FilePreviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon-sm">
            <EyeIcon className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl! h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Xem trước tài liệu</DialogTitle>
          <DialogDescription>{fileName}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <PdfViewer file={file} />
        </div>
      </DialogContent>
    </Dialog>
  );
}