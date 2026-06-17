import { ContractLiquidation } from '@/features/main/contract/liquidation/LiquidationContract';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { EyeIcon, FileTextIcon, HistoryIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type LiquidationSectionProps = {
  contractId: string;
  initialFile?: string;
  onSave: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  onSuccess?: () => void;
  disabled?: boolean;
};

export function LiquidationSection({
  contractId,
  initialFile,
  onSuccess,
  disabled = false,
}: LiquidationSectionProps) {
  const [file, setFile] = useState<string | undefined>(initialFile);

  useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  return (
    <section className='space-y-4 pt-6 border-t'>
      <div className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
        <HistoryIcon className='size-5' />
        <h3>Thanh lý hợp đồng</h3>
      </div>

      <div className='flex items-center gap-4 w-full'>
        {!file ? (
          disabled ? (
            <Button variant='destructive' type='button' size='lg' className='w-full' disabled>
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
                <Button variant='destructive' type='button' size='lg' className='w-full'>
                  <HistoryIcon className='size-4' />
                  Thanh lý hợp đồng
                </Button>
              }
            />
          )
        ) : (
          <div className='w-full'>
            <Item variant='outline' className='bg-background shadow-xs'>
              <ItemMedia variant='icon' className='bg-primary/10 text-primary size-10 rounded-md'>
                <FileTextIcon className='size-5' />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-sm font-medium'>{file}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button size='icon-xs' variant='ghost' className='hover:bg-transparent hover:text-primary' type='button'>
                  <EyeIcon className='size-4' />
                </Button>
              </ItemActions>
            </Item>
          </div>
        )}
      </div>
    </section>
  );
}