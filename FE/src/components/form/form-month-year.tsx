import { FormControlProps } from '@/components/form/form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, Path, useController } from 'react-hook-form';

export type FormMonthYearProps<T extends FieldValues> = Omit<
  FormControlProps<T>,
  'name'
> & {
  month: Path<T>;
  year: Path<T>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export function FormMonthYear<T extends FieldValues>({
  control,
  month,
  year,
  label,
  placeholder = 'MM/yyyy',
  required,
  disabled,
}: FormMonthYearProps<T>) {
  const { field: monthField, fieldState: monthFieldState } = useController({
    control,
    name: month,
    disabled,
  });

  const { field: yearField, fieldState: yearFieldState } = useController({
    control,
    name: year,
    disabled,
  });

  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    yearField.value ?? currentYear  // ← giống QuarterYear, bỏ Number()
  );
  const displayValue =
    monthField.value && yearField.value  // ← giống QuarterYear, bỏ Number()
      ? `Tháng ${monthField.value < 10 ? `0${monthField.value}` : monthField.value}/${yearField.value}`
      : placeholder;


  const handleYearChange = (yearStr: string) => {
    const yearNum = Number(yearStr);
    setSelectedYear(yearNum);
    // Chỉ update form nếu đã có tháng được chọn
    if (monthField.value) {
      yearField.onChange(yearNum);
    }
  };

  const handleMonthClick = (monthNum: number) => {
    monthField.onChange(monthNum);
    // Luôn commit năm vào form khi chọn tháng (selectedYear luôn có giá trị)
    yearField.onChange(selectedYear);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Khi mở dropdown, luôn đảm bảo có năm được chọn (mặc định là năm hiện tại)
      if (!yearField.value || yearField.value === null || yearField.value === '') {
        setSelectedYear(currentYear);
      } else {
        setSelectedYear(yearField.value);
      }
    }
  };

  return (
    <Field data-invalid={monthFieldState.invalid || yearFieldState.invalid}>
      {label && (
        <FieldLabel>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            size={'lg'}
            variant={'outline'}
            className='justify-between hover:bg-background'
          >
            <span
              className={cn(
                'truncate font-normal',
                displayValue === placeholder && 'text-muted-foreground'
              )}
            >
              {displayValue}
            </span>
            <CalendarIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='p-3 w-fit space-y-2' align='center'>
          <Select
            value={String(selectedYear)}
            onValueChange={handleYearChange}
            key={isOpen ? 'open' : 'closed'}
          >
            <SelectTrigger className='w-full' size='lg'>
              <SelectValue placeholder={'Chọn năm'} />
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

            <div className='grid grid-cols-4 gap-2'>
              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const isSelected = Number(monthField.value) === month;
                const displayValue = month < 10 ? `0${month}` : month;
                return (
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    size={'icon'}
                    key={month}
                    value={String(month)}
                    onClick={() => handleMonthClick(month)}
                  >
                    {displayValue}
                  </Button>
                );
              })}
            </div>
          </Select>
        </DropdownMenuContent>
      </DropdownMenu>
      {(monthFieldState.invalid || yearFieldState.invalid) && (
        <FieldError errors={[monthFieldState.error, yearFieldState.error]} />
      )}
    </Field>
  );
}
