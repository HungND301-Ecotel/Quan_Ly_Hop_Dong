import { Form } from '@/components/form/form';
import {
  FormArrayAppend,
  FormArrayIndicator,
  FormArrayMove,
  FormArrayRemove,
} from '@/components/form/form-array';
import { FormRow } from '@/components/form/form-row';
import { FormSelect } from '@/components/form/form-select';
import { StepperPrev } from '@/components/stepper';
import { useStepperContext } from '@/components/stepper/context';
import { Button } from '@/components/ui/button';
import { Item, ItemContent } from '@/components/ui/item';
import { SignatureType } from '@/constants/signature-type';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import {
  SignFlowsDefault,
  SignFlowsSchema,
  SignFlowsValues,
} from '@/features/main/contract/edit/sign-flows/schema';
import { departmentService } from '@/services/department';
import { Department } from '@/services/department/type';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

export function ContractSignFlowsForm() {
  const { next } = useStepperContext();
  const { setSignFlows, signFlows, contract, isUpdate, loading } = useContractEditContext();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<SignFlowsValues>({
    resolver: zodResolver(SignFlowsSchema),
    defaultValues: signFlows || SignFlowsDefault,
    mode: 'onSubmit',
  });

  const formArray = useFieldArray({
    control: form.control,
    name: 'signers',
  });

  useEffect(() => {
    if (!isUpdate || loading || !contract) return;

    const mappedSigners = contract.signingFlows?.map((flow) => ({
      departmentId: flow.departmentId || '',
      signerId: flow.userId || '',
      signTypeId: flow.signatureType?.toString() || '',
    })) || [];

    const formData: SignFlowsValues = {
      signers: mappedSigners.length > 0 ? mappedSigners : SignFlowsDefault.signers,
    };

    form.reset(formData);
  }, [isUpdate, contract, loading, form]);

  useEffect(() => {
    if (signFlows) {
      form.reset(signFlows);
    }
  }, [signFlows, form]);

  useEffect(() => {
    const promises = Promise.all([
      departmentService.getDepartmentList(),
      userService.getUserList(),
    ]);

    promises.then(([departments, users]) => {
      setDepartments(departments || []);
      setUsers(users || []);
    });
  }, []);

  // Helper function: Tìm vị trí người đầu tiên chọn "Ký số" (signatureType = 2)
  const getFirstDigitalSignIndex = () => {
    const signers = form.watch('signers');
    return signers.findIndex((signer) => signer.signTypeId === '2');
  };

  // Watch all signers to auto-set digital sign for people after first digital signer
  const allSigners = form.watch('signers');
  
  useEffect(() => {
    const firstDigitalSignIndex = allSigners.findIndex(
      (signer) => signer.signTypeId === '2'
    );

    if (firstDigitalSignIndex !== -1) {
      // Auto set all signers after first digital signer to digital sign
      allSigners.forEach((signer, index) => {
        if (index > firstDigitalSignIndex && signer.signTypeId !== '2') {
          form.setValue(`signers.${index}.signTypeId`, '2');
        }
      });
    }
  }, [allSigners, form]);

  const handleSubmit = (values: SignFlowsValues) => {
    setSignFlows(values);
    next();
  };

  return (
    <Form
      context={form}
      onSubmit={handleSubmit}
      className='flex flex-col gap-4'
    >
      <div className='flex items-center gap-4 justify-between'>
        <span className='text-sm text-muted-foreground'>
          Thêm thành phần ký vào luồng phê duyệt (theo thứ tự từ trên xuống
          dưới)
        </span>
        <FormArrayAppend
          fieldArray={formArray}
          children={'Thêm thành phần ký'}
        />
      </div>

      {formArray.fields.map((field, index) => {
        const watchedDepartmentId = form.watch(`signers.${index}.departmentId`);
        const watchedSignerId = form.watch(`signers.${index}.signerId`);

        const filteredUsers = (() => {
          if (!watchedDepartmentId) return [];

          return users.filter(
            (user) => user.departmentId === watchedDepartmentId
          );
        })();

        // Kiểm tra xem có người nào ở vị trí trước chọn "Ký số" không
        const firstDigitalSignIndex = getFirstDigitalSignIndex();
        const mustBeDigitalSign = firstDigitalSignIndex !== -1 && index > firstDigitalSignIndex;

        // Filter options dựa trên logic
        const availableSignTypes = (() => {
          if (mustBeDigitalSign) {
            // Chỉ cho phép "Ký số"
            return [{ value: '2', label: SignatureType[2] }];
          }
          // Cho phép tất cả các loại
          return Object.entries(SignatureType).map(([key, value]) => ({
            value: key,
            label: value,
          }));
        })();

        return (
          <Item variant={'outline'} key={field.id} className='bg-background'>
            <ItemContent>
              <FormRow>
                <FormArrayMove fieldArray={formArray} index={index} />

                <FormArrayIndicator index={index} />

                <FormSelect
                  control={form.control}
                  name={`signers.${index}.departmentId`}
                  label='Phòng ban'
                  placeholder='Chọn phòng ban'
                  options={departments.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  required
                />

                <FormSelect
                  control={form.control}
                  name={`signers.${index}.signerId`}
                  label='Người ký'
                  placeholder='Chọn người ký'
                  options={filteredUsers.map((item) => ({
                    value: item.id.toString(),
                    label: item.fullname,
                    render: (
                      <div className='space-y-1 ps-1'>
                        <p className='font-semibold text-sm'>{item.fullname}</p>
                        <p className='text-xs'>{item.email}</p>
                      </div>
                    ),
                  }))}
                  required
                />

                <FormSelect
                  control={form.control}
                  name={`signers.${index}.signTypeId`}
                  label='Loại chữ ký'
                  placeholder='Chọn loại chữ ký'
                  required
                  disabled={!watchedSignerId || mustBeDigitalSign}
                  options={availableSignTypes}
                />

                <FormArrayRemove fieldArray={formArray} index={index} />
              </FormRow>
            </ItemContent>
          </Item>
        );
      })}

      <div className='fixed bottom-0 start-0 p-6 py-4 shadow bg-background w-full border-t flex items-center justify-between'>
        <StepperPrev>Quay lại</StepperPrev>
        <div className='mx-auto hidden md:block' />
        <Button
          type='submit'
          size={'lg'}
          className='px-4 w-24'
          onClick={() => {
            console.log(form.formState.errors);
          }}
        >
          Tiếp tục
        </Button>
      </div>
    </Form>
  );
}