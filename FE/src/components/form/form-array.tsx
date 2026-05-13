import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';
import {
  ArrayPath,
  Control,
  FieldArray,
  FieldValues,
  useFieldArray,
  UseFieldArrayReturn,
} from 'react-hook-form';

export type FormArrayProps<T extends FieldValues> = {
  control: Control<T>;
  name: ArrayPath<T>;
  label?: string;
  children: (
    fieldArray: UseFieldArrayReturn<T, ArrayPath<T>, 'id'>
  ) => ReactNode;
};

export function FormArray<T extends FieldValues>({
  control,
  name,
  label,
  children,
}: FormArrayProps<T>) {
  const fieldArray = useFieldArray({ control, name });

  return (
    <div className='flex-col gap-4'>
      {label && <Label>{label}</Label>}
      {children(fieldArray)}
    </div>
  );
}

export type FormArrayButtonProps<T extends FieldValues> = {
  fieldArray: UseFieldArrayReturn<T, ArrayPath<T>, 'id'>;
  index?: number;
} & PropsWithChildren;

export function FormArrayRemove<T extends FieldValues>({
  fieldArray,
  index,
}: FormArrayButtonProps<T>) {
  const { remove, fields } = fieldArray;

  return (
    <Button
      type='button'
      variant='destructive'
      size='icon-lg'
      className='mt-8 bg-destructive text-background'
      onClick={() => remove(index)}
      disabled={fields.length === 1}
    >
      <Trash2Icon className='size-5' />
    </Button>
  );
}

export function FormArrayAppend<T extends FieldValues>({
  fieldArray,
  children,
}: FormArrayButtonProps<T> & PropsWithChildren) {
  const { append } = fieldArray;

  return (
    <Button
      type='button'
      size='lg'
      onClick={() => append({} as FieldArray<T, ArrayPath<T>>)}
    >
      <PlusIcon className='size-5' strokeWidth={2} />
      {children}
    </Button>
  );
}

export function FormArrayMove<T extends FieldValues>({
  fieldArray,
  index,
}: FormArrayButtonProps<T>) {
  const { swap } = fieldArray;

  return (
    <div className='flex flex-col h-18 justify-end gap-2'>
      <Button
        type='button'
        size={'icon-sm'}
        variant={'outline'}
        onClick={() => index && swap(index, index - 1)}
      >
        <ChevronUpIcon />
      </Button>

      <Button
        type='button'
        size={'icon-sm'}
        variant={'outline'}
        onClick={() => index && swap(index, index + 1)}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}

export function FormArrayIndicator({ index }: { index: number }) {
  return (
    <div className='flex items-center justify-center rounded-full bg-primary/80 text-primary-foreground size-9 min-w-9 mt-8.5'>
      <span>{index + 1}</span>
    </div>
  );
}
