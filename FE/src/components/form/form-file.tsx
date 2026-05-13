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
import { FileText, Upload, X } from 'lucide-react';
import React, { useRef } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

export type FormFileProps<T extends FieldValues> = FormControlProps<T> & {
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
  className?: string;
};

export function FormFile<T extends FieldValues>({
  label,
  accept = '.pdf,.docx',
  maxSize = 10,
  placeholder,
  required,
  multiple,
  control,
  name,
}: FormFileProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { field, fieldState } = useController({ control, name });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      field.onChange(null);
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Kích thước file không được vượt quá ${maxSize}MB`);
      field.onChange(null);
      return;
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = accept.split(',').map((ext) => ext.replace('.', ''));
    if (fileExt && !allowedExts.includes(fileExt)) {
      alert(`Chỉ chấp nhận file: ${accept}`);
      field.onChange(null);
      return;
    }

    field.onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
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
    <Field data-invalid={fieldState.invalid} className=''>
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

      {!field.value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 h-30 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors'
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
            <FileText className='size-14 text-primary' />
          </ItemMedia>
          <ItemContent className='gap-1 overflow-hidden'>
            <ItemTitle className='text-lg truncate block max-w-full overflow-hidden'>
              {field.value.name}
            </ItemTitle>
            <ItemDescription className='text-base'>
              {formatFileSize(field.value.size)}
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
