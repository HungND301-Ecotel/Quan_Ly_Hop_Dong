import { PdfViewer } from '@/components/pdf-viewer';
import { StepperPrev } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractFormat } from '@/constants/contract-format';
import { DiscountType } from '@/constants/discount-type';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import { ContractRegisterService } from '@/services/contract-register';
import { ContractRegister } from '@/services/contract-register/type';
import { contractTypeService } from '@/services/contract-type';
import { departmentService } from '@/services/department';
import { Department } from '@/services/department/type';
import { materialService } from '@/services/material';
import { Material } from '@/services/material/type';
import { partnerService } from '@/services/partner';
import { Partner } from '@/services/partner/type';
import { procurementMethodService } from '@/services/procurement-method';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import {
  Banknote,
  CalendarDays,
  DollarSignIcon,
  EyeIcon,
  FileBadge,
  FileText,
  FileTextIcon,
  HashIcon,
  Info,
  Layers,
  LucideIcon,
  ShieldCheck,
  StickyNote,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { FilePreviewDialog } from '../../edit/review/FilePreviewDialog';
import { errorMessageMap } from '../../edit/review/error-map';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { Level1Code } from '@/services/level1code/type';
import { Level2Code } from '@/services/level2code/type';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { level2CodeService } from '@/services/level2code';
import { level3CodeService } from '@/services/level3code';
import { ContractType } from '@/services/contract-type/type';
import { ContractStructureCatalog } from '@/services/structure/type';
import { contractStructureCatalogService } from '@/services/structure';

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const emptyStringToNull = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().nullable()
);

const guaranteeSchema = z.object({
  value: z.number(),
  valueType: z.number(),
  durationDate: emptyStringToNull,
  bankAccountId: emptyStringToNull,
});

const contractGuarantee = z.object({
  performanceBondGuarantee: guaranteeSchema,
  warrantyBondGuarantee: guaranteeSchema,
  depositGuarantee: guaranteeSchema,
});

