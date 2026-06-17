import { Form } from '@/components/form/form';
import { FormDate } from '@/components/form/form-date';
import { FormDates } from '@/components/form/form-dates';
import { FormFile } from '@/components/form/form-file';
import { FormFiles } from '@/components/form/form-files';
import {
  FormGroup,
  FormGroupContent,
  FormGroupHeader,
  FormGroupLabel,
} from '@/components/form/form-group';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/form/form-input';
import { FormMonthYear } from '@/components/form/form-month-year';
import { FormNumber } from '@/components/form/form-number';
import { FormQuaterYear } from '@/components/form/form-quater-year';
import { FormReadonly } from '@/components/form/form-readonly';
import { FormRow } from '@/components/form/form-row';
import { FormSelect } from '@/components/form/form-select';
import { FormTextArea } from '@/components/form/form-text-area';
import { FormYear } from '@/components/form/form-year';
import { StepperPrev } from '@/components/stepper';
import { useStepperContext } from '@/components/stepper/context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { GuaranteeType } from '@/constants/contract';
import { ContractRole } from '@/constants/contract-role';
import { DiscountType } from '@/constants/discount-type';
import { ScheduleType } from '@/constants/schedule-type';
import { useAuthContext } from '@/features/context';
import {
  BasicInformationDefault,
  BasicInformationSchema,
  BasicInformationValues,
} from '@/features/main/contract/edit/basic-information/schema';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import {
  MaterialInformationDefault,
  MaterialInformationValues,
  MaterialSchema,
} from '@/features/main/setting/catalog/material/edit/schema';
import { format } from '@/lib/format';
import { contractService } from '@/services/contract';
import { ContractRegisterService } from '@/services/contract-register';
import { ContractRegister } from '@/services/contract-register/type';
import { contractTypeService } from '@/services/contract-type';
import { ContractType } from '@/services/contract-type/type';
import { contractFieldService } from '@/services/contract-field';
import { ContractField } from '@/services/contract-field/type';
import { ContractGuarantee } from '@/services/contract/type';
import { departmentService } from '@/services/department';
import { Department } from '@/services/department/type';
import { fileService } from '@/services/file';
import { materialService } from '@/services/material';
import { Material } from '@/services/material/type';
import { partnerService } from '@/services/partner';
import { Partner } from '@/services/partner/type';
import { positionService } from '@/services/postion';
import { procurementMethodService } from '@/services/procurement-method';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusIcon, Save, Trash2Icon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BankAccountSelect } from '@/components/form/bank-form';
import { useApi } from '@/hooks/use-api';
import { unitOfMeasureService } from '@/services/unit';
import { Level1Code } from '@/services/level1code/type';
import { Level2CodeLookup } from '@/services/level2code/type';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { level2CodeService } from '@/services/level2code';
import { level3CodeService } from '@/services/level3code';
import { signedContentService } from '@/services/signedContent';
import { MaterialImportDialog } from '../../all/components/Materialimportdialog';
import { ContractStructureCatalog } from '@/services/structure/type';
import { contractStructureCatalogService } from '@/services/structure';
import { VirtualMaterialSelect } from '../../all/components/VirtualSelect';

