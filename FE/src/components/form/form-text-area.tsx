import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupTextarea } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useController,
} from 'react-hook-form';

export type FormTextAreaProps<T extends FieldValues> = FormControlProps<T> &
  Omit<
    ComponentProps<'textarea'>,
    keyof FormControlProps<T> | keyof ControllerRenderProps<T, Path<T>> | 'id'
  >;

export function FormTextArea<T extends FieldValues>({
  control,
  name,
  label,
  autoComplete = 'off',
  required = false,
  className,
  ...props
}: FormTextAreaProps<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel htmlFor={name}>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <InputGroup className={cn('h-10', className)}>
        <InputGroupTextarea
          {...props}
          {...field}
          id={name}
          autoComplete={autoComplete}
          required={required}
        />
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
