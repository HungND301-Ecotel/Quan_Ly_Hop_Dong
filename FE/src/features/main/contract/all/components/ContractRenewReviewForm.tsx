import { PdfViewer } from '@/components/pdf-viewer';
import { StepperPrev } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractFormat } from '@/constants/contract-format';
import { DiscountType } from '@/constants/discount-type';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import { SignBox } from '@/features/main/contract/edit/sign-postions/sign-box';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import { ContractRegisterService } from '@/services/contract-register';
import { ContractRegister } from '@/services/contract-register/type';
import { contractTypeService } from '@/services/contract-type';
import { ContractSignFlow, ContractType } from '@/services/contract/type';
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
  RefreshCwIcon,
  ShieldCheck,
  StickyNote,
  Users,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FilePreviewDialog } from '@/features/main/contract/edit/review/FilePreviewDialog';
import { errorMessageMap } from '@/features/main/contract/edit/review/error-map';
import z from 'zod';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { ScheduleType } from '@/constants/schedule-type';
import { Level1Code } from '@/services/level1code/type';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { level3CodeService } from '@/services/level3code';
import { ContractStructureCatalog } from '@/services/structure/type';
import { contractStructureCatalogService } from '@/services/structure';
// ─── Zod schemas ──────────────────────────────────────────────────────────────

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

