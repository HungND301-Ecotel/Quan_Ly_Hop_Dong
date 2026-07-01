import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormTextArea } from '@/components/form/form-text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateProcurementMethodValues,
  createProcurementMethodSchema,
} from '../create/procurement-method-schema';
import { FormRow } from '@/components/form/form-row';

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
      description: '',
      ...defaultValues,
    },
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <Form
      id={id}
      context={form}
      onSubmit={readOnly ? (e: any) => e.preventDefault() : onSubmit}
      className='flex flex-col overflow-hidden'
    >
      <div className='flex-1 p-6 flex flex-col gap-6'>
        <FormRow>
          <FormInput
            control={form.control}
            name='code'
            label='Mã hình thức lựa chọn nhà thầu'
            placeholder='Nhập mã hình thức lựa chọn nhà thầu'
            disabled={readOnly}
          />
        </FormRow>
        <FormRow>
          <FormInput
            control={form.control}
            name='name'
            label='Hình thức lựa chọn nhà thầu'
            placeholder='Nhập hình thức lựa chọn nhà thầu'
            disabled={readOnly}
          />
        </FormRow>
        <div className='col-span-2'>
          <FormTextArea
            control={form.control}
            name='description'
            label='Ghi chú'
            placeholder='Nhập ghi chú'
            disabled={readOnly}
          />
        </div>
      </div>
    </Form>
  );
}
