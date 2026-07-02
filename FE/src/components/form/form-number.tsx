import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useController,
} from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

export type FormNumberProps<T extends FieldValues> = FormControlProps<T> &
  Omit<
    ComponentProps<'input'>,
    | keyof FormControlProps<T>
    | keyof ControllerRenderProps<T, Path<T>>
    | 'id'
    | 'type'
    | 'inputMode'
    | 'pattern'
    | 'defaultValue'
  >;

export function FormNumber<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  autoComplete = 'off',
  disabled,
  readOnly,
  ...props
}: FormNumberProps<T>) {
  const {
    field: { onChange, value, ...field },
    fieldState,
  } = useController({ control, name, disabled });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel htmlFor={name}>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <InputGroup
        className={cn(
          'h-10',
          disabled && 'bg-muted text-foreground',
          readOnly && 'bg-muted text-foreground',
          className
        )}
      >
        <NumericFormat
          decimalSeparator=','
          thousandSeparator='.'
          value={value}
          onValueChange={(values) => {
            onChange(values.floatValue === undefined ? '' : values.floatValue);
          }}
          {...field}
          disabled={disabled}
          customInput={InputGroupInput}
          id={name}
          autoComplete={autoComplete}
          required={required}
          type='text'
          inputMode='decimal'
          readOnly={readOnly}
          {...props}
        />
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
