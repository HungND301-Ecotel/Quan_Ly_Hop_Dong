import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  useDataTable,
} from '@/components/data-table';
import { DataTableEvent } from '@/components/data-table/types';
import { FormNumber } from '@/components/form/form-number';
import { FormSelect } from '@/components/form/form-select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from '@/lib/format';
import { contractPaymentService } from '@/services/contract-payment';

import { contractProgressService } from '@/services/contract-progress';
import {
  ContractItem as ApiContractItem,
  ContractProgress as ApiContractProgress,
  ContractProgressDetail as ApiContractProgressDetail,
  CreateContractProgressWithItemsRequest,
  UpdateContractProgressWithItemsRequest,
  WorkInProgress,
  YearlySummary,
  YearlySummaryItem,
} from '@/services/contract-progress/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import {
  ActivityIcon,
  BanknoteIcon,
  CalculatorIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ConstructionIcon,
  Database,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  HistoryIcon,
  Loader2,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getContractItemColumns,
  getWorkInProgressColumns,
  getYearlySummaryColumns,
} from './columns';
import {
  ContractProgress,
  ContractProgressItem,
  calculateProgressTotals,
} from './Mock';
import {
  ContractProgressFormDefault,
  ContractProgressFormSchema,
  ContractProgressFormValues,
} from './schema';
import { SyncResult } from '@/services/contract-payment/type';
import { useExternalSyncConnections } from '@/hooks/useExternalSyncConnections';
import { ExternalSyncConnection } from '@/services/server';
import { SyncResultBadges } from '../DocumentSection';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import { FormDate } from '@/components/form/form-date';

// contractQuantity hiển thị = executedQuantity + remainingQuantity (= tổng được phép của kỳ này)
// remainingQuantity (validate max khi user nhập) = contractQuantity - 0
//   vì người dùng có thể nhập lại từ 0 đến displayContractQty
function mapApiContractItemToUi(item: ApiContractItem): ContractProgressItem {
  const executedQuantity = item.executedQuantity ?? 0;
  // remainingQuantity từ API = phần chưa thực hiện sau kỳ này
  const apiRemainingQuantity = item.remainingQuantity ?? 0;
  // Khối lượng HĐ của kỳ này = phần đã làm + phần còn lại sau kỳ này
  // Ví dụ: executedQuantity=5, remainingQuantity=5 → displayContractQty=10 (kỳ 1)
  // Ví dụ: executedQuantity=5, remainingQuantity=0 → displayContractQty=5 (kỳ cuối)
  const displayContractQty = executedQuantity + apiRemainingQuantity;

  return {
    id: item.id,
    contractItemId: item.contractItemId,
    itemCode: item.materialCode,
    itemName: item.materialName,
    unit: '',
    unitPrice: item.materialPrice,
    contractQuantity: displayContractQty,
    contractAmount: displayContractQty * item.materialPrice,
    executedQuantity,
    // ✅ remainingQuantity = displayContractQty (user được phép nhập từ 0 → displayContractQty)
    // KHÔNG tính lại = displayContractQty - executedQuantity vì đó sẽ = apiRemainingQuantity
    // mà apiRemainingQuantity ở kỳ cuối = 0, dẫn đến max = 0 (sai)
    remainingQuantity: displayContractQty,
    currentExecutedQuantity: executedQuantity,
    currentExecutedAmount: item.totalItemAmount ?? 0,
  };
}

function mapApiProgressToUi(progress: ApiContractProgress): ContractProgress {
  const items =
    progress.contractProgressItems?.map(mapApiContractItemToUi) || [];
  const totals = calculateProgressTotals(items);
  return {
    id: progress.id,
    periodStart: progress.periodStart,
    periodEnd: progress.periodEnd,
    totalExecutedQuantity: totals.totalQuantity,
    totalExecutedAmount: progress.progressTotal ?? totals.totalAmount,
    contractProgressItems: items,
    contractPaymentId: progress.contractPaymentId,
    numberInvoice: progress.numberInvoice,
    executedAmount: progress.executedAmount,
    isHasValue: progress.isHasValue,
    isHasMaterial: progress.isHasMaterial,
  };
}

function mapApiDetailToUi(detail: ApiContractProgressDetail): {
  fromDate: string;
  toDate: string;
  total: number;
  contractProgresses: ContractProgress[];
  isHasValue?: boolean;
  isHasMaterial?: boolean;
} {
  const progresses = detail.contractProgresses?.map(mapApiProgressToUi) || [];
  const total = progresses.reduce((sum, p) => sum + p.totalExecutedAmount, 0);
  return {
    fromDate: detail.fromDate,
    toDate: detail.toDate,
    total,
    contractProgresses: progresses,
    isHasValue: detail.isHasValue,
    isHasMaterial: detail.isHasMaterial,
  };
}

