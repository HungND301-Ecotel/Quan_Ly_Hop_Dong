import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  useDataTable,
} from '@/components/data-table';
import { DataTableEvent } from '@/components/data-table/types';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { YearItemTable } from '@/features/main/finance/buy/components/progress';
import {
  getWorkInProgressColumns,
  getYearlySummaryColumns,
} from '@/features/main/finance/buy/components/progress/columns';
import { format } from '@/lib/format';
import { contractProgressService } from '@/services/contract-progress';
import {
  YearlySummary,
  YearlySummaryItem,
} from '@/services/contract-progress/type';
import {
  CalculatorIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  TableIcon,
} from 'lucide-react';
import { useState } from 'react';

type SummarySectionProps = {
  contractId: string;
  contractValue: number;
};

export function SummarySection({
  contractId,
  contractValue,
}: SummarySectionProps) {
  const [yearSummary, setYearSummary] = useState<YearlySummary>();

  const { getYearlySummary, getWorkInProgress } = contractProgressService;

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
      return detail?.items || [];
    },
    columns: getWorkInProgressColumns(),
    keys: ['work-in-progress', contractId],
  });

  return (
    <div className='space-y-8'>
      <section className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
          <TableIcon className='size-5' />
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
                    <CalculatorIcon className='size-5' />
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
                    <CalculatorIcon className='size-5' />
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

      <section className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold text-slate-700'>
          <TableIcon className='size-5' />
          <h3>Khối lượng giá trị dở dang</h3>
        </div>

        <DataTable dataTable={workInProgressTable}>
          <DataTableContent />

          <DataTableFooter>
            <DataTablePagination />
          </DataTableFooter>
        </DataTable>
      </section>
    </div>
  );
}
