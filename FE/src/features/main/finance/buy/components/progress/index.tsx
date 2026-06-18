import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  useDataTable,
} from '@/components/data-table';
import { DataTableEvent } from '@/components/data-table/types';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { format } from '@/lib/format';
import { contractProgressService } from '@/services/contract-progress';
import {
  ContractItem,
  ContractProgressDetail,
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
  HistoryIcon,
  PlusIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getContractItemColumns,
  getContractProgressColumns,
  getWorkInProgressColumns,
  getYearlySummaryColumns,
} from './columns';
import {
  ContractProgressBatchDefault,
  ContractProgressBatchFormValues,
  ContractProgressBatchSchema,
  ContractProgressFormItem,
  ProgressItemDefault,
  ProgressItemFormValues,
  ProgressItemSchema,
} from './schema';

type ProgressSectionProps = {
  contractId: string;
  contractValue: number;
};

export function ProgressSection({
  contractId,
  contractValue,
}: ProgressSectionProps) {
  const { getContractProgressDetail, getYearlySummary, getWorkInProgress } =
    contractProgressService;

  const [progressDetail, setProgressDetail] =
    useState<ContractProgressDetail>();
  const [yearSummary, setYearSummary] = useState<YearlySummary>();
  const [workInProgress, setWorkInProgress] = useState<WorkInProgress>();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<ContractProgressBatchFormValues>({
    resolver: zodResolver(ContractProgressBatchSchema),
    defaultValues: ContractProgressBatchDefault,
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const service = useCallback(async () => {
    const detail = await getContractProgressDetail(contractId);
    console.log(detail);
    setProgressDetail(detail);
    return (detail?.contractProgresses || []).map((item) => ({
      contractProgressId: item.id,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      progressTotal: item.progressTotal,
    }));
  }, [contractId, getContractProgressDetail]);

  const onEdit = (index: number) => {
    setEditingIndex(index);
  };

  const onCancel = () => {
    setEditingIndex(null);
    form.reset({
      contractId,
      items: progressDetail?.contractProgresses.map((item) => ({
        contractProgressId: item.id,
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
        progressTotal: item.progressTotal,
      })),
    });
  };

  const onSave = async (index: number) => {
    try {
      // Trigger validation for the specific row or full form if needed
      const isValid = await form.trigger(`items.${index}`);
      if (!isValid) return;

      const items = form.getValues('items').map((item) => ({
        id: item.contractProgressId,
        periodStart: item.periodStart,
        periodEnd: item.periodEnd,
        progressTotal: item.progressTotal,
      }));
      const data = {
        contractId,
        items,
      };

      await api.put(API.CONTRACT_PROGRESS.BATCH_UPDATE_PROGRESS, data);
      toast.success('Lưu thông tin thành công');
      setEditingIndex(null);
      progressTable.refresh();
      // Force refresh detail to update form via effect
      const detail = await getContractProgressDetail(contractId);
      setProgressDetail(detail);
    } catch {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  const onDelete = async (index: number) => {
    try {
      const currentItems = form.getValues('items');
      const newItems = currentItems
        .filter((_, i) => i !== index)
        .map((item) => ({
          id: item.contractProgressId,
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          progressTotal: item.progressTotal,
        }));
      const data = {
        contractId,
        items: newItems,
      };

      await api.put(API.CONTRACT_PROGRESS.BATCH_UPDATE_PROGRESS, data);
      toast.success('Xoá thành công');
      setEditingIndex(null);
      progressTable.refresh();
      const detail = await getContractProgressDetail(contractId);
      setProgressDetail(detail);
    } catch {
      toast.error('Lỗi khi xoá');
    }
  };

  const columns = useMemo(() => getContractProgressColumns(), []);

  const progressTable = useDataTable<ContractProgressFormItem>({
    keys: ['contract-progress', 'contract', contractId],
    service,
    columns: columns as ColumnDef<ContractProgressFormItem>[],
    form: form as unknown as UseFormReturn,
    meta: {
      editingIndex,
      onEdit,
      onCancel,
      onSave,
      onDelete,
      form,
    },
    data: fields,
  });

  useEffect(() => {
    if (progressDetail) {
      form.reset({
        contractId,
        items: progressDetail.contractProgresses.map((item) => ({
          contractProgressId: item.id,
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          progressTotal: item.progressTotal,
        })),
      });
    }
  }, [contractId, progressDetail, form]);

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

  return (
    <div className='space-y-8'>
      <section className='space-y-3'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
            <ActivityIcon className='size-5' />
            <h3>Tình hình thực hiện hợp đồng</h3>
          </div>
        </div>
        <form id='contract-progress-form'>
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
                      <ItemTitle>
                        {format.date(progressDetail.toDate)}
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
                        {format.number(progressDetail.total)}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                </>
              )}
            </DataTableHeader>

            <DataTableContent
              onExpand={({ row }: DataTableEvent<ContractProgressFormItem>) => {
                if (!row) return null;
                return (
                  <ProgressItemTable
                    contractId={contractId}
                    contractProgressId={
                      row.original.contractProgressId as string
                    }
                    callback={() => {
                      progressTable.refresh();
                      yearSummaryTable.refresh();
                      workInProgressTable.refresh();
                    }}
                  />
                );
              }}
            />

            <Button
              onClick={() => {
                append({
                  periodStart: '',
                  periodEnd: '',
                });
                setEditingIndex(fields.length);
              }}
              type='button'
              variant='default'
              size={'lg'}
              className='w-full shadow'
              disabled={editingIndex !== null}
            >
              <PlusIcon className='size-4' />
              Thêm mới thời gian thực hiện
            </Button>

            <DataTableFooter>
              <DataTablePagination />
            </DataTableFooter>
          </DataTable>
        </form>
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
                    <ItemDescription>Thành tiền thực hiện</ItemDescription>
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

      {/* <section>
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <BadgeAlert className='size-5' />
          <h3>Kiểm điểm, thanh lý hợp đồng</h3>
        </div>
      </section> */}
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

function ProgressItemTable({
  contractId,
  contractProgressId,
  callback,
}: {
  contractId: string;
  contractProgressId: string;
  callback: () => void | Promise<void>;
}) {
  const { getContractProgressDetail } = contractProgressService;

  const form = useForm<ProgressItemFormValues>({
    resolver: zodResolver(ProgressItemSchema),
    defaultValues: ProgressItemDefault,
    mode: 'onSubmit',
  });

  const columns = useMemo(() => getContractItemColumns(), []);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const onEdit = (index: number) => {
    setEditingIndex(index);
  };

  const onCancel = () => {
    setEditingIndex(null);
    form.reset({
      contractProgressId,
      items: progressItemTable.data?.map((item) => ({
        id: item.id,
        contractItemId: item.contractItemId,
        executedQuantity: item.executedQuantity,
      })),
    });
  };

  const onSave = async (index: number) => {
    try {
      const isValid = await form.trigger(`items.${index}`);
      if (!isValid) return;

      const formItems = form.getValues('items');
      const tableData = progressItemTable.data || [];

      const hasOverflow = tableData.some((item, i) => {
        const isFirst = item.maxExecutableQuantity === item.contractQuantity;
        const maxQty = isFirst ? item.contractQuantity : item.maxExecutableQuantity;
        const executed = Number(formItems[i]?.executedQuantity) || 0;
        return executed > maxQty;
      });

      if (hasOverflow) {
        toast.error('Vui lòng kiểm tra lại, một số vật tư vượt quá khối lượng cho phép');
        return;
      }

      const data = form.getValues();
      await api.put(API.CONTRACT_PROGRESS.UPDATE, data);
      toast.success('Lưu thông tin thành công');
      setEditingIndex(null);
      progressItemTable.refresh();
      await callback();
    } catch {
      toast.error('Lỗi khi lưu thông tin');
    }
  };

  const progressItemTable = useDataTable<ContractItem>({
    keys: ['progress-item', contractId, contractProgressId],
    service: async () => {
      const detail = await getContractProgressDetail(contractId);
      const contractProgresses = detail?.contractProgresses || [];

      const contractProgress = contractProgresses.find(
        (progress) => progress.id === contractProgressId
      );

      const contractItems = contractProgress?.contractProgressItems || [];

      return contractItems;
    },
    columns,
    form: form as unknown as UseFormReturn,
    meta: {
      editingIndex,
      onEdit,
      onCancel,
      onSave,
      form,
    },
  });

  useEffect(() => {
    if (!progressItemTable.loading) {
      form.reset({
        contractProgressId,
        items: progressItemTable.data?.map((item) => {
          return {
            id: item.id,
            contractItemId: item.contractItemId,
            executedQuantity: item.executedQuantity,
          };
        }),
      });
    }
  }, [
    form,
    contractProgressId,
    progressItemTable.data,
    progressItemTable.loading,
  ]);

  return (
    <DataTable dataTable={progressItemTable}>
      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination />
      </DataTableFooter>
    </DataTable>
  );
}
