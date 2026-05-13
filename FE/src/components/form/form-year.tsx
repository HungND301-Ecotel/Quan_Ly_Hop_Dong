import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';
import { FieldValues, useController } from 'react-hook-form';

export type FormYearProps<T extends FieldValues> = FormControlProps<T> & {
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export function FormYear<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Chọn năm',
  required,
  disabled,
}: FormYearProps<T>) {
  const { field, fieldState } = useController({
    control,
    name,
    disabled,
  });

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (field.value == null) {
      field.onChange(currentYear);
    }
  }, [field.value]);
  // Sử dụng field.value nếu có, nếu không thì dùng currentYear
  const displayValue = field.value ?? currentYear;

  const handleYearChange = (yearStr: string) => {
    const yearNum = Number(yearStr);
    field.onChange(yearNum);
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <Select
        value={displayValue ? String(displayValue) : ''}
        onValueChange={handleYearChange}
        disabled={disabled}
      >
        <SelectTrigger className='w-full' size='lg'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='h-48'>
          {Array.from({ length: 128 }, (_, index) => {
            const year = new Date().getFullYear() + 64 - index;

            return (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
