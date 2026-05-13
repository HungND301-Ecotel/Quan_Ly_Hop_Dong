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

export type FormQuaterYearProps<T extends FieldValues> = Omit<
  FormControlProps<T>,
  'name'
> & {
  quater: Path<T>;
  year: Path<T>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export function FormQuaterYear<T extends FieldValues>({
  control,
  quater,
  year,
  label,
  placeholder = 'Q/yyyy',
  required,
  disabled,
}: FormQuaterYearProps<T>) {
  const { field: quaterField, fieldState: quaterFieldState } = useController({
    control,
    name: quater,
    disabled,
  });

  const { field: yearField, fieldState: yearFieldState } = useController({
    control,
    name: year,
    disabled,
  });

  const currentYear = new Date().getFullYear();
  // Luôn khởi tạo với currentYear nếu không có giá trị từ form
  const [selectedYear, setSelectedYear] = useState<number>(
    yearField.value ?? currentYear
  );
  const [isOpen, setIsOpen] = useState(false);

  const displayValue =
    quaterField.value && yearField.value
      ? `Quý ${quaterField.value}/${yearField.value}`
      : placeholder;

  const handleYearChange = (yearStr: string) => {
    const yearNum = Number(yearStr);
    setSelectedYear(yearNum);
    // Chỉ update form nếu đã có quý được chọn
    if (quaterField.value) {
      yearField.onChange(yearNum);
    }
  };

  const handleQuaterClick = (quaterNum: number) => {
    quaterField.onChange(quaterNum);
    // Luôn commit năm vào form khi chọn quý (selectedYear luôn có giá trị)
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
    <Field data-invalid={quaterFieldState.invalid || yearFieldState.invalid}>
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
              {Array.from({ length: 4 }, (_, index) => {
                const quater = index + 1;
                const isSelected = Number(quaterField.value) === quater;
                const displayValue = quater < 10 ? `0${quater}` : quater;
                return (
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    size={'icon'}
                    key={quater}
                    value={String(quater)}
                    onClick={() => handleQuaterClick(quater)}
                  >
                    {displayValue}
                  </Button>
                );
              })}
            </div>
          </Select>
        </DropdownMenuContent>
      </DropdownMenu>
      {(quaterFieldState.invalid || yearFieldState.invalid) && (
        <FieldError errors={[quaterFieldState.error, yearFieldState.error]} />
      )}
    </Field>
  );
}
