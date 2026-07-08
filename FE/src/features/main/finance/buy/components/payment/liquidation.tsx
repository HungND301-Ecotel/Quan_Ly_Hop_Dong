import { ContractLiquidation } from '@/features/main/contract/liquidation/LiquidationContract';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import {
  EyeIcon,
  FileTextIcon,
  HistoryIcon,
  Trash2Icon,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileViewerModal } from './modal/PDFViewModal';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { contractPaymentService } from '@/services/contract-payment';

type LiquidationSectionProps = {
  contractId: string;
  initialFile?: string;
  onSave: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  onSuccess?: () => void;
  disabled?: boolean;
};

const getFileName = (filePath: string) => {
  const fileName = filePath.split('/').pop() || filePath;
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export function LiquidationSection({
  contractId,
  initialFile,
  onSuccess,
  disabled = false,
}: LiquidationSectionProps) {
  const [file, setFile] = useState<string | undefined>(initialFile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  const handlePreviewFile = async (filePath: string) => {
    try {
      setIsLoadingFile(true);
      // Strip domain nếu là full URL
      let s3Key = filePath.replace(/^https?:\/\/[^/]+\//, '');
      // Thêm prefix "contracts/" nếu chưa có
      if (!s3Key.startsWith('contracts/')) {
        s3Key = `contracts/${s3Key}`;
      }
      const fileObj = await api.file(s3Key, false);
      setSelectedFile(fileObj);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error getting file:', error);
      toast.error('Không thể mở file');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contractPaymentService.updateLiquidationFile(contractId, '');
      toast.success('Đã xóa file thanh lý');
      setFile(undefined);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting liquidation file:', error);
      toast.error('Lỗi khi xóa file thanh lý');
    }
  };

  return (
    <section className='space-y-4 pt-6 border-t'>
      <div className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
        <HistoryIcon className='size-5' />
        <h3>Thanh lý hợp đồng</h3>
      </div>

      <div className='flex items-center gap-4 w-full'>
        {!file ? (
          disabled ? (
            <Button
              variant='destructive'
              type='button'
              size='lg'
              className='w-full'
              disabled
            >
              <HistoryIcon className='size-4' />
              Thanh lý hợp đồng
            </Button>
          ) : (
            <ContractLiquidation
              contractId={contractId}
              callback={(filePath) => {
                setFile(filePath); // ✅ cập nhật hiển thị ngay
                onSuccess?.();
              }}
              trigger={
                <Button
                  variant='destructive'
                  type='button'
                  size='lg'
                  className='w-full'
                >
                  <HistoryIcon className='size-4' />
                  Thanh lý hợp đồng
                </Button>
              }
            />
          )
        ) : (
          <div className='w-full'>
            <Item variant='outline' className='bg-background shadow-xs'>
              <ItemMedia
                variant='icon'
                className='bg-primary/10 text-primary size-10 rounded-md'
              >
                <FileTextIcon className='size-5' />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-sm font-medium'>
                  {getFileName(file)}
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button
                  size='icon-xs'
                  variant='ghost'
                  className='hover:bg-transparent hover:text-primary'
                  type='button'
                  onClick={() => handlePreviewFile(file)}
                  disabled={isLoadingFile}
                >
                  {isLoadingFile ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <EyeIcon className='size-4' />
                  )}
                </Button>
                {!disabled && (
                  <Button
                    size='icon-xs'
                    variant='ghost'
                    className='hover:bg-transparent hover:text-destructive text-muted-foreground'
                    type='button'
                    onClick={handleDelete}
                  >
                    <Trash2Icon className='size-4' />
                  </Button>
                )}
              </ItemActions>
            </Item>
          </div>
        )}
      </div>

      <FileViewerModal
        file={selectedFile}
        fileName={selectedFile?.name}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </section>
  );
}
