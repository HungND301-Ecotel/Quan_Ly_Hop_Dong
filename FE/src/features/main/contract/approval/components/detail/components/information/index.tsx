import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractFormat } from '@/constants/contract-format';
import { ContractRole } from '@/constants/contract-role';
import { DiscountType } from '@/constants/discount-type';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Contract } from '@/services/contract/type';
import {
  CalendarDays,
  DollarSignIcon,
  FileBadge,
  FileText,
  Layers,
  LucideIcon,
  ShieldCheck,
  StickyNote,
} from 'lucide-react';

export type ContractInformationProps = {
  information?: Contract;
  loading?: boolean;
};

function InfoRow({
  label,
  value,
  highlight = false,
  loading = false,
}: {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div className='min-w-0'>
      <dt className='text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-none'>
        {label}
      </dt>
      {loading ? (
        <Skeleton className='h-4 w-3/4 rounded bg-muted-foreground/20 mt-1' />
      ) : (
        <dd
          className={`text-[13px] mt-1 leading-snug wrap-break-words ${highlight ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}
        >
          {value || <span className='text-muted-foreground/40'>—</span>}
        </dd>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className='flex items-center gap-2 mb-3'>
      <div className='w-0.5 h-3.5 rounded-full bg-primary shrink-0' />
      <div>
        <h3 className='text-[11px] font-semibold text-primary uppercase tracking-widest'>
          {title}
        </h3>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>
    </div>
  );
}

const Section = ({
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
}) => (
  <div className='py-4'>
    <SectionHeader title={title} description={description} icon={icon} />
    <div className={cn('space-y-3', className)}>{children}</div>
  </div>
);

export function ContractInformation({
  information,
  loading,
}: ContractInformationProps) {
  const getContractFinalValue = () => {
    const total = information?.contractValue || 0;

    let discount = 0;
    const discountVal = information?.discountValue || 0;
    if (information?.discountType == DiscountType.Percent.id) {
      discount = (total / 100) * discountVal;
    } else {
      discount = discountVal;
    }

    return total - discount;
  };

  const getContractAfterTax = () => {
    return information?.contractValueAfterVat || 0;
  };

  const isRuleContract = [0, 1].includes(information?.contractFormat || 0);

  return (
    <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
      {/* ── Thông tin hợp đồng (Section 1 + 2 gộp chung table) ── */}
      <Section title='Thông tin hợp đồng' icon={FileText}>
        <div className='rounded-md border overflow-hidden'>
          <table className='w-full border-collapse text-sm table-auto'>
            <tbody>
              {/* ── Mẫu hợp đồng ── */}
              <tr>
                <td
                  colSpan={4}
                  className='bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b'
                >
                  Mẫu hợp đồng
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Định dạng hợp đồng
                </td>
                <td className='px-3 py-2 text-sm font-medium text-primary border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    ContractFormat[information?.contractFormat || 0]?.name
                  )}
                </td>
                {information?.parentContractId ? (
                  <>
                    <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                      Gia hạn từ hợp đồng
                    </td>
                    <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                      {loading ? (
                        <Skeleton className='h-4 w-28' />
                      ) : (
                        information.parentContractNumber
                      )}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className='border-b' />
                )}
              </tr>

              {[2, 3].includes(information?.contractFormat || 0) && (
                <tr>
                  <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                    Theo dõi công nợ
                  </td>
                  <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                    {loading ? (
                      <Skeleton className='h-4 w-16' />
                    ) : information?.isDebtTrackingEnabled ? (
                      'Có'
                    ) : (
                      'Không'
                    )}
                  </td>
                  <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                    HĐ nguyên tắc liên kết
                  </td>
                  <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                    {loading ? (
                      <Skeleton className='h-4 w-28' />
                    ) : information?.childContractRelationships?.length ? (
                      information.childContractRelationships
                        .map((c) => c.childContractNumber)
                        .join(', ')
                    ) : (
                      'Hợp đồng kinh tế độc lập'
                    )}
                  </td>
                </tr>
              )}

              {/* ── Thông tin hợp đồng ── */}
              <tr>
                <td
                  colSpan={4}
                  className='bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b'
                >
                  Thông tin hợp đồng
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Mã cấp I
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : (
                    information?.level1CodeCode
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Mã cấp II
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : (
                    information?.level2Code
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Mã cấp III
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : (
                    information?.level3Code
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Lĩnh vực hợp đồng
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    information?.contractFieldName
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Loại hợp đồng
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    information?.contractTypeName
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Hình thức hợp đồng
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    information?.contractStructureName
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Tên/nội dung hợp đồng
                </td>
                <td
                  colSpan={3}
                  className='px-3 py-2 text-sm font-medium text-primary border-b w-1/4'
                >
                  {loading ? (
                    <Skeleton className='h-4 w-full' />
                  ) : (
                    information?.title
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Số ký hiệu HĐ
                </td>
                <td className='px-3 py-2 text-sm font-medium text-primary border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    information?.contractNumber
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Số ký hiệu PLHĐ
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-28' />
                  ) : (
                    information?.appendixNumber
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Ngày ký HĐ
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    format.date(information?.signingDate || '')
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Ngày hiệu lực
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    format.date(information?.effectiveDate || '')
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Ngày hoàn thành HĐ
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    format.date(information?.completionDate || '')
                  )}
                </td>
                <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                  Ngày hết hạn bảo hành
                </td>
                <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                  {loading ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    format.date(information?.warrantyExpirationDate || '')
                  )}
                </td>
              </tr>

              {/* ── Đối tác / Khách hàng ── */}
              <tr>
                <td
                  colSpan={4}
                  className='bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b'
                >
                  Đối tác / Khách hàng
                </td>
              </tr>
              {loading ? (
                <tr>
                  <td colSpan={4} className='px-3 py-3 border-b'>
                    <Skeleton className='h-12 w-full' />
                  </td>
                </tr>
              ) : information?.partnerName ? (
                <>
                  <tr>
                    <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                      Tên đối tác
                    </td>
                    <td className='px-3 py-2 text-sm font-semibold border-b w-1/4'>
                      {information.partnerName}
                    </td>
                    <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                      Mã số thuế
                    </td>
                    <td className='px-3 py-2 text-sm font-medium border-b w-1/4'>
                      {information?.partnerDetail?.taxCode}
                    </td>
                  </tr>
                  {information?.partnerDetail?.address && (
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                        Địa chỉ
                      </td>
                      <td colSpan={3} className='px-3 py-2 text-sm border-b'>
                        {information.partnerDetail.address}
                      </td>
                    </tr>
                  )}
                  {information?.partnerDetail?.contactPerson && (
                    <tr>
                      <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                        Người đại diện
                      </td>
                      <td colSpan={3} className='px-3 py-2 text-sm border-b'>
                        {information.partnerDetail.contactPerson}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap border-b w-px'>
                      Hình thức lựa chọn nhà thầu
                    </td>
                    <td
                      colSpan={3}
                      className='px-3 py-2 text-sm font-medium border-b'
                    >
                      {information?.procurementMethodName}
                    </td>
                  </tr>
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
              )}

              {/* ── Phân công quản lý ── */}
              <tr>
                <td
                  colSpan={4}
                  className='bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b'
                >
                  Phân công quản lý
                </td>
              </tr>
              {Object.values(ContractRole).reduce<React.ReactNode[]>(
                (rows, roleDef, i, arr) => {
                  if (i % 2 === 0) {
                    const next = arr[i + 1];
                    const renderCell = (rd: typeof roleDef) => {
                      const roleData = information?.contractUserRoles?.find(
                        (r) => r.role === rd.id
                      );
                      return (
                        <>
                          <td className='px-3 py-2 text-xs text-muted-foreground whitespace-nowrap align-top border-b w-[1%]'>
                            {rd.name}
                          </td>
                          <td className='px-3 py-2 align-top border-b'>
                            {loading ? (
                              <Skeleton className='h-8 w-36' />
                            ) : roleData ? (
                              <div>
                                <div className='text-sm font-medium'>
                                  {roleData.fullname}
                                </div>
                                <div className='text-[11px] text-muted-foreground'>
                                  {roleData.departmentName}
                                  {roleData.positionName
                                    ? ` / ${roleData.positionName}`
                                    : ''}
                                </div>
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
                      <tr key={roleDef.id}>
                        {renderCell(roleDef)}
                        {next ? (
                          renderCell(next)
                        ) : (
                          <td colSpan={2} className='border-b' />
                        )}
                      </tr>
                    );
                  }
                  return rows;
                },
                []
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Thông tin tài chính ── */}
      <Section title='Thông tin tài chính' icon={DollarSignIcon}>
        {[2, 3].includes(information?.contractFormat || 0) && (
          <div className='p-4 rounded-md border border-emerald-500/20'>
            <div className='text-sm font-medium text-muted-foreground mb-2'>
              Tổng giá trị hợp đồng (sau thuế)
            </div>
            <div className='text-2xl font-bold text-emerald-600'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(getContractAfterTax())}
            </div>
          </div>
        )}

        {information?.contractItems && information.contractItems.length > 0 && (
          <>
            {[2, 3].includes(information?.contractFormat || 0) && (
              <Separator className='my-2' />
            )}
            <div>
              <div className='text-sm font-medium mb-3'>
                Danh sách vật tư ({information.contractItems.length} mục)
              </div>
              <div className='space-y-2'>
                <div className='grid grid-cols-12 gap-4 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground'>
                  <div className='col-span-8'>Tên vật tư</div>
                  <div className='col-span-2'>Đơn vị tính</div>
                  {!isRuleContract && (
                    <div className='col-span-2 text-right'>Số lượng</div>
                  )}
                </div>
                {information.contractItems.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className='grid grid-cols-12 gap-4 px-3 py-2 rounded-lg border hover:border-primary/50 hover:bg-white transition-colors'
                    >
                      <div className='col-span-8 flex flex-col justify-center'>
                        <span className='text-sm font-medium'>
                          {item.materialName}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {item.materialCode}
                        </span>
                      </div>
                      <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                        {item?.unitOfMeasureName || '—'}
                      </div>
                      {!isRuleContract && (
                        <div className='col-span-2 flex items-center justify-end text-sm font-medium'>
                          {item.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Section>

      {/* ── Dịch vụ khác ── */}
      {(information?.contractOthersValue ||
        (information?.contractOtherItems &&
          information.contractOtherItems.length > 0)) && (
          <Section title='Dịch vụ khác' icon={Layers}>
            {information.contractOtherItems &&
              information.contractOtherItems.length > 0 ? (
              <div>
                <div className='text-sm font-medium mb-3'>
                  Danh sách dịch vụ khác ({information.contractOtherItems.length}{' '}
                  mục)
                </div>
                <div className='space-y-2'>
                  <div className='grid grid-cols-12 gap-4 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground'>
                    <div className='col-span-9'>Tên dịch vụ khác</div>
                    <div className='col-span-3'>Đơn vị tính</div>
                  </div>
                  {information.contractOtherItems.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className='grid grid-cols-12 gap-4 px-3 py-2 rounded-lg border hover:border-primary/50 hover:bg-white transition-colors'
                      >
                        <div className='col-span-9 flex items-center'>
                          <span className='text-sm font-medium'>
                            {item.materialName || 'N/A'}
                          </span>
                        </div>
                        <div className='col-span-3 flex items-center text-sm text-muted-foreground'>
                          {item?.unitOfMeasureName || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <InfoRow
                label='Giá trị thành phần khác'
                value={`${format.number(information.contractOthersValue || 0)} đ`}
                loading={loading}
              />
            )}
          </Section>
        )}

      {/* ── Chiết khấu ── */}
      {information?.discountValue !== undefined &&
        information.discountValue > 0 && (
          <Section title='Chiết khấu' icon={FileBadge}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <InfoRow
                label='Loại chiết khấu'
                value={
                  Object.values(DiscountType).find(
                    (t) => t.id === information.discountType
                  )?.name
                }
                loading={loading}
              />
              <InfoRow
                label='Giá trị chiết khấu'
                value={
                  information.discountType === DiscountType.Percent.id
                    ? `${information.discountValue}%`
                    : `${format.number(information.discountValue)} đ`
                }
                loading={loading}
              />
            </div>
          </Section>
        )}

      {/* 7. Lịch thanh toán */}
      {!isRuleContract && (
        <Section title='Lịch thanh toán' icon={CalendarDays}>
          {information?.paymentSchedules &&
            information.paymentSchedules.length > 0 && (
              <div>
                <div className='text-sm font-medium mb-3'>
                  Chi tiết kế hoạch thanh toán
                </div>
                <div className='space-y-3'>
                  {information.paymentSchedules.map((item, index) => {
                    // Tính số tiền: nếu là % thì nhân với giá trị hợp đồng
                    const displayAmount =
                      item.amountType === DiscountType.Percent.id
                        ? (item.amount / 100) * getContractFinalValue()
                        : item.amount || 0;

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
                              <span className='text-xs text-muted-foreground'>Số ngày thanh toán/đối chiếu: {item.days} ngày</span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='text-xs text-muted-foreground'>
                              {item.amountType === DiscountType.Percent.id
                                ? `Giá trị: ${item.amount}%`
                                : 'Số tiền cố định'}
                            </div>
                            <div className='text-base font-bold text-primary'>
                              {format.number(displayAmount)} đ
                            </div>
                          </div>
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
      {!isRuleContract && information?.contractGuarantee && information.contractGuarantee.length > 0 && (
        <Section title='Bảo lãnh hợp đồng' icon={ShieldCheck}>
          <div className='space-y-4'>
            {information.contractGuarantee.map((guarantee) => {
              if (!guarantee?.value) return null;

              const guaranteeTypeMap: Record<number, { label: string; colorClass: string; iconColor: string }> = {
                1: {
                  label: 'Bảo lãnh thực hiện hợp đồng',
                  colorClass: 'bg-white',
                  iconColor: 'text-amber-600',
                },
                2: {
                  label: 'Bảo lãnh bảo hành',
                  colorClass: 'bg-white',
                  iconColor: 'text-green-600',
                },
                3: {
                  label: 'Bảo lãnh đặt cọc',
                  colorClass: 'bg-white',
                  iconColor: 'text-blue-600',
                },
              };

              const { colorClass } = guaranteeTypeMap[guarantee.guaranteeType] ?? {
                label: 'Bảo lãnh khác',
                colorClass: 'from-muted/5 to-muted/0',
                iconColor: 'text-muted-foreground',
              };

              return (
                <div
                  key={guarantee.bankAccount?.id}
                  className={`p-4 rounded-lg border bg-linear-to-br ${colorClass}`}
                >
                  <div className='grid grid-cols-3 gap-3'>
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
                        value={format.date(guarantee.durationDate)}
                      />
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Bảo lãnh ── */}
      {!isRuleContract &&
        information?.contractGuarantee &&
        information.contractGuarantee.length > 0 && (
          <Section title='Bảo lãnh hợp đồng' icon={ShieldCheck}>
            <div className='space-y-4'>
              {information.contractGuarantee.map((guarantee) => {
                if (!guarantee?.value) return null;
                const guaranteeTypeMap: Record<number, { label: string }> = {
                  1: { label: 'Bảo lãnh thực hiện hợp đồng' },
                  2: { label: 'Bảo lãnh bảo hành' },
                  3: { label: 'Bảo lãnh đặt cọc' },
                };
                const guaranteeInfo = guaranteeTypeMap[
                  guarantee.guaranteeType
                ] ?? { label: 'Bảo lãnh khác' };
                return (
                  <div
                    key={guarantee.bankAccount?.id}
                    className='p-3 rounded-md border '
                  >
                    <div className='mb-3 text-sm font-semibold text-primary'>
                      {guaranteeInfo.label}
                    </div>
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
                          value={format.date(guarantee.durationDate)}
                        />
                      )}
                      {guarantee.bankAccount?.bankName && (
                        <InfoRow
                          label='Ngân hàng'
                          value={guarantee.bankAccount.bankName}
                        />
                      )}
                      {guarantee.bankAccount?.accountNumber && (
                        <InfoRow
                          label='Số tài khoản'
                          value={guarantee.bankAccount.accountNumber}
                        />
                      )}
                      {guarantee.bankAccount?.accountHolder && (
                        <div className='col-span-2'>
                          <InfoRow
                            label='Chủ tài khoản'
                            value={guarantee.bankAccount.accountHolder}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

      {/* ── Ghi chú ── */}
      {information?.notes && (
        <Section title='Ghi chú' icon={StickyNote}>
          <p className='text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed p-3 rounded-lg '>
            {information.notes}
          </p>
        </Section>
      )}
    </div>
  );
}