// ─── UI primitives ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon: Icon,
  highlight = false,
  loading = false,
}: {
  label: string;
  value?: string | React.ReactNode;
  icon?: LucideIcon;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div className='flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'>
      {Icon && (
        <div className='mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary'>
          <Icon className='size-4' />
        </div>
      )}
      <div className='flex-1 min-w-0'>
        <dt className='text-xs font-medium text-muted-foreground mb-0.5'>
          {label}
        </dt>
        {loading ? (
          <Skeleton className='h-5 w-3/4 rounded bg-muted-foreground/20' />
        ) : (
          <dd
            className={cn(
              'text-sm font-medium wrap-break-words',
              highlight && 'font-semibold'
            )}
          >
            {value || 'N/A'}
          </dd>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <div className='flex items-center gap-2 mb-4'>
      <div className='p-2 rounded-lg bg-primary/10'>
        <Icon className='size-5 text-primary' />
      </div>
      <div>
        <h3 className='text-base font-semibold tracking-tight'>{title}</h3>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className='p-6 rounded-lg border bg-blue-50 space-y-4'>
      <SectionHeader title={title} description={description} icon={icon} />
      <div className={cn('space-y-3', className)}>{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContractArchiveReviewForm() {
  const { contractFormat, basicInformation, callback, contract, isUpdate } =
    useContractEditContext();

  const [loading, setLoading] = useState(true);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isEconomicWithDebt =
    [2, 3].includes(contractFormat?.contractFormat ?? -1) &&
    !!contractFormat?.isDebtTrackingEnabled;

  const [isAutoLiquidated, setIsAutoLiquidated] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [contractRegisters, setContractRegisters] = useState<ContractRegister[]>([]);
  const [procurementMethods, setProcurementMethods] = useState<ProcurementMethod[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [otherMaterials, setOtherMaterials] = useState<Material[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [linkedContractLabel, setLinkedContractLabel] = useState<string | null>(null);
  const [level1Codes, setLevel1Codes] = useState<Level1Code[]>([]);
  const [level2Codes, setLevel2Codes] = useState<Level2Code[]>([]);
  const [level3Codes, setLevel3Codes] = useState<Level3Code[]>([]);
  const [contractStructures, setContractStructures] = useState<ContractStructureCatalog[]>([]);

  const level1CodeMap = useMemo(
    () => new Map(level1Codes.map((l) => [l.id, l.code])),
    [level1Codes]
  );
  const level2CodeMap = useMemo(
    () => new Map(level2Codes.map((l) => [l.id, l.code])),
    [level2Codes]
  );
  const level3CodeMap = useMemo(
    () => new Map(level3Codes.map((l) => [l.id, l.code])),
    [level3Codes]
  );

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments]
  );
  const partnerMap = useMemo(
    () => new Map(partners.map((p) => [p.id, p])),
    [partners]
  );
  const contractTypeMap = useMemo(
    () => new Map(contractTypes.map((ct) => [ct.id, ct.name])),
    [contractTypes]
  );
  const contractRegisterMap = useMemo(
    () => new Map(contractRegisters.map((cr) => [cr.id, cr.name])),
    [contractRegisters]
  );
  const procurementMethodMap = useMemo(
    () => new Map(procurementMethods.map((pm) => [pm.id, pm.name])),
    [procurementMethods]
  );
  const userMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );
  const materialMap = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials]
  );

  const contractStructureMap = useMemo(
    () => new Map(contractStructures.map((cs) => [cs.id, cs.name])),
    [contractStructures]
  );

  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);

  useEffect(() => {
    Promise.all([
      departmentService.getDepartmentList(),
      partnerService.getPartnerList(),
      contractTypeService.getContractTypeList(),
      ContractRegisterService.getContractRegisterList(),
      procurementMethodService.getProcurementMethodList(),
      userService.getUserList(),
      materialService.getMaterialList(),
      materialService.getOtherMaterialList(),
      BankAccountService.getBankAccountList(),
      level1CodeService.getLevel1CodeList(),
      level2CodeService.getLevel2CodeList(),
      level3CodeService.getLevel3CodeList(),
      contractStructureCatalogService.getContractStructureCatalogList(),
    ])
      .then(([deps, parts, ctypes, cregs, pmethods, usrs, mats, otherMats, bankAccountsData, level1CodesData, level2CodesData, level3CodesData, contractStructuresData]) => {
        setDepartments(deps || []);
        setPartners(parts || []);
        setContractTypes(ctypes || []);
        setContractRegisters(cregs || []);
        setProcurementMethods(pmethods || []);
        setUsers(usrs || []);
        setMaterials(mats || []);
        setOtherMaterials(otherMats || []);
        setBankAccounts(bankAccountsData || []);
        setLevel1Codes(level1CodesData || []);
        setLevel2Codes(level2CodesData || []);
        setLevel3Codes(level3CodesData || []);
        setContractStructures(contractStructuresData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = contractFormat?.linkedContractId?.trim();
    if (!id) return;
    contractService.getContractDetail(id).then((res) => {
      if (res) setLinkedContractLabel(`${res.contractNumber} — ${res.title}`);
    });
  }, [contractFormat?.linkedContractId]);

  const getContractFinalValue = () => {
    if (!basicInformation) return 0;
    const { contractValue, contractItems, discountType, discountValue, contractOthersValue, contractOtherItems } = basicInformation;

    let totalItems = 0;
    if (contractItems && contractItems.length > 0) {
      contractItems.forEach((item) => {
        const material = materials.find((m) => m.id === item.materialId);
        totalItems += (item.quantity || 0) * (material?.price || 0);
      });
    } else {
      totalItems = contractValue || 0;
    }

    let totalOthers = 0;
    if (contractOtherItems && contractOtherItems.length > 0) {
      contractOtherItems.forEach((item) => {
        const material = otherMaterials.find((m) => m.id === item.materialId);
        totalOthers += (item.quantity || 0) * (material?.price || 0);
      });
    } else {
      totalOthers = contractOthersValue || 0;
    }

    const total = totalItems + totalOthers;
    const dValue = discountValue || 0;
    let discount = 0;
    if (discountType == DiscountType.Percent.id) {
      discount = Math.round((total * dValue) / 100);
    } else {
      discount = dValue;
    }
    return total - discount;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const contractFilePath = await contractService.uploadContract({
        contractFile: basicInformation!.contractFile!,
        contractNumber: basicInformation!.contractNumber!,
      });

      const attachmentFiles = await contractService.uploadAttachments({
        attachmentFiles: basicInformation?.attachmentFiles || [],
        contractNumber: basicInformation!.contractNumber!,
      });

      const mappedUserRoles = {
        draftingOfficerUserIds: basicInformation?.contractUserRoles.draftingOfficer.map((x: any) => x.userId).filter(Boolean),
        managerUserIds: basicInformation?.contractUserRoles.manager.map((x: any) => x.userId).filter(Boolean),
        coordinatorUserIds: basicInformation?.contractUserRoles.coordinator.map((x: any) => x.userId).filter(Boolean),
        receivingOfficerUserIds: basicInformation?.contractUserRoles.receivingOfficer.map((x: any) => x.userId).filter(Boolean),
      };

      const allContractItems = [
        ...(basicInformation?.contractItems || []),
        ...(basicInformation?.contractOtherItems || []),
      ];

      const payload = {
        ...contractFormat,
        ...basicInformation!,
        isArchiveContract: true,
        isAutoLiquidated: isEconomicWithDebt ? isAutoLiquidated : false,
        contractGuarantee: isRuleContract
          ? null
          : contractGuarantee.parse(basicInformation?.contractGuarantee),
        isDebtTrackingEnabled: contractFormat?.isDebtTrackingEnabled ?? false,
        childRelationships: !isRuleContract && contractFormat?.linkedContractId?.trim()
          ? [{ childContractId: contractFormat.linkedContractId.trim(), relationType: 0 }]
          : null,
        parentRelationship: null,
        parentContractId: undefined,
        contractUserRoles: mappedUserRoles,
        contractFilePath,
        attachmentFiles,
        signingFlows: [],
        contractItems: allContractItems,
        contractOtherItems: undefined,
        contractOthersValue: undefined,
      };

      if (isUpdate && contract) {
        await contractService.updateContract(contract.id, payload);
      } else {
        await contractService.createContract(payload);
      }

      toast.success('Tạo hợp đồng lưu trữ thành công');
      callback?.();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.title || error?.response?.data?.message;
      const message = errorMessageMap[backendMessage] || backendMessage || 'Lỗi khi tạo hợp đồng lưu trữ';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-col gap-0 h-full'>
      <Tabs defaultValue='informations' className='w-full flex-1 gap-4 py-6'>
        <div className='px-6'>
          <TabsList className='w-full'>
            <TabsTrigger value='informations' className='flex items-center gap-2'>
              <Info className='size-4' />
              <span className='hidden md:inline'>Thông tin hợp đồng</span>
            </TabsTrigger>
            <TabsTrigger value='documents' className='flex items-center gap-2'>
              <FileText className='size-4' />
              <span className='hidden md:inline'>Tài liệu</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='px-6'>
          {/* ── Tab: Thông tin hợp đồng ── */}
          <TabsContent
            value='informations'
            className='mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-0.5'
          >
            {/* 1. Mẫu hợp đồng */}
            <Section title='Mẫu hợp đồng' icon={FileText}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow
                  label='Định dạng hợp đồng'
                  value={ContractFormat[contractFormat?.contractFormat || 0]?.name}
                  loading={loading}
                  highlight
                />
                {isRuleContract && (
                  <InfoRow
                    label='Theo dõi công nợ'
                    value={contractFormat?.isDebtTrackingEnabled ? 'Có' : 'Không'}
                    loading={loading}
                  />
                )}
                {!isRuleContract && (
                  <InfoRow
                    label='Hợp đồng nguyên tắc liên kết'
                    value={linkedContractLabel || contractFormat?.linkedContractId?.trim() || 'Hợp đồng kinh tế độc lập'}
                    loading={loading}
                  />
                )}
              </div>

              {/* isAutoLiquidated: chỉ hiển thị khi format 2,3 + có theo dõi công nợ */}
              {isEconomicWithDebt && (
                <div className='flex items-start gap-3 p-3 rounded-lg border bg-white'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <Checkbox
                      id='archive-auto-liquidated'
                      checked={isAutoLiquidated}
                      onCheckedChange={(checked) =>
                        setIsAutoLiquidated(checked === true)
                      }
                    />
                    <div className='flex flex-col'>
                      <Label
                        htmlFor='archive-auto-liquidated'
                        className='text-sm font-medium cursor-pointer'
                      >
                        Tự động thanh lý hợp đồng
                      </Label>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Hệ thống sẽ tự động thanh lý hợp đồng khi đủ các tài liệu
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* 2. Thông tin hợp đồng */}
            <Section title='Thông tin hợp đồng' icon={HashIcon}>
              <div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <InfoRow label='Mã cấp I' value={level1CodeMap.get(basicInformation?.level1CodeId || '')} loading={loading} />
                  <InfoRow label='Mã cấp II' value={level2CodeMap.get(basicInformation?.level2CodeId || '')} loading={loading} />
                  <InfoRow label='Mã cấp III' value={level3CodeMap.get(basicInformation?.level3CodeId || '')} loading={loading} />
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow
                  label='Loại hợp đồng'
                  value={contractTypeMap.get(basicInformation?.contractTypeId || '')}
                  loading={loading}
                />
                <InfoRow
                  label='Hình thức hợp đồng'
                  value={contractStructureMap.get(basicInformation?.contractStructureId || '')}
                />
                <InfoRow
                  label='Tên/nội dung hợp đồng'
                  value={basicInformation?.title}
                  loading={loading}
                  highlight
                />
                <InfoRow
                  label='Sổ theo dõi hợp đồng'
                  value={contractRegisterMap.get(basicInformation?.contractRegisterId || '')}
                  loading={loading}
                />
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow
                  label='Phòng ban'
                  value={departmentMap.get(basicInformation?.departmentId || '')}
                  loading={loading}
                />
                <InfoRow
                  label='Hình thức lựa chọn nhà thầu/nhà cung cấp'
                  value={procurementMethodMap.get(basicInformation?.procurementMethodId || '')}
                  loading={loading}
                />
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow
                  label='Số ký hiệu hợp đồng'
                  value={basicInformation?.contractNumber}
                  loading={loading}
                  highlight
                />
                <InfoRow
                  label='Số ký hiệu PLHĐ'
                  value={basicInformation?.appendixNumber}
                  loading={loading}
                />
              </div>

              <Separator />

              {(() => {
                const partner = partnerMap.get(basicInformation?.partnerId || '');
                return (
                  <InfoRow
                    label='Đối tác/khách hàng'
                    loading={loading}
                    value={partner ? (
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-semibold'>{partner.name}</span>
                        {partner.address && (
                          <span className='text-xs text-muted-foreground'>
                            <b>Địa chỉ:</b> {partner.address}
                          </span>
                        )}
                        {partner.taxCode && (
                          <span className='text-xs text-muted-foreground'>
                            <b>Mã số thuế:</b> {partner.taxCode}
                          </span>
                        )}
                        {partner.contactPerson && (
                          <span className='text-xs text-muted-foreground'>
                            <b>Người đại diện:</b> {partner.contactPerson}
                          </span>
                        )}
                      </div>
                    ) : undefined}
                  />
                );
              })()}

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow
                  label='Ngày ký hợp đồng'
                  value={
                    basicInformation?.signingDate
                      ? new Date(basicInformation.signingDate).toLocaleDateString('vi-VN')
                      : undefined
                  }
                  loading={loading}
                />
                <InfoRow
                  label='Hiệu lực hết'
                  value={
                    basicInformation?.completionDate
                      ? new Date(basicInformation.completionDate).toLocaleDateString('vi-VN')
                      : undefined
                  }
                  loading={loading}
                />
              </div>
            </Section>

            {/* 3. Phân công quản lý */}
            <Section title='Phân công quản lý' icon={Users}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {(
                  [
                    { role: 'draftingOfficer' as const, label: 'Cán bộ soạn thảo' },
                    { role: 'manager' as const, label: 'Người quản lý' },
                    { role: 'coordinator' as const, label: 'Người điều phối' },
                    { role: 'receivingOfficer' as const, label: 'Cán bộ tiếp nhận' },
                  ]
                ).map(({ role, label }) => {
                  const assigned = (basicInformation?.contractUserRoles?.[role] || []).filter((u: any) => u.userId);
                  return (
                    <div
                      key={role}
                      className='p-4 rounded-lg border bg-white space-y-2'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-muted-foreground'>{label}</span>
                      </div>
                      {loading ? (
                        <Skeleton className='h-10 w-full' />
                      ) : assigned.length > 0 ? (
                        <div className='space-y-2'>
                          {assigned.map((item: any, idx: number) => {
                            const user = userMap.get(item.userId || '');
                            return (
                              <div key={idx} className='text-sm border-b last:border-0 pb-1.5 last:pb-0'>
                                <div className='font-semibold text-foreground'>{user?.fullname || 'Chưa rõ'}</div>
                                {user && <div className='text-xs text-muted-foreground'>{user.departmentName}{user.positionName ? ` / ${user.positionName}` : ''}</div>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='text-sm text-muted-foreground italic'>Chưa phân công</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* 4. Thông tin tài chính */}
            <Section title='Thông tin tài chính' icon={DollarSignIcon}>
              {!isRuleContract && (
                <div className='p-6 rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20'>
                  <div className='text-sm font-medium text-muted-foreground mb-2'>
                    Tổng giá trị hợp đồng (sau thuế)
                  </div>
                  <div className='text-3xl font-bold text-emerald-600'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getContractFinalValue())}
                  </div>
                </div>
              )}

              {basicInformation?.contractItems && basicInformation.contractItems.length > 0 && (
                <>
                  {!isRuleContract && <Separator />}
                  <div>
                    <div className='text-sm font-medium mb-3'>
                      Danh sách vật tư ({basicInformation.contractItems.length} mục)
                    </div>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                        <div className='col-span-6'>Tên vật tư</div>
                        <div className='col-span-3'>Đơn vị tính</div>
                        <div className='col-span-3 text-right'>Số lượng</div>
                      </div>
                      {basicInformation.contractItems.map((item, index) => {
                        const material = materialMap.get(item.materialId);
                        return (
                          <div
                            key={index}
                            className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'
                          >
                            <div className='col-span-6 flex flex-col justify-center'>
                              <span className='text-sm font-medium'>{material?.name || 'N/A'}</span>
                              {material?.materialCode && (
                                <span className='text-xs text-muted-foreground'>{material.materialCode}</span>
                              )}
                            </div>
                            <div className='col-span-3 flex items-center text-sm text-muted-foreground'>
                              {material?.unitOfMeasureName || '—'}
                            </div>
                            <div className='col-span-3 flex items-center justify-end text-sm font-medium'>
                              {item.quantity || 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </Section>

            {/* 5. dịch vụ khác */}
            {((basicInformation?.contractOthersValue && basicInformation.contractOthersValue > 0) ||
              (basicInformation?.contractOtherItems &&
                basicInformation.contractOtherItems.length > 0 &&
                otherMaterials.length > 0)) && (
                <Section title='Dịch vụ khác' icon={Layers}>
                  {basicInformation?.contractOtherItems &&
                    basicInformation.contractOtherItems.length > 0 &&
                    otherMaterials.length > 0 ? (
                    <div>
                      <div className='text-sm font-medium mb-3'>
                        Danh sách dịch vụ khác ({basicInformation.contractOtherItems.length} mục)
                      </div>
                      <div className='space-y-2'>
                        <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                          <div className='col-span-6'>Tên thành phần</div>
                          <div className='col-span-3'>Đơn vị tính</div>
                          <div className='col-span-3 text-right'>Số lượng</div>
                        </div>
                        {basicInformation.contractOtherItems.map((item, index) => {
                          const otherMaterial = otherMaterials.find((m) => m.id === item.materialId);
                          return (
                            <div
                              key={index}
                              className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'
                            >
                              <div className='col-span-6 flex items-center'>
                                <span className='text-sm font-medium'>{otherMaterial?.name || 'N/A'}</span>
                              </div>
                              <div className='col-span-3 flex items-center text-sm text-muted-foreground'>
                                {otherMaterial?.unitOfMeasureName || '—'}
                              </div>
                              <div className='col-span-3 flex items-center justify-end text-sm font-medium'>
                                {item.quantity || 0}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <InfoRow
                      label='Giá trị thành phần khác'
                      value={`${format.number(basicInformation?.contractOthersValue || 0)} đ`}
                      loading={loading}
                      icon={Banknote}
                    />
                  )}
                </Section>
              )}

            {/* 6. Chiết khấu */}
            {basicInformation?.discountValue !== undefined &&
              basicInformation.discountValue > 0 && (
                <Section title='Chiết khấu' icon={FileBadge}>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <InfoRow
                      label='Loại chiết khấu'
                      value={
                        basicInformation.discountType === DiscountType.Percent.id
                          ? DiscountType.Percent.name
                          : DiscountType.Amount.name
                      }
                      loading={loading}
                    />
                    <InfoRow
                      label='Giá trị chiết khấu'
                      value={
                        basicInformation.discountType === DiscountType.Percent.id
                          ? `${basicInformation.discountValue}%`
                          : `${format.number(basicInformation.discountValue)} đ`
                      }
                      loading={loading}
                    />
                  </div>
                </Section>
              )}

            {/* 7. Lịch thanh toán */}
            {!isRuleContract && basicInformation?.paymentSchedules && (
              <Section title='Lịch thanh toán' icon={CalendarDays}>
                {basicInformation.paymentSchedules.schedules.length > 0 && (
                  <div>
                    <div className='text-sm font-medium mb-3'>Chi tiết kế hoạch thanh toán</div>
                    <div className='space-y-3'>
                      {basicInformation.paymentSchedules.schedules.map((schedule, index) => {
                        const rawAmount = schedule.amount ?? 0;
                        const displayAmount =
                          schedule.amountType === DiscountType.Percent.id
                            ? (rawAmount / 100) * getContractFinalValue()
                            : rawAmount;
                        return (
                          <div
                            key={index}
                            className='p-4 rounded-lg border bg-linear-to-br from-background to-muted/20 hover:border-primary/50 transition-colors'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <span className='flex items-center justify-center size-7 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold'>
                                  {index + 1}
                                </span>
                                <div className='flex flex-col'>
                                  <span className='text-sm font-medium'>Kỳ {index + 1}</span>
                                  <span className='text-xs text-muted-foreground'>Số ngày thanh toán/đối chiếu: {schedule.days} ngày</span>
                                </div>
                              </div>
                              {schedule.amount != null && (
                                <div className='text-right'>
                                  <div className='text-xs text-muted-foreground'>
                                    {schedule.amountType === DiscountType.Percent.id
                                      ? `Giá trị: ${rawAmount}%`
                                      : 'Số tiền cố định'}
                                  </div>
                                  <div className='text-base font-bold text-primary'>
                                    {format.number(displayAmount)} đ
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* 8. Bảo lãnh */}
            {!isRuleContract && basicInformation?.contractGuarantee && (
              <Section title='Bảo lãnh hợp đồng' icon={ShieldCheck}>
                <div className='space-y-4'>
                  {(
                    [
                      {
                        key: 'performanceBondGuarantee' as const,
                        label: 'Bảo lãnh thực hiện hợp đồng',
                        colorClass: 'bg-white',
                        iconColor: 'text-amber-600',
                      },
                      {
                        key: 'warrantyBondGuarantee' as const,
                        label: 'Bảo lãnh bảo hành',
                        colorClass: 'bg-white',
                        iconColor: 'text-green-600',
                      },
                      {
                        key: 'depositGuarantee' as const,
                        label: 'Bảo lãnh đặt cọc',
                        colorClass: 'bg-white',
                        iconColor: 'text-blue-600',
                      },
                    ]
                  ).map(({ key, colorClass }) => {
                    const guarantee = basicInformation.contractGuarantee?.[key];
                    if (!guarantee?.value) return null;
                    return (
                      <div key={key} className={`p-4 rounded-lg border bg-linear-to-br ${colorClass}`}>
                        <div className='grid grid-cols-2 gap-3'>
                          <InfoRow
                            label='Giá trị'
                            value={
                              guarantee.valueType === 1
                                ? `${guarantee.value}%`
                                : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(guarantee.value)
                            }
                            highlight
                          />
                          {guarantee.durationDate && (
                            <InfoRow label='Thời hạn' value={new Date(guarantee.durationDate).toLocaleDateString('vi-VN')} />
                          )}
                          {guarantee.bankAccountId && (() => {
                            const bank = bankAccounts.find((b) => b.id === guarantee.bankAccountId);
                            if (!bank) return null;
                            return (
                              <>
                                <InfoRow label='Ngân hàng' value={bank.bankName} />
                                <InfoRow label='Số tài khoản' value={bank.accountNumber} />
                                <div className='col-span-2'>
                                  <InfoRow label='Chủ tài khoản' value={bank.accountHolder} />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* 9. Ghi chú */}
            {basicInformation?.notes && (
              <Section title='Ghi chú' icon={StickyNote}>
                <p className='text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30'>
                  {basicInformation.notes}
                </p>
              </Section>
            )}
          </TabsContent>

          {/* ── Tab: Tài liệu ── */}
          <TabsContent value='documents' className='mt-4'>
            <div className='p-6 rounded-lg border bg-card space-y-4'>
              <SectionHeader
                title='Xem trước tài liệu'
                description='File hợp đồng và tài liệu đính kèm'
                icon={FileText}
              />
              {Array.isArray(basicInformation?.contractFile) && basicInformation.contractFile.length > 1 && (
                <Tabs value={String(selectedFileIndex)} onValueChange={(val) => {
                  setSelectedFileIndex(Number(val));
                }} className='w-full'>
                  <TabsList className='w-full justify-start overflow-x-auto flex-wrap h-auto p-1 bg-muted/50 rounded-lg border'>
                    {basicInformation.contractFile.map((file, idx) => (
                      <TabsTrigger
                        key={idx}
                        value={String(idx)}
                        className='py-2 px-4 text-sm font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
                      >
                        {file.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {basicInformation?.contractFile && (
                <PdfViewer
                  file={
                    Array.isArray(basicInformation.contractFile)
                      ? basicInformation.contractFile[selectedFileIndex]
                      : basicInformation.contractFile
                  }
                />
              )}
              {basicInformation?.attachmentFiles &&
                basicInformation.attachmentFiles.length > 0 && (
                  <>
                    <Separator className='my-4' />
                    <div>
                      <div className='text-sm font-medium text-muted-foreground mb-2'>
                        Tài liệu đính kèm
                      </div>
                      <div className='space-y-2'>
                        {basicInformation.attachmentFiles.map((file, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors'
                          >
                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                              <FileTextIcon className='size-4 shrink-0' />
                              <span className='text-sm truncate'>{file.name}</span>
                            </div>
                            <FilePreviewDialog
                              file={file}
                              fileName={file.name}
                              trigger={
                                <Button variant='ghost' size='icon-sm'>
                                  <EyeIcon className='size-4' />
                                </Button>
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className='fixed bottom-0 start-0 p-6 py-4 shadow bg-background w-full border-t flex items-center justify-between'>
        <StepperPrev>Quay lại</StepperPrev>
        <div className='mx-auto hidden md:block' />
        <Button
          type='submit'
          size={'lg'}
          className='px-4 w-24'
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <Spinner /> : 'Hoàn thành'}
        </Button>
      </div>
    </div>
  );
}