function InfoRow({
  label, value, icon: Icon, highlight = false, loading = false,
}: {
  label: string; value?: string | React.ReactNode; icon?: LucideIcon; highlight?: boolean; loading?: boolean;
}) {
  return (
    <div className='flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'>
      {Icon && <div className='mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary'><Icon className='size-4' /></div>}
      <div className='flex-1 min-w-0'>
        <dt className='text-xs font-medium text-muted-foreground mb-0.5'>{label}</dt>
        {loading ? (
          <Skeleton className='h-5 w-3/4 rounded bg-muted-foreground/20' />
        ) : (
          <dd className={cn('text-sm font-medium wrap-break-words', highlight && 'font-semibold')}>
            {value || 'N/A'}
          </dd>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, icon: Icon }: { title: string; description?: string; icon: LucideIcon }) {
  return (
    <div className='flex items-center gap-2 mb-4'>
      <div className='p-2 rounded-lg bg-primary/10'><Icon className='size-5 text-primary' /></div>
      <div>
        <h3 className='text-base font-semibold tracking-tight'>{title}</h3>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
      </div>
    </div>
  );
}

function Section({ title, description, icon, children, className }: {
  title: string; description?: string; icon: LucideIcon; children: React.ReactNode; className?: string;
}) {
  return (
    <div className='p-6 rounded-lg border bg-blue-50 space-y-4'>
      <SectionHeader title={title} description={description} icon={icon} />
      <div className={cn('space-y-3', className)}>{children}</div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function ContractRenewReviewForm() {
  const {
    contractFormat,
    basicInformation,
    signFlows,
    signPositions,
    callback,
  } = useContractEditContext();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAutoLiquidated, setIsAutoLiquidated] = useState(true);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [procurementMethods, setProcurementMethods] = useState<ProcurementMethod[]>([]);
  const [contractRegisters, setContractRegisters] = useState<ContractRegister[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [otherMaterials, setOtherMaterials] = useState<Material[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [parentContractLabel, setParentContractLabel] = useState<string | null>(null);
  const [linkedContractLabel, setLinkedContractLabel] = useState<string | null>(null);
  const [level1Codes, setLevel1Codes] = useState<Level1Code[]>([]);
  const [level3Codes, setLevel3Codes] = useState<Level3Code[]>([]);
  const [contractStructures, setContractStructures] = useState<ContractStructureCatalog[]>([]);
  const level1CodeMap = useMemo(
    () => new Map(level1Codes.map((l) => [l.id, l.code])),
    [level1Codes]
  );
  const level3CodeMap = useMemo(
    () => new Map(level3Codes.map((l) => [l.id, l.code])),
    [level3Codes]
  );

  const contractStructureMap = useMemo(
    () => new Map(contractStructures.map((cs) => [cs.id, cs.name])),
    [contractStructures]
  );

  const contractTypeMap = useMemo(() => new Map(contractTypes.map((ct) => [ct.id, ct.name])), [contractTypes]);
  const partnerMap = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const procurementMethodMap = useMemo(() => new Map(procurementMethods.map((p) => [p.id, p.name])), [procurementMethods]);
  const contractRegisterMap = useMemo(() => new Map(contractRegisters.map((p) => [p.id, p.name])), [contractRegisters]);
  const materialMap = useMemo(() => new Map(materials.map((m) => [m.id, m])), [materials]);
  const departmentMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);

  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);

  useEffect(() => {
    Promise.all([
      contractTypeService.getContractTypeList(),
      partnerService.getPartnerList(),
      userService.getUserList(),
      departmentService.getDepartmentList(),
      procurementMethodService.getProcurementMethodList(),
      ContractRegisterService.getContractRegisterList(),
      materialService.getMaterialList(),
      materialService.getOtherMaterialList(),
      BankAccountService.getBankAccountList(),
      level1CodeService.getLevel1CodeList(),
      level3CodeService.getLevel3CodeList(),
      contractStructureCatalogService.getContractStructureCatalogList(),
    ])
      .then(([ctypes, parts, usrs, deps, pmethods, cregs, mats, otherMats, bankAccountsData, level1CodesData, level3CodesData, contractStructuresData]) => {
        setContractTypes(ctypes || []);
        setPartners(parts || []);
        setUsers(usrs || []);
        setDepartments(deps || []);
        setProcurementMethods(pmethods || []);
        setContractRegisters(cregs || []);
        setMaterials(mats || []);
        setOtherMaterials(otherMats || []);
        setBankAccounts(bankAccountsData || []);
        setLevel1Codes(level1CodesData || []);
        setLevel3Codes(level3CodesData || []);
        setContractStructures(contractStructuresData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = contractFormat?.parentContractId?.trim();
    if (!id) return;
    contractService.getContractDetail(id).then((res) => {
      if (res) setParentContractLabel(`${res.contractNumber} — ${res.title}`);
    });
  }, [contractFormat?.parentContractId]);

  useEffect(() => {
    const id = contractFormat?.linkedContractId?.trim();
    if (!id) return;
    contractService.getContractDetail(id).then((res) => {
      if (res) setLinkedContractLabel(`${res.contractNumber} — ${res.title}`);
    });
  }, [contractFormat?.linkedContractId]);

  const signBoxes = useMemo(() => {
    if (!signPositions?.postions) return [];
    return signPositions.postions.map((position, index) => {
      const user = users.find((u) => u.id === position.userId);
      const signatureFile = user?.signatures.find(
        (s) => s.signatureType === position.signatureType
      )?.signatureFile;
      return (
        <SignBox
          key={index}
          positionX={position.positionX}
          positionY={position.positionY}
          pageNumber={position.pageNumber}
          userId={position.userId}
          signatureType={position.signatureType}
          width={position.width}
          height={position.height}
          signerName={user?.fullname}
          onRemove={() => { }}
          currentPage={currentPage}
          signatureFile={signatureFile}
        />
      );
    });
  }, [signPositions, users, currentPage]);

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

      const signFlowsWithPositions: ContractSignFlow[] = [];
      if (signFlows && signFlows.signers.length > 0) {
        signFlows.signers.forEach((signer, index) => {
          const position = signPositions?.postions.find((p) => p.userId === signer.signerId);
          signFlowsWithPositions.push(
            position || {
              userId: signer.signerId,
              sequenceOrder: index + 1,
              signatureType: Number(signer.signTypeId),
            }
          );
        });
      }

      const allContractItems = [
        ...(basicInformation?.contractItems || []),
        ...(basicInformation?.contractOtherItems || []),
      ];

      const { paymentSchedules, ...basicInformationWithoutSchedules } = basicInformation!;

      const cleanedPaymentSchedules = (() => {
        if (!paymentSchedules) return undefined;
        const { scheduleType, schedules } = paymentSchedules;

        return {
          scheduleType,
          schedules: schedules.map((schedule) => {
            const year = schedule.year ? Number(schedule.year) : null;
            const month = schedule.month ? Number(schedule.month) : null;
            const quarter = schedule.quarter ? Number(schedule.quarter) : null;
            let fromDate: string | null = null;
            let toDate: string | null = null;

            if (scheduleType === ScheduleType.Month.id && year && month) {
              const lastDay = new Date(year, month, 0).getDate();
              fromDate = `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;
              toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;
            } else if (scheduleType === ScheduleType.Quarter.id && year && quarter) {
              const startMonth = (quarter - 1) * 3 + 1;
              const endMonth = quarter * 3;
              const lastDay = new Date(year, endMonth, 0).getDate();
              fromDate = `${year}-${String(startMonth).padStart(2, '0')}-01T00:00:00Z`;
              toDate = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;
            } else if (scheduleType === ScheduleType.Year.id && year) {
              fromDate = `${year}-01-01T00:00:00Z`;
              toDate = `${year}-12-31T23:59:59Z`;
            } else if (scheduleType === ScheduleType.Stage.id) {
              fromDate = schedule.fromDate ? `${schedule.fromDate}T00:00:00Z` : null;
              toDate = schedule.toDate ? `${schedule.toDate}T23:59:59Z` : null;
            } else if (scheduleType === ScheduleType.LumpSum.id) {
              fromDate = basicInformation?.startDate
                ? `${basicInformation.startDate.slice(0, 10)}T00:00:00Z`
                : null;
              toDate = basicInformation?.endDate
                ? `${basicInformation.endDate.slice(0, 10)}T23:59:59Z`
                : null;
            }

            return {
              amountType: schedule.amountType,
              amount: schedule.amount,
              month: schedule.month || null,
              year: schedule.year || null,
              quarter: schedule.quarter || null,
              fromDate,
              toDate,
              dueDate: schedule.dueDate ? `${schedule.dueDate}T00:00:00Z` : null,
            };
          }),
        };
      })();

      const isRuleContract = [0, 1].includes(contractFormat?.contractFormat ?? -1);

      const parentRelationship = contractFormat?.parentContractId?.trim()
        ? { parentContractId: contractFormat.parentContractId.trim(), relationType: 1 }
        : null;
      const childRelationships = !isRuleContract && contractFormat?.linkedContractId?.trim()
        ? [{ childContractId: contractFormat.linkedContractId.trim(), relationType: 0 }]
        : null;

      const requestBody = {
        ...contractFormat,
        ...basicInformationWithoutSchedules,
        isDebtTrackingEnabled: true,       // gia hạn luôn true
        parentRelationship,                // hợp đồng gốc đã hết hạn
        childRelationships: childRelationships,          // không liên kết nguyên tắc
        isAutoLiquidated,
        contractFilePath,
        attachmentFiles,
        signingFlows: signFlowsWithPositions,
        parentContractId: undefined,
        contractUserRoles: {
          draftingOfficerUserId: basicInformation?.contractUserRoles.draftingOfficer.userId,
          managerUserId: basicInformation?.contractUserRoles.manager.userId,
          coordinatorUserId: basicInformation?.contractUserRoles.coordinator.userId,
          receivingOfficerUserId: basicInformation?.contractUserRoles.receivingOfficer.userId,
        },
        contractItems: allContractItems,
        contractOtherItems: undefined,
        contractOthersValue: undefined,
        contractGuarantee: isRuleContract
          ? null
          : contractGuarantee.parse(basicInformation?.contractGuarantee),
        paymentSchedules: cleanedPaymentSchedules,
      };

      await contractService.createContract(requestBody);
      toast.success('Gia hạn hợp đồng thành công');
      callback?.();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.title || error?.response?.data?.message;
      const message = errorMessageMap[backendMessage] || backendMessage || 'Lỗi khi gia hạn hợp đồng';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-0 h-full'>

      <Tabs defaultValue='informations' className='w-full flex-1 gap-4 py-6'>
        <div className='px-6'>
          <TabsList className='w-full'>
            <TabsTrigger value='informations' className='flex items-center gap-2'>
              <Info className='size-4' />
              <span className='hidden md:inline'>Thông tin hợp đồng</span>
            </TabsTrigger>
            <TabsTrigger value='flows' className='flex items-center gap-2'>
              <Workflow className='size-4' />
              <span className='hidden md:inline'>Luồng ký duyệt</span>
            </TabsTrigger>
            <TabsTrigger value='documents' className='flex items-center gap-2'>
              <FileText className='size-4' />
              <span className='hidden md:inline'>Tài liệu</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='px-6'>
          {/* ── Tab: Thông tin hợp đồng ── */}
          <TabsContent value='informations' className='mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-0.5'>

            {/* 1. Mẫu hợp đồng */}
            <Section title='Mẫu hợp đồng' icon={FileText}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow label='Định dạng hợp đồng' value={ContractFormat[contractFormat?.contractFormat || 0]?.name} loading={loading} highlight />
              </div>

              {contractFormat?.parentContractId?.trim() && (
                <InfoRow
                  label='Gia hạn từ hợp đồng'
                  value={parentContractLabel || contractFormat.parentContractId.trim()}
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

              {/* isAutoLiquidated: luôn hiển thị cho hợp đồng gia hạn, dựa theo contractFormat */}
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
            </Section>

            {/* 2. Thông tin hợp đồng */}
            <Section title='Thông tin hợp đồng' icon={HashIcon}>
              <div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <InfoRow label='Mã cấp I' value={level1CodeMap.get(basicInformation?.level1CodeId || '')} loading={loading} />
                  <InfoRow label='Mã cấp II' value={basicInformation?.level2Code} loading={loading} />
                  <InfoRow label='Mã cấp III' value={level3CodeMap.get(basicInformation?.level3CodeId || '')} loading={loading} />
                </div>
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow label='Loại hợp đồng' value={contractTypeMap.get(basicInformation?.contractTypeId || '')} loading={loading} />
                <InfoRow
                  label='Hình thức hợp đồng'
                  value={contractStructureMap.get(basicInformation?.contractStructureId || '')}
                  loading={loading}
                />
                <InfoRow label='Tên/nội dung hợp đồng' value={basicInformation?.title} loading={loading} highlight />
                <InfoRow label='Sổ theo dõi hợp đồng' value={contractRegisterMap.get(basicInformation?.contractRegisterId || '')} loading={loading} />
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow label='Phòng ban' value={departmentMap.get(basicInformation?.departmentId || '')} loading={loading} />
                <div className='md:col-span-1'>
                  <InfoRow label='Hình thức lựa chọn nhà thầu/nhà cung cấp' value={procurementMethodMap.get(basicInformation?.procurementMethodId || '')} loading={loading} />
                </div>
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow label='Số ký hiệu hợp đồng' value={basicInformation?.contractNumber} loading={loading} highlight />
                <InfoRow label='Số ký hiệu PLHĐ' value={basicInformation?.appendixNumber} loading={loading} />
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
                        {partner.address && <span className='text-xs text-muted-foreground'><b>Địa chỉ:</b> {partner.address}</span>}
                        {partner.taxCode && <span className='text-xs text-muted-foreground'><b>Mã số thuế:</b> {partner.taxCode}</span>}
                        {partner.contactPerson && <span className='text-xs text-muted-foreground'><b>Người đại diện:</b> {partner.contactPerson}</span>}
                      </div>
                    ) : undefined}
                  />
                );
              })()}
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <InfoRow label='Ngày ký hợp đồng' value={basicInformation?.startDate ? new Date(basicInformation.startDate).toLocaleDateString('vi-VN') : undefined} loading={loading} />
                <InfoRow label='Hiệu lực hết' value={basicInformation?.endDate ? new Date(basicInformation.endDate).toLocaleDateString('vi-VN') : undefined} loading={loading} />
              </div>
            </Section>

            {/* 3. Phân công quản lý */}
            <Section title='Phân công quản lý' icon={Users}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {[
                  { label: 'Cán bộ soạn thảo', userId: basicInformation?.contractUserRoles?.draftingOfficer?.userId },
                  { label: 'Người quản lý', userId: basicInformation?.contractUserRoles?.manager?.userId },
                  { label: 'Người điều phối', userId: basicInformation?.contractUserRoles?.coordinator?.userId },
                  { label: 'Cán bộ tiếp nhận', userId: basicInformation?.contractUserRoles?.receivingOfficer?.userId },
                ].map(({ label, userId }) => {
                  const user = userMap.get(userId || '');
                  return (
                    <div key={label} className='p-4 rounded-lg border bg-white space-y-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-muted-foreground'>{label}</span>
                      </div>
                      {loading ? <Skeleton className='h-10 w-full' /> : (
                        <div className='space-y-1'>
                          <div className='text-sm font-semibold'>{user?.fullname || 'Chưa phân công'}</div>
                          {user && <div className='text-xs text-muted-foreground'>{user.departmentName}{user.positionName ? ` / ${user.positionName}` : ''}</div>}
                        </div>
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
                  <div className='text-sm font-medium text-muted-foreground mb-2'>Tổng giá trị hợp đồng (sau thuế)</div>
                  <div className='text-3xl font-bold text-emerald-600'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getContractFinalValue())}
                  </div>
                </div>
              )}
              {basicInformation?.contractItems && basicInformation.contractItems.length > 0 && (
                <>
                  {!isRuleContract && <Separator />}
                  <div>
                    <div className='text-sm font-medium mb-3'>Danh sách vật tư ({basicInformation.contractItems.length} mục)</div>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                        <div className='col-span-3'>Tên vật tư</div>
                        <div className='col-span-2'>Đơn vị tính</div>
                        <div className='col-span-2 text-right'>Đơn giá</div>
                      </div>
                      {basicInformation.contractItems.map((item, index) => {
                        const material = materialMap.get(item.materialId);
                        return (
                          <div key={index} className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'>
                            <div className='col-span-3 flex flex-col justify-center'>
                              <span className='text-sm font-medium'>{material?.name || 'N/A'}</span>
                              {material?.materialCode && <span className='text-xs text-muted-foreground'>{material.materialCode}</span>}
                            </div>
                            <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                              {material?.unitOfMeasureName || '—'}
                            </div>
                            <div className='col-span-2 flex items-center justify-end text-sm'>{format.number(material?.price || 0)} đ</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </Section>

            {/* 5. Thành phần hợp đồng khác */}
            {((basicInformation?.contractOthersValue && basicInformation.contractOthersValue > 0) ||
              (basicInformation?.contractOtherItems && basicInformation.contractOtherItems.length > 0 && otherMaterials.length > 0)) && (
                <Section title='Thành phần hợp đồng khác' icon={Layers}>
                  {basicInformation?.contractOtherItems && basicInformation.contractOtherItems.length > 0 && otherMaterials.length > 0 ? (
                    <div>
                      <div className='text-sm font-medium mb-3'>Danh sách thành phần hợp đồng khác ({basicInformation.contractOtherItems.length} mục)</div>
                      <div className='space-y-2'>
                        <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                          <div className='col-span-3'>Tên thành phần</div>
                          <div className='col-span-2'>Đơn vị tính</div>
                          <div className='col-span-2 text-right'>Đơn giá</div>
                        </div>
                        {basicInformation.contractOtherItems.map((item, index) => {
                          const otherMaterial = otherMaterials.find((m) => m.id === item.materialId);
                          return (
                            <div key={index} className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'>
                              <div className='col-span-3 flex items-center'><span className='text-sm font-medium'>{otherMaterial?.name || 'N/A'}</span></div>
                              <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                                {otherMaterial?.unitOfMeasureName || '—'}
                              </div>
                              <div className='col-span-2 flex items-center justify-end text-sm'>{format.number(otherMaterial?.price || 0)} đ</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <InfoRow label='Giá trị thành phần khác' value={`${format.number(basicInformation?.contractOthersValue || 0)} đ`} loading={loading} icon={Banknote} />
                  )}
                </Section>
              )}

            {/* 6. Chiết khấu */}
            {basicInformation?.discountValue !== undefined && basicInformation.discountValue > 0 && (
              <Section title='Chiết khấu' icon={FileBadge}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <InfoRow
                    label='Loại chiết khấu'
                    value={basicInformation.discountType === DiscountType.Percent.id ? DiscountType.Percent.name : basicInformation.discountType === DiscountType.Amount.id ? DiscountType.Amount.name : undefined}
                    loading={loading}
                  />
                  <InfoRow
                    label='Giá trị chiết khấu'
                    value={basicInformation.discountType === DiscountType.Percent.id ? `${basicInformation.discountValue}%` : `${format.number(basicInformation.discountValue)} đ`}
                    loading={loading}
                  />
                </div>
              </Section>
            )}

            {/* 7. Lịch thanh toán */}
            {!isRuleContract && basicInformation?.paymentSchedules && (
              <Section title='Lịch thanh toán' icon={CalendarDays}>
                <div className='p-4 rounded-lg bg-blue-500/5 border border-blue-500/20'>
                  <div className='text-xs text-muted-foreground mb-1'>Loại kế hoạch</div>
                  <div className='text-sm font-semibold text-blue-600'>
                    {basicInformation.paymentSchedules.scheduleType === 1 && 'Theo tháng'}
                    {basicInformation.paymentSchedules.scheduleType === 2 && 'Theo quý'}
                    {basicInformation.paymentSchedules.scheduleType === 3 && 'Theo kỳ hạn'}
                    {basicInformation.paymentSchedules.scheduleType === 4 && 'Theo giai đoạn'}
                    {basicInformation.paymentSchedules.scheduleType === 5 && 'Một lần'}
                  </div>
                </div>
                {basicInformation.paymentSchedules.schedules.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className='text-sm font-medium mb-3'>Chi tiết kế hoạch thanh toán</div>
                      <div className='space-y-3'>
                        {basicInformation.paymentSchedules.schedules.map((schedule, index) => (
                          <div key={index} className='p-4 rounded-lg border bg-linear-to-br from-background to-muted/20 hover:border-primary/50 transition-colors'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <span className='flex items-center justify-center size-7 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold'>{index + 1}</span>
                                <span className='text-sm font-medium'>Kỳ {index + 1}</span>
                              </div>
                              {schedule.amount && (
                                <div className='text-right'>
                                  <div className='text-xs text-muted-foreground'>
                                    {schedule.amountType == DiscountType.Percent.id ? `Giá trị: ${schedule.amount}%` : 'Số tiền cố định'}
                                  </div>
                                  <div className='text-base font-bold text-primary'>
                                    {schedule.amountType == DiscountType.Percent.id
                                      ? format.number((schedule.amount / 100) * getContractFinalValue()) + ' đ'
                                      : format.number(schedule.amount) + ' đ'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* 8. Bảo lãnh */}
            {!isRuleContract && basicInformation?.contractGuarantee && (
              <Section title='Bảo lãnh hợp đồng' icon={ShieldCheck}>
                <div className='space-y-4'>
                  {([
                    { key: 'performanceBondGuarantee' as const, colorClass: 'bg-white' },
                    { key: 'warrantyBondGuarantee' as const, colorClass: 'bg-white' },
                    { key: 'depositGuarantee' as const, colorClass: 'bg-white' },
                  ]).map(({ key, colorClass }) => {
                    const guarantee = basicInformation.contractGuarantee?.[key];
                    if (!guarantee?.value) return null;
                    return (
                      <div key={key} className={`p-4 rounded-lg border bg-linear-to-br ${colorClass}`}>
                        <div className='grid grid-cols-2 gap-3'>
                          <InfoRow label='Giá trị' value={guarantee.valueType === 1 ? `${guarantee.value}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(guarantee.value)} highlight />
                          {guarantee.durationDate && <InfoRow label='Thời hạn' value={new Date(guarantee.durationDate).toLocaleDateString('vi-VN')} />}
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

          {/* ── Tab: Luồng ký duyệt ── */}
          <TabsContent value='flows' className='mt-4'>
            <div className='p-6 rounded-lg border bg-card space-y-4'>
              <SectionHeader title='Luồng ký duyệt' description='Thông tin các thành phần tham gia ký hợp đồng' icon={Workflow} />
              <div className='space-y-2'>
                {signFlows?.signers?.map((item, index) => {
                  const user = userMap.get(item.signerId);
                  return (
                    <Item key={item.signerId} variant='muted' className='border-border rounded-none border-s-4 border-s-primary'>
                      <ItemMedia variant='image'>
                        <div className='size-9 aspect-square flex items-center justify-center bg-primary text-primary-foreground rounded-full'>
                          <span className='text-base font-medium'>{index + 1}</span>
                        </div>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{user?.fullname}</ItemTitle>
                        {user && <p className='text-xs text-muted-foreground'>{user.departmentName}{user.positionName ? ` / ${user.positionName}` : ''}</p>}
                      </ItemContent>
                    </Item>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Tài liệu ── */}
          <TabsContent value='documents' className='mt-4'>
            <div className='p-6 rounded-lg border bg-card space-y-4'>
              <SectionHeader title='Xem trước tài liệu' description='Hợp đồng với vị trí chữ ký đã đánh dấu' icon={FileText} />
              {basicInformation?.contractFile && (
                <PdfViewer file={basicInformation.contractFile} signBoxes={signBoxes} onPageChange={setCurrentPage} />
              )}
              {basicInformation?.attachmentFiles && basicInformation.attachmentFiles.length > 0 && (
                <>
                  <Separator className='my-4' />
                  <div>
                    <div className='text-sm font-medium text-muted-foreground mb-2'>Tài liệu đính kèm</div>
                    <div className='space-y-2'>
                      {basicInformation.attachmentFiles.map((file, index) => (
                        <div key={index} className='flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors'>
                          <div className='flex items-center gap-2 flex-1 min-w-0'>
                            <FileTextIcon className='size-4 shrink-0' />
                            <span className='text-sm truncate'>{file.name}</span>
                          </div>
                          <FilePreviewDialog file={file} fileName={file.name} trigger={<Button variant='ghost' size='icon-sm'><EyeIcon className='size-4' /></Button>} />
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
        <Button size='lg' className='px-6' onClick={handleSubmit} disabled={submitting || loading}>
          {submitting ? <Spinner /> : (
            <>
              <RefreshCwIcon className='size-4 mr-2' />
              Gia hạn hợp đồng
            </>
          )}
        </Button>
      </div>
    </div>
  );
}