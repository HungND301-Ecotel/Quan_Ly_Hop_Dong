import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateProcurementMethodValues,
  createProcurementMethodSchema,
} from '../create/procurement-method-schema';

interface UserFormProps {
  id: string;
  defaultValues?: Partial<CreateProcurementMethodValues>;
  readOnly?: boolean;
  isEdit?: boolean;
  onSubmit?: (data: CreateProcurementMethodValues) => void;
}

export function ProcurementMethodForm({
  id,
  defaultValues,
  readOnly,
  onSubmit,
}: UserFormProps) {
  const form = useForm<CreateProcurementMethodValues>({
    resolver: zodResolver(createProcurementMethodSchema),
    defaultValues: {
      code: '',
      name: '',
      ...defaultValues,
    },
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <Form
      id={id}
      context={form}
      onSubmit={readOnly ? (e: any) => e.preventDefault() : onSubmit}
      className='grid grid-cols-2 gap-4'
    >
      <FormInput
        control={form.control}
        name='code'
        label='Mã phương thức'
        placeholder='Nhập mã phương thức'
        required
        disabled={readOnly}
      />

      <FormInput
        control={form.control}
        name='name'
        label='Tên phương thức'
        placeholder='Nhập tên phương thức'
        required
        disabled={readOnly}
      />
    </Form>
  );
}
