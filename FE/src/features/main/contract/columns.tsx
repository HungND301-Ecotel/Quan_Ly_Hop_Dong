import { DataTableSelectColumn } from '@/components/data-table';
import { useAuthContext } from '@/features/context';
import { useDataTableContext } from '@/components/data-table/context';
import { ContractStatus, ContractSubStatus } from '@/constants/contract-status';
import { ContractEdit } from '@/features/main/contract/edit';
import { format } from '@/lib/format';
import { cn, parseDateLocal } from '@/lib/utils';
import { Contract, InvoicesDueSoon } from '@/services/contract/type';
import { ColumnDef } from '@tanstack/react-table';
import { ContractDetail } from './approval/components/detail';
import { ContractComplete } from './edit/complete/ContractComplete';
import { ContractCancel } from './edit/cancel/ContractCancel';
import { ContractLiquidation } from './liquidation/LiquidationContract';
import { ContractPause } from './all/components/ContractPause';
import { ContractResume } from './all/components/ContractResume';
import { ContractArchive } from './all/components/ChangeArchive';
import { ContractRenew } from './all/components/ContractRenew';

export const ContractColumns: ColumnDef<Contract>[] = [
  DataTableSelectColumn as ColumnDef<Contract>,
  {
    accessorKey: 'contractTypeId',
    header: 'Loại hợp đồng',
    meta: { hidden: true },
  },
  {
    accessorKey: 'contractFormat',
    header: 'Phân Loại hợp đồng',
    meta: { hidden: true },
    filterFn: 'equals',
  },
  {
    id: 'contractCode',
    header: 'Mã hợp đồng',
    cell: ({ row }) => (
      <div className='space-y-0.5'>
        <p className='font-medium text-sm'>{row.original.level1CodeCode || '—'}</p>
        <p className='font-medium text-sm'>{row.original.level2Code}</p>
        <p className='font-medium text-sm'>{row.original.level3Code || '—'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'contractNumber',
    header: 'Số hợp đồng',
    cell: ({ row }) => (
      <span className='font-bold'>{row.original.contractNumber}</span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Tên hợp đồng',
  },
  {
    accessorKey: 'partnerName',
    header: 'Đối tác',
  },
  {
    accessorKey: 'effectiveDate',
    header: () => <span className='w-full flex justify-center'>Hiệu lực hợp đồng</span>,
    cell: ({ row }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completionDate = row.original.completionDate
        ? new Date(row.original.completionDate)
        : null;
      if (completionDate) completionDate.setHours(0, 0, 0, 0);

      const daysLeft = completionDate
        ? Math.ceil((completionDate.getTime() - today.getTime()) / 86_400_000)
        : null;

      // ✅ Chỉ hiện khi còn trong 7 ngày tới (chưa quá hạn)
      const isNearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

      return (
        <div className='space-y-1 text-center'>
          {isNearExpiry && (
            <p className='inline-flex text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap bg-red-500 text-white'>
              Sắp hết hạn
            </p>
          )}
          <p>{format.date(row.original.effectiveDate)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => <span className='w-full flex justify-center'>Trạng thái</span>,
    cell: ({ row }) => {
      const status = ContractStatus[row.original.status];
      const subStatus = ContractSubStatus[row.original.subStatus];

      // ✅ Các subStatus được phép hiển thị khi cha là Archive
      const archiveAllowedSubStatuses = ['ArchivedAfterLiquidation', 'ArchivedAfterCancellation'];
      const isArchive = row.original.status === 'Archive';

      // ✅ Có hiển thị subStatus không
      const showSubStatus = (() => {
        if (isArchive) {
          // Archive: chỉ hiện nếu subStatus nằm trong whitelist
          return archiveAllowedSubStatuses.includes(row.original.subStatus);
        }
        return !!subStatus;
      })();

      // ✅ Khi status là Expired và subStatus là null → hiển thị "Đã quá hạn" tạm
      const isExpiredWithNoSubStatus =
        row.original.status === 'Expired' && !row.original.subStatus;

      return (
        <div className='space-y-1'>
          {status && (
            <p className={cn('text-xs rounded-xl px-3 py-1 text-center font-medium whitespace-nowrap', status.background, status.foreground)}>
              {status.title}
            </p>
          )}
          {/* ✅ Hiển thị subStatus thật */}
          {showSubStatus && subStatus && (
            <p className={cn('text-xs rounded-xl px-3 py-1 text-center font-medium whitespace-nowrap', subStatus.background, subStatus.foreground)}>
              {subStatus.title}
              {row.original.subStatus === 'AwaitingSigning' &&
                row.original.signingFlows
                  ?.sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                  .find((flow) => flow.status === 'Pending')?.departmentName}
            </p>
          )}
          {/* ✅ Expired + null subStatus → hiển thị tạm "Đã quá hạn" */}
          {isExpiredWithNoSubStatus && (
            <p className={cn('text-xs rounded-xl px-3 py-1 text-center font-medium whitespace-nowrap',
              ContractSubStatus['Overdue']?.background,
              ContractSubStatus['Overdue']?.foreground
            )}>
              {ContractSubStatus['Overdue']?.title ?? 'Đã quá hạn'}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: 'invoicesDueSoon',
    header: () => <span className='w-full flex justify-center'>Hóa đơn sắp đến hạn</span>,
    cell: ({ row }) => {
      const invoices = row.original.invoicesDueSoon;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = (invoices ?? [])
        .map((inv: InvoicesDueSoon) => {
          const due = parseDateLocal(inv.dueDate);
          const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
          return { ...inv, daysLeft };
        })
        .filter((inv: InvoicesDueSoon & { daysLeft: number }) => inv.daysLeft >= 0 && inv.daysLeft <= 15)
        .sort((a: InvoicesDueSoon & { daysLeft: number }, b: InvoicesDueSoon & { daysLeft: number }) => a.daysLeft - b.daysLeft);

      if (filtered.length === 0) return <span className='text-muted-foreground text-xs flex justify-center'>Không có hóa đơn</span>;

      return (
        <div className='flex flex-col gap-1 items-center'>
          {filtered.map((inv: InvoicesDueSoon & { daysLeft: number }) => (
            <div
              key={inv.numberInvoice}
              className='inline-flex items-center gap-1.5 text-xs rounded-md px-2 py-0.5 w-fit whitespace-nowrap bg-amber-50 border border-amber-200'
            >
              <span className='font-medium text-amber-800'>{inv.numberInvoice}</span>
              <span className='text-amber-700'>— còn {inv.daysLeft} ngày</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => (
      <span className='w-full flex items-center justify-center'>Hành động</span>
    ),
    cell: ({ table, row }) => {
      const { user } = useAuthContext();
      const { refresh } = useDataTableContext<Contract>();
      const isDraft = row.original.status === 'Draft';
      const isRejected = row.original.status === 'PendingApproval' && row.original.subStatus === 'Rejected';
      const isWaitingPartnerSign = row.original.status === 'PendingApproval' && row.original.subStatus === 'WaitPartnerSign';
      // ✅ Hủy trước hiệu lực: subStatus là CancelledBeforeEffective
      const isCancelledBeforeEffective = row.original.subStatus === 'CancelledBeforeEffective' || row.original.subStatus === 'TerminatedEarly';
      // ✅ Đang hiệu lực: hiển thị nút Tạm dừng và Hủy khi đang thực hiện
      const isActive = row.original.status === 'Active' && row.original.subStatus !== 'Paused';
      // ✅ Tạm dừng: hiển thị nút Tiếp tục + xem lý do, ẩn Hủy
      const isPaused = row.original.subStatus === 'Paused';
      // ✅ Đang nghiệm thu: hiển thị nút chuyển sang lưu trữ
      const isLiquidatedDone = row.original.status === 'Liquidated'
        && row.original.subStatus === 'LiquidatedDone';
      const isAdmin = user?.role === '0' || user?.role === 'Admin';
      const isDraftingOfficer = row.original.contractUserRoles?.some(
        (r) => r.userId === user?.id && r.role === 0
      );
      const canEdit = (isDraft || isRejected) && (isAdmin || isDraftingOfficer);

      const isExpired = row.original.status === 'Expired';
      const isNearExpiry = row.original.subStatus === 'NearExpiry';
      const isCancelled = row.original.status === 'Cancelled';
      const canRenewOrTerminate = isExpired || isNearExpiry;

      return (
        <div className='flex gap-2 justify-center'>
          {canEdit && (
            <ContractEdit contractId={row.original.id} callback={refresh} />
          )}
          {isWaitingPartnerSign && (
            <>
              <ContractComplete contract={row.original} callback={refresh} />
              <ContractCancel contractId={row.original.id} callback={refresh} />
            </>
          )}
          {/* ✅ Hiển thị nút thêm file thanh lý khi Hủy trước hiệu lực */}
          {isCancelledBeforeEffective && (
            <ContractLiquidation contractId={row.original.id} callback={refresh} />
          )}
          {/* ✅ Hiển thị Tạm dừng + Hủy khi hợp đồng đang hiệu lực */}
          {isActive && (
            <>
              <ContractPause contractId={row.original.id} callback={refresh} />
              <ContractCancel contractId={row.original.id} callback={refresh} />
            </>
          )}
          {/* ✅ Đang tạm dừng: Tiếp tục + xem lý do (chưa có api xem lý do) */}
          {isPaused && (
            <>
              <ContractResume contractId={row.original.id} callback={refresh} />
            </>
          )}
          {/* ✅ Đang nghiệm thu: chuyển sang lưu trữ */}
          {(isLiquidatedDone || isCancelled) && (
            <ContractArchive contractId={row.original.id} callback={refresh} />
          )}

          {canRenewOrTerminate && (
            <ContractRenew contract={row.original} callback={refresh} />
          )}
          <ContractDetail table={table} row={row} onSubmit={refresh} />
        </div>
      );
    },
  },
];