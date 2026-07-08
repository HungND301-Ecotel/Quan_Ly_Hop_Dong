import { PdfViewer } from '@/components/pdf-viewer';
import { useQueryClient } from '@tanstack/react-query';
import { StepperPrev } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
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
import { contractFieldService } from '@/services/contract-field';
import { ContractField } from '@/services/contract-field/type';
import { departmentService } from '@/services/department';
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
  Info,
  Layers,
  LucideIcon,
  ShieldCheck,
  StickyNote,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FilePreviewDialog } from './FilePreviewDialog';
import z from 'zod';
import { errorMessageMap } from './error-map';
import { BankAccountService } from '@/services/bank-account';
import { BankAccount } from '@/services/bank-account/type';
import { Level1Code } from '@/services/level1code/type';
import { Level2Code } from '@/services/level2code/type';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { level2CodeService } from '@/services/level2code';
import { level3CodeService } from '@/services/level3code';
import { ContractStructureCatalog } from '@/services/structure/type';
import { contractStructureCatalogService } from '@/services/structure';
import { SignatureType } from '@/constants/signature-type';
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
    <div className='flex items-start gap-2 py-1'>
      {Icon && (
        <div className='mt-0.5 text-primary shrink-0'>
          <Icon className='size-4' />
        </div>
      )}

      <div className='grid grid-cols-[180px_1fr] gap-3 flex-1 min-w-0'>
        <dt className='text-sm text-muted-foreground'>{label}</dt>

        {loading ? (
          <Skeleton className='h-4 w-32' />
        ) : (
          <dd
            className={cn(
              'text-sm text-right md:text-left break-words',
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
    <div className='px-4 py-3 rounded-md border bg-white'>
      <SectionHeader title={title} description={description} icon={icon} />

      <div className={cn('mt-3 space-y-2', className)}>{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContractReviewForm() {
  const {
    contractFormat,
    basicInformation,
    signFlows,
    signPositions,
    callback,
    isUpdate,
    contract,
  } = useContractEditContext();

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Hợp đồng phê duyệt: luôn hiển thị checkbox, mặc định true
  const [isAutoLiquidated, setIsAutoLiquidated] = useState(true);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [contractFields, setContractFields] = useState<ContractField[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [procurementMethods, setProcurementMethods] = useState<
    ProcurementMethod[]
  >([]);
  const [contractRegisters, setContractRegisters] = useState<
    ContractRegister[]
  >([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [otherMaterials, setOtherMaterials] = useState<Material[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [linkedContractLabel, setLinkedContractLabel] = useState<string | null>(
    null
  );
  const [level1Codes, setLevel1Codes] = useState<Level1Code[]>([]);
  const [level2Codes, setLevel2Codes] = useState<Level2Code[]>([]);
  const [level3Codes, setLevel3Codes] = useState<Level3Code[]>([]);
  const [contractStructures, setContractStructures] = useState<
    ContractStructureCatalog[]
  >([]);

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

  const contractTypeMap = useMemo(
    () => new Map(contractTypes.map((ct) => [ct.id, ct.name])),
    [contractTypes]
  );
  const contractFieldMap = useMemo(
    () => new Map(contractFields.map((cf) => [cf.id, cf.name])),
    [contractFields]
  );
  const partnerMap = useMemo(
    () => new Map(partners.map((p) => [p.id, p])),
    [partners]
  );
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const procurementMethodMap = useMemo(
    () => new Map(procurementMethods.map((p) => [p.id, p.name])),
    [procurementMethods]
  );
  const contractRegisterMap = useMemo(
    () => new Map(contractRegisters.map((p) => [p.id, p.name])),
    [contractRegisters]
  );
  const materialMap = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials]
  );
  const contractStructureMap = useMemo(
    () => new Map(contractStructures.map((cs) => [cs.id, cs.name])),
    [contractStructures]
  );

  const signBoxes = useMemo(() => {
    if (!signPositions?.postions) return [];
    return signPositions.postions
      .filter((position) => (position.fileIndex ?? 0) === selectedFileIndex) // <-- thêm
      .map((position, index) => {
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
            onRemove={() => {}}
            currentPage={currentPage}
            signatureFile={signatureFile}
          />
        );
      });
  }, [signPositions, users, currentPage, selectedFileIndex]); // <-- thêm selectedFileIndex

  const isRuleContract = [0, 1].includes(contractFormat?.contractFormat || 0);

  useEffect(() => {
    const promises = Promise.all([
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
      level2CodeService.getLevel2CodeList(),
      level3CodeService.getLevel3CodeList(),
      contractStructureCatalogService.getContractStructureCatalogList(),
      contractFieldService.getContractFieldList(),
    ]);

    promises
      .then(
        ([
          contractTypesData,
          partnersData,
          usersData,
          _departmentsData,
          procurementMethodsData,
          contractRegistersData,
          materialsData,
          otherMaterialsData,
          bankAccountsData,
          level1CodesData,
          level2CodesData,
          level3CodesData,
          contractStructuresData,
          contractFieldsData,
        ]) => {
          setContractTypes(contractTypesData || []);
          setPartners(partnersData || []);
          setUsers(usersData || []);
          setProcurementMethods(procurementMethodsData || []);
          setContractRegisters(contractRegistersData || []);
          setMaterials(materialsData || []);
          setOtherMaterials(otherMaterialsData || []);
          setBankAccounts(bankAccountsData || []);
          setLevel1Codes(level1CodesData || []);
          setLevel2Codes(level2CodesData || []);
          setLevel3Codes(level3CodesData || []);
          setContractStructures(contractStructuresData || []);
          setContractFields(contractFieldsData || []);
        }
      )
      .finally(() => {
        setLoading(false);
      });
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
    const { contractValue, discountType, discountValue, vatPercentage } =
      basicInformation;

    const total = contractValue || 0;

    let discount = 0;
    const dValue = discountValue || 0;
    if (discountType == DiscountType.Percent.id) {
      discount = Math.round((total * dValue) / 100);
    } else {
      discount = dValue;
    }

    const beforeTax = total - discount;
    const vatAmount = Math.round((beforeTax * (vatPercentage || 0)) / 100);
    return beforeTax + vatAmount;
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
          const userPositions = signPositions?.postions
            .filter((p) => p.userId === signer.signerId)
            .map((p) => ({
              positionX: p.positionX,
              positionY: p.positionY,
              pageNumber: p.pageNumber,
              width: p.width,
              height: p.height,
              fileIndex: p.fileIndex ?? 0,
            }));

          const firstPosition = userPositions?.[0];

          signFlowsWithPositions.push({
            userId: signer.signerId,
            sequenceOrder: index + 1,
            signatureType: Number(signer.signTypeId),
            positionX: firstPosition?.positionX,
            positionY: firstPosition?.positionY,
            pageNumber: firstPosition?.pageNumber,
            width: firstPosition?.width,
            height: firstPosition?.height,
            signPositions: userPositions && userPositions.length > 0 ? JSON.stringify(userPositions) : undefined,
          });
        });
      }

      const allContractItems = [
        ...(basicInformation?.contractItems || []),
        ...(basicInformation?.contractOtherItems || []),
      ];
      const { paymentSchedules, ...basicInformationWithoutSchedules } =
        basicInformation!;

      const cleanedPaymentSchedules = (() => {
        if (!paymentSchedules || paymentSchedules.schedules.length === 0)
          return undefined;
        const firstSchedule = paymentSchedules.schedules[0];

        const daysVal = firstSchedule.days;
        const finalDays =
          daysVal === undefined ||
          daysVal === null ||
          (daysVal as unknown) === ''
            ? 30
            : Number(daysVal);

        return {
          schedules: [
            {
              amountType: 0,
              amount: 0,
              days: finalDays,
            },
          ],
        };
      })();

      const isEconomic = [2, 3].includes(contractFormat?.contractFormat ?? -1);
      const linkedContractId = contractFormat?.linkedContractId?.trim() || null;

      const childRelationships =
        isEconomic && linkedContractId
          ? [{ childContractId: linkedContractId, relationType: 0 }]
          : null;

      const isRuleContract = [0, 1].includes(
        contractFormat?.contractFormat ?? -1
      );

      const roleIds = (roles?: { userId?: string }[]) =>
        (roles ?? []).map((x) => x.userId).filter(Boolean);

      const requestBody = {
        ...contractFormat,
        ...basicInformationWithoutSchedules,
        contractFieldId: basicInformation?.contractFieldId || null,
        isDebtTrackingEnabled: true,
        // Hợp đồng phê duyệt: truyền giá trị user chọn
        isAutoLiquidated,
        parentRelationship: null,
        childRelationships,
        contractFilePath,
        attachmentFiles,
        signingFlows: signFlowsWithPositions,
        parentContractId: undefined,
        contractUserRoles: {
          draftingOfficerUserIds: roleIds(
            basicInformation?.contractUserRoles?.draftingOfficer
          ),
          managerUserIds: roleIds(basicInformation?.contractUserRoles?.manager),
          coordinatorUserIds: roleIds(
            basicInformation?.contractUserRoles?.coordinator
          ),
          receivingOfficerUserIds: roleIds(
            basicInformation?.contractUserRoles?.receivingOfficer
          ),
        },
        contractItems: allContractItems,
        contractOtherItems: undefined,
        contractOthersValue: undefined,
        contractGuarantee: isRuleContract
          ? null
          : contractGuarantee.parse(basicInformation?.contractGuarantee),
        paymentSchedules: cleanedPaymentSchedules,
      };

      if (isUpdate && contract) {
        await contractService.updateContract(contract.id, requestBody);
        toast.success('Sửa hợp đồng thành công');
      } else {
        await contractService.createContract(requestBody);
        toast.success('Tạo hợp đồng thành công');
      }

      queryClient.invalidateQueries({ queryKey: ['data-table'] });
      callback?.();
    } catch (error: any) {
      console.log(error);
      const backendMessage =
        error?.response?.data?.title || error?.response?.data?.message;
      const message =
        errorMessageMap[backendMessage] ||
        backendMessage ||
        'Lỗi khi tạo hợp đồng';
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
            <TabsTrigger
              value='informations'
              className='flex items-center gap-2'
            >
              <Info className='size-4' />
              <span className='hidden md:inline'>Thông tin hợp đồng</span>
            </TabsTrigger>
            <TabsTrigger value='flows' className='flex items-center gap-2'>
              <Workflow className='size-4' />
              <span className='hidden md:inline'>Thành phần ký duyệt</span>
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
            className='mt-3 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-0.5'
          >
            <Section title='Thông tin hợp đồng' icon={FileText}>
              <div className='rounded-md border overflow-hidden'>
                <table className='w-full border-collapse text-sm'>
                  <tbody>
                    {/* ── Mẫu hợp đồng ── */}
                    <tr>
                      <td
                        colSpan={4}
                        className='border-b bg-muted/50 px-3 py-2 text-sm font-medium uppercase tracking-wide text-blue-600'
                      >
                        Mẫu hợp đồng
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Định dạng hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          ContractFormat[contractFormat?.contractFormat || 0]
                            ?.name
                        )}
                      </td>
                      {!isRuleContract && (
                        <>
                          <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                            HĐ nguyên tắc liên kết
                          </td>
                          <td className='px-3 py-2 text-sm font-medium border-b'>
                            {loading ? (
                              <Skeleton className='h-4 w-28' />
                            ) : (
                              linkedContractLabel ||
                              contractFormat?.linkedContractId?.trim() ||
                              'Hợp đồng kinh tế độc lập'
                            )}
                          </td>
                        </>
                      )}
                      {isRuleContract && (
                        <td colSpan={2} className='border-b' />
                      )}
                    </tr>
                    <tr>
                      <td colSpan={4} className='px-3 py-2 border-b'>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            id='archive-auto-liquidated'
                            checked={isAutoLiquidated}
                            onCheckedChange={(checked) =>
                              setIsAutoLiquidated(checked === true)
                            }
                          />
                          <Label
                            htmlFor='archive-auto-liquidated'
                            className='text-sm font-medium cursor-pointer'
                          >
                            Tự động thanh lý hợp đồng
                          </Label>
                        </div>
                      </td>
                    </tr>

                    {/* ── Thông tin hợp đồng ── */}
                    <tr>
                      <td
                        colSpan={4}
                        className='border-b bg-muted/50 px-3 py-2 text-sm font-medium uppercase tracking-wide text-blue-600'
                      >
                        Thông tin hợp đồng
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Mã cấp I
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-20' />
                        ) : (
                          level1CodeMap.get(
                            basicInformation?.level1CodeId || ''
                          )
                        )}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Mã cấp II
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-20' />
                        ) : (
                          level2CodeMap.get(
                            basicInformation?.level2CodeId || ''
                          )
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Mã cấp III
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-20' />
                        ) : (
                          level3CodeMap.get(
                            basicInformation?.level3CodeId || ''
                          )
                        )}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Sổ theo dõi HĐ
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-20' />
                        ) : (
                          contractRegisterMap.get(
                            basicInformation?.contractRegisterId || ''
                          )
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Loại hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          contractTypeMap.get(
                            basicInformation?.contractTypeId || ''
                          )
                        )}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Lĩnh vực hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          contractFieldMap.get(
                            basicInformation?.contractFieldId || ''
                          )
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Hình thức hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          contractStructureMap.get(
                            basicInformation?.contractStructureId || ''
                          )
                        )}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Hình thức lựa chọn nhà thầu
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          procurementMethodMap.get(
                            basicInformation?.procurementMethodId || ''
                          )
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Tên/nội dung hợp đồng
                      </td>
                      <td
                        colSpan={3}
                        className='px-3 py-2 text-sm font-medium border-b'
                      >
                        {loading ? (
                          <Skeleton className='h-4 w-full' />
                        ) : (
                          basicInformation?.title
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Số ký hiệu hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          basicInformation?.contractNumber
                        )}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Số ký hiệu PLHĐ
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-28' />
                        ) : (
                          basicInformation?.appendixNumber
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Ngày ký hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-24' />
                        ) : basicInformation?.signingDate ? (
                          new Date(
                            basicInformation.signingDate
                          ).toLocaleDateString('vi-VN')
                        ) : undefined}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Ngày hợp đồng có hiệu lực
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-24' />
                        ) : basicInformation?.effectiveDate ? (
                          new Date(
                            basicInformation.effectiveDate
                          ).toLocaleDateString('vi-VN')
                        ) : undefined}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Ngày hoàn thành hợp đồng
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-24' />
                        ) : basicInformation?.completionDate ? (
                          new Date(
                            basicInformation.completionDate
                          ).toLocaleDateString('vi-VN')
                        ) : undefined}
                      </td>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                        Ngày hết hạn bảo hành
                      </td>
                      <td className='px-3 py-2 text-sm font-medium border-b'>
                        {loading ? (
                          <Skeleton className='h-4 w-24' />
                        ) : basicInformation?.warrantyExpirationDate ? (
                          new Date(
                            basicInformation.warrantyExpirationDate
                          ).toLocaleDateString('vi-VN')
                        ) : undefined}
                      </td>
                    </tr>

                    {/* ── Đối tác / Khách hàng ── */}
                    <tr>
                      <td
                        colSpan={4}
                        className='border-b bg-muted/50 px-3 py-2 text-sm font-medium uppercase tracking-wide text-blue-600'
                      >
                        Đối tác / Khách hàng
                      </td>
                    </tr>
                    {(() => {
                      const partner = partnerMap.get(
                        basicInformation?.partnerId || ''
                      );
                      return loading ? (
                        <tr>
                          <td colSpan={4} className='px-3 py-3 border-b'>
                            <Skeleton className='h-12 w-full' />
                          </td>
                        </tr>
                      ) : partner ? (
                        <>
                          <tr>
                            <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                              Tên đối tác
                            </td>
                            <td className='px-3 py-2 text-sm font-medium border-b'>
                              {partner.name}
                            </td>
                            <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                              Mã số thuế
                            </td>
                            <td className='px-3 py-2 text-sm font-medium border-b'>
                              {partner.taxCode}
                            </td>
                          </tr>
                          {partner.address && (
                            <tr>
                              <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                                Địa chỉ
                              </td>
                              <td
                                colSpan={3}
                                className='px-3 py-2 text-sm border-b font-medium'
                              >
                                {partner.address}
                              </td>
                            </tr>
                          )}
                          {partner.contactPerson && (
                            <tr>
                              <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-[1%]'>
                                Người đại diện
                              </td>
                              <td
                                colSpan={3}
                                className='px-3 py-2 text-sm border-b font-medium'
                              >
                                {partner.contactPerson}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className='px-3 py-2 text-sm text-muted-foreground border-b'
                          >
                            —
                          </td>
                        </tr>
                      );
                    })()}

                    {/* ── Phân công quản lý ── */}
                    <tr>
                      <td
                        colSpan={4}
                        className='border-b bg-muted/50 px-3 py-2 text-sm font-medium uppercase tracking-wide text-blue-600'
                      >
                        Phân công quản lý
                      </td>
                    </tr>
                    {[
                      {
                        label: 'Cán bộ soạn thảo',
                        userRoles:
                          basicInformation?.contractUserRoles?.draftingOfficer,
                      },
                      {
                        label: 'Người quản lý',
                        userRoles: basicInformation?.contractUserRoles?.manager,
                      },
                      {
                        label: 'Người điều phối',
                        userRoles:
                          basicInformation?.contractUserRoles?.coordinator,
                      },
                      {
                        label: 'Cán bộ tiếp nhận',
                        userRoles:
                          basicInformation?.contractUserRoles?.receivingOfficer,
                      },
                    ].reduce<React.ReactNode[]>((rows, item, i, arr) => {
                      if (i % 2 === 0) {
                        const next = arr[i + 1];
                        const renderCell = ({
                          label,
                          userRoles,
                        }: {
                          label: string;
                          userRoles?: { userId: string }[];
                        }) => {
                          const assigned = (userRoles || []).filter(
                            (u: any) => u.userId
                          );
                          return (
                            <>
                              <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap align-top border-b w-[1%]'>
                                {label}
                              </td>
                              <td className='px-3 py-2 align-top border-b'>
                                {loading ? (
                                  <Skeleton className='h-8 w-36' />
                                ) : assigned.length > 0 ? (
                                  <div className='flex flex-col gap-1.5'>
                                    {assigned.map(
                                      (roleUser: any, idx: number) => {
                                        const user = userMap.get(
                                          roleUser.userId || ''
                                        );
                                        return (
                                          <div
                                            key={idx}
                                            className={
                                              idx > 0 ? 'border-t pt-1' : ''
                                            }
                                          >
                                            <div className='text-sm font-medium'>
                                              {user?.fullname || 'Chưa rõ'}
                                            </div>
                                            {user && (
                                              <div className='text-[11px] text-muted-foreground'>
                                                {user.departmentName}
                                                {user.positionName
                                                  ? ` / ${user.positionName}`
                                                  : ''}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <span className='text-sm text-muted-foreground italic'>
                                    Chưa phân công
                                  </span>
                                )}
                              </td>
                            </>
                          );
                        };
                        rows.push(
                          <tr>
                            {renderCell(item)}
                            {next ? (
                              renderCell(next)
                            ) : (
                              <td colSpan={2} className='border-b' />
                            )}
                          </tr>
                        );
                      }
                      return rows;
                    }, [])}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 4. Thông tin tài chính */}
            <Section title='Thông tin tài chính' icon={DollarSignIcon}>
              {!isRuleContract && (
                <div className='p-4 rounded-md bg-white from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20'>
                  <div className='text-sm font-medium text-muted-foreground mb-2'>
                    Tổng giá trị hợp đồng (sau thuế)
                  </div>
                  <div className='text-2xl font-bold text-emerald-600'>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(getContractFinalValue())}
                  </div>
                </div>
              )}

              {basicInformation?.contractItems &&
                basicInformation.contractItems.length > 0 && (
                  <>
                    {!isRuleContract && <Separator className='my-2' />}
                    <div>
                      <div className='text-sm font-medium mb-3'>
                        Danh sách vật tư (
                        {basicInformation.contractItems.length} mục)
                      </div>
                      <div className='space-y-2'>
                        <div className='grid grid-cols-12 gap-4 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground'>
                          <div className='col-span-4'>Tên vật tư</div>
                          <div className='col-span-2'>Đơn vị tính</div>
                          <div className='col-span-1 text-right'>SL</div>
                          {!isRuleContract && (
                            <>
                              <div className='col-span-2 text-right'>
                                Đơn giá
                              </div>
                              <div className='col-span-3 text-right'>
                                Thành tiền
                              </div>
                            </>
                          )}
                        </div>
                        {basicInformation.contractItems.map((item, index) => {
                          const material = materialMap.get(item.materialId);
                          const total =
                            (item.quantity || 0) * (material?.price || 0);
                          return (
                            <div
                              key={index}
                              className='grid grid-cols-12 gap-4 px-3 py-2 rounded-lg border hover:border-primary/50 hover:bg-white transition-colors'
                            >
                              <div className='col-span-4 flex flex-col justify-center'>
                                <span className='text-sm font-medium'>
                                  {material?.name || 'N/A'}
                                </span>
                                {material?.materialCode && (
                                  <span className='text-xs text-muted-foreground'>
                                    {material.materialCode}
                                  </span>
                                )}
                              </div>
                              <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                                {material?.unitOfMeasureName || '—'}
                              </div>
                              <div className='col-span-1 flex items-center justify-end text-sm'>
                                {format.number(item.quantity || 0)}
                              </div>
                              {!isRuleContract && (
                                <>
                                  <div className='col-span-2 flex items-center justify-end text-sm'>
                                    {format.number(material?.price || 0)} đ
                                  </div>
                                  <div className='col-span-3 flex items-center justify-end text-sm font-semibold text-primary'>
                                    {format.number(total)} đ
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
            </Section>

            {/* 5. dịch vụ khác */}
            {((basicInformation?.contractOthersValue &&
              basicInformation.contractOthersValue > 0) ||
              (basicInformation?.contractOtherItems &&
                basicInformation.contractOtherItems.length > 0 &&
                otherMaterials.length > 0)) && (
              <Section title='Dịch vụ khác' icon={Layers}>
                {basicInformation?.contractOtherItems &&
                basicInformation.contractOtherItems.length > 0 &&
                otherMaterials.length > 0 ? (
                  <div>
                    <div className='text-sm font-medium mb-3'>
                      Danh sách dịch vụ khác (
                      {basicInformation.contractOtherItems.length} mục)
                    </div>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                        <div className='col-span-5'>Tên dịch vụ khác</div>

                        {!isRuleContract && (
                          <div className='col-span-3 text-right'>
                            Thành tiền
                          </div>
                        )}
                      </div>
                      {basicInformation.contractOtherItems.map(
                        (item, index) => {
                          const otherMaterial = otherMaterials.find(
                            (m) => m.id === item.materialId
                          );

                          return (
                            <div
                              key={index}
                              className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-white transition-colors'
                            >
                              <div className='col-span-5 flex items-center'>
                                <span className='text-sm font-medium'>
                                  {otherMaterial?.name || 'N/A'}
                                </span>
                              </div>
                              {!isRuleContract && (
                                <div className='col-span-3 flex items-center justify-end text-sm font-semibold text-primary'>
                                  {format.number(item.price || 0)} đ
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
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
                        basicInformation.discountType ===
                        DiscountType.Percent.id
                          ? DiscountType.Percent.name
                          : basicInformation.discountType ===
                              DiscountType.Amount.id
                            ? DiscountType.Amount.name
                            : undefined
                      }
                      loading={loading}
                    />
                    <InfoRow
                      label='Giá trị chiết khấu'
                      value={
                        basicInformation.discountType ===
                        DiscountType.Percent.id
                          ? `${basicInformation.discountValue}%`
                          : `${format.number(basicInformation.discountValue)} đ`
                      }
                      loading={loading}
                    />
                  </div>
                </Section>
              )}

            {/* 7. Lịch thanh toán */}
            {!isRuleContract &&
              basicInformation?.paymentSchedules &&
              basicInformation.paymentSchedules.schedules.length > 0 && (
                <Section title='Lịch thanh toán' icon={CalendarDays}>
                  <div className='p-4 rounded-lg border bg-white shadow-sm hover:border-primary/50 transition-colors'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-slate-800'>
                        {`Thanh toán sau ${basicInformation.paymentSchedules.schedules[0].days} ngày kể từ ngày có biên bản nghiệm thu chất lượng hàng hoá từng đợt (hoặc biên bản kiểm nhập) và bên B cung cấp đầy đủ các chứng từ thanh toán, hoá đơn GTGT theo quy định, giấy đề nghị thanh toán.`}
                      </span>
                    </div>
                  </div>
                </Section>
              )}

            {/* 8. Bảo lãnh */}
            {!isRuleContract && basicInformation?.contractGuarantee && (
              <Section title='Bảo lãnh hợp đồng' icon={ShieldCheck}>
                <div className='space-y-4'>
                  {[
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
                  ].map(({ key, colorClass }) => {
                    const guarantee = basicInformation.contractGuarantee?.[key];
                    if (!guarantee?.value) return null;
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-md border bg-white ${colorClass}`}
                      >
                        <div className='grid grid-cols-2 gap-3'>
                          <InfoRow
                            label='Giá trị'
                            value={
                              guarantee.valueType === 1
                                ? `${guarantee.value}%`
                                : new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(guarantee.value)
                            }
                            highlight
                          />
                          {guarantee.durationDate && (
                            <InfoRow
                              label='Thời hạn'
                              value={new Date(
                                guarantee.durationDate
                              ).toLocaleDateString('vi-VN')}
                            />
                          )}
                          {guarantee.bankAccountId &&
                            (() => {
                              const bank = bankAccounts.find(
                                (b) => b.id === guarantee.bankAccountId
                              );
                              if (!bank) return null;
                              return (
                                <>
                                  <InfoRow
                                    label='Ngân hàng'
                                    value={bank.bankName}
                                  />
                                  <InfoRow
                                    label='Số tài khoản'
                                    value={bank.accountNumber}
                                  />
                                  <div className='col-span-2'>
                                    <InfoRow
                                      label='Chủ tài khoản'
                                      value={bank.accountHolder}
                                    />
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
                <p className='text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed p-3 rounded-lg bg-white'>
                  {basicInformation.notes}
                </p>
              </Section>
            )}
          </TabsContent>

          {/* ── Tab: Thành phần ký duyệt ── */}
          <TabsContent value='flows' className='mt-4'>
            <div className='p-6 rounded-lg border bg-card space-y-4'>
              <SectionHeader
                title='Thành phần ký duyệt'
                description='Thông tin các thành phần tham gia ký hợp đồng'
                icon={Workflow}
              />
              <div className='space-y-2'>
                {signFlows?.signers?.map((item, index) => {
                  const user = userMap.get(item.signerId);
                  return (
                    <Item
                      key={item.signerId}
                      variant={'muted'}
                      className='border-border rounded-none border-s-4 border-s-primary'
                    >
                      <ItemMedia variant={'image'}>
                        <div className='size-9 aspect-square flex items-center justify-center bg-primary text-primary-foreground rounded-full'>
                          <span className='text-base font-medium'>
                            {index + 1}
                          </span>
                        </div>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{user?.fullname}</ItemTitle>
                        {user && (
                          <>
                            <p className='text-xs text-muted-foreground'>
                              {user.departmentName}
                              {user.positionName
                                ? ` / ${user.positionName}`
                                : ''}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Loại chữ ký:{' '}
                              {SignatureType[Number(item.signTypeId)] ??
                                'Không xác định'}
                            </p>
                          </>
                        )}
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
              <SectionHeader
                title='Xem trước tài liệu'
                description='Hợp đồng với vị trí chữ ký đã đánh dấu'
                icon={FileText}
              />
              {Array.isArray(basicInformation?.contractFile) &&
                basicInformation.contractFile.length > 1 && (
                  <Tabs
                    value={String(selectedFileIndex)}
                    onValueChange={(val) => {
                      setSelectedFileIndex(Number(val));
                      setCurrentPage(1);
                    }}
                    className='w-full'
                  >
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
                  signBoxes={signBoxes}
                  onPageChange={setCurrentPage}
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
                              <span className='text-sm truncate'>
                                {file.name}
                              </span>
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
          disabled={submitting || loading}
        >
          {submitting ? <Spinner /> : 'Hoàn thành'}
        </Button>
      </div>
    </div>
  );
}
