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
import { format, parseISO } from 'date-fns';
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
};

function parseISODate(value: unknown): Date | null {
  if (!value || typeof value !== 'string') return null;
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
}: {
  field: ControllerRenderProps<T>;
  placeholder?: string;
  readonly?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const parsedDate = parseISODate(field.value);
  const displayValue = parsedDate
    ? format(parsedDate, 'dd/MM/yyyy', { locale: vi })
    : '';

  const handleCalendarSelect = (date: Date | undefined) => {
    field.onChange(date ? toISODateString(date) : undefined);
    setOpen(false);
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
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
