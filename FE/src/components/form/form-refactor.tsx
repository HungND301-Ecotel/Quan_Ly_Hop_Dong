import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, ChevronLeftIcon } from 'lucide-react';
import { useState } from 'react';
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';
import { useController } from 'react-hook-form';

export type FormDatesYearProps<T extends FieldValues> = {
  control: Control<T>;
  from: Path<T>;
  to: Path<T>;
  label?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  fromYear?: number;
  toYear?: number;
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

// ─── Year Picker Panel ────────────────────────────────────────────────────────

function YearPicker({
  selectedYear,
  fromYear,
  toYear,
  onSelect,
}: {
  selectedYear: number;
  fromYear: number;
  toYear: number;
  onSelect: (year: number) => void;
}) {
  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  ).reverse();

  return (
    <div className='p-3 space-y-2'>
      <p className='text-xs font-medium text-muted-foreground text-center'>Chọn năm</p>
      <ScrollArea className='h-56'>
        <div className='grid grid-cols-3 gap-1 pr-3'>
          {years.map((year) => (
            <Button
              key={year}
              type='button'
              size='sm'
              variant={year === selectedYear ? 'default' : 'ghost'}
              className='h-8 text-sm'
              onClick={() => onSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Calendar with year nav ───────────────────────────────────────────────────

type Step = 'from-year' | 'from-date' | 'to-year' | 'to-date';

function FormDatesYearInput<T extends FieldValues>({
  fromField,
  toField,
  placeholder,
  disabled,
  fromYear: fromYearProp = 2000,
  toYear: toYearProp = new Date().getFullYear() + 10,
}: {
  fromField: ControllerRenderProps<T>;
  toField: ControllerRenderProps<T>;
  placeholder?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('from-year');

  const currentYear = new Date().getFullYear();
  const [fromSelectedYear, setFromSelectedYear] = useState(currentYear);
  const [toSelectedYear, setToSelectedYear] = useState(currentYear);

  // Month navigation state for each calendar
  const [fromMonth, setFromMonth] = useState<Date>(
    new Date(currentYear, new Date().getMonth())
  );
  const [toMonth, setToMonth] = useState<Date>(
    new Date(currentYear, new Date().getMonth())
  );

  const fromDate = parseISODate(fromField.value);
  const toDate = parseISODate(toField.value);

  const displayValue = fromDate
    ? `${format(fromDate, 'dd/MM/yyyy', { locale: vi })}${
        toDate ? ` - ${format(toDate, 'dd/MM/yyyy', { locale: vi })}` : ''
      }`
    : '';

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val) setStep('from-year');
  };

  // Step 1: chọn năm bắt đầu
  const handleFromYearSelect = (year: number) => {
    setFromSelectedYear(year);
    setFromMonth(new Date(year, new Date().getMonth()));
    setStep('from-date');
  };

  // Step 2: chọn ngày bắt đầu
  const handleFromDateSelect = (date: Date | undefined) => {
    if (!date) return;
    fromField.onChange(toISODateString(date));
    toField.onChange(undefined); // reset to date
    setStep('to-year');
  };

  // Step 3: chọn năm kết thúc
  const handleToYearSelect = (year: number) => {
    setToSelectedYear(year);
    setToMonth(new Date(year, new Date().getMonth()));
    setStep('to-date');
  };

  // Step 4: chọn ngày kết thúc
  const handleToDateSelect = (date: Date | undefined) => {
    if (!date) return;
    toField.onChange(toISODateString(date));
    setOpen(false);
  };

  const stepLabel: Record<Step, string> = {
    'from-year': 'Chọn năm bắt đầu',
    'from-date': `Chọn ngày bắt đầu (${fromSelectedYear})`,
    'to-year': 'Chọn năm kết thúc',
    'to-date': `Chọn ngày kết thúc (${toSelectedYear})`,
  };

  const canGoBack: Record<Step, Step | null> = {
    'from-year': null,
    'from-date': 'from-year',
    'to-year': 'from-date',
    'to-date': 'to-year',
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
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
          <InputGroupAddon align='inline-end'>
            <CalendarIcon className='size-4' strokeWidth={2} />
          </InputGroupAddon>
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent align='center' className='w-auto p-0 shadow-md' hidden={disabled}>
        {/* Header nav */}
        <div className='flex items-center gap-2 px-3 pt-3 pb-2 border-b'>
          {canGoBack[step] && (
            <Button
              type='button'
              size='icon'
              variant='ghost'
              className='size-7'
              onClick={() => setStep(canGoBack[step]!)}
            >
              <ChevronLeftIcon className='size-4' />
            </Button>
          )}
          <p className='flex-1 text-center text-xs font-medium text-muted-foreground'>
            {stepLabel[step]}
          </p>
          {/* Placeholder để giữ layout khi không có back button */}
          {!canGoBack[step] && <div className='size-7' />}
        </div>

        {/* Step content */}
        {step === 'from-year' && (
          <YearPicker
            selectedYear={fromSelectedYear}
            fromYear={fromYearProp}
            toYear={toYearProp}
            onSelect={handleFromYearSelect}
          />
        )}

        {step === 'from-date' && (
          <Calendar
            mode='single'
            locale={vi}
            month={fromMonth}
            onMonthChange={setFromMonth}
            selected={fromDate}
            onSelect={handleFromDateSelect}
            defaultMonth={new Date(fromSelectedYear, new Date().getMonth())}
            fromYear={fromYearProp}
            toYear={toYearProp}
          />
        )}

        {step === 'to-year' && (
          <YearPicker
            selectedYear={toSelectedYear}
            fromYear={fromYearProp}
            toYear={toYearProp}
            onSelect={handleToYearSelect}
          />
        )}

        {step === 'to-date' && (
          <Calendar
            mode='single'
            locale={vi}
            month={toMonth}
            onMonthChange={setToMonth}
            selected={toDate}
            onSelect={handleToDateSelect}
            disabled={fromDate ? { before: fromDate } : undefined}
            defaultMonth={new Date(toSelectedYear, new Date().getMonth())}
            fromYear={fromYearProp}
            toYear={toYearProp}
          />
        )}

        {/* Progress indicator */}
        <div className='flex gap-1 justify-center pb-3 pt-1'>
          {(['from-year', 'from-date', 'to-year', 'to-date'] as Step[]).map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 rounded-full transition-all',
                s === step ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Export component ─────────────────────────────────────────────────────────

export function FormDatesYear<T extends FieldValues>({
  control,
  from,
  to,
  label,
  placeholder,
  disabled,
  readonly,
  required,
  fromYear,
  toYear,
}: FormDatesYearProps<T>) {
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
      <FormDatesYearInput
        fromField={fromField}
        toField={toField}
        placeholder={placeholder}
        disabled={disabled || readonly}
        fromYear={fromYear}
        toYear={toYear}
      />
      {invalid && <FieldError errors={errors} />}
    </Field>
  );
}