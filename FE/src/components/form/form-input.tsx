import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { ComponentProps, HTMLInputTypeAttribute, useState } from 'react';
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useController,
} from 'react-hook-form';

export type FormInputProps<T extends FieldValues> = FormControlProps<T> &
  Omit<
    ComponentProps<'input'>,
    keyof FormControlProps<T> | keyof ControllerRenderProps<T, Path<T>> | 'id'
  > & {
    disabled?: boolean;
  };

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type,
  autoComplete = 'off',
  required = false,
  className,
  disabled,
  ...props
}: FormInputProps<T>) {
  const { field, fieldState } = useController({ control, name, disabled });

  const [inputType, setInputType] = useState<
    HTMLInputTypeAttribute | undefined
  >(type);

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel htmlFor={name}>
          <span>{label}</span>
          {required && <span className='text-destructive'> *</span>}
        </FieldLabel>
      )}
      <InputGroup className={cn('h-10', className)}>
        <InputGroupInput
          {...props}
          {...field}
          type={inputType}
          id={name}
          autoComplete={autoComplete}
          required={required}
        />
        {type === 'password' && (
          <InputGroupAddon
            align={'inline-end'}
            onClick={() =>
              setInputType(inputType === 'password' ? 'text' : 'password')
            }
          >
            {inputType === 'password' ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupAddon>
        )}
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
