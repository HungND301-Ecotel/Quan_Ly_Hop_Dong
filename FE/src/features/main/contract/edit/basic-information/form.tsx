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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import {
  ContractAppendix,
  contractAppendixService,
} from '@/services/contract-appendix';
import {
  ContractNumber,
  contractNumberService,
} from '@/services/contract-number';
import { VirtualMaterialMultiSelect } from '../../all/components/Virtualmaterialmultiselect';

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
            <FormInput
              control={form.control}
              name='description'
              label={`Ghi chú`}
              placeholder={`Nhập ghi chú`}
            />
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

function RoleUserRow({
  role,
  index,
  form,
  departments,
  users,
  onRemove,
  disabledRemove,
  showLabel,
}: {
  role: RoleUserArrayInputProps['role'];
  index: number;
  form: any;
  departments: Department[];
  users: User[];
  onRemove: () => void;
  disabledRemove: boolean;
  showLabel: boolean;
}) {
  const watchedDeptId = form.watch(
    `contractUserRoles.${role}.${index}.departmentId`
  );
  const prevDeptIdRef = useRef(watchedDeptId);

  useEffect(() => {
    if (prevDeptIdRef.current === watchedDeptId) return;
    prevDeptIdRef.current = watchedDeptId;
    form.setValue(`contractUserRoles.${role}.${index}.userId`, '', {
      shouldDirty: true,
    });
  }, [watchedDeptId]);

  const siblingValues = form.watch(`contractUserRoles.${role}`) || [];
  const selectedUserIdsInOtherRows = siblingValues
    .map((val: any, idx: number) => (idx !== index ? val.userId : null))
    .filter(Boolean);

  const filteredUsers = users.filter(
    (u) =>
      u.departmentId === watchedDeptId &&
      !selectedUserIdsInOtherRows.includes(u.id)
  );

  return (
    <div className='flex items-end gap-3 flex-wrap lg:flex-nowrap'>
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <FormSelect
          control={form.control}
          name={`contractUserRoles.${role}.${index}.departmentId`}
          label={showLabel ? 'Phòng ban' : undefined}
          placeholder='Chọn phòng ban'
          options={departments.map((dept) => ({
            value: dept.id,
            label: dept.code ? `${dept.code} - ${dept.name}` : dept.name,
          }))}
        />
        <FormSelect
          control={form.control}
          name={`contractUserRoles.${role}.${index}.userId`}
          label={showLabel ? 'Nhân viên' : undefined}
          placeholder='Chọn nhân viên'
          disabled={!watchedDeptId}
          options={filteredUsers.map((u) => ({
            value: u.id,
            label: u.employeeCode
              ? `${u.employeeCode} - ${u.fullname}`
              : u.fullname,
          }))}
        />
      </div>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        className={cn(
          'text-destructive hover:text-destructive shrink-0 size-10',
          showLabel ? 'mt-6' : ''
        )}
        disabled={disabledRemove}
        onClick={onRemove}
      >
        <Trash2Icon className='size-4' />
      </Button>
    </div>
  );
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
        <div className='flex flex-col' data-invalid={!!error}>
          <div className='text-sm font-semibold text-slate-800'>{label}</div>
          {error?.message && (
            <p className='text-xs font-medium text-destructive mt-0.5'>
              {error.message}
            </p>
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
          Thêm phòng ban / nhân viên
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className='text-xs text-muted-foreground italic text-center py-2'>
          Chưa phân công cán bộ
        </p>
      ) : (
        <div className='space-y-3'>
          {fields.map((field, index) => (
            <RoleUserRow
              key={field.id}
              role={role}
              index={index}
              form={form}
              departments={departments}
              users={users}
              onRemove={() => remove(index)}
              disabledRemove={fields.length === 1}
              showLabel={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const addDays = (
  dateStr: string | null | undefined,
  days: number | null | undefined
): string => {
  if (!dateStr || days === null || days === undefined || isNaN(Number(days)))
    return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
};

const diffDays = (
  fromStr: string | null | undefined,
  toStr: string | null | undefined
): number | undefined => {
  if (!fromStr || !toStr) return undefined;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
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
  const [contractAppendixs, setContractAppendixs] = useState<
    ContractAppendix[]
  >([]);
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
      const roleUsers =
        contract.contractUserRoles?.filter((r) => r.role === roleId) || [];
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

    // Tính trước contractNumberId khớp đúng, dùng chung để match appendix
    // đúng theo cả appendixNumber lẫn contractNumberId (tránh trùng số phụ lục
    // giữa các hợp đồng khác nhau)
    const matchedContractNumberId =
      contractNumbers.find((f) => f.number === contract.contractNumber)?.id ??
      '';

    const filePaths = contract.filePath
      ? contract.filePath.split(';').filter(Boolean)
      : [];
    const attachmentPaths =
      contract.attachments?.map((attachment) => attachment.filePath) || [];

    const promises = Promise.all([
      Promise.all(filePaths.map((path) => fileService.getFile(path))),
      Promise.all(attachmentPaths.map((path) => fileService.getFile(path))),
    ]);

    promises.then(([files, attachments]) => {
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
        contractNumberId: matchedContractNumberId,
        appendixNumberId:
          contractAppendixs.find(
            (f) =>
              f.appendixNumber === contract.appendixNumber &&
              f.contractNumberId === matchedContractNumberId
          )?.id ?? '',
        partnerId: contract.partnerId,
        signingDate: contract.signingDate
          ? contract.signingDate.slice(0, 10)
          : '',
        effectiveDate: contract.effectiveDate
          ? contract.effectiveDate.slice(0, 10)
          : '',
        completionDurationDays: diffDays(
          contract.effectiveDate,
          contract.completionDate
        ),
        completionDate: contract.completionDate
          ? contract.completionDate.slice(0, 10)
          : '',
        warrantyDurationDays: (() => {
          const diff = diffDays(
            contract.completionDate,
            contract.warrantyExpirationDate
          );
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
          draftingOfficer: getContractUserRoles(
            ContractRole.DraftingOfficer.id
          ),
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

  const watchedContractItems =
    useWatch({ control: form.control, name: 'contractItems' }) || [];
  const selectedMaterialIds = useMemo(
    () =>
      watchedContractItems
        .map((item) => item.materialId)
        .filter(Boolean) as string[],
    [watchedContractItems]
  );

  const totalContractItemsValue = useMemo(() => {
    return watchedContractItems.reduce((sum, item) => {
      const material = materials.find((m) => m.id === item.materialId);
      const price = material?.price || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [watchedContractItems, materials]);

  const {
    fields: contractOtherItems,
    append: appendContractOtherItem,
    remove: removeContractOtherItem,
  } = useFieldArray({
    control: form.control,
    name: 'contractOtherItems',
  });

  const watchedContractOtherItems =
    useWatch({ control: form.control, name: 'contractOtherItems' }) || [];
  const selectedOtherMaterialIds = useMemo(
    () =>
      watchedContractOtherItems
        .map((item) => item.materialId)
        .filter(Boolean) as string[],
    [watchedContractOtherItems]
  );

  const totalContractOtherItemsValue = useMemo(() => {
    return watchedContractOtherItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
  }, [watchedContractOtherItems]);

  const totalContractComponentsValue = useMemo(() => {
    return totalContractItemsValue + totalContractOtherItemsValue;
  }, [totalContractItemsValue, totalContractOtherItemsValue]);

  const { replace: replacePaymentSchedules } = useFieldArray({
    control: form.control,
    name: 'paymentSchedules.schedules',
  });

  const watchedDiscountType = form.watch('discountType');
  const watchedDiscountValue = form.watch('discountValue');
  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);
  const watchedContractNumberId = form.watch('contractNumberId');
  const watchedAppendixNumberId = form.watch('appendixNumberId');
  const filteredAppendixs = contractAppendixs.filter(
    (appendix) => appendix.contractNumberId === watchedContractNumberId
  );

  useEffect(() => {
    if (isResettingForm.current) return;
    if (contractNumbers.length === 0) return;
    const selected = contractNumbers.find(
      (f) => f.id === watchedContractNumberId
    );
    form.setValue('contractNumber', selected?.number ?? '');
    form.setValue('appendixNumberId', '');
    form.setValue('appendixNumber', '');
  }, [watchedContractNumberId, contractNumbers]);

  useEffect(() => {
    if (isResettingForm.current) return;
    if (contractAppendixs.length === 0) return;
    const selected = contractAppendixs.find(
      (f) => f.id === watchedAppendixNumberId
    );
    form.setValue('appendixNumber', selected?.appendixNumber ?? '');
  }, [watchedAppendixNumberId, contractAppendixs]);

  const watchedEffectiveDate = form.watch('effectiveDate');
  const watchedCompletionDurationDays = form.watch('completionDurationDays');
  const watchedCompletionDate = form.watch('completionDate');
  const watchedWarrantyDurationDays = form.watch('warrantyDurationDays');

  // Ngày hoàn thành hợp đồng = Ngày hiệu lực + Thời gian thực hiện
  useEffect(() => {
    if (isResettingForm.current) return;
    form.setValue(
      'completionDate',
      addDays(watchedEffectiveDate, watchedCompletionDurationDays)
    );
  }, [watchedEffectiveDate, watchedCompletionDurationDays]);

  // Ngày hết hạn bảo hành = (Ngày hoàn thành + 1) + Thời gian bảo hành
  useEffect(() => {
    if (isResettingForm.current) return;
    const warrantyStartDate = addDays(watchedCompletionDate, 1);
    form.setValue(
      'warrantyExpirationDate',
      addDays(warrantyStartDate, watchedWarrantyDurationDays)
    );
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

    promises
      .then(
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
          setMaterials(materials || []);
          setOtherMaterials(otherMaterials || []);
          setDepartments(departments || []);
          setLevel1Codes(level1CodesData || []);
          setContractStructures(contractStructuresData || []);
          setContractFields(contractFieldsData || []);
          setContractNumbers(contractNumbersData || []);
          setContractAppendixs(contractAppendixsData || []);
        }
      )
      .finally(() => {
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
    form.setValue('title', '', { shouldValidate: true });
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
    form.setValue('title', '', { shouldValidate: true });

    signedContentService
      .getSignedContentByLevel3(watchedLevel3CodeId)
      .then((data) => {
        const first = data?.[0];
        if (first?.name) {
          form.setValue('title', first.name, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      });
  }, [watchedLevel3CodeId]);

  const handleSubmit = (data: BasicInformationValues) => {
    if (getContractFinalValue() < 0) {
      return form.setError('discountValue', {
        message: 'Phải nhỏ hơn giá trị hợp đồng',
      });
    }
    // BE chỉ nhận 4 ngày tuyệt đối, không cần gửi số ngày (duration)
    const { completionDurationDays, warrantyDurationDays, ...payload } = data;
    setBasicInformation(payload as BasicInformationValues);
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
              options={contractFields.map((f) => ({
                value: f.id,
                label: f.code ? `${f.code} - ${f.name}` : f.name,
              }))}
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

          <FormGroupContent className='flex flex-col gap-6'>
            {/* ── Sub-section 1: Vật tư ── */}
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between items-center'>
                <FormGroupLabel>Thành phần hợp đồng</FormGroupLabel>
                {!isRuleContract && (
                  <span className='text-sm font-semibold text-primary'>
                    Tổng : {format.number(totalContractComponentsValue)} VNĐ
                  </span>
                )}
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm font-semibold'>
                  Danh sách vật tư, tài sản
                </span>

                <div className='flex items-center gap-2'>
                  <MaterialImportDialog
                    isOtherMaterial={false}
                    existingMaterials={materials}
                    onReloadMaterials={reloadMaterials}
                    contractFormat={contractFormat?.contractFormat}
                    onSuccess={(items) => {
                      const newItems = items.filter(
                        (item) => !selectedMaterialIds.includes(item.materialId)
                      );
                      newItems.forEach((item) => appendContractItem(item));
                    }}
                  />
                  <CreateMaterialDialog
                    isOtherMaterial={false}
                    onSuccess={reloadMaterials}
                  />
                </div>
              </div>
              <VirtualMaterialMultiSelect
                control={form.control}
                name='contractItems'
                placeholder='Thêm vật tư, tài sản'
                materials={materials}
                isLoading={isCatalogLoading}
                excludedIds={selectedMaterialIds}
                onConfirm={(selected) => {
                  selected.forEach((m) =>
                    appendContractItem({
                      materialId: m.id,
                      quantity: '' as unknown as number,
                    })
                  );
                }}
              />

              {contractItems.length > 0 ? (
                <div className='rounded-lg border max-h-[475px] overflow-y-auto'>
                  <table className='w-full border-collapse text-sm'>
                    <thead className='sticky top-0 z-30'>
                      <tr className='bg-muted'>
                        <th className='w-10 border-b bg-muted px-3 py-2 text-center font-medium'>
                          #
                        </th>
                        <th className='border-b bg-muted px-3 py-2 text-left font-medium'>
                          Mã vật tư, tài sản
                        </th>
                        <th className='border-b bg-muted px-3 py-2 text-left font-medium'>
                          Tên vật tư, tài sản
                        </th>
                        <th className='w-36 border-b bg-muted px-3 py-2 text-left font-medium'>
                          ĐVT
                        </th>
                        <th className='w-36 border-b bg-muted px-3 py-2 text-left font-medium'>
                          Đơn giá
                        </th>
                        {!isRuleContract && (
                          <>
                            <th className='w-44 border-b bg-muted px-3 py-2 text-left font-medium'>
                              Số lượng
                            </th>
                            <th className='w-40 border-b bg-muted px-3 py-2 text-left font-medium'>
                              Thành tiền
                            </th>
                          </>
                        )}
                        <th className='w-10 border-b bg-muted' />
                      </tr>
                    </thead>

                    <tbody>
                      {contractItems.map((field, index) => {
                        const watchedMaterialId =
                          watchedContractItems[index]?.materialId;

                        const selectedMaterial = materials.find(
                          (m) => m.id === watchedMaterialId
                        );

                        return (
                          <tr
                            key={field.id}
                            className='transition-colors hover:bg-muted/30'
                          >
                            <td className='border-b px-3 py-2 text-center text-muted-foreground'>
                              {index + 1}
                            </td>

                            <td className='border-b px-3 py-2'>
                              {selectedMaterial?.materialCode || (
                                <span className='italic text-muted-foreground'>
                                  —
                                </span>
                              )}
                            </td>

                            <td className='border-b px-3 py-2'>
                              {selectedMaterial?.name || (
                                <span className='text-xs italic text-muted-foreground'>
                                  —
                                </span>
                              )}
                            </td>

                            <td className='border-b px-3 py-2 text-muted-foreground'>
                              {selectedMaterial?.unitOfMeasureName || '—'}
                            </td>

                            <td className='border-b px-3 py-2 text-muted-foreground'>
                              {selectedMaterial?.price
                                ? format.number(selectedMaterial.price)
                                : '—'}
                            </td>

                            {!isRuleContract && (
                              <>
                                <td className='border-b px-3 py-2'>
                                  <FormNumber
                                    control={form.control}
                                    name={`contractItems.${index}.quantity`}
                                    placeholder='Nhập số lượng'
                                  />
                                </td>

                                <td className='border-b px-3 py-2 font-medium'>
                                  {(() => {
                                    const price = selectedMaterial?.price || 0;
                                    const quantity =
                                      Number(
                                        watchedContractItems[index]?.quantity
                                      ) || 0;

                                    return format.number(price * quantity);
                                  })()}
                                </td>
                              </>
                            )}

                            <td className='border-b px-2 py-2 text-center'>
                              <Button
                                variant='ghost'
                                size='icon'
                                type='button'
                                className='size-8 text-destructive hover:text-destructive'
                                onClick={() => removeContractItem(index)}
                              >
                                <Trash2Icon className='size-4' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {!isRuleContract && (
                      <tfoot className='sticky bottom-0 z-30'>
                        <tr className='border-t bg-muted'>
                          <td colSpan={6} className='bg-muted px-3 py-2'>
                            <div className='flex justify-end'>
                              <span className='font-medium'>Tổng tiền</span>
                            </div>
                          </td>

                          <td className='bg-muted px-3 py-2 font-semibold text-primary'>
                            {format.number(totalContractItemsValue)} VNĐ
                          </td>

                          <td className='bg-muted' />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              ) : (
                <p className='rounded-lg border py-4 text-center text-sm italic text-muted-foreground'>
                  Chưa có vật tư, tài sản nào. Dùng dropdown hoặc import Excel
                  để thêm.
                </p>
              )}
            </div>

            {/* ── Sub-section 2: Dịch vụ khác ── */}
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-semibold'>
                  Danh sách dịch vụ khác
                </span>
                <div className='flex items-center gap-2'>
                  <CreateMaterialDialog
                    isOtherMaterial={true}
                    onSuccess={reloadOtherMaterials}
                  />
                </div>
              </div>
              <VirtualMaterialMultiSelect
                control={form.control}
                name='contractOtherItems'
                placeholder='Thêm dịch vụ khác'
                materials={otherMaterials}
                isLoading={isCatalogLoading}
                excludedIds={selectedOtherMaterialIds}
                onConfirm={(selected) => {
                  selected.forEach((m) =>
                    appendContractOtherItem({
                      materialId: m.id,
                      quantity: '' as unknown as number,
                      price: '' as unknown as number,
                    })
                  );
                }}
              />
              {contractOtherItems.length > 0 ? (
                <div className='rounded-lg border max-h-[500px] overflow-y-auto'>
                  <table className='w-full border-collapse text-sm'>
                    <thead className='sticky top-0 z-30'>
                      <tr className='bg-muted'>
                        <th className='w-10 border-b bg-muted px-3 py-2 text-center font-medium'>
                          #
                        </th>
                        <th className='border-b bg-muted px-3 py-2 text-left font-medium'>
                          Mã dịch vụ
                        </th>
                        <th className='border-b bg-muted px-3 py-2 text-left font-medium'>
                          Tên dịch vụ
                        </th>
                        {!isRuleContract && (
                          <th className='w-72 border-b bg-muted px-3 py-2 text-left font-medium'>
                            Thành tiền
                          </th>
                        )}
                        <th className='w-10 border-b bg-muted' />
                      </tr>
                    </thead>

                    <tbody>
                      {contractOtherItems.map((field, index) => {
                        const watchedMaterialId =
                          watchedContractOtherItems[index]?.materialId;

                        const selectedMaterial = otherMaterials.find(
                          (m) => m.id === watchedMaterialId
                        );

                        return (
                          <tr
                            key={field.id}
                            className='transition-colors hover:bg-muted/30'
                          >
                            {/* # */}
                            <td className='border-b px-3 py-2 text-center text-muted-foreground'>
                              {index + 1}
                            </td>

                            {/* Mã dịch vụ */}
                            <td className='border-b px-3 py-2'>
                              {selectedMaterial?.materialCode || (
                                <span className='italic text-muted-foreground'>
                                  —
                                </span>
                              )}
                            </td>

                            {/* Tên dịch vụ */}
                            <td className='border-b px-3 py-2'>
                              {selectedMaterial?.name || (
                                <span className='text-xs italic text-muted-foreground'>
                                  —
                                </span>
                              )}
                            </td>

                            {/* Thành tiền */}
                            {!isRuleContract && (
                              <td className='border-b px-3 py-2 text-muted-foreground'>
                                <FormNumber
                                  control={form.control}
                                  name={`contractOtherItems.${index}.price`}
                                  placeholder='Nhập thành tiền'
                                />
                              </td>
                            )}

                            {/* Xóa */}
                            <td className='border-b px-2 py-2 text-center'>
                              <Button
                                variant='ghost'
                                size='icon'
                                type='button'
                                className='size-8 text-destructive hover:text-destructive'
                                onClick={() => removeContractOtherItem(index)}
                              >
                                <Trash2Icon className='size-4' />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {!isRuleContract && (
                      <tfoot className='sticky bottom-0 z-30'>
                        <tr className='border-t bg-muted'>
                          <td colSpan={3} className='bg-muted px-3 py-2'>
                            <div className='flex justify-end'>
                              <span className='font-medium'>Tổng tiền</span>
                            </div>
                          </td>
                          <td className='bg-muted px-3 py-2 font-semibold text-primary'>
                            {format.number(totalContractOtherItemsValue)} VNĐ
                          </td>
                          <td className='bg-muted' />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              ) : (
                <p className='rounded-lg border py-4 text-center text-sm italic text-muted-foreground'>
                  Chưa có dịch vụ nào. Dùng dropdown hoặc import Excel để thêm.
                </p>
              )}
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
          <FormRow className='grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0'>
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
                <FormGroup key={name} className='min-w-0 overflow-hidden'>
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
                label: `${contractRegister.name} - ${contractRegister.year}`,
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
                options={contractNumbers.map((f) => ({
                  value: f.id,
                  label: f.number,
                }))}
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
                value={formatDateDisplay(form.watch('completionDate')) || '—'}
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
                value={
                  formatDateDisplay(form.watch('warrantyExpirationDate')) || '—'
                }
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
                <FormNumber
                  control={form.control}
                  name={`paymentSchedules.schedules.0.days`}
                  label={`Thanh toán sau ${form.watch('paymentSchedules.schedules.0.days') || '…'} ngày kể từ ngày có biên bản nghiệm thu chất lượng hàng hoá từng đợt (hoặc biên bản kiểm nhập) và bên B cung cấp đầy đủ các chứng từ thanh toán, hoá đơn GTGT theo quy định, giấy đề nghị thanh toán.`}
                  placeholder='Nhập số ngày'
                />
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
                label: procurementMethod.code
                  ? `${procurementMethod.code} - ${procurementMethod.name}`
                  : procurementMethod.name,
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
                label: cs.code ? `${cs.code} - ${cs.name}` : cs.name,
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
                label='Hợp đồng'
                placeholder='Chọn file hợp đồng (Chỉ PDF)'
              />

              <FormFiles
                accept='.pdf'
                control={form.control}
                name='attachmentFiles'
                label='Phụ lục hợp đồng và tài liệu khác'
                placeholder='Chọn file phụ lục hợp đồng và các tài liệu đính kèm (Chỉ PDF)'
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
