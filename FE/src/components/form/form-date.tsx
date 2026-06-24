import type { FormControlProps } from '@/components/form/form';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfDay, isBefore, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

export type FormDateProps<T extends FieldValues> = FormControlProps<T> & {
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  className?: string;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
};

function parseISODate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string') return null;
  try {
    const date = parseISO(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function FormDateInput<T extends FieldValues>({
  field,
  placeholder,
  readonly,
  minDate,
  maxDate,
}: {
  field: ControllerRenderProps<T>;
  placeholder?: string;
  readonly?: boolean;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
}) {
  const [open, setOpen] = useState(false);

  const parsedDate = parseISODate(field.value);
  const displayValue = parsedDate
    ? format(parsedDate, 'dd/MM/yyyy', { locale: vi })
    : '';

  const parsedMinDate = parseISODate(minDate as any);
  const parsedMaxDate = parseISODate(maxDate as any);

  const handleCalendarSelect = (date: Date | undefined) => {
    field.onChange(date ? toISODateString(date) : undefined);
    setOpen(false);
  };

  // ✅ Chặn các ngày trước minDate / sau maxDate
  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    if (parsedMinDate && isBefore(day, startOfDay(parsedMinDate))) {
      return true;
    }
    if (parsedMaxDate && isAfter(day, startOfDay(parsedMaxDate))) {
      return true;
    }
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={readonly}>
        <InputGroup className='h-10 cursor-pointer bg-background'>
          <div
            className={cn(
              'flex-1 px-3 flex items-center text-sm outline-none',
              !displayValue && 'text-muted-foreground'
            )}
          >
            {displayValue || placeholder || 'dd/MM/yyyy'}
          </div>
          <InputGroupAddon align={'inline-end'}>
            <CalendarIcon className='size-4' strokeWidth={2} />
          </InputGroupAddon>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent align='center' className='w-auto p-0 shadow-none'>
        <Calendar
          mode='single'
          locale={vi}
          selected={parsedDate ?? undefined}
          onSelect={handleCalendarSelect}
          disabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}

export function FormDate<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  readonly,
  required,
  className,
  minDate,
  maxDate,
}: FormDateProps<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
      {label && (
        <FieldLabel htmlFor={name}>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <FormDateInput
        field={field}
        placeholder={placeholder}
        readonly={readonly}
        minDate={minDate}
        maxDate={maxDate}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}