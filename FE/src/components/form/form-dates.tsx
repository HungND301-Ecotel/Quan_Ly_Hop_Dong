import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';
import { useController } from 'react-hook-form';

export type FormDatesProps<T extends FieldValues> = {
  control: Control<T>;
  from: Path<T>;
  to: Path<T>;
  label?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
};

function parseISODate(value: unknown): Date | undefined {
  if (!value || typeof value !== 'string') return undefined;
  try {
    const date = parseISO(value);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function FormDatesInput<T extends FieldValues>({
  fromField,
  toField,
  placeholder,
  disabled,
}: {
  fromField: ControllerRenderProps<T>;
  toField: ControllerRenderProps<T>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const range: DateRange = {
    from: parseISODate(fromField.value),
    to: parseISODate(toField.value),
  };

  const displayValue = range.from
    ? `${format(range.from, 'dd/MM/yyyy', { locale: vi })}${
        range.to ? ` - ${format(range.to, 'dd/MM/yyyy', { locale: vi })}` : ''
      }`
    : '';

  const handleCalendarSelect = (range: DateRange | undefined) => {
    fromField.onChange(range?.from ? toISODateString(range.from) : undefined);
    toField.onChange(range?.to ? toISODateString(range.to) : undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <InputGroup
          className={cn(
            'h-9 cursor-pointer',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div
            className={cn(
              'flex-1 px-3 flex items-center text-sm outline-none',
              !displayValue && 'text-muted-foreground'
            )}
          >
            {displayValue || placeholder || 'dd/MM/yyyy - dd/MM/yyyy'}
          </div>
          <InputGroupAddon align={'inline-end'}>
            <CalendarIcon className='size-4' strokeWidth={2} />
          </InputGroupAddon>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent
        align='center'
        className='w-auto p-0 shadow-none'
        hidden={disabled}
      >
        <Calendar
          mode='range'
          locale={vi}
          selected={range}
          onSelect={handleCalendarSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

export function FormDates<T extends FieldValues>({
  control,
  from,
  to,
  label,
  placeholder,
  disabled,
  readonly,
  required,
}: FormDatesProps<T>) {
  const { field: fromField, fieldState: fromFieldState } = useController({
    control,
    name: from,
  });
  const { field: toField, fieldState: toFieldState } = useController({
    control,
    name: to,
  });

  const invalid = fromFieldState.invalid || toFieldState.invalid;
  const errors = [fromFieldState.error, toFieldState.error].filter(Boolean);

  return (
    <Field data-invalid={invalid}>
      {label && (
        <FieldLabel htmlFor={from}>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <FormDatesInput
        fromField={fromField}
        toField={toField}
        placeholder={placeholder}
        disabled={disabled || readonly}
      />
      {invalid && <FieldError errors={errors} />}
    </Field>
  );
}
