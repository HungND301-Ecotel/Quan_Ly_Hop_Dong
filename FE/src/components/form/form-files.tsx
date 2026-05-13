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
import React, { useRef, useState } from 'react';
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
};

export function FormFiles<T extends FieldValues>({
  label,
  accept,
  maxSize,
  placeholder,
  required,
  control,
  name,
}: FormFilesProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { field, fieldState } = useController({ control, name });

  const [size, setSize] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      field.onChange(null);
      return;
    }

    const totalSize = Array.from(files).reduce(
      (acc, file) => acc + file.size,
      0
    );

    if (maxSize) {
      if (totalSize > maxSize * 1024 * 1024) {
        toast.error(`Kích thước file không được vượt quá ${maxSize}MB`);
        e.target.value = '';
        field.onChange(null);
        return;
      }
    }

    if (accept) {
      const allowedExts = accept
        .split(',')
        .map((ext) => ext.trim().toLowerCase().replace('.', ''));

      const isValid = Array.from(files).every((file) => {
        const fileName = file.name.toLowerCase();
        return allowedExts.some((ext) => fileName.endsWith(ext));
      });

      if (!isValid) {
        toast.error(`Chỉ chấp nhận file: ${accept}`);
        e.target.value = '';
        field.onChange(null);
        return;
      }
    }

    field.onChange(Array.from(files));
    setSize(totalSize);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
    setSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
        multiple={true}
        id={name}
      />

      {!field.value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
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
        <Item
          variant={'outline'}
          className='border-2 border-dashed border-primary h-30 bg-muted'
        >
          <ItemMedia
            variant={'icon'}
            className='flex justify-center items-center h-full'
          >
            <FilesIcon className='size-14 text-primary' />
          </ItemMedia>
          <ItemContent className='gap-1 overflow-hidden'>
            <ItemTitle className='text-lg truncate max-w-full'>
              {field.value.length} files
            </ItemTitle>
            <ItemDescription className='text-base truncate max-w-full'>
              {formatFileSize(size)}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant='ghost'
              size='icon-lg'
              onClick={handleRemove}
              className='hover:bg-destructive/10 hover:text-destructive'
            >
              <X className='size-5' />
            </Button>
          </ItemActions>
        </Item>
      )}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
