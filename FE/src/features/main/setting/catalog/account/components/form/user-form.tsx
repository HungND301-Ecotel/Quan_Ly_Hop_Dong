import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { Department } from '@/services/department/type';
import { Position } from '@/services/postion/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  CreateUserFormValues,
  createUserSchema,
} from '../create/user-form-schema';

interface UserFormProps {
  id: string;
  positions: Position[];
  departments: Department[];
  defaultValues?: Partial<CreateUserFormValues>;
  readOnly?: boolean;
  isEdit?: boolean;
  onSubmit?: (data: CreateUserFormValues) => void;
}

export function UserForm({
  id,
  positions,
  departments,
  defaultValues,
  readOnly,
  isEdit,
  onSubmit,
}: UserFormProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      userName: '',
      fullname: '',
      phoneNumber: '',
      email: '',
      password: '123456',
      departmentId: '',
      positionId: '',
      ...defaultValues,
    },
  });

  const positionOptions = positions.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <Form
      id={id}
      context={form}
      onSubmit={readOnly ? (e: any) => e.preventDefault() : onSubmit}
      className='grid grid-cols-2 gap-4'
    >
      {/* Row 1: Họ và tên - full width */}
      <div className='col-span-2'>
        <FormInput
          control={form.control}
          name='fullname'
          label='Họ và tên'
          placeholder='Nhập họ và tên'
          required
          disabled={readOnly}
        />
      </div>

      {/* Row 2: Điện thoại | Email */}
      <FormInput
        control={form.control}
        name='phoneNumber'
        label='Số điện thoại'
        placeholder='Nhập số điện thoại'
        required
        disabled={readOnly}
      />

      <FormInput
        control={form.control}
        name='email'
        label='Email'
        placeholder='Nhập email'
        required
        disabled={readOnly}
      />

      {/* Row 3: Chức vụ - full width */}
      <div className='col-span-2'>
        <FormSelect
          control={form.control}
          name='positionId'
          label='Chức vụ'
          placeholder='Chọn chức vụ'
          options={positionOptions}
          required
          disabled={readOnly}
        />
      </div>

      {/* Row 4: Phòng ban - full width */}
      <div className='col-span-2'>
        <FormSelect
          control={form.control}
          name='departmentId'
          label='Phòng ban'
          placeholder='Chọn phòng ban'
          options={departmentOptions}
          required
          disabled={readOnly}
        />
      </div>

      {/* Row 5: Tên đăng nhập | Mật khẩu */}
      <FormInput
        control={form.control}
        name='userName'
        label='Tên đăng nhập'
        placeholder='Nhập tên đăng nhập'
        required
        disabled={readOnly || isEdit}
      />

      {!readOnly && !isEdit ? (
        <FormInput
          control={form.control}
          name='password'
          label='Mật khẩu'
          type='password'
          placeholder='Nhập mật khẩu (tùy chọn)'
          autoComplete='new-password'
        />
      ) : (
        <div />
      )}
    </Form>
  );
}
