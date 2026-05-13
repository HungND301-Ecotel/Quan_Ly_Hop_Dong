import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import { UploadCloudIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type ContractCompleteProps = {
  contract: Contract;
  callback?: () => void;
};

export function ContractComplete({ contract, callback }: ContractCompleteProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file hợp đồng');
      return;
    }
    try {
      setIsLoading(true);
      await contractService.completeContract({
        contractId: contract.id,
        contractFile: file,
        contractNumber: contract.contractNumber,
        // Verify lại giá trị status/subStatus với BE
        status: 3,
        subStatus: 4,
      });
      toast.success('Hoàn thiện hợp đồng thành công');
      setOpen(false);
      setFile(null);
      callback?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi hoàn thiện hợp đồng'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='text-primary hover:text-primary hover:bg-primary/10'
          title='Hoàn thiện hợp đồng'
        >
          <UploadCloudIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-xl!'>
        <DialogHeader>
          <DialogTitle>Hoàn thiện hợp đồng</DialogTitle>
          <DialogDescription>
            Upload file hợp đồng đã ký cuối cùng để kích hoạt hợp đồng.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className='border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors'
          >
            <UploadCloudIcon className='size-10 mx-auto mb-3 text-muted-foreground' />
            {file ? (
              <div className='space-y-1'>
                <p className='text-sm font-medium text-foreground'>{file.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Nhấn hoặc kéo thả file vào đây</p>
                <p className='text-xs text-muted-foreground'>PDF, DOC, DOCX</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type='file'
            accept='.pdf,.doc,.docx'
            className='hidden'
            onChange={handleFileChange}
          />

          {file && (
            <div className='flex items-center justify-between px-3 py-2 rounded-lg bg-muted text-sm'>
              <span className='truncate max-w-[80%] text-foreground'>{file.name}</span>
              <Button
                variant='ghost'
                size='icon'
                className='size-6 shrink-0'
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                <XIcon className='size-3' />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={isLoading}>
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Hoàn thiện hợp đồng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}