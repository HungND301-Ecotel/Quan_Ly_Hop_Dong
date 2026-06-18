'use client';

import { FormControlProps } from '@/components/form/form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { FilesIcon, Upload, X } from 'lucide-react';
import React, { useRef } from 'react';
import { type FieldValues, Path, useController } from 'react-hook-form';
import { toast } from 'sonner';

export type FormFilesProps<T extends FieldValues> = Omit<
  FormControlProps<T>,
  'name'
> & {
  name: Path<T>;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
  multiple?: boolean;
};

export function FormFiles<T extends FieldValues>({
  label,
  accept,
  maxSize,
  placeholder,
  required,
  control,
  name,
  multiple = true,
}: FormFilesProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { field, fieldState } = useController({ control, name });

  const existingFilesList: any[] = Array.isArray(field.value)
    ? field.value
    : field.value
    ? [field.value]
    : [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      // Người dùng bấm Cancel trên dialog -> giữ nguyên danh sách cũ, không xoá
      return;
    }

    const newFiles = Array.from(files);

    // Khi multiple=true, cộng dồn file mới chọn vào danh sách đã có sẵn
    // Khi multiple=false, luôn thay thế bằng file mới nhất
    const combinedFiles = multiple
      ? [...existingFilesList, ...newFiles]
      : newFiles;

    const totalSize = combinedFiles.reduce(
      (acc, file) => acc + (file?.size || 0),
      0
    );

    if (maxSize) {
      if (totalSize > maxSize * 1024 * 1024) {
        toast.error(`Kích thước file không được vượt quá ${maxSize}MB`);
        e.target.value = '';
        return;
      }
    }

    if (accept) {
      const allowedExts = accept
        .split(',')
        .map((ext) => ext.trim().toLowerCase().replace('.', ''));

      const isValid = newFiles.every((file) => {
        const fileName = file.name.toLowerCase();
        return allowedExts.some((ext) => fileName.endsWith(ext));
      });

      if (!isValid) {
        toast.error(`Chỉ chấp nhận file: ${accept}`);
        e.target.value = '';
        return;
      }
    }

    field.onChange(combinedFiles);
    // reset input để có thể chọn lại đúng những file đã chọn (nếu cần) ở lần mở dialog kế tiếp
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveOne = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = existingFilesList.filter((_, i) => i !== index);
    field.onChange(updated.length > 0 ? updated : null);
  };

  const handleOpenDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filesList = existingFilesList;

  const totalSize = filesList.reduce((acc, file) => acc + (file?.size || 0), 0);

  const displayTitle =
    filesList.length === 0
      ? ''
      : filesList.length === 1
      ? filesList[0].name
      : `${filesList.length} files`;

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>
        <span>{label}</span>
        {required && <span className='text-destructive'> *</span>}
      </FieldLabel>

      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        onChange={handleFileSelect}
        className='hidden'
        multiple={multiple}
        id={name}
      />

      {filesList.length === 0 ? (
        <div
          onClick={handleOpenDialog}
          className={cn(
            'border-2 h-30 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors',
            fieldState.invalid && 'border-destructive/25'
          )}
        >
          <Upload className='h-10 w-10 mx-auto mb-4 text-muted-foreground' />
          {placeholder && (
            <p className='text-xs text-muted-foreground'>{placeholder}</p>
          )}
        </div>
      ) : (
        <div className='space-y-2'>
          <Item
            variant={'outline'}
            onClick={multiple ? handleOpenDialog : undefined}
            className={cn(
              'border-2 border-dashed border-primary h-30 bg-muted',
              multiple && 'cursor-pointer'
            )}
          >
            <ItemMedia
              variant={'icon'}
              className='flex justify-center items-center h-full'
            >
              <FilesIcon className='size-14 text-primary' />
            </ItemMedia>
            <ItemContent className='gap-1 overflow-hidden'>
              <ItemTitle className='text-lg truncate max-w-full' title={displayTitle}>
                {displayTitle}
              </ItemTitle>
              <ItemDescription className='text-base truncate max-w-full'>
                {formatFileSize(totalSize)}
                {multiple && ' · Nhấn để thêm file'}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant='ghost'
                size='icon-lg'
                onClick={handleRemove}
                className='hover:bg-destructive/10 hover:text-destructive'
                title='Xoá tất cả'
              >
                <X className='size-5' />
              </Button>
            </ItemActions>
          </Item>

          {/* Danh sách chi tiết từng file khi có nhiều hơn 1 file, cho phép xoá từng file riêng lẻ */}
          {multiple && filesList.length > 1 && (
            <div className='space-y-1'>
              {filesList.map((file, index) => (
                <div
                  key={`${file?.name}-${index}`}
                  className='flex items-center justify-between text-sm px-3 py-1.5 rounded border bg-background'
                >
                  <span className='truncate max-w-[80%]' title={file?.name}>
                    {file?.name}
                  </span>
                  <button
                    type='button'
                    onClick={(e) => handleRemoveOne(e, index)}
                    className='text-muted-foreground hover:text-destructive shrink-0'
                  >
                    <X className='size-4' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}