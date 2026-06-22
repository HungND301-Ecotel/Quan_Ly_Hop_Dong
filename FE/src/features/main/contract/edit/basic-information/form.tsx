import { Form } from '@/components/form/form';
import { FormDate } from '@/components/form/form-date';
import { FormFiles } from '@/components/form/form-files';
import {
  FormGroup,
  FormGroupContent,
  FormGroupHeader,
  FormGroupLabel,
} from '@/components/form/form-group';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/form/form-input';
import { FormNumber } from '@/components/form/form-number';
import { FormReadonly } from '@/components/form/form-readonly';
import { FormRow } from '@/components/form/form-row';
import { FormSelect } from '@/components/form/form-select';
import { FormTextArea } from '@/components/form/form-text-area';
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
import { ContractAppendix, contractAppendixService } from '@/services/contract-appendix';
import { ContractNumber, contractNumberService } from '@/services/contract-number';

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
        price:
          values.price === undefined ||
            values.price === null ||
            String(values.price) === ''
            ? null
            : Number(values.price),
        ...(isOtherMaterial && { isOtherMaterial: true }),
      };
      await materialService.createMaterial(payload);
      toast.success(
        `Tạo mới ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'} thành công`
      );
      setOpen(false);
      onSuccess();
    } catch {
      toast.error(
        `Lỗi khi tạo mới ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}`
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
          <span>
            Tạo mới {isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            Tạo mới {isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}
          </DialogTitle>
          <DialogDescription>
            Tạo mới thông tin{' '}
            {isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}
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
                label={`Mã ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}`}
                placeholder={`Nhập mã ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}`}
              />
              <FormInput
                control={form.control}
                name='name'
                label={`Tên ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}`}
                placeholder={`Nhập tên ${isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản'}`}
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

const addDays = (dateStr: string | null | undefined, days: number | null | undefined): string => {
  if (!dateStr || days === null || days === undefined || isNaN(Number(days))) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
};

const diffDays = (fromStr: string | null | undefined, toStr: string | null | undefined): number | undefined => {
  if (!fromStr || !toStr) return undefined;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

export function ContractBasicInformationForm() {
  const { user } = useAuthContext();
  const { next: nextStep } = useStepperContext();
  const {
    setBasicInformation,
    contractFormat,
    isUpdate,
    contract,
    loading,
    basicInformation,
  } = useContractEditContext();

  const isResettingForm = useRef(false);
  const hasInitializedFromContract = useRef(false);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [contractFields, setContractFields] = useState<ContractField[]>([]);
  const [contractAppendixs, setContractAppendixs] = useState<ContractAppendix[]>([]);
  const [contractNumbers, setContractNumbers] = useState<ContractNumber[]>([]);
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
  const [contractStructures, setContractStructures] = useState<
    ContractStructureCatalog[]
  >([]);

  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const form = useForm<BasicInformationValues>({
    mode: 'onSubmit',
    resolver: zodResolver(BasicInformationSchema),
    defaultValues: {
      ...BasicInformationDefault,
      departmentId: user?.departmentId,
      contractItems: [],
      contractOtherItems: [],
      paymentSchedules: {
        schedules: [{ amountType: 0, amount: 0, days: 30 }],
      },
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

    isResettingForm.current = true;

    form.reset({
      ...basicInformation,
      contractFile: basicInformation.contractFile ?? undefined,
      attachmentFiles: basicInformation.attachmentFiles ?? null,
      contractNumber: basicInformation.contractNumber || '',
      signingDate: basicInformation.signingDate || '',
      effectiveDate: basicInformation.effectiveDate || '',
      completionDurationDays: basicInformation.completionDurationDays,
      completionDate: basicInformation.completionDate || '',
      warrantyDurationDays: basicInformation.warrantyDurationDays,
      warrantyExpirationDate: basicInformation.warrantyExpirationDate || '',
    });

    // Nếu đã có level1CodeId, cần load lại danh sách level2/level3 tương ứng
    if (basicInformation.level1CodeId) {
      level2CodeService
        .getLevel2CodeByLevel1(basicInformation.level1CodeId)
        .then((data) => setLevel2Codes(data || []));
      level3CodeService
        .getLevel3CodeByLevel1(basicInformation.level1CodeId)
        .then((data) => setLevel3Codes(data || []));
    }

    setTimeout(() => {
      isResettingForm.current = false;
    }, 100);
  }, [basicInformation, isUpdate]);

  useEffect(() => {
    if (!contractFormat || hasInitializedContractItems.current) return;
    hasInitializedContractItems.current = true;

    if (contractFormat?.parentContractId) {
      // Nếu đã có contractItems prefill từ basicInformation thì không fetch lại
      const existingItems = form.getValues('contractItems');
      if (existingItems && existingItems.length > 0) return;
      if (
        basicInformation?.contractItems &&
        basicInformation.contractItems.length > 0
      )
        return;

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
        bankAccountId:
          guarantee.bankAccountId ?? guarantee.bankAccount?.id ?? '',
      };
    };

    const filePaths = contract.filePath ? contract.filePath.split(';').filter(Boolean) : [];
    const attachmentPaths = contract.attachments?.map((attachment) => attachment.filePath) || [];

    const promises = Promise.all([
      Promise.all(filePaths.map((path) => fileService.getFile(path))),
      Promise.all(attachmentPaths.map((path) => fileService.getFile(path))),
    ]);

    promises.then(([files, attachments]) => {
      console.log('contract.paymentSchedules:', contract.paymentSchedules);
      isResettingForm.current = true;
      if (contract.level1CodeId) {
        level2CodeService
          .getLevel2CodeByLevel1(contract.level1CodeId)
          .then((data) => setLevel2Codes(data || []));
        level3CodeService
          .getLevel3CodeByLevel1(contract.level1CodeId)
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
        contractNumberId: contractNumbers.find(
          (f) => f.number === contract.contractNumber
        )?.id ?? '',
        appendixNumberId: contractAppendixs.find(
          (f) => f.appendixNumber === contract.appendixNumber
        )?.id ?? '',
        partnerId: contract.partnerId,
        signingDate: contract.signingDate ? contract.signingDate.slice(0, 10) : '',
        effectiveDate: contract.effectiveDate ? contract.effectiveDate.slice(0, 10) : '',
        completionDurationDays: diffDays(contract.effectiveDate, contract.completionDate),
        completionDate: contract.completionDate ? contract.completionDate.slice(0, 10) : '',
        warrantyDurationDays: (() => {
          const diff = diffDays(contract.completionDate, contract.warrantyExpirationDate);
          return diff !== undefined ? diff - 1 : undefined; // trừ 1 vì bảo hành tính từ ngày kế tiếp
        })(),
        warrantyExpirationDate: contract.warrantyExpirationDate
          ? contract.warrantyExpirationDate.slice(0, 10)
          : '',
        contractFile: files,
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
        vatPercentage: contract.vatPercentage,
        contractItems: contract.contractItems,
        contractOthersValue: contract.contractOthersValue,
        contractOtherItems: contract.contractOtherItems,
        paymentSchedules: {
          schedules:
            contract.paymentSchedules && contract.paymentSchedules.length > 0
              ? contract.paymentSchedules.map((schedule) => ({
                amountType: schedule.amountType,
                amount: schedule.amount,
                days: schedule.days,
              }))
              : [{ amountType: 0, amount: 0, days: 30 }],
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
    replace: replacePaymentSchedules,
  } = useFieldArray({
    control: form.control,
    name: 'paymentSchedules.schedules',
  });

  const watchedDiscountType = form.watch('discountType');
  const watchedDiscountValue = form.watch('discountValue');
  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);
  const watchedContractNumberId = form.watch('contractNumberId');
  const filteredAppendixs = contractAppendixs.filter(
    appendix => appendix.contractNumberId === watchedContractNumberId
  );

  const watchedEffectiveDate = form.watch('effectiveDate');
  const watchedCompletionDurationDays = form.watch('completionDurationDays');
  const watchedCompletionDate = form.watch('completionDate');
  const watchedWarrantyDurationDays = form.watch('warrantyDurationDays');

  // Ngày hoàn thành hợp đồng = Ngày hiệu lực + Thời gian thực hiện
  useEffect(() => {
    if (isResettingForm.current) return;
    form.setValue('completionDate', addDays(watchedEffectiveDate, watchedCompletionDurationDays));
  }, [watchedEffectiveDate, watchedCompletionDurationDays]);

  // Ngày hết hạn bảo hành = (Ngày hoàn thành + 1) + Thời gian bảo hành
  useEffect(() => {
    if (isResettingForm.current) return;
    const warrantyStartDate = addDays(watchedCompletionDate, 1);
    form.setValue('warrantyExpirationDate', addDays(warrantyStartDate, watchedWarrantyDurationDays));
  }, [watchedCompletionDate, watchedWarrantyDurationDays]);

  const getVatAmount = () => {
    const beforeTax = getContractFinalValue();
    const vat = form.watch('vatPercentage') || 0;
    return Math.round((beforeTax * vat) / 100);
  };

  const getContractAfterTax = () => {
    return getContractFinalValue() + getVatAmount();
  };

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
      contractNumberService.getContractNumberList(),
      contractAppendixService.getContractAppendixList(),
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
        contractNumbersData,
        contractAppendixsData,
      ]) => {
        setContractTypes(contractTypes || []);
        setContractRegisters(contractRegisters || []);
        setPartners(partners || []);
        setProcurementMethods(procurementMethods || []);
        setUsers(users || []);
        console.log('form.tsx loaded materials count:', (materials || []).length);
        console.log('form.tsx loaded otherMaterials count:', (otherMaterials || []).length);
        setMaterials(materials || []);
        setOtherMaterials(otherMaterials || []);
        setDepartments(departments || []);
        setLevel1Codes(level1CodesData || []);
        setContractStructures(contractStructuresData || []);
        setContractFields(contractFieldsData || []);
        setContractNumbers(contractNumbersData || []);
        setContractAppendixs(contractAppendixsData || []);
      }
    ).finally(() => {
      setIsCatalogLoading(false);
    });
  }, []);

  const getContractFinalValue = () => {
    return form.watch('contractValue') || 0;
  };

  const watchedLevel1CodeId = form.watch('level1CodeId');
  const watchedLevel3CodeId = form.watch('level3CodeId');
  const prevLevel1CodeIdRef = useRef(watchedLevel1CodeId);

  useEffect(() => {
    if (!watchedLevel1CodeId || level1Codes.length === 0) return;
    if (isResettingForm.current) {
      prevLevel1CodeIdRef.current = watchedLevel1CodeId;
      return;
    }
    if (prevLevel1CodeIdRef.current === watchedLevel1CodeId) return;
    prevLevel1CodeIdRef.current = watchedLevel1CodeId;

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
    level2CodeService
      .getLevel2CodeByLevel1(watchedLevel1CodeId)
      .then((data) => setLevel2Codes(data || []))
      .finally(() => setIsLevel2Loading(false));

    // Load level3 theo level1
    setIsLevel3Loading(true);
    level3CodeService
      .getLevel3CodeByLevel1(watchedLevel1CodeId)
      .then((data) => setLevel3Codes(data || []))
      .finally(() => setIsLevel3Loading(false));
  }, [watchedLevel1CodeId, level1Codes]);

  // Khi chọn level3Code → load signedContent và fill title
  useEffect(() => {
    if (!watchedLevel3CodeId) return;
    if (isResettingForm.current) return;

    // ← Xóa title cũ ngay khi đổi mã 3
    form.setValue('title', '');

    signedContentService
      .getSignedContentByLevel3(watchedLevel3CodeId)
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
        message: 'Phải nhỏ hơn giá trị hợp đồng',
      });
    }
    setBasicInformation(data);
    nextStep();
  };


  if (isCatalogLoading || (isUpdate && loading)) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>
            Đang tải dữ liệu...
          </span>
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
              value={
                contractTypes.find((t) => t.id === form.watch('contractTypeId'))
                  ?.name || ''
              }
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
              options={[
                ...contractFields.map((f) => ({ value: f.id, label: f.name })),
              ]}
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
              <FormGroupLabel>Giá trị hợp đồng</FormGroupLabel>
                <div className='flex flex-col gap-3 p-4 rounded-lg border bg-muted/30 w-fit min-w-[500px]'>
                  {/* Dòng 1: Trước thuế */}
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium w-52 shrink-0'>
                      Giá trị hợp đồng (trước thuế)
                    </span>
                    <div className='w-48'>
                      <FormNumber
                        control={form.control}
                        name='contractValue'
                        placeholder='Nhập giá trị hợp đồng'
                      />
                    </div>
                    <span className='text-sm font-semibold'>VNĐ</span>
                  </div>

                  {/* Dòng 2: VAT */}
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium w-52 shrink-0'>
                      Thuế VAT (%)
                    </span>
                    <div className='w-48'>
                      <FormNumber
                        control={form.control}
                        name='vatPercentage'
                        placeholder='Nhập % VAT'
                      />
                    </div>
                    <span className='text-sm text-muted-foreground shrink-0'>
                      = {format.number(getVatAmount())} VNĐ
                    </span>
                  </div>

                  {/* Dòng 3: Sau thuế */}
                  <div className='flex items-center gap-3 border-t pt-3'>
                    <span className='text-sm font-medium w-52 shrink-0'>
                      Giá trị hợp đồng (sau thuế)
                    </span>
                    <span className='font-bold text-primary text-base'>
                      {format.number(getContractAfterTax())} VNĐ
                    </span>
                  </div>
                </div>
            </div>
          </FormGroupHeader>

          <FormGroupContent className='flex flex-col gap-6 max-h-[600px] overflow-auto'>
            {/* ── Sub-section 1: Vật tư ── */}
            <div className='flex flex-col gap-2'>
              <FormGroupLabel>Thành phần hợp đồng</FormGroupLabel>

              <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold'>
                    Danh sách vật tư, tài sản chi tiết
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <MaterialImportDialog
                    isOtherMaterial={false}
                    existingMaterials={materials}
                    onReloadMaterials={reloadMaterials}
                    contractFormat={contractFormat?.contractFormat}
                    onSuccess={(items) => {
                      items.forEach((item) => appendContractItem(item));
                    }}
                  />
                  <Button
                    variant={'default'}
                    size={'sm'}
                    type='button'
                    className='min-w-48'
                    onClick={() => {
                      appendContractItem(
                        BasicInformationDefault.contractItems[0]
                      );
                    }}
                  >
                    <PlusIcon />
                    <span>Thêm vật tư, tài sản</span>
                  </Button>
                  <div className='flex justify-end'>
                    <CreateMaterialDialog
                      isOtherMaterial={false}
                      onSuccess={reloadMaterials}
                    />
                  </div>
                </div>
              </div>

              {contractItems?.map((_, index) => {
                const watchedMaterialId = form.watch(
                  `contractItems.${index}.materialId`
                );
                const selectedMaterial = materials.find(
                  (m) => m.id === watchedMaterialId
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
                    </div>
                    <FormReadonly
                      label='Đơn vị tính'
                      value={selectedMaterial?.unitOfMeasureName || '—'}
                    />
                    <div className='w-56 shrink-0'>
                      <FormNumber
                        control={form.control}
                        name={`contractItems.${index}.quantity`}
                        label='Khối lượng'
                        placeholder='Nhập khối lượng'
                      />
                    </div>
                    <Button
                      variant={'destructive'}
                      size={'icon-lg'}
                      className='mt-8'
                      type='button'
                      onClick={() => removeContractItem(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </FormRow>
                );
              })}
            </div>

            {/* ── Sub-section 2: Dịch vụ khác ── */}
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold'>
                    Danh sách dịch vụ khác
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <MaterialImportDialog
                    isOtherMaterial={true}
                    existingMaterials={otherMaterials}
                    onReloadMaterials={reloadOtherMaterials}
                    contractFormat={contractFormat?.contractFormat}
                    onSuccess={(items) => {
                      items.forEach((item) => appendContractOtherItem(item));
                    }}
                  />
                  <Button
                    variant={'default'}
                    size={'sm'}
                    type='button'
                    className='min-w-48'
                    onClick={() => {
                      appendContractOtherItem({
                        materialId: '',
                        quantity: '' as unknown as number,
                      });
                    }}
                  >
                    <PlusIcon />
                    <span>Thêm dịch vụ khác</span>
                  </Button>
                  <div className='flex justify-end'>
                    <CreateMaterialDialog
                      isOtherMaterial={true}
                      onSuccess={reloadOtherMaterials}
                    />
                  </div>
                </div>
              </div>

              {contractOtherItems?.map((_, index) => {
                return (
                  <FormRow key={index}>
                    <div className='size-10 aspect-square rounded-lg mt-8 bg-primary border flex items-center justify-center text-primary-foreground'>
                      <span>{index + 1}</span>
                    </div>
                    <div className='flex gap-2 flex-1 min-w-lg'>
                      <FormSelect
                        control={form.control}
                        name={`contractOtherItems.${index}.materialId`}
                        label='Dịch vụ khác'
                        placeholder='Chọn dịch vụ khác'
                        options={otherMaterials.map((material) => ({
                          value: material.id,
                          label: `${material.materialCode} - ${material.name}`,
                        }))}
                      />
                    </div>
                    <Button
                      variant={'destructive'}
                      size={'icon-lg'}
                      className='mt-8'
                      type='button'
                      onClick={() => removeContractOtherItem(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </FormRow>
                );
              })}
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
                    const total = form.watch('contractValue') || 0;
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
                      currentId={
                        form.watch(
                          `contractGuarantee.${name}.bankAccountId`
                        ) as string
                      }
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
              <FormSelect
                control={form.control}
                name='contractNumberId'
                label='Số ký hiệu hợp đồng'
                placeholder='Số ký hiệu hợp đồng'
                options={contractNumbers.map((f) => ({ value: f.id, label: f.number }))}
              />
              <FormSelect
                control={form.control}
                name='appendixNumberId'
                label='Số ký hiệu phụ lục hợp đồng'
                placeholder='Số ký hiệu phụ lục hợp đồng'
                options={filteredAppendixs.map((f) => ({
                  value: f.id,
                  label: f.appendixNumber,
                }))}
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        <FormGroup>
          <FormGroupHeader>
            <FormGroupLabel>Đơn vị ký kết hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormSelect
              control={form.control}
              name='partnerId'
              placeholder='Chọn đơn vị ký kết hợp đồng'
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
                        type='button'
                        variant={'destructive'}
                        size={'icon-lg'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          form.setValue('partnerId', '', { shouldDirty: true });
                          form.clearErrors('partnerId');
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
            <FormGroupLabel>Mốc thời gian hợp đồng</FormGroupLabel>
          </FormGroupHeader>
          <FormGroupContent>
            <FormRow>
              <FormDate
                control={form.control}
                name='signingDate'
                label='Ngày ký hợp đồng'
                placeholder='Chọn ngày ký hợp đồng'
              />
              <FormDate
                control={form.control}
                name='effectiveDate'
                label='Ngày hợp đồng có hiệu lực'
                placeholder='Chọn ngày hiệu lực'
              />
            </FormRow>

            <FormRow>
              <FormNumber
                control={form.control}
                name='completionDurationDays'
                label='Thời gian thực hiện hợp đồng (ngày)'
                placeholder='Nhập số ngày thực hiện'
              />
              <FormReadonly
                label='Ngày hoàn thành hợp đồng'
                value={form.watch('completionDate') || '—'}
              />
              <Controller
                control={form.control}
                name='completionDate'
                render={({ field }) => (
                  <input type='hidden' {...field} value={field.value ?? ''} />
                )}
              />
            </FormRow>

            <FormRow>
              <FormNumber
                control={form.control}
                name='warrantyDurationDays'
                label='Thời gian bảo hành (ngày)'
                placeholder='Nhập số ngày bảo hành'
              />
              <FormReadonly
                label='Ngày hết hạn bảo hành'
                value={form.watch('warrantyExpirationDate') || '—'}
              />
              <Controller
                control={form.control}
                name='warrantyExpirationDate'
                render={({ field }) => (
                  <input type='hidden' {...field} value={field.value ?? ''} />
                )}
              />
            </FormRow>
          </FormGroupContent>
        </FormGroup>

        {!isRuleContract && (
          <FormGroup>
            <FormGroupHeader>
              <FormGroupLabel>Thời hạn thanh toán, đối chiếu</FormGroupLabel>
            </FormGroupHeader>
            <FormGroupContent>
              <FormRow>
                <div className='w-full max-w-sm'>
                  <FormNumber
                    control={form.control}
                    name={`paymentSchedules.schedules.0.days`}
                    label='Số ngày thanh toán/đối chiếu'
                    placeholder='Nhập số ngày'
                  />
                </div>
              </FormRow>
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
              <FormFiles
                accept='.pdf'
                control={form.control}
                name='contractFile'
                label='File hợp đồng'
                placeholder='Chọn file hợp đồng (Chỉ PDF)'
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
