import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export type FormReadonlyProps = {
  label?: string;
  value?: string;
  placeholder?: string;
};

export function FormReadonly({ label, value, placeholder }: FormReadonlyProps) {
  return (
    <Field>
      {label && (
        <FieldLabel>
          <span>{label}</span>
        </FieldLabel>
      )}
      <InputGroup className={cn('h-10 bg-muted')}>
        <InputGroupInput value={value} placeholder={placeholder} readOnly />
      </InputGroup>
    </Field>
  );
}
