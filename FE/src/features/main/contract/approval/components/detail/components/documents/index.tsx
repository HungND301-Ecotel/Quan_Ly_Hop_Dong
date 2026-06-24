import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { FolderCodeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ContractDocumentsProps = {
  documents?: { url: string; name: string; group?: 'origin' | 'signed' | 'attachment' }[];
  loading?: boolean;
};

export function ContractDocuments({
  documents,
  loading,
}: ContractDocumentsProps) {
  const [selectedFile, setSelectedFile] = useState<string>('');

  useEffect(() => {
    if (loading || !documents || documents.length === 0) return;
    setSelectedFile(documents[0].url);
  }, [documents, loading]);

  if (loading) {
    return (
      <div className='h-32 w-full border-4 border-dashed flex items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <FolderCodeIcon />
          </EmptyMedia>
          <EmptyTitle>Không có tài liệu</EmptyTitle>
          <EmptyDescription>Không có tài liệu để hiển thị</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const originDocs = documents.filter((d) => d.group === 'origin');
  const signedDocs = documents.filter((d) => d.group === 'signed');
  const attachmentDocs = documents.filter((d) => d.group === 'attachment' || !d.group);

  return (
    <div className='flex flex-col gap-3 h-full flex-1'>
      <Select value={selectedFile} onValueChange={setSelectedFile}>
        <SelectTrigger className='w-full data-[size=default]:h-10'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {originDocs.length > 0 && (
            <SelectGroup>
              <SelectLabel>Hợp đồng gốc</SelectLabel>
              {originDocs.map(({ url, name }) =>
                url && name ? (
                  <SelectItem key={url} value={url}>
                    {name}
                  </SelectItem>
                ) : null
              )}
            </SelectGroup>
          )}

          {signedDocs.length > 0 && (
            <SelectGroup>
              <SelectLabel>Hợp đồng đã ký</SelectLabel>
              {signedDocs.map(({ url, name }) =>
                url && name ? (
                  <SelectItem key={url} value={url}>
                    {name}
                  </SelectItem>
                ) : null
              )}
            </SelectGroup>
          )}

          {attachmentDocs.length > 0 && (
            <SelectGroup>
              <SelectLabel>Đính kèm</SelectLabel>
              {attachmentDocs.map(({ url, name }) =>
                url && name ? (
                  <SelectItem key={url} value={url}>
                    {name}
                  </SelectItem>
                ) : null
              )}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {selectedFile && (
        <iframe
          src={selectedFile}
          className='w-full rounded-lg h-[calc(100vh-26.3rem)]'
        />
      )}
    </div>
  );
}