// Component tạo mới vật tư inline
function CreateMaterialDialog({
  isOtherMaterial = false,
  onSuccess,
}: {
  isOtherMaterial?: boolean;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unitOfMeasures = useApi({
    service: unitOfMeasureService.getUnitOfMeasureList,
  });

  const form = useForm<MaterialInformationValues>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: MaterialInformationDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: MaterialInformationValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        unitOfMeasureId: values.unitOfMeasureId || null,
        price: values.price === undefined || values.price === null || String(values.price) === '' ? null : Number(values.price),
        ...(isOtherMaterial && { isOtherMaterial: true }),
      };
      await materialService.createMaterial(payload);
      toast.success(
        `Tạo mới ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'} thành công`
      );
      setOpen(false);
      onSuccess();
    } catch {
      toast.error(
        `Lỗi khi tạo mới ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='default'
          className='shrink-0'
        >
          <PlusIcon className='h-4 w-4' />
          <span>Tạo mới {isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Tạo mới {isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}
          </DialogTitle>
          <DialogDescription>
            Tạo mới thông tin{' '}
            {isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}
          </DialogDescription>
        </DialogHeader>
        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <FormRow>
              <FormInput
                control={form.control}
                name='materialCode'
                label={`Mã ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}`}
                placeholder={`Nhập mã ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}`}
              />
              <FormInput
                control={form.control}
                name='name'
                label={`Tên ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}`}
                placeholder={`Nhập tên ${isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư'}`}
              />
            </FormRow>

            <FormRow>
              <FormSelect
                control={form.control}
                name='unitOfMeasureId'
                label='Đơn vị tính'
                placeholder='Chọn đơn vị tính'
                options={[
                  { label: 'Không chọn', value: '' },
                  ...(unitOfMeasures.data?.map((u) => ({
                    label: u.name,
                    value: u.id,
                  })) ?? [])
                ]}
              />
              <FormNumber
                control={form.control}
                name='price'
                label='Đơn giá'
                placeholder='Nhập đơn giá'
              />
            </FormRow>
          </div>

          <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
            <Button
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='min-w-32 bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4 mr-2' />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface RoleUserArrayInputProps {
  role: 'draftingOfficer' | 'manager' | 'coordinator' | 'receivingOfficer';
  label: string;
  form: any;
  departments: Department[];
  users: User[];
}

function RoleUserArrayInput({
  role,
  label,
  form,
  departments,
  users,
}: RoleUserArrayInputProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `contractUserRoles.${role}`,
  });

  const error = form.formState.errors.contractUserRoles?.[role];

  return (
    <div className='space-y-3 p-4 border rounded-lg bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b pb-2 mb-2'>
        <div className='flex flex-col'>
          <div className='text-sm font-semibold text-slate-800'>{label}</div>
          {error?.message && (
            <p className='text-xs font-medium text-destructive mt-0.5'>{error.message}</p>
          )}
        </div>
        <Button
          type='button'
          size='sm'
          variant='outline'
          className='h-7 gap-1 px-2 text-xs'
          onClick={() => append({ departmentId: '', userId: '' })}
        >
          <PlusIcon className='size-3.5' />
          Thêm phòng ban/người
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className='text-xs text-muted-foreground italic text-center py-2'>Chưa phân công cán bộ</p>
      ) : (
        <div className='space-y-3'>
          {fields.map((field, index) => {
            const watchedDeptId = form.watch(
              `contractUserRoles.${role}.${index}.departmentId`
            );

            // Filter out userIds that have already been selected in other rows
            const siblingValues = form.watch(`contractUserRoles.${role}`) || [];
            const selectedUserIdsInOtherRows = siblingValues
              .map((val: any, idx: number) => idx !== index ? val.userId : null)
              .filter(Boolean);

            const filteredUsers = users.filter(
              (u) => u.departmentId === watchedDeptId && !selectedUserIdsInOtherRows.includes(u.id)
            );

            return (
              <div key={field.id} className='flex items-end gap-3 flex-wrap lg:flex-nowrap'>
                <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <FormSelect
                    control={form.control}
                    name={`contractUserRoles.${role}.${index}.departmentId`}
                    label={index === 0 ? 'Phòng ban' : undefined}
                    placeholder='Chọn phòng ban'
                    options={departments.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    }))}
                  />

                  <FormSelect
                    control={form.control}
                    name={`contractUserRoles.${role}.${index}.userId`}
                    label={index === 0 ? 'Cán bộ, nhân viên' : undefined}
                    placeholder='Chọn cán bộ, nhân viên'
                    disabled={!watchedDeptId}
                    options={filteredUsers.map((u) => ({
                      value: u.id,
                      label: u.fullname,
                    }))}
                  />
                </div>

                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  className={cn(
                    'text-destructive hover:text-destructive shrink-0 size-10',
                    index === 0 ? 'mt-6' : ''
                  )}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContractBasicInformationForm() {
  const { user } = useAuthContext();
  const { next: nextStep } = useStepperContext();
  const { setBasicInformation, contractFormat, isUpdate, contract, loading, basicInformation } =
    useContractEditContext();

  const isResettingForm = useRef(false);
  const hasInitializedFromContract = useRef(false);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [contractFields, setContractFields] = useState<ContractField[]>([]);
  const [contractRegisters, setContractRegisters] = useState<
    ContractRegister[]
  >([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [procurementMethods, setProcurementMethods] = useState<
    ProcurementMethod[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [otherMaterials, setOtherMaterials] = useState<Material[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [level1Codes, setLevel1Codes] = useState<Level1Code[]>([]);
  const [level2Codes, setLevel2Codes] = useState<Level2CodeLookup[]>([]);
  const [isLevel2Loading, setIsLevel2Loading] = useState(false);
  const [level3Codes, setLevel3Codes] = useState<Level3Code[]>([]);
  const [isLevel3Loading, setIsLevel3Loading] = useState(false);
  const [contractStructures, setContractStructures] = useState<ContractStructureCatalog[]>([]);

  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const form = useForm<BasicInformationValues>({

    mode: 'onSubmit',
    resolver: zodResolver(BasicInformationSchema),
    defaultValues: {
      ...BasicInformationDefault,
      departmentId: user?.departmentId,
      contractItems: [],
      contractOtherItems: [],
    },
  });

  // Function to reload materials list
  const reloadMaterials = () => {
    materialService.getMaterialList().then((data) => {
      setMaterials(data || []);
    });
  };

  // Function to reload other materials list
  const reloadOtherMaterials = () => {
    materialService.getOtherMaterialList().then((data) => {
      setOtherMaterials(data || []);
    });
  };

  const hasInitializedContractItems = useRef(false);

  useEffect(() => {
    if (isUpdate || !basicInformation) return;

    form.reset({
      ...basicInformation,
      // Chỉ xóa file/số ký hiệu/ngày nếu user chưa điền (tức là quay lại từ step trước thì giữ nguyên)
      contractFile: basicInformation.contractFile instanceof File
        ? basicInformation.contractFile
        : undefined,
      attachmentFiles: basicInformation.attachmentFiles ?? null,
      contractNumber: basicInformation.contractNumber || '',
      startDate: basicInformation.startDate || '',
      endDate: basicInformation.endDate || '',
    });
  }, [basicInformation, isUpdate]);

  useEffect(() => {
    if (!contractFormat || hasInitializedContractItems.current) return;
    hasInitializedContractItems.current = true;

    if (contractFormat?.parentContractId) {
      // Nếu đã có contractItems prefill từ basicInformation thì không fetch lại
      const existingItems = form.getValues('contractItems');
      if (existingItems && existingItems.length > 0) return;
      if (basicInformation?.contractItems && basicInformation.contractItems.length > 0) return;

      contractService
        .getContractDetail(contractFormat.parentContractId)
        .then((res) =>
          form.setValue(
            'contractItems',
            res?.contractItems?.map((item) => ({
              materialId: item.materialId,
              quantity: '' as unknown as number,
            })) || []
          )
        );
    } else {
      form.setValue('contractItems', []);
    }
  }, [contractFormat]);

  useEffect(() => {
    if (!isUpdate || loading || !contract) return;
    if (hasInitializedFromContract.current) return;
    if (isCatalogLoading) return;
    hasInitializedFromContract.current = true;

    // Helper function to extract role data list
    const getContractUserRoles = (roleId: number) => {
      const roleUsers = contract.contractUserRoles?.filter(
        (r) => r.role === roleId
      ) || [];
      if (roleUsers.length === 0) {
        return [{ userId: '', departmentId: '' }];
      }

      return roleUsers.map((roleUser) => {
        const user = users.find((u) => u.id === roleUser.userId);
        return {
          userId: roleUser.userId,
          departmentId: user?.departmentId || '',
        };
      });
    };

    const getContractGuarantee = (
      guaranteeType: number,
      guarantees: ContractGuarantee[]
    ) => {
      const guarantee = guarantees.find(
        (g) => g.guaranteeType === guaranteeType
      );
      if (!guarantee) return undefined;

      return {
        value: guarantee.value,
        valueType: guarantee.valueType,
        durationDate: guarantee.durationDate,
        bankAccountId: guarantee.bankAccountId ?? guarantee.bankAccount?.id ?? '',
      };
    };

    const promises = Promise.all([
      fileService.getFile(contract.filePath),
      ...(contract.attachments?.map((attachment) =>
        fileService.getFile(attachment.filePath)
      ) || []),
    ]);

    promises.then(([file, ...attachments]) => {
      console.log('contract.paymentSchedules:', contract.paymentSchedules);
      isResettingForm.current = true;
      if (contract.level1CodeId) {
        level2CodeService.getLevel2CodeByLevel1(contract.level1CodeId)
          .then((data) => setLevel2Codes(data || []));
        level3CodeService.getLevel3CodeByLevel1(contract.level1CodeId)
          .then((data) => setLevel3Codes(data || []));
      }
      form.reset({
        departmentId: contract.departmentId,
        level1CodeId: contract.level1CodeId,
        level2CodeId: contract.level2CodeId,
        level3CodeId: contract.level3CodeId,
        procurementMethodId: contract.procurementMethodId,
        contractStructureId: contract.contractStructureId,
        contractTypeId: contract.contractTypeId,
        contractFieldId: contract.contractFieldId,
        title: contract.title,
        contractRegisterId: contract.contractRegisterId,
        contractNumber: contract.contractNumber,
        appendixNumber: contract.appendixNumber,
        partnerId: contract.partnerId,
        startDate: contract.startDate.slice(0, 10),
        endDate: contract.endDate.slice(0, 10),
        contractFile: file,
        attachmentFiles: attachments.length > 0 ? attachments : null,
        discountType: contract.discountType,
        discountValue: contract.discountValue,
        contractUserRoles: {
          draftingOfficer: getContractUserRoles(ContractRole.DraftingOfficer.id),
          manager: getContractUserRoles(ContractRole.Manager.id),
          coordinator: getContractUserRoles(ContractRole.Coordinator.id),
          receivingOfficer: getContractUserRoles(
            ContractRole.ReceivingOfficer.id
          ),
        },
        contractValue: contract.contractValue,
        contractItems: contract.contractItems,
        contractOthersValue: contract.contractOthersValue,
        contractOtherItems: contract.contractOtherItems,
        paymentSchedules: {
          scheduleType:
            contract.paymentSchedules && contract.paymentSchedules.length > 0
              ? contract.paymentSchedules[0].scheduleType
              : undefined,
          schedules:
            contract.paymentSchedules?.map((schedule) => {
              const scheduleType = schedule.scheduleType;
              const year = schedule.year ? Number(schedule.year) : null;
              const month = schedule.month ? Number(schedule.month) : null;
              const quarter = schedule.quarter ? Number(schedule.quarter) : null;

              let fromDate: string | null = null;
              let toDate: string | null = null;

              if (scheduleType === ScheduleType.Year.id && year) {
                fromDate = `${year}-01-01`;
                toDate = `${year}-12-31`;
              } else if (scheduleType === ScheduleType.Month.id && year && month) {
                const lastDay = new Date(year, month, 0).getDate(); // ngày cuối tháng
                fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
                toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
              } else if (scheduleType === ScheduleType.Quarter.id && year && quarter) {
                const quarterMonthStart = (quarter - 1) * 3 + 1;
                const quarterMonthEnd = quarter * 3;
                const lastDay = new Date(year, quarterMonthEnd, 0).getDate();
                fromDate = `${year}-${String(quarterMonthStart).padStart(2, '0')}-01`;
                toDate = `${year}-${String(quarterMonthEnd).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
              } else if (scheduleType === ScheduleType.Stage.id) {
                fromDate = schedule.fromDate?.slice(0, 10) || null;
                toDate = schedule.toDate?.slice(0, 10) || null;
              } else if (scheduleType === ScheduleType.LumpSum.id) {
                fromDate = contract.startDate?.slice(0, 10) || null;
                toDate = contract.endDate?.slice(0, 10) || null;
              }

              return {
                amountType: schedule.amountType,
                amount: schedule.amount,
                month: schedule.month,
                year: schedule.year,
                quarter: schedule.quarter,
                fromDate,
                toDate,
                dueDate: schedule.dueDate?.slice(0, 10),
              };
            }) || [],
        },
        contractGuarantee: {
          performanceBondGuarantee: getContractGuarantee(
            GuaranteeType.PerformanceBond,
            contract.contractGuarantee || []
          ),
          depositGuarantee: getContractGuarantee(
            GuaranteeType.Deposit,
            contract.contractGuarantee || []
          ),
          warrantyBondGuarantee: getContractGuarantee(
            GuaranteeType.WarrantyBond,
            contract.contractGuarantee || []
          ),
        },
        notes: contract.notes,
      });
      setTimeout(() => {
        isResettingForm.current = false;
        prevScheduleTypeRef.current = form.getValues('paymentSchedules.scheduleType');
        const schedules = form.getValues('paymentSchedules.schedules');
        if (schedules && schedules.length > 0) {
          replacePaymentSchedules(schedules);
        }
      }, 100);
    });
  }, [isUpdate, contract, users, loading, isCatalogLoading]);

  const {
    fields: contractItems,
    append: appendContractItem,
    remove: removeContractItem,
  } = useFieldArray({
    control: form.control,
    name: 'contractItems',
  });

  const {
    fields: contractOtherItems,
    append: appendContractOtherItem,
    remove: removeContractOtherItem,
  } = useFieldArray({
    control: form.control,
    name: 'contractOtherItems',
  });

  const {
    fields: paymentSchedules,
    append: appendPaymentSchedule,
    remove: removePaymentSchedule,
    replace: replacePaymentSchedules,
  } = useFieldArray({
    control: form.control,
    name: 'paymentSchedules.schedules',
  });

  const watchedDiscountType = form.watch('discountType');
  const watchedDiscountValue = form.watch('discountValue');
  const watchedContractValue = form.watch('contractValue');
  const watchedContractOthersValue = form.watch('contractOthersValue');
  const watchedContractOtherItems = form.watch('contractOtherItems');
  const watchedContractItems = form.watch('contractItems');
  const watchedPaymentScheduleType = form.watch(
    'paymentSchedules.scheduleType'
  );

  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);
  const isFirstScheduleTypeMount = useRef(true);
  const prevScheduleTypeRef = useRef<number | string | undefined>(
    watchedPaymentScheduleType
  );

  const contractItemsTotal = (() => {
    const items = form.watch('contractItems');
    if (items && items.length > 0) {
      return items.reduce((total, item) => {
        const material = materials.find((m) => m.id === item.materialId);
        return total + (item.quantity || 0) * (material?.price || 0);
      }, 0);
    }
    return form.watch('contractValue') || 0;
  })();


  const contractOtherItemsTotal = (() => {
    const items = form.watch('contractOtherItems');
    if (items && items.length > 0) {
      return items.reduce((total, item) => {
        const material = otherMaterials.find((m) => m.id === item.materialId);
        return total + (item.quantity || 0) * (material?.price || 0);
      }, 0);
    }
    return form.watch('contractOthersValue') || 0;
  })();

  useEffect(() => {
    if (isResettingForm.current) return; // ← Thêm dòng này

    if (isFirstScheduleTypeMount.current) {
      isFirstScheduleTypeMount.current = false;
      prevScheduleTypeRef.current = watchedPaymentScheduleType;
      return;
    }

    if (prevScheduleTypeRef.current !== watchedPaymentScheduleType) {
      prevScheduleTypeRef.current = watchedPaymentScheduleType;
      const currentSchedules = form.getValues('paymentSchedules.schedules');
      if (currentSchedules && currentSchedules.length > 0) {
        const resetSchedules = currentSchedules.map((schedule) => ({
          ...schedule,
          month: null, quarter: null, year: null,
          fromDate: null, toDate: null, dueDate: null,
        }));
        replacePaymentSchedules(resetSchedules);
      }
    }
  }, [watchedPaymentScheduleType, form, replacePaymentSchedules]);

  useEffect(() => {
    const promises = Promise.all([
      contractTypeService.getContractTypeList(),
      ContractRegisterService.getContractRegisterList(),
      partnerService.getPartnerList(),
      procurementMethodService.getProcurementMethodList(),
      userService.getUserList(),
      materialService.getMaterialList(),
      materialService.getOtherMaterialList(),
      departmentService.getDepartmentList(),
      positionService.getPositionList(),
      level1CodeService.getLevel1CodeList(),
      contractStructureCatalogService.getContractStructureCatalogList(),
      contractFieldService.getContractFieldList(),
    ]);

    promises.then(
      ([
        contractTypes,
        contractRegisters,
        partners,
        procurementMethods,
        users,
        materials,
        otherMaterials,
        departments,
        _positions,
        level1CodesData,
        contractStructuresData,
        contractFieldsData,
      ]) => {
        setContractTypes(contractTypes || []);
        setContractRegisters(contractRegisters || []);
        setPartners(partners || []);
        setProcurementMethods(procurementMethods || []);
        setUsers(users || []);
        setMaterials(materials || []);
        setOtherMaterials(otherMaterials || []);
        setDepartments(departments || []);
        setLevel1Codes(level1CodesData || []);
        setContractStructures(contractStructuresData || []);
        setContractFields(contractFieldsData || []);
      }
    ).finally(() => {
      setIsCatalogLoading(false);
    });
  }, []);

  const getContractFinalValue = () => {
    const totalItems = contractItemsTotal;
    const totalOthers = contractOtherItemsTotal;

    const total = (totalItems || 0) + (totalOthers || 0);

    let discount = 0;
    const discountVal = watchedDiscountValue || 0;
    if (watchedDiscountType == DiscountType.Percent.id) {
      discount = (total / 100) * discountVal;
    } else {
      discount = discountVal;
    }

    return total - discount;
  };

  const getPaymentSchedulesTotal = () => {
    const schedules = form.watch('paymentSchedules.schedules');
    const scheduleType = form.watch('paymentSchedules.scheduleType');

    if (scheduleType == ScheduleType.LumpSum.id) {
      return getContractFinalValue();
    }

    if (!schedules || schedules.length === 0) return 0;

    return schedules.reduce((total, schedule) => {
      const amount = schedule.amount || 0;
      const amountType = schedule.amountType;

      if (amountType == DiscountType.Percent.id) {
        return total + (amount / 100) * getContractFinalValue();
      }
      return total + amount;
    }, 0);
  };

  const getPaymentScheduleComparison = () => {
    const contractValue = getContractFinalValue();
    const paymentTotal = getPaymentSchedulesTotal();
    const difference = paymentTotal - contractValue;

    if (difference == 0) {
      return {
        status: 'exact',
        message: `Đủ thanh toán cho giá trị hợp đồng: ${format.number(contractValue)} đ`,
        color: 'text-green-600'
      };
    } else if (difference > 0) {
      return {
        status: 'excess',
        message: `Thừa ${format.number(difference)} đ so với giá trị hợp đồng`,
        color: 'text-orange-600'
      };
    } else {
      return {
        status: 'shortage',
        message: `Còn thiếu ${format.number(Math.abs(difference))} đ so với giá trị hợp đồng`,
        color: 'text-red-600'
      };
    }
  };

  useEffect(() => {
    if (isResettingForm.current) return;

    if (watchedPaymentScheduleType == ScheduleType.LumpSum.id) {
      form.setValue('paymentSchedules.schedules', [
        {
          amountType: DiscountType.Amount.id,
          amount: getContractFinalValue(),
          month: null,
          quarter: null,
          year: null,
          fromDate: null,
          toDate: null,
          dueDate: null,
        },
      ]);
    }
  }, [watchedPaymentScheduleType]);

  const watchedLevel1CodeId = form.watch('level1CodeId');
  const watchedLevel3CodeId = form.watch('level3CodeId');

  useEffect(() => {
    if (!watchedLevel1CodeId || level1Codes.length === 0) return;
    if (isResettingForm.current) return;

    const selected = level1Codes.find((l) => l.id === watchedLevel1CodeId);
    if (selected?.contractTypeId) {
      form.setValue('contractTypeId', selected.contractTypeId);
    }

    // Reset level2, level3 và title khi đổi level1
    form.setValue('level2CodeId', '');
    form.setValue('level3CodeId', '');
    form.setValue('title', '');
    setLevel2Codes([]);
    setLevel3Codes([]);

    // Load level2 theo level1
    setIsLevel2Loading(true);
    level2CodeService.getLevel2CodeByLevel1(watchedLevel1CodeId)
      .then((data) => setLevel2Codes(data || []))
      .finally(() => setIsLevel2Loading(false));

    // Load level3 theo level1
    setIsLevel3Loading(true);
    level3CodeService.getLevel3CodeByLevel1(watchedLevel1CodeId)
      .then((data) => setLevel3Codes(data || []))
      .finally(() => setIsLevel3Loading(false));
  }, [watchedLevel1CodeId, level1Codes]);

  // Khi chọn level3Code → load signedContent và fill title
  useEffect(() => {
    if (!watchedLevel3CodeId) return;
    if (isResettingForm.current) return;

    // ← Xóa title cũ ngay khi đổi mã 3
    form.setValue('title', '');

    signedContentService.getSignedContentByLevel3(watchedLevel3CodeId)
      .then((data) => {
        const first = data?.[0];
        if (first?.name) {
          form.setValue('title', first.name);
        }
      });
  }, [watchedLevel3CodeId]);

  const handleSubmit = (data: BasicInformationValues) => {
    if (getContractFinalValue() < 0) {
      return form.setError('discountValue', {
        message: 'Phải nhỏ hơn giá trị vật tư',
      });
    }
    if (!isRuleContract && hasScheduleType && watchedPaymentScheduleType != ScheduleType.LumpSum.id) {
      const comparison = getPaymentScheduleComparison();
      if (comparison.status !== 'exact') {
        toast.error('Tổng giá trị thanh toán phải bằng giá trị hợp đồng');
        return;
      }
    }
    setBasicInformation(data);
    nextStep();
  };

  const hasScheduleType = watchedPaymentScheduleType !== undefined && watchedPaymentScheduleType !== null;


  if (isCatalogLoading || (isUpdate && loading)) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Form context={form} onSubmit={handleSubmit}>
        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Mã hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormRow>
              {/* Mã cấp I — chọn từ danh sách */}
              <FormSelect
                control={form.control}
                name='level1CodeId'
                label='Mã cấp I'
                placeholder='Chọn mã cấp I'
                options={level1Codes.map((l) => ({
                  value: l.id,
                  label: `${l.code}`,
                }))}
              />

              {/* Mã cấp II — chọn từ danh sách */}
              <FormSelect
                control={form.control}
                name='level2CodeId'
                label='Mã cấp II'
                placeholder={
                  !watchedLevel1CodeId
                    ? 'Chọn mã cấp I trước'
                    : isLevel2Loading
                      ? 'Đang tải...'
                      : 'Chọn mã cấp II'
                }
                disabled={!watchedLevel1CodeId || isLevel2Loading}
                options={level2Codes.map((l) => ({
                  value: l.id,
                  label: l.code,
                }))}
              />

              {/* Mã cấp III — chọn từ danh sách */}
              <FormSelect
                control={form.control}
                name='level3CodeId'
                label='Mã cấp III'
                placeholder={
                  !watchedLevel1CodeId
                    ? 'Chọn mã cấp I trước'
                    : isLevel3Loading
                      ? 'Đang tải...'
                      : 'Chọn mã cấp III'
                }
                disabled={!watchedLevel1CodeId || isLevel3Loading}
                options={level3Codes.map((l) => ({
                  value: l.id,
                  label: `${l.code}${l.description ? ` - ${l.description}` : ''}`,
                }))}
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Loại hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormReadonly
              label='Loại hợp đồng'
              value={contractTypes.find((t) => t.id === form.watch('contractTypeId'))?.name || ''}
            />
            {/* ✅ Dùng Controller để hidden input luôn sync với form state */}
            <Controller
              control={form.control}
              name='contractTypeId'
              render={({ field }) => (
                <input type='hidden' {...field} value={field.value ?? ''} />
              )}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Lĩnh vực hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='contractFieldId'
              placeholder='Chọn lĩnh vực hợp đồng'
              options={contractFields.map((f) => ({ value: f.id, label: f.name }))}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>
              Tên hợp đồng/ Nội dung ký kết hợp đồng
            </FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormTextArea
              control={form.control}
              name='title'
              placeholder='Tự động điền theo mã cấp III'
              readOnly
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <FormGroupLabel>
                Giá trị hợp đồng{' '}
                {[2, 3].includes(Number(contractFormat?.contractFormat)) && '(sau thuế): '}
                {!isRuleContract && (
                  <span className="text-red-500">
                    {[2, 3].includes(Number(contractFormat?.contractFormat)) &&
                      format.number(getContractFinalValue())}
                    đ
                  </span>
                )}
              </FormGroupLabel>
              {!isRuleContract && (
                <div className='text-sm font-medium text-muted-foreground'>
                  Tổng:{' '}
                  <span className='text-foreground font-semibold'>
                    {format.number(contractItemsTotal)}
                  </span>
                  <span className='text-foreground font-semibold'>
                    đ
                  </span>
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <MaterialImportDialog
                isOtherMaterial={false}
                existingMaterials={materials}
                onReloadMaterials={reloadMaterials}
                contractFormat={contractFormat?.contractFormat}
                onSuccess={(items) => {
                  form.setValue('contractValue', null);
                  items.forEach((item) => appendContractItem(item));
                }}
              />
              <Button
                variant={'default'}
                size={'sm'}
                type='button'
                className='min-w-48'
                onClick={() => {
                  if (watchedContractValue) form.setValue('contractValue', null);
                  appendContractItem(BasicInformationDefault.contractItems[0]);
                }}
              >
                <PlusIcon />
                <span>Thêm vật tư</span>
              </Button>
            </div>

          </FormGroupHeader>

          <FormGroupContent className='max-h-74 overflow-auto'>
            <FormRow>
              {watchedContractItems.length === 0 && !isRuleContract && (
                <FormNumber
                  control={form.control}
                  name='contractValue'
                  placeholder='Nhập giá trị vật tư'
                />
              )}
            </FormRow>

            {contractItems?.map((_, index) => {
              const watchedMaterialId = form.watch(
                `contractItems.${index}.materialId`
              );

              const selectedMaterial = materials.find(
                (material) => material.id === watchedMaterialId
              );

              const watchedQuantity = form.watch(
                `contractItems.${index}.quantity`
              );

              return (
                <FormRow key={index}>
                  <div className='size-10 aspect-square rounded-lg mt-8 bg-primary border flex items-center justify-center text-primary-foreground'>
                    <span>{index + 1}</span>
                  </div>

                  <div className='flex gap-2 flex-1 min-w-lg'>
                    <VirtualMaterialSelect
                      control={form.control}
                      name={`contractItems.${index}.materialId`}
                      label='Vật tư'
                      placeholder='Chọn vật tư'
                      materials={materials}
                      isLoading={isCatalogLoading}
                    />

                    <FormReadonly
                      label='Đơn vị tính'
                      value={selectedMaterial?.unitOfMeasureName || '—'}
                    />

                    <FormReadonly
                      label='Đơn giá vật tư (đ)'
                      value={format.number(selectedMaterial?.price || 0)}
                    />
                  </div>

                  {!isRuleContract && (
                    <div className='w-56 shrink-0'>
                      <FormNumber
                        control={form.control}
                        name={`contractItems.${index}.quantity`}
                        label='Khối lượng'
                        placeholder='Nhập khối lượng'
                        readOnly={[0, 1].includes(
                          contractFormat?.contractFormat || 0
                        )}
                      />
                    </div>
                  )}

                  {!isRuleContract && (
                    <div className='w-56 shrink-0'>
                      <FormReadonly
                        label='Thành tiền (đ)'
                        value={format.number(
                          (selectedMaterial?.price || 0) * (watchedQuantity || 0)
                        )}
                      />
                    </div>
                  )}

                  <Button
                    variant={'destructive'}
                    size={'icon-lg'}
                    className='mt-8'
                    type='button'
                    onClick={() => {
                      removeContractItem(index);
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </FormRow>
              );
            })}
            <div className='flex justify-end'>
              <CreateMaterialDialog
                isOtherMaterial={false}
                onSuccess={reloadMaterials}
              />
            </div>
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <FormGroupLabel>Thành phần hợp đồng khác</FormGroupLabel>
              {!isRuleContract && (
                <div className='text-sm font-medium text-muted-foreground'>
                  Tổng:{' '}
                  <span className='text-foreground font-semibold'>
                    {format.number(contractOtherItemsTotal)}
                  </span>
                  <span className='text-foreground font-semibold'>
                    đ
                  </span>
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <MaterialImportDialog
                isOtherMaterial={true}
                existingMaterials={otherMaterials}
                onReloadMaterials={reloadOtherMaterials}
                contractFormat={contractFormat?.contractFormat}
                onSuccess={(items) => {
                  form.setValue('contractOthersValue', null);
                  items.forEach((item) => appendContractOtherItem(item));
                }}
              />
              <Button
                variant={'default'}
                size={'sm'}
                type='button'
                className='min-w-48'
                onClick={() => {
                  if (watchedContractOthersValue) form.setValue('contractOthersValue', null);
                  appendContractOtherItem({ materialId: '', quantity: '' as unknown as number });
                }}
              >
                <PlusIcon />
                <span>Thêm thành phần khác</span>
              </Button>
            </div>

          </FormGroupHeader>

          <FormGroupContent className='max-h-74 overflow-auto'>
            <FormRow>
              {watchedContractOtherItems &&
                watchedContractOtherItems.length === 0 &&
                !isRuleContract && (
                  <FormNumber
                    control={form.control}
                    name='contractOthersValue'
                    placeholder='Nhập giá trị thành phần hợp đồng khác'
                  />
                )}
            </FormRow>

            {contractOtherItems?.map((_, index) => {
              const watchedMaterialId = form.watch(
                `contractOtherItems.${index}.materialId`
              );

              const selectedMaterial = otherMaterials.find(
                (material) => material.id === watchedMaterialId
              );

              const watchedQuantity = form.watch(
                `contractOtherItems.${index}.quantity`
              );

              return (
                <FormRow key={index}>
                  <div className='size-10 aspect-square rounded-lg mt-8 bg-primary border flex items-center justify-center text-primary-foreground'>
                    <span>{index + 1}</span>
                  </div>

                  <div className='flex gap-2 flex-1 min-w-lg'>
                    <FormSelect
                      control={form.control}
                      name={`contractOtherItems.${index}.materialId`}
                      label='Thành phần hợp đồng khác'
                      placeholder='Chọn thành phần hợp đồng khác'
                      options={otherMaterials.map((material) => ({
                        value: material.id,
                        label: `${material.materialCode} - ${material.name}`,
                      }))}
                    />

                    <FormReadonly
                      label='Đơn vị tính'
                      value={selectedMaterial?.unitOfMeasureName || '—'}  // ← thêm
                    />

                    <FormReadonly
                      label='Đơn giá thành phần khác (đ)'
                      value={format.number(selectedMaterial?.price || 0)}
                    />
                  </div>

                  {!isRuleContract && (
                    <div className='w-56 shrink-0'>
                      <FormNumber
                        control={form.control}
                        name={`contractOtherItems.${index}.quantity`}
                        label='Khối lượng'
                        placeholder='Nhập khối lượng'
                      />
                    </div>
                  )}

                  {!isRuleContract && (
                    <div className='w-56 shrink-0'>
                      <FormReadonly
                        label='Thành tiền (đ)'
                        value={format.number(
                          (selectedMaterial?.price || 0) *
                          (watchedQuantity || 0)
                        )}
                      />
                    </div>
                  )}

                  <Button
                    variant={'destructive'}
                    size={'icon-lg'}
                    className='mt-8'
                    type='button'
                    onClick={() => {
                      removeContractOtherItem(index);
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </FormRow>
              );
            })}
            <div className='flex justify-end'>
              <CreateMaterialDialog
                isOtherMaterial={true}
                onSuccess={reloadOtherMaterials}
              />
            </div>
          </FormGroupContent>
        </FormGroup>

        {!isRuleContract && (
          <FormGroup>
            <FormGroupHeader>
              <FormGroupLabel>Chiết khấu</FormGroupLabel>
            </FormGroupHeader>
            <FormGroupContent>
              <FormRow>
                <FormSelect
                  control={form.control}
                  name='discountType'
                  label='Chiết khấu'
                  placeholder='Chọn loại chiết khấu'
                  options={Object.values(DiscountType).map(({ id, name }) => ({
                    value: String(id),
                    label: name,
                  }))}
                />
                <FormNumber
                  control={form.control}
                  name='discountValue'
                  label={
                    watchedDiscountType == DiscountType.Percent.id
                      ? 'Giá trị chiết khấu (%)'
                      : 'Giá trị chiết khấu (đ)'
                  }
                  placeholder={
                    watchedDiscountType == DiscountType.Percent.id
                      ? 'Nhập % chiết khấu'
                      : 'Nhập số tiền chiết khấu'
                  }
                />
                <FormReadonly
                  label='Thành tiền chiết khấu (đ)'
                  value={(() => {
                    const total = contractItemsTotal + contractOtherItemsTotal;
                    const val = watchedDiscountValue || 0;
                    if (watchedDiscountType == DiscountType.Percent.id) {
                      return format.number(Math.round((total / 100) * val));
                    }
                    return format.number(val);
                  })()}
                />
              </FormRow>
            </FormGroupContent>
          </FormGroup>
        )}

        {/* Bảo lãnh, bảo hành, đặt cọc */}
        {!isRuleContract && (
          <FormRow className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {(
              [
                { name: 'performanceBondGuarantee', title: 'Bảo lãnh' },
                { name: 'warrantyBondGuarantee', title: 'Bảo hành' },
                { name: 'depositGuarantee', title: 'Đặt cọc' },
              ] as {
                name:
                | 'performanceBondGuarantee'
                | 'warrantyBondGuarantee'
                | 'depositGuarantee';
                title: string;
              }[]
            ).map(({ name, title }) => {
              return (
                <FormGroup key={name}>
                  <FormGroupHeader>
                    <FormGroupLabel>{title}</FormGroupLabel>
                  </FormGroupHeader>
                  <FormGroupContent>
                    <FormSelect
                      control={form.control}
                      name={`contractGuarantee.${name}.valueType`}
                      label={'Đơn vị'}
                      placeholder='Chọn đơn vị'
                      options={[
                        { value: '0', label: 'Số tiền cố định (đ)' },
                        { value: '1', label: 'Phần trăm (%)' },
                      ]}
                    />
                    <FormNumber
                      control={form.control}
                      name={`contractGuarantee.${name}.value`}
                      label={'Giá trị'}
                      placeholder='Nhập giá trị'
                    />
                    <FormDate
                      control={form.control}
                      name={`contractGuarantee.${name}.durationDate`}
                      label={'Thời gian'}
                      placeholder='Chọn thời gian'
                    />
                    <BankAccountSelect
                      control={form.control}
                      setValue={form.setValue}
                      bankAccountIdField={`contractGuarantee.${name}.bankAccountId`}
                      currentId={form.watch(`contractGuarantee.${name}.bankAccountId`) as string}
                      label='Tài khoản ngân hàng'
                    />
                  </FormGroupContent>
                </FormGroup>
              );
            })}
          </FormRow>
        )}

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Sổ theo dõi hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='contractRegisterId'
              placeholder='Chọn sổ theo dõi hợp đồng'
              options={contractRegisters.map((contractRegister) => ({
                value: contractRegister.id,
                label: contractRegister.name,
              }))}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Số ký hiệu</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormRow className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='contractNumber'
                label='Số ký hiệu hợp đồng'
                placeholder='Nhập số ký hiệu hợp đồng'
              />

              <FormInput
                control={form.control}
                name='appendixNumber'
                label='Số ký hiệu PLHĐ'
                placeholder='Nhập số ký hiệu PLHĐ'
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Đối tác/khách hàng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='partnerId'
              placeholder='Chọn đối tác/khách hàng'
              options={partners.map((partner) => ({
                value: partner.id,
                label: partner.name,
                render: (
                  <Item className='p-1'>
                    <ItemContent>
                      <ItemTitle>{partner.name}</ItemTitle>
                      <ItemDescription>
                        <b>Địa chỉ:</b> {partner.address}
                      </ItemDescription>
                      <ItemDescription>
                        <b>Mã số thuế:</b> {partner.taxCode}
                      </ItemDescription>
                      <ItemDescription>
                        <b>Người đại diện theo pháp luật:</b>
                        {partner.contactPerson}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ),
              }))}
              trigger={(selected) => {
                const partner = partners.find(
                  (partner) => partner.id === selected?.value
                );

                if (!partner) {
                  return undefined;
                }

                return (
                  <Item variant={'outline'}>
                    <ItemContent>
                      <ItemTitle>{partner.name}</ItemTitle>
                      <ItemDescription>
                        <b>Địa chỉ:</b> {partner.address}
                      </ItemDescription>
                      <ItemDescription>
                        <b>Mã số thuế:</b> {partner.taxCode}
                      </ItemDescription>
                      <ItemDescription>
                        <b>Người đại diện theo pháp luật:</b>
                        {partner.contactPerson}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant={'destructive'}
                        size={'icon-lg'}
                        onClick={(e) => {
                          e.stopPropagation();
                          form.resetField('partnerId');
                        }}
                      >
                        <XIcon />
                      </Button>
                    </ItemActions>
                  </Item>
                );
              }}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Hiệu lực hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormRow>
              <FormDate
                control={form.control}
                name='startDate'
                label='Ngày tháng năm ký hợp đồng'
                placeholder='Chọn ngày ký tháng năm ký hợp đồng'
              />
              <FormDate
                control={form.control}
                name='endDate'
                label='Hiệu lực hết của hợp đồng'
                placeholder='Chọn ngày hiệu lực hết của hợp đồng'
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        {!isRuleContract && (
          <FormGroup>
            <FormGroupHeader>
              <div className='flex flex-col gap-1'>
                <FormGroupLabel>Thời hạn thanh toán, đối chiếu</FormGroupLabel>
                {hasScheduleType && paymentSchedules.length > 0 && (
                  <div className='text-sm font-medium'>
                    <span className='text-muted-foreground'>Tổng thanh toán: </span>
                    <span className='text-foreground font-semibold'>
                      {format.number(getPaymentSchedulesTotal())} đ
                    </span>
                    <span className='mx-2'>•</span>
                    <span className={getPaymentScheduleComparison().color}>
                      {getPaymentScheduleComparison().message}
                    </span>
                  </div>
                )}
              </div>
            </FormGroupHeader>

            <FormGroupContent>
              <FormRow>
                <FormSelect
                  control={form.control}
                  name='paymentSchedules.scheduleType'
                  placeholder='Chọn thời hạn thanh toán, đối chiếu'
                  options={Object.values(ScheduleType).map((scheduleType) => ({
                    value: String(scheduleType.id),
                    label: scheduleType.name,
                  }))}
                />

                <Button
                  type='button'
                  size={'lg'}
                  onClick={() => {
                    appendPaymentSchedule({
                      amountType: '' as unknown as number,
                      amount: 0,
                      month: null,
                      quarter: null,
                      year: null,
                      fromDate: null,
                      toDate: null,
                      dueDate: null,
                    });
                  }}
                  disabled={
                    !hasScheduleType ||
                    watchedPaymentScheduleType == ScheduleType.LumpSum.id
                  }
                  className='min-w-48'
                >
                  <PlusIcon />
                  <span>Thêm thời hạn</span>
                </Button>
              </FormRow>

              {hasScheduleType &&
                paymentSchedules.map((_, index) => {
                  const watchedUnit = form.watch(
                    `paymentSchedules.schedules.${index}.amountType`
                  );
                  const watchedAmount = form.watch(
                    `paymentSchedules.schedules.${index}.amount`
                  );

                  return (
                    <FormRow key={index}>
                      <div className='mt-8 size-10 aspect-square bg-primary rounded-lg text-primary-foreground flex items-center justify-center'>
                        {index + 1}
                      </div>

                      {watchedPaymentScheduleType == ScheduleType.Month.id && (
                        <FormMonthYear
                          control={form.control}
                          month={`paymentSchedules.schedules.${index}.month`}
                          year={`paymentSchedules.schedules.${index}.year`}
                          label='Thời hạn thanh toán, đối chiếu'
                          placeholder='Chọn thời hạn'
                        />
                      )}

                      {watchedPaymentScheduleType ==
                        ScheduleType.Quarter.id && (
                          <FormQuaterYear
                            control={form.control}
                            quater={`paymentSchedules.schedules.${index}.quarter`}
                            year={`paymentSchedules.schedules.${index}.year`}
                            label='Thời hạn thanh toán, đối chiếu'
                            placeholder='Chọn thời hạn'
                          />
                        )}

                      {watchedPaymentScheduleType == ScheduleType.Year.id && (
                        <FormYear
                          control={form.control}
                          name={`paymentSchedules.schedules.${index}.year`}
                          label='Thời hạn thanh toán, đối chiếu'
                          placeholder='Chọn thời hạn'
                        />
                      )}

                      {watchedPaymentScheduleType == ScheduleType.Stage.id && (
                        <FormDates
                          control={form.control}
                          from={`paymentSchedules.schedules.${index}.fromDate`}
                          to={`paymentSchedules.schedules.${index}.toDate`}
                          label='Thời hạn thanh toán, đối chiếu'
                          placeholder='Chọn thời hạn'
                        />
                      )}

                      {watchedPaymentScheduleType ==
                        ScheduleType.LumpSum.id && (
                          <>
                            <FormDate
                              control={form.control}
                              name={`paymentSchedules.schedules.${index}.dueDate`}
                              label='Thời hạn thanh toán, đối chiếu'
                              placeholder='Chọn thời hạn'
                            />
                            <FormReadonly
                              label='Số tiền thanh toán (đ)'
                              value={format.number(getContractFinalValue())}
                            />
                          </>
                        )}

                      {watchedPaymentScheduleType !=
                        ScheduleType.LumpSum.id && (
                          <FormSelect
                            control={form.control}
                            name={`paymentSchedules.schedules.${index}.amountType`}
                            label='Đơn vị tính'
                            placeholder='Chọn đơn vị tính'
                            options={Object.values(DiscountType).map((unit) => ({
                              value: String(unit.id),
                              label: unit.name,
                            }))}
                          />
                        )}

                      {watchedPaymentScheduleType !=
                        ScheduleType.LumpSum.id && (
                          <>
                            <FormNumber
                              control={form.control}
                              name={`paymentSchedules.schedules.${index}.amount`}
                              label='Giá trị'
                              placeholder='Nhập giá trị'
                            />

                            <FormReadonly
                              label='Giá trị thanh toán'
                              value={(() => {
                                if (watchedUnit == DiscountType.Percent.id) {
                                  return format.number(
                                    ((watchedAmount || 0) / 100) *
                                    getContractFinalValue()
                                  );
                                }
                                return format.number(watchedAmount || 0);
                              })()}
                            />
                          </>
                        )}

                      <Button
                        type='button'
                        size={'icon-lg'}
                        variant={'destructive'}
                        className='mt-8'
                        onClick={() => {
                          removePaymentSchedule(index);
                        }}
                        disabled={paymentSchedules.length === 1}
                      >
                        <Trash2Icon />
                      </Button>
                    </FormRow>
                  );
                })}
            </FormGroupContent>
          </FormGroup>
        )}

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>
              Hình thức lựa chọn nhà thầu/nhà cung cấp
            </FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='procurementMethodId'
              placeholder='Chọn hình thức lựa chọn nhà thầu/nhà cung cấp'
              options={procurementMethods.map((procurementMethod) => ({
                value: procurementMethod.id,
                label: procurementMethod.name,
              }))}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Hình thức hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='contractStructureId'
              label='Hình thức hợp đồng'
              placeholder='Chọn hình thức hợp đồng'
              options={contractStructures.map((cs) => ({
                value: cs.id,
                label: cs.name,
              }))}
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Phân công quản lý hợp đồng</FormGroupLabel>
          </FormGroupHeader>

          <FormGroupContent className='space-y-6'>
            {(
              [
                {
                  role: 'draftingOfficer',
                  label: ContractRole.DraftingOfficer.name,
                },
                { role: 'manager', label: ContractRole.Manager.name },
                { role: 'coordinator', label: ContractRole.Coordinator.name },
                {
                  role: 'receivingOfficer',
                  label: ContractRole.ReceivingOfficer.name,
                },
              ] as const
            ).map(({ role, label }) => (
              <RoleUserArrayInput
                key={role}
                role={role}
                label={label}
                form={form}
                departments={departments}
                users={users}
              />
            ))}
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Ghi chú</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormTextArea
              control={form.control}
              name='notes'
              placeholder='Nhập ghi chú'
            />
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Hợp đồng và tài liệu đính kèm</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormRow className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormFile
                control={form.control}
                name='contractFile'
                label='File hợp đồng'
                placeholder='Chọn file hợp đồng (Chỉ PDF)'
                accept='.pdf'
              />

              <FormFiles
                accept='.pdf'
                control={form.control}
                name='attachmentFiles'
                label='Tài liệu đính kèm'
                placeholder='Chọn tài liệu đính kèm (Chỉ PDF)'
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        <div className='fixed bottom-0 start-0 p-6 py-4 shadow bg-background w-full border-t flex items-center justify-between'>
          <StepperPrev>Quay lại</StepperPrev>
          <div className='mx-auto hidden md:block' />
          <Button type='submit' size={'lg'} className='px-4 w-24'>
            Tiếp tục
          </Button>
        </div>
      </Form>
    </>
  );
}
