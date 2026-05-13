import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractFormat } from '@/constants/contract-format';
import { ContractRole } from '@/constants/contract-role';
import { DiscountType } from '@/constants/discount-type';
import { ScheduleType } from '@/constants/schedule-type';
import { format } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Contract } from '@/services/contract/type';
import {
  Banknote,
  Calendar1Icon,
  CalendarDays,
  DollarSignIcon,
  FileBadge,
  FileText,
  HashIcon,
  Layers,
  LucideIcon,
  ShieldCheck,
  StickyNote,
  Users,
} from 'lucide-react';

export type ContractInformationProps = {
  information?: Contract;
  loading?: boolean;
};

function InfoRow({
  label,
  value,
  icon: Icon,
  highlight = false,
  loading = false,
}: {
  label: string;
  value: string | React.ReactNode;
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
            className={`text-sm font-medium wrap-break-words ${highlight ? 'font-semibold' : ''}`}
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
  <div className='p-6 rounded-lg border space-y-4 bg-blue-50'>
    <SectionHeader title={title} description={description} icon={icon} />
    <div className={cn('space-y-3', className)}>{children}</div>
  </div>
);

export function ContractInformation({
  information,
  loading,
}: ContractInformationProps) {
  const getContractFinalValue = () => {
    let totalItems = 0;
    if (information?.contractItems && information.contractItems.length > 0) {
      information.contractItems.forEach((item) => {
        totalItems += (item.quantity || 0) * (item.price || 0);
      });
    } else {
      totalItems = information?.contractValue || 0;
    }

    let totalOthers = 0;
    if (
      information?.contractOtherItems &&
      information.contractOtherItems.length > 0
    ) {
      information.contractOtherItems.forEach((item) => {
        totalOthers += (item.quantity || 0) * (item.price || 0);
      });
    } else {
      totalOthers = information?.contractOthersValue || 0;
    }

    const total = (totalItems || 0) + (totalOthers || 0);

    let discount = 0;
    const discountVal = information?.discountValue || 0;
    if (information?.discountType == DiscountType.Percent.id) {
      discount = (total / 100) * discountVal;
    } else {
      discount = discountVal;
    }

    return total - discount;
  };

  const isRuleContract = [0, 1].includes(information?.contractFormat || 0);

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-0.5'>
      {/* 1. Contract Format */}
      <Section title='Mẫu hợp đồng' icon={FileText}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <InfoRow
            label='Định dạng hợp đồng'
            value={ContractFormat[information?.contractFormat || 0]?.name}
            loading={loading}
            highlight
          />
          {information?.parentContractId && (
            <InfoRow
              label='Gia hạn từ hợp đồng'
              value={information.parentContractNumber}
              loading={loading}
            />
          )}
          {[2, 3].includes(information?.contractFormat || 0) && (
            <InfoRow
              label='Theo dõi công nợ'
              value={information?.isDebtTrackingEnabled ? 'Có' : 'Không'}
              loading={loading}
            />
          )}
          {[2, 3].includes(information?.contractFormat || 0) && (
            <InfoRow
              label='Hợp đồng nguyên tắc liên kết'
              value={
                information?.childContractRelationships &&
                  information.childContractRelationships.length > 0
                  ? information.childContractRelationships
                    .map((c) => `${c.childContractNumber}`)
                    .join(', ')
                  : 'Hợp đồng kinh tế độc lập'
              }
              loading={loading}
            />
          )}
        </div>
      </Section>

      {/* 2. Thông tin hợp đồng */}
      <Section title='Thông tin hợp đồng' icon={HashIcon}>
        <div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <InfoRow
              label='Mã cấp I'
              value={information?.level1CodeCode}
              loading={loading}
            />
            <InfoRow
              label='Mã cấp II'
              value={information?.level2Code}
              loading={loading}
            />
            <InfoRow
              label='Mã cấp III'
              value={information?.level3Code}
              loading={loading}
            />
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <InfoRow
            label='Loại hợp đồng'
            value={information?.contractTypeName}
            loading={loading}
          />
          <InfoRow
            label='Hình thức hợp đồng'
            value={information?.contractStructureName}
            loading={loading}
          />
          <InfoRow
            label='Tên/nội dung hợp đồng'
            value={information?.title}
            loading={loading}
            highlight
          />
          <InfoRow
            label='Sổ theo dõi hợp đồng'
            value={information?.contractRegisterName}
            loading={loading}
          />
        </div>

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <InfoRow
            label='Phòng ban'
            value={information?.departmentName}
            loading={loading}
          />
          <InfoRow
            label='Hình thức lựa chọn nhà thầu/nhà cung cấp'
            value={information?.procurementMethodName}
            loading={loading}
          />
        </div>

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <InfoRow
            label='Số ký hiệu hợp đồng'
            value={information?.contractNumber}
            loading={loading}
            highlight
          />
          <InfoRow
            label='Số ký hiệu PLHĐ'
            value={information?.appendixNumber}
            loading={loading}
          />
        </div>

        <Separator />

        <InfoRow
          label='Đối tác/khách hàng'
          loading={loading}
          value={
            <div className='flex flex-col gap-0.5'>
              <span className='font-semibold'>{information?.partnerName}</span>
              {information?.partnerDetail?.address && (
                <span className='text-xs text-muted-foreground'>
                  <b>Địa chỉ:</b> {information.partnerDetail.address}
                </span>
              )}
              {information?.partnerDetail?.taxCode && (
                <span className='text-xs text-muted-foreground'>
                  <b>Mã số thuế:</b> {information.partnerDetail.taxCode}
                </span>
              )}
              {information?.partnerDetail?.contactPerson && (
                <span className='text-xs text-muted-foreground'>
                  <b>Người đại diện:</b> {information.partnerDetail.contactPerson}
                </span>
              )}
            </div>
          }
        />

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <InfoRow
            label='Ngày ký hợp đồng'
            value={format.date(information?.startDate || '')}
            loading={loading}
          />
          <InfoRow
            label='Hiệu lực hết'
            value={format.date(information?.endDate || '')}
            loading={loading}
          />
        </div>
      </Section>

      {/* 3. Phân công quản lý */}
      <Section title='Phân công quản lý' icon={Users}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {Object.values(ContractRole).map((roleDef) => {
            const roleData = information?.contractUserRoles?.find(
              (r) => r.role === roleDef.id
            );
            return (
              <div
                key={roleDef.id}
                className='p-4 rounded-lg border bg-white space-y-2'
              >
                <div className='flex items-center gap-2'>

                  <span className='text-xs font-medium text-muted-foreground'>
                    {roleDef.name}
                  </span>
                </div>
                {loading ? (
                  <Skeleton className='h-10 w-full' />
                ) : (
                  <div className='space-y-1'>
                    <div className='text-sm font-semibold'>
                      {roleData?.fullname || 'Chưa phân công'}
                    </div>
                    {roleData && (
                      <div className='text-xs text-muted-foreground'>
                        {roleData.departmentName}
                        {roleData.positionName
                          ? ` / ${roleData.positionName}`
                          : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* 4. Thông tin tài chính */}
      <Section title='Thông tin tài chính' icon={DollarSignIcon}>
        {[2, 3].includes(information?.contractFormat || 0) && (
          <div className='p-6 rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20'>
            <div className='text-sm font-medium text-muted-foreground mb-2'>
              Tổng giá trị hợp đồng (sau thuế)
            </div>
            <div className='text-3xl font-bold text-emerald-600'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(getContractFinalValue())}
            </div>
          </div>
        )}

        {information?.contractItems && information.contractItems.length > 0 && (
          <>
            {[2, 3].includes(information?.contractFormat || 0) && <Separator />}
            <div>
              <div className='text-sm font-medium mb-3'>
                Danh sách vật tư ({information.contractItems.length} mục)
              </div>
              <div className='space-y-2'>
                <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                  <div className='col-span-3'>Tên vật tư</div>
                  <div className='col-span-2'>Đơn vị tính</div>
                  <div className='col-span-2 text-right'>Đơn giá</div>
                  {!isRuleContract && <div className='col-span-2 text-right'>Số lượng</div>}
                  {!isRuleContract && <div className='col-span-3 text-right'>Thành tiền</div>}
                </div>
                {information.contractItems.map((item, index) => {
                  const total = (item?.quantity || 0) * (item?.price || 0);
                  return (
                    <div
                      key={index}
                      className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'
                    >
                      <div className='col-span-3 flex flex-col justify-center'>
                        <span className='text-sm font-medium'>
                          {item.materialName}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {item.materialCode}
                        </span>
                      </div>
                      <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                        {item?.unitOfMeasureName || '—'}  {/* ← thêm */}
                      </div>
                      <div className='col-span-2 flex items-center justify-end text-sm'>
                        {format.number(item?.price || 0)} đ
                      </div>
                      {!isRuleContract && (
                        <div className='col-span-2 flex items-center justify-end text-sm font-medium'>
                          {item.quantity}
                        </div>
                      )}
                      {!isRuleContract && (
                        <div className='col-span-3 flex items-center justify-end text-sm font-semibold text-primary'>
                          {format.number(total)} đ
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

      {/* 5. Thành phần hợp đồng khác */}
      {(information?.contractOthersValue ||
        (information?.contractOtherItems &&
          information.contractOtherItems.length > 0)) && (
          <Section title='Thành phần hợp đồng khác' icon={Layers}>
            {information.contractOtherItems &&
              information.contractOtherItems.length > 0 ? (
              <div>
                <div className='text-sm font-medium mb-3'>
                  Danh sách thành phần hợp đồng khác ({information.contractOtherItems.length} mục)
                </div>
                <div className='space-y-2'>
                  <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground'>
                    <div className={isRuleContract ? 'col-span-3' : 'col-span-3'}>Thành phần hợp đồng khác</div>
                    <div className='col-span-2'>Đơn vị tính</div>
                    <div className='col-span-2 text-right'>Đơn giá</div>
                    {!isRuleContract && <div className='col-span-2 text-right'>Số lượng</div>}
                    {!isRuleContract && <div className='col-span-3 text-right'>Thành tiền</div>}
                  </div>
                  {information.contractOtherItems.map((item, index) => {
                    const total = (item?.quantity || 0) * (item?.price || 0);
                    return (
                      <div
                        key={index}
                        className='grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors'
                      >
                        <div className={`${isRuleContract ? 'col-span-3' : 'col-span-3'} flex items-center`}>
                          <span className='text-sm font-medium'>
                            {item.materialName || 'N/A'}
                          </span>
                        </div>
                        <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
                          {item?.unitOfMeasureName || '—'}  {/* ← thêm */}
                        </div>
                        <div className='col-span-2 flex items-center justify-end text-sm'>
                          {format.number(item?.price || 0)} đ
                        </div>
                        {!isRuleContract && (
                          <div className='col-span-2 flex items-center justify-end text-sm font-medium'>
                            {item.quantity || 0}
                          </div>
                        )}
                        {!isRuleContract && (
                          <div className='col-span-3 flex items-center justify-end text-sm font-semibold text-orange-600'>
                            {format.number(total)} đ
                          </div>
                        )}
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
                icon={Banknote}
              />
            )}
          </Section>
        )}

      {/* 6. Chiết khấu */}
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
      {!isRuleContract && <Section title='Lịch thanh toán' icon={CalendarDays}>
        <div className='p-4 rounded-lg bg-blue-500/5 border border-blue-500/20'>
          <div className='text-xs text-muted-foreground mb-1'>Loại kế hoạch</div>
          <div className='text-sm font-semibold text-blue-600'>
            {Object.values(ScheduleType).find(
              (s) => String(s.id) === String(information?.paymentPlanType)
            )?.name || '---'}
          </div>
        </div>

        {information?.paymentSchedules &&
          information.paymentSchedules.length > 0 && (
            <>
              <Separator />
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
                          <div className='flex flex-col items-start gap-2'>
                            <div className='flex gap-2 items-center'>
                              <span className='flex items-center justify-center size-7 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold'>
                                {index + 1}
                              </span>
                              <span className='text-sm font-medium'>Kỳ {index + 1}</span>
                            </div>
                            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                              <Calendar1Icon className='size-3.5' />
                              <span>
                                {item.fromDate && item.toDate
                                  ? `Từ ${format.date(item.fromDate)} đến ${format.date(item.toDate)}`
                                  : item.dueDate
                                    ? `Hạn thanh toán: ${format.date(item.dueDate)}`
                                    : item.month && item.year
                                      ? `Tháng ${item.month}/${item.year}`
                                      : item.quarter && item.year
                                        ? `Quý ${item.quarter}/${item.year}`
                                        : '---'}
                              </span>
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
            </>
          )}
      </Section>}

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
                  {guarantee.bankAccount?.accountNumber && (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <InfoRow
                        label='Ngân hàng'
                        value={guarantee.bankAccount.bankName}
                      />
                      <InfoRow
                        label='Số tài khoản'
                        value={guarantee.bankAccount.accountNumber}
                      />
                      <InfoRow
                        label='Chủ tài khoản'
                        value={guarantee.bankAccount.accountHolder}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 9. Ghi chú */}
      {information?.notes && (
        <Section title='Ghi chú' icon={StickyNote}>
          <p className='text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30'>
            {information.notes}
          </p>
        </Section>
      )}
    </div>
  );
}