import { FormControlProps } from '@/components/form/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { FieldValues, useController } from 'react-hook-form';

export type FormSelectOption = {
  value: string;
  label: string;
  render?: ReactNode;
};

export type FormSelectProps<T extends FieldValues> = FormControlProps<T> & {
  placeholder?: string;
  options?: FormSelectOption[];
  readonly?: boolean;
  required?: boolean;
  disabled?: boolean;
  trigger?: (selected?: FormSelectOption) => ReactNode;
};

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '',
  options = [],
  required,
  disabled,
  trigger,
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ control, name, disabled });

  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value == field.value)?.label,
    [field.value, options]
  );

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel>
          <span>{label}</span>
          {required && <span className='text-destructive'>*</span>}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}
        >
          {(() => {
            return trigger?.(
              options.find((option) => option.value === field.value)
            );
          })() || (
            <InputGroup className={cn('h-10', disabled && 'opacity-50')}>
              <InputGroupInput
                placeholder={placeholder}
                value={selectedLabel || ''}
                readOnly
                className={cn(
                  'cursor-pointer',
                  disabled && 'cursor-not-allowed'
                )}
              />

              <InputGroupAddon
                align={'inline-end'}
                className='hover:text-primary cursor-pointer'
                onClick={() => setOpen(!open)}
              >
                <ChevronDownIcon />
              </InputGroupAddon>
            </InputGroup>
          )}
        </PopoverTrigger>

        <PopoverContent
          className='p-0'
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align='start'
        >
          <Command>
            <CommandInput placeholder={'Tìm kiếm'} />
            <CommandList
              className='max-h-54'
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected =
                    String(field.value) === String(option.value);
                  return (
                    <CommandItem
                      key={`${option.label}-${option.value}`}
                      value={`${option.label}-${option.value}`}
                      onSelect={() => {
                        field.onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <div
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background'
                        )}
                      >
                        {isSelected && (
                          <div className='size-1.5 rounded-full bg-current' />
                        )}
                      </div>
                      {option.render ? (
                        option.render
                      ) : (
                        <span>{option.label}</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