type ProgressSectionProps = {
  contractId: string;
  contractValue: number;
  disabled?: boolean;
};

export function ProgressSection({
  contractId,
  contractValue,
  disabled = false,
}: ProgressSectionProps) {
  const { getContractProgressDetail, getYearlySummary, getWorkInProgress } =
    contractProgressService;

  const [contractInfo, setContractInfo] = useState<{
    contractNumber: string;
    effectiveDate: string;
  } | null>(null);

  useEffect(() => {
    contractService.getContractDetail(contractId).then((res) => {
      if (res) {
        setContractInfo({
          contractNumber: res.contractNumber,
          effectiveDate: res.effectiveDate,
        });
      }
    });
  }, [contractId]);

  const [progressDetail, setProgressDetail] = useState<{
    fromDate: string;
    toDate: string;
    total: number;
    contractProgresses: ContractProgress[];
    isHasValue?: boolean;
    isHasMaterial?: boolean;
  }>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgress, setEditingProgress] =
    useState<ContractProgress | null>(null);
  // Index của lần đang edit trong mảng contractProgresses (để tìm N+1)
  const [editingProgressIndex, setEditingProgressIndex] = useState<number>(-1);
  const [viewingProgress, setViewingProgress] =
    useState<ContractProgress | null>(null);

  const [yearSummary, setYearSummary] = useState<YearlySummary>();
  const [workInProgress, setWorkInProgress] = useState<WorkInProgress>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConnectionPicker, setShowConnectionPicker] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const {
    connections,
    loading: loadingConnections,
    loadConnections,
  } = useExternalSyncConnections();

  useEffect(() => {
    if (showConnectionPicker) {
      loadConnections();
    }
  }, [showConnectionPicker, loadConnections]);

  const handleSelectConnection = async (conn: ExternalSyncConnection) => {
    setShowConnectionPicker(false);
    setSyncing(true);
    setSyncResult(null);

    try {
      const payload = {
        contractNumber: contractInfo?.contractNumber ?? '',
        contractDate: contractInfo?.effectiveDate ?? '',
        sourceConnectionId: conn.id!,
      };

      const result = await contractPaymentService.syncInvoice(payload);
      setSyncResult(result ?? null);
      toast.success('Đồng bộ hóa đơn thành công');

      // Refresh 3 bảng sau khi đồng bộ
      progressTable.refresh();
      yearSummaryTable.refresh();
      workInProgressTable.refresh();
    } catch {
      toast.error('Đồng bộ hóa đơn thất bại');
    } finally {
      setSyncing(false);
    }
  };

  const progressColumns: ColumnDef<ContractProgress>[] = useMemo(
    () => [
      {
        accessorKey: 'periodStart',
        header: 'Từ ngày',
        cell: ({ row }) => format.date(row.original.periodStart),
      },
      {
        accessorKey: 'periodEnd',
        header: 'Đến ngày',
        cell: ({ row }) => format.date(row.original.periodEnd),
      },
      {
        accessorKey: 'numberInvoice',
        header: 'Số hóa đơn',
        cell: ({ row }) => row.original.numberInvoice || '—',
      },
      {
        accessorKey: 'totalExecutedAmount',
        header: 'Giá trị thực hiện',
        cell: ({ row }) => format.number(row.original.totalExecutedAmount),
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setViewingProgress(row.original)}
            >
              <EyeIcon className='size-4' />
            </Button>
            {!disabled && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleEdit(row.original, row.index)}
                >
                  <EditIcon className='size-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleDelete(row.original.id)}
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [disabled]
  );

  const progressTable = useDataTable<ContractProgress>({
    keys: ['progress', contractId],
    service: async () => {
      const detail = await getContractProgressDetail(contractId);
      const mapped = mapApiDetailToUi(detail as ApiContractProgressDetail);
      setProgressDetail(mapped);
      return mapped.contractProgresses;
    },
    columns: progressColumns,
  });

  const yearSummaryTable = useDataTable({
    service: async () => {
      const detail = await getYearlySummary(contractId);
      setYearSummary(detail);
      return detail?.yearlySummaries || [];
    },
    columns: getYearlySummaryColumns(),
    keys: ['yearly-summary', contractId],
  });

  const workInProgressTable = useDataTable({
    service: async () => {
      const detail = await getWorkInProgress(contractId);
      setWorkInProgress(detail);
      return detail?.items || [];
    },
    columns: getWorkInProgressColumns(),
    keys: ['work-in-progress', contractId],
  });

  const handleAdd = () => {
    setEditingProgress(null);
    setEditingProgressIndex(-1);
    setIsDialogOpen(true);
  };

  // Nhận thêm index của row để truyền vào dialog
  const handleEdit = (progress: ContractProgress, index: number) => {
    setEditingProgress(progress);
    setEditingProgressIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await contractProgressService.deleteContractProgress(deletingId);
      setDeletingId(null);
      toast.success('Xóa thời gian thực hiện thành công');
      progressTable.refresh();
      yearSummaryTable.refresh();
      workInProgressTable.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Lỗi khi xóa thời gian thực hiện'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='space-y-8'>
      <Dialog
        open={showConnectionPicker}
        onOpenChange={setShowConnectionPicker}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Database className='w-5 h-5' />
              Chọn kết nối đồng bộ
            </DialogTitle>
            <DialogDescription>
              Chọn cổng kết nối để đồng bộ hóa đơn và thuế
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            {loadingConnections ? (
              <div className='flex justify-center items-center gap-2 py-8 text-muted-foreground'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>Đang tải danh sách kết nối...</span>
              </div>
            ) : connections.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Database className='w-10 h-10 mx-auto mb-2 opacity-30' />
                <p className='text-sm'>Chưa có kết nối nào được cấu hình</p>
              </div>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => handleSelectConnection(conn)}
                  disabled={!conn.isActive}
                  className='w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-100 rounded-md'>
                        <Database className='w-4 h-4 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-semibold text-sm text-slate-900'>
                          {conn.connection.server}
                          <span className='text-slate-400 font-normal'>
                            :{conn.connection.port}
                          </span>
                        </p>
                        <p className='text-xs text-slate-500 mt-0.5'>
                          {conn.connection.database} · {conn.connection.userId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        conn.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {conn.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <section className='space-y-3'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
            <ActivityIcon className='size-5' />
            <h3>Tình hình thực hiện hợp đồng</h3>
          </div>
        </div>

        <div className='flex items-center justify-between p-4 rounded-lg border bg-muted/30'>
          <div className='flex items-center gap-2'>
            <FileTextIcon className='size-4 text-blue-600' />
            <span className='text-sm font-medium'>Hóa đơn:</span>
            {syncResult ? (
              <SyncResultBadges result={syncResult} />
            ) : (
              <span className='text-xs text-muted-foreground'>—</span>
            )}
          </div>
          <Button
            size='sm'
            variant='default'
            onClick={() => setShowConnectionPicker(true)}
            disabled={syncing || !contractInfo}
            className='gap-1.5 shrink-0'
          >
            <RefreshCwIcon
              className={cn('size-4', syncing && 'animate-spin')}
            />
            {syncing ? 'Đang đồng bộ...' : 'Đồng bộ hóa đơn'}
          </Button>
        </div>

        <DataTable dataTable={progressTable}>
          <DataTableHeader>
            {progressDetail && (
              <>
                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <CalendarIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Từ ngày</ItemDescription>
                    <ItemTitle>
                      {format.date(progressDetail.fromDate)}
                    </ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <CalendarCheckIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Đến ngày</ItemDescription>
                    <ItemTitle>{format.date(progressDetail.toDate)}</ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <BanknoteIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị hợp đồng</ItemDescription>
                    <ItemTitle>{format.number(contractValue)}</ItemTitle>
                  </ItemContent>
                </Item>
              </>
            )}

            <Item
              variant={'outline'}
              size={'sm'}
              className='bg-background shadow-xs'
            >
              <ItemMedia
                variant={'icon'}
                className='size-10 bg-primary/20 text-primary rounded-md'
              >
                <TrendingUpIcon className='size-5' />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Giá trị thực hiện</ItemDescription>
                <ItemTitle>
                  {format.number(progressDetail?.total || 0)}
                </ItemTitle>
              </ItemContent>
            </Item>
          </DataTableHeader>

          <DataTableContent />

          {!disabled && (
            <Button
              onClick={handleAdd}
              type='button'
              variant='default'
              size={'lg'}
              className='w-full shadow'
            >
              <PlusIcon className='size-4' />
              Thêm mới thời gian thực hiện
            </Button>
          )}

          <DataTableFooter>
            <DataTablePagination />
          </DataTableFooter>
        </DataTable>
      </section>

      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <HistoryIcon className='size-5' />
          <h3>Luỹ kế năm</h3>
        </div>
        <DataTable dataTable={yearSummaryTable}>
          <DataTableHeader>
            {yearSummary && (
              <>
                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <CalendarArrowUpIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Từ năm</ItemDescription>
                    <ItemTitle>{yearSummary.fromYear}</ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <CalendarArrowDownIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Đến năm</ItemDescription>
                    <ItemTitle>{yearSummary.toYear}</ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <BanknoteIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị hợp đồng</ItemDescription>
                    <ItemTitle>{format.number(contractValue)}</ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <TrendingUpIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị thực hiện</ItemDescription>
                    <ItemTitle>{format.number(yearSummary.total)}</ItemTitle>
                  </ItemContent>
                </Item>
              </>
            )}
          </DataTableHeader>

          <DataTableContent
            onExpand={({ row }: DataTableEvent<YearlySummaryItem>) => (
              <YearItemTable
                contractId={contractId}
                year={row?.original.year as number}
              />
            )}
          />

          <DataTableFooter>
            <DataTablePagination />
          </DataTableFooter>
        </DataTable>
      </section>

      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <ConstructionIcon className='size-5' />
          <h3>Khối lượng giá trị dở dang</h3>
        </div>

        <DataTable dataTable={workInProgressTable}>
          <DataTableHeader>
            {workInProgress && (
              <>
                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <BanknoteIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị hợp đồng</ItemDescription>
                    <ItemTitle>{format.number(contractValue)}</ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <TrendingUpIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị thực hiện</ItemDescription>
                    <ItemTitle>
                      {format.number(progressDetail?.total || 0)}
                    </ItemTitle>
                  </ItemContent>
                </Item>

                <Item
                  variant={'outline'}
                  size={'sm'}
                  className='bg-background shadow-xs'
                >
                  <ItemMedia
                    variant={'icon'}
                    className='size-10 bg-primary/20 text-primary rounded-md'
                  >
                    <CalculatorIcon className='size-5' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemDescription>Giá trị dở dang</ItemDescription>
                    <ItemTitle>
                      {format.number(workInProgress.totalAmount)}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              </>
            )}
          </DataTableHeader>
          <DataTableContent />
          <DataTableFooter>
            <DataTablePagination />
          </DataTableFooter>
        </DataTable>
      </section>

      <ProgressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contractId={contractId}
        progress={editingProgress}
        progressIndex={editingProgressIndex}
        onSaved={(mode) => {
          setIsDialogOpen(false);
          progressTable.refresh();
          yearSummaryTable.refresh();
          workInProgressTable.refresh();
          toast.success(
            mode === 'edit'
              ? 'Cập nhật thành công'
              : 'Thêm mới thời gian thực hiện thành công'
          );
        }}
      />

      <ViewProgressDialog
        open={!!viewingProgress}
        onOpenChange={(open) => !open && setViewingProgress(null)}
        progress={viewingProgress}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thời gian thực hiện này? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              variant='destructive'
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function YearItemTable({
  contractId,
  year,
}: {
  contractId: string;
  year: number;
}) {
  const { getYearlySummary } = contractProgressService;
  const columns = useMemo(
    () => getContractItemColumns({ showAction: false }),
    []
  );

  const progressItemTable = useDataTable({
    keys: ['progress-item', contractId, String(year)],
    service: async () => {
      const detail = await getYearlySummary(contractId);
      const summaryItem = detail?.yearlySummaries.find(
        (progress) => progress.year === year
      );
      return summaryItem?.contractItems || [];
    },
    columns,
  });

  return (
    <DataTable dataTable={progressItemTable}>
      <DataTableContent />
      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}

// Map contractItemId → executedQuantity của lần N+1 (để validate)
type NextProgressItemMap = Record<string, number>;

function ProgressFormDialog({
  open,
  onOpenChange,
  contractId,
  progress,
  progressIndex,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  progress: ContractProgress | null;
  progressIndex: number; // index trong mảng contractProgresses, -1 = thêm mới
  onSaved: (mode: 'create' | 'edit') => void;
}) {
  const isEdit = !!progress;

  const form = useForm<ContractProgressFormValues>({
    resolver: zodResolver(ContractProgressFormSchema) as any,
    defaultValues: ContractProgressFormDefault as ContractProgressFormValues,
  });

  const [loadingItems, setLoadingItems] = useState(false);
  const [invoices, setInvoices] = useState<{ label: string; value: string }[]>(
    []
  );
  const [payments, setPayments] = useState<any[]>([]);
  // executedQuantity của lần N+1 theo contractItemId
  const [nextProgressItemMap, setNextProgressItemMap] =
    useState<NextProgressItemMap>({});
  const hasNextProgress = Object.keys(nextProgressItemMap).length > 0;
  const [allProgresses, setAllProgresses] = useState<ApiContractProgress[]>([]);

  const { fields } = useFieldArray({
    control: form.control,
    name: 'contractProgressItems',
  });

  const watchedItems = useWatch({
    control: form.control,
    name: 'contractProgressItems',
    defaultValue: fields,
  });

  const watchedPeriodStart = form.watch('periodStart');

  useEffect(() => {
    if (!open) return;

    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        setNextProgressItemMap({});

        const paymentDetail =
          await contractPaymentService.getContractPaymentDetail(contractId);
        const rawPayments = paymentDetail?.payments || [];
        setPayments(rawPayments);

        const invoiceOptions = rawPayments
          .filter((p) => p.invoice && p.invoice.numberInvoice)
          .map((p) => ({
            label: p.invoice!.numberInvoice!,
            value: p.id,
          }));
        setInvoices(invoiceOptions);

        const schedulesPromise =
          contractPaymentService.getPaymentSchedules(contractId);

        if (isEdit && progress) {
          const [detail] = await Promise.all([
            contractProgressService.getContractProgressDetail(contractId),
            schedulesPromise,
          ]);

          const allProgresses = detail?.contractProgresses || [];
          setAllProgresses(allProgresses);
          const currentProgressApi = allProgresses.find(
            (item) => item.id === progress.id
          );

          if (!currentProgressApi) {
            toast.error(
              'Không tìm thấy dữ liệu cũ của thời gian thực hiện để chỉnh sửa'
            );
            onOpenChange(false);
            return;
          }

          // Tìm lần N+1 dựa theo progressIndex
          const nextProgressApi =
            progressIndex >= 0 && progressIndex < allProgresses.length - 1
              ? allProgresses[progressIndex + 1]
              : null;

          if (nextProgressApi) {
            // Tạo map: contractItemId → executedQuantity của lần N+1
            // Chỉ đưa vào những item có executedQuantity > 0 (lần N+1 đã dùng)
            const map: NextProgressItemMap = {};
            nextProgressApi.contractProgressItems?.forEach((item) => {
              if (item.executedQuantity > 0) {
                map[item.contractItemId] = item.executedQuantity;
              }
            });
            setNextProgressItemMap(map);
          }

          const items =
            currentProgressApi.contractProgressItems?.map(
              mapApiContractItemToUi
            ) || [];
          const totals = calculateProgressTotals(items);

          form.reset({
            id: currentProgressApi.id,
            paymentScheduleId: currentProgressApi.paymentScheduleId || '',
            periodStart: currentProgressApi.periodStart,
            periodEnd: currentProgressApi.periodEnd,
            totalExecutedQuantity: totals.totalQuantity,
            totalExecutedAmount: totals.totalAmount,
            contractProgressItems: items,
            isHasValue: currentProgressApi.isHasValue,
            isHasMaterial: currentProgressApi.isHasMaterial,
            contractPaymentId: currentProgressApi.contractPaymentId || '',
            executedAmount: currentProgressApi.executedAmount || 0,
          });
          return;
        }

        // Thêm mới — fetch cả sources lẫn detail để lấy remainingQuantity của lần cuối
        const [sources, schedules, detail] = await Promise.all([
          contractProgressService.getContractProgressItems(contractId),
          schedulesPromise,
          contractProgressService.getContractProgressDetail(contractId),
        ]);

        const availableSchedules = schedules || [];

        if (availableSchedules.length > 0) {
          if (
            availableSchedules.length === 1 ||
            availableSchedules[0].scheduleType === 4
          ) {
            form.setValue('paymentScheduleId', availableSchedules[0].id);
          }
        }

        // Lấy lần thực hiện cuối cùng (nếu có) để dùng remainingQuantity làm contractQuantity
        const allProgresses = detail?.contractProgresses || [];
        setAllProgresses(allProgresses);
        const lastProgress =
          allProgresses.length > 0
            ? allProgresses[allProgresses.length - 1]
            : null;

        // Map contractItemId → remainingQuantity của lần cuối
        const lastRemainingMap: Record<string, number> = {};
        if (lastProgress) {
          lastProgress.contractProgressItems?.forEach((item) => {
            lastRemainingMap[item.contractItemId] = item.remainingQuantity;
          });
        }

        const isFirstProgress = allProgresses.length === 0;

        const items: ContractProgressItem[] = (sources || []).map((source) => {
          // Lần 1: dùng source.quantity (khối lượng gốc trong hợp đồng)
          // Lần 2+: dùng remainingQuantity của lần cuối cùng theo contractItemId
          // source.id ở đây chính là contractItemId
          const displayContractQty = isFirstProgress
            ? (source.quantity ?? 0)
            : (lastRemainingMap[source.id] ?? source.quantity ?? 0);

          return {
            id: source.id,
            contractItemId: source.id,
            itemCode: source.materialCode || '',
            itemName: source.materialName,
            unit: source.unit || '',
            unitPrice: source.price,
            // contractQuantity hiển thị đúng theo lần 1 / lần 2+
            contractQuantity: displayContractQty,
            contractAmount: displayContractQty * (source.price ?? 0),
            executedQuantity: source.executedQuantity ?? 0,
            // remainingQuantity = chính là displayContractQty vì người dùng chưa nhập gì
            remainingQuantity: displayContractQty,
            currentExecutedQuantity: 0,
            currentExecutedAmount: 0,
          };
        });

        form.reset({
          ...(ContractProgressFormDefault as ContractProgressFormValues),
          id: `progress-${Date.now()}`,
          contractProgressItems: items,
          isHasValue: detail?.isHasValue || false,
          isHasMaterial: detail?.isHasMaterial || false,
          contractPaymentId: '',
          executedAmount: 0,
        });
      } catch {
        toast.error('Không lấy được danh sách vật tư');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [
    open,
    isEdit,
    progress?.id,
    progressIndex,
    contractId,
    form,
    onOpenChange,
  ]);

  const watchedPaymentId = form.watch('contractPaymentId');
  const watchedExecutedAmount = form.watch('executedAmount');

  const invoiceInfo = useMemo(() => {
    if (!watchedPaymentId || payments.length === 0) {
      return null;
    }

    const selectedPayment = payments.find((p) => p.id === watchedPaymentId);
    if (!selectedPayment) return null;

    const invoiceAmount = selectedPayment.amount ?? 0;

    const otherProgressesAmount = allProgresses
      .filter(
        (p) =>
          p.contractPaymentId === watchedPaymentId &&
          (!isEdit || p.id !== progress?.id)
      )
      .reduce((sum, p) => sum + (p.executedAmount ?? 0), 0);

    const remainingInvoiceAmount = Math.max(
      0,
      invoiceAmount - otherProgressesAmount
    );

    return {
      invoiceAmount,
      otherProgressesAmount,
      remainingInvoiceAmount,
      numberInvoice: selectedPayment.invoice?.numberInvoice || '',
    };
  }, [watchedPaymentId, payments, allProgresses, isEdit, progress?.id]);

  const isOverRemaining = useMemo(() => {
    if (!invoiceInfo) return false;
    const amount = Number(watchedExecutedAmount) || 0;
    return amount > invoiceInfo.remainingInvoiceAmount;
  }, [invoiceInfo, watchedExecutedAmount]);

  const onSubmit = async (data: ContractProgressFormValues) => {
    if (data.contractPaymentId) {
      const selectedPayment = payments.find(
        (p) => p.id === data.contractPaymentId
      );
      if (selectedPayment) {
        const invoiceAmount = selectedPayment.amount ?? 0;
        const otherProgressesAmount = allProgresses
          .filter(
            (p) =>
              p.contractPaymentId === data.contractPaymentId &&
              (!isEdit || p.id !== progress?.id)
          )
          .reduce((sum, p) => sum + (p.executedAmount ?? 0), 0);
        const remainingInvoiceAmount = Math.max(
          0,
          invoiceAmount - otherProgressesAmount
        );

        if (Number(data.executedAmount || 0) > remainingInvoiceAmount) {
          toast.error(
            `Số tiền thực hiện vượt quá số tiền còn lại của hóa đơn (tối đa còn lại: ${format.number(remainingInvoiceAmount)} đ)`
          );
          return;
        }
      }
    }

    // Kiểm tra lần N+1 bị ảnh hưởng trước khi submit
    if (data.isHasMaterial !== false && hasNextProgress) {
      const violatingItems = data.contractProgressItems.filter((item) => {
        const nextQty = nextProgressItemMap[item.contractItemId] ?? 0;
        return nextQty > 0 && item.currentExecutedQuantity < nextQty;
      });

      if (violatingItems.length > 0) {
        const names = violatingItems.map((i) => i.itemName).join(', ');
        toast.error(
          `Không thể chỉnh sửa vì khối lượng lần thực hiện sau bị thiếu hụt (${names}), vui lòng sửa hợp lý`
        );
        return;
      }
    }

    if (isEdit) {
      try {
        const payload: UpdateContractProgressWithItemsRequest = {
          contractId,
          id: data.id,
          paymentScheduleId: data.paymentScheduleId || null,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          contractProgressItems:
            data.isHasMaterial === false
              ? []
              : data.contractProgressItems.map((item) => ({
                  id: item.id,
                  contractItemId: item.contractItemId,
                  executedQuantity: item.currentExecutedQuantity,
                })),
          contractPaymentId: data.contractPaymentId || null,
          executedAmount: Number(data.executedAmount) || 0,
        };

        const res =
          await contractProgressService.updateContractProgressWithItems(
            payload
          );
        toast.success(
          res?.message || 'Cập nhật thời gian thực hiện thành công'
        );
        onSaved('edit');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error?.message
            : 'Cập nhật thời gian thực hiện không thành công'
        );
      }
      return;
    }

    try {
      const payload: CreateContractProgressWithItemsRequest = {
        contractId,
        paymentScheduleId: data.paymentScheduleId || null,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        contractProgressItems:
          data.isHasMaterial === false
            ? []
            : data.contractProgressItems
                .filter((item) => item.currentExecutedQuantity > 0)
                .map((item) => ({
                  contractItemId: item.contractItemId,
                  executedQuantity: item.currentExecutedQuantity,
                })),
        contractPaymentId: data.contractPaymentId || null,
        executedAmount: Number(data.executedAmount) || 0,
      };

      const res =
        await contractProgressService.createContractProgressWithItems(payload);
      toast.success(res?.message || 'Thêm mới thời gian thực hiện thành công');
      onSaved('create');
      form.reset(ContractProgressFormDefault as ContractProgressFormValues);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error?.message
          : 'Thêm mới thời gian thực hiện không thành công'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl! sm:max-w-6xl! max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? 'Chỉnh sửa thời gian thực hiện'
              : 'Thêm mới thời gian thực hiện'}
          </DialogTitle>
          <DialogDescription>
            {loadingItems
              ? 'Đang tải thông tin...'
              : 'Nhập thông tin hóa đơn và khối lượng thực hiện'}
          </DialogDescription>
        </DialogHeader>

        <div className='overflow-y-auto flex-1 px-1'>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormSelect
                control={form.control}
                name='contractPaymentId'
                label='Số hóa đơn thực hiện'
                placeholder='Chọn số hóa đơn'
                options={invoices}
              />
              <FormDate
                control={form.control}
                name='periodStart'
                label='Từ ngày'
                placeholder='Chọn ngày thực hiện'
              />
              <FormDate
                control={form.control}
                name='periodEnd'
                label='Đến ngày'
                placeholder='Chọn ngày thực hiện'
                minDate={watchedPeriodStart || null}
              />
              <div className='flex flex-col gap-1.5'>
                <FormNumber
                  control={form.control}
                  name='executedAmount'
                  label='Số tiền thực hiện (đ)'
                  placeholder='Nhập số tiền thực hiện'
                  className={
                    isOverRemaining
                      ? 'border-destructive focus-within:ring-destructive'
                      : ''
                  }
                />
                {isOverRemaining && (
                  <p className='text-xs text-destructive font-medium'>
                    Số tiền thực hiện không được vượt quá số tiền còn lại của
                    hóa đơn (
                    {format.number(invoiceInfo?.remainingInvoiceAmount || 0)} đ)
                  </p>
                )}
              </div>
            </div>

            {invoiceInfo && (
              <div className='p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2 backdrop-blur-xs'>
                <h5 className='font-semibold text-blue-800 dark:text-blue-300 text-sm flex items-center gap-1.5'>
                  <BanknoteIcon className='size-4 text-blue-600 dark:text-blue-400' />
                  Thông tin thanh toán hóa đơn: {invoiceInfo.numberInvoice}
                </h5>
                <div className='grid grid-cols-3 gap-4 text-xs sm:text-sm'>
                  <div className='p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-xs'>
                    <span className='text-muted-foreground block text-[11px] font-medium uppercase tracking-wider'>
                      Giá trị hóa đơn gốc
                    </span>
                    <span className='font-bold text-slate-900 dark:text-slate-100'>
                      {format.number(invoiceInfo.invoiceAmount)} đ
                    </span>
                  </div>
                  <div className='p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-xs'>
                    <span className='text-muted-foreground block text-[11px] font-medium uppercase tracking-wider'>
                      Tổng đã thực hiện trước đó
                    </span>
                    <span className='font-bold text-amber-600 dark:text-amber-400'>
                      {format.number(invoiceInfo.otherProgressesAmount)} đ
                    </span>
                  </div>
                  <div className='p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-lg shadow-xs'>
                    <span className='text-blue-600 dark:text-blue-400 block text-[11px] font-semibold uppercase tracking-wider'>
                      Giá trị tối đa còn lại
                    </span>
                    <span className='font-extrabold text-blue-700 dark:text-blue-300'>
                      {format.number(invoiceInfo.remainingInvoiceAmount)} đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {fields && fields.length > 0 && (
              <div>
                <h4 className='font-semibold mb-4'>
                  Danh sách vật tư, tài sản
                </h4>
                {loadingItems ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    Đang tải danh sách vật tư...
                  </div>
                ) : (
                  <div className='overflow-x-auto -mx-1'>
                    <Table className='w-full'>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã vật tư, tài sản</TableHead>
                          <TableHead>Tên vật tư, tài sản</TableHead>
                          <TableHead>Khối lượng hợp đồng</TableHead>
                          <TableHead>Khối lượng thực hiện</TableHead>
                          <TableHead>Khối lượng chưa thực hiện</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields?.map((field, index) => {
                          const currentItem = watchedItems?.[index];
                          const currentQty =
                            Number(currentItem?.currentExecutedQuantity) || 0;
                          // maxQty = remainingQuantity đã được tính đúng lần 1/lần 2+ trong mapApiContractItemToUi
                          const maxQty = Number(field.remainingQuantity) || 0;
                          // nextQty = executedQuantity của lần N+1 cho vật tư này (nếu có)
                          const nextQty =
                            nextProgressItemMap[field.contractItemId] ?? 0;

                          const isOverMax = currentQty > maxQty;
                          // Cảnh báo nếu nhập thấp hơn lần N+1 đã dùng
                          const isUnderNext =
                            hasNextProgress &&
                            nextQty > 0 &&
                            currentQty < nextQty;
                          const hasError = isOverMax || isUnderNext;

                          const unexecuted = hasError
                            ? null
                            : maxQty - currentQty;

                          return (
                            <TableRow key={field.id}>
                              <TableCell>{field.itemCode}</TableCell>
                              <TableCell>{field.itemName}</TableCell>
                              {/* Khối lượng HĐ: contractQuantity đã được map đúng lần 1/2+ */}
                              <TableCell>
                                {format.number(field.contractQuantity)}{' '}
                                {field.unit}
                              </TableCell>
                              <TableCell>
                                <div className='space-y-1'>
                                  <FormNumber
                                    control={form.control}
                                    name={`contractProgressItems.${index}.currentExecutedQuantity`}
                                    placeholder='Nhập khối lượng thực hiện'
                                    className={
                                      hasError ? 'border-destructive' : ''
                                    }
                                  />
                                  {/* Vượt quá khối lượng hợp đồng */}
                                  {isOverMax && (
                                    <p className='text-xs text-destructive'>
                                      Vượt quá khối lượng cho phép (
                                      {format.number(maxQty)})
                                    </p>
                                  )}
                                  {/* Thấp hơn lần N+1 đã dùng */}
                                  {!isOverMax && isUnderNext && (
                                    <p className='text-xs text-destructive'>
                                      Không thể chỉnh sửa vì khối lượng lần thực
                                      hiện sau bị thiếu hụt, vui lòng sửa hợp lý
                                      (tối thiểu {format.number(nextQty)})
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              {/* KL chưa thực hiện */}
                              <TableCell>
                                {hasError ? (
                                  <span className='text-destructive font-medium'>
                                    —
                                  </span>
                                ) : (
                                  format.number(unexecuted)
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex gap-2 items-center p-4 rounded-lg'>
                <span className='font-semibold'>Tổng giá trị:</span>
                <span className='text-xl font-bold text-primary'>
                  {format.number(form.watch('executedAmount') || 0)} đ
                </span>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  <XIcon className='size-4' />
                  Hủy
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={
                  loadingItems || form.formState.isSubmitting || isOverRemaining
                }
              >
                {form.formState.isSubmitting ? (
                  <Spinner className='size-4' />
                ) : (
                  <SaveIcon className='size-4' />
                )}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewProgressDialog({
  open,
  onOpenChange,
  progress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: ContractProgress | null;
}) {
  if (!progress) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[90vw]! h-auto overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Chi tiết thực hiện hợp đồng</DialogTitle>
          <DialogDescription>
            Từ {format.date(progress.periodStart)} đến{' '}
            {format.date(progress.periodEnd)}
          </DialogDescription>
        </DialogHeader>

        <div className='overflow-y-auto flex-1 space-y-4'>
          {progress.isHasValue && (
            <div className='grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg'>
              <div>
                <span className='font-semibold text-muted-foreground block text-xs'>
                  Số hóa đơn
                </span>
                <span className='font-medium'>
                  {progress.numberInvoice || '—'}
                </span>
              </div>
              <div>
                <span className='font-semibold text-muted-foreground block text-xs'>
                  Số tiền thực hiện
                </span>
                <span className='font-bold text-primary'>
                  {format.number(progress.executedAmount || 0)} đ
                </span>
              </div>
            </div>
          )}

          {progress.isHasMaterial !== false && (
            <div className='overflow-x-auto'>
              <Table className='w-full'>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã thành phần</TableHead>
                    <TableHead>Tên thành phần</TableHead>
                    <TableHead>Đơn giá (đ)</TableHead>
                    <TableHead>Khối lượng hợp đồng</TableHead> {/* ✅ thêm */}
                    <TableHead>Thành tiền hợp đồng (đ)</TableHead>{' '}
                    {/* ✅ thêm */}
                    <TableHead>Khối lượng thực hiện</TableHead>
                    <TableHead>Thành tiền thực hiện (đ)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progress.contractProgressItems
                    .filter((item) => item.currentExecutedQuantity > 0)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemCode}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{format.number(item.unitPrice)}</TableCell>
                        <TableCell>
                          {' '}
                          {/* ✅ thêm */}
                          {format.number(item.contractQuantity)} {item.unit}
                        </TableCell>
                        <TableCell>
                          {format.number(item.contractAmount)}
                        </TableCell>{' '}
                        {/* ✅ thêm */}
                        <TableCell>
                          {format.number(item.currentExecutedQuantity)}{' '}
                          {item.unit}
                        </TableCell>
                        <TableCell>
                          {format.number(item.currentExecutedAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
          <div className='flex gap-2 items-center p-4 rounded-lg'>
            <span className='font-semibold'>Tổng giá trị:</span>
            <span className='text-xl font-bold text-primary'>
              {format.number(progress.totalExecutedAmount)} đ
            </span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
