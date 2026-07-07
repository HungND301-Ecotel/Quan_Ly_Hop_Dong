import { FormDate } from '@/components/form/form-date';
import { FormNumber } from '@/components/form/form-number';
import { FormReadonly } from '@/components/form/form-readonly';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  ContractProgressBatchFormValues,
  ProgressItemFormValues,
} from '@/features/main/finance/buy/components/progress/schema';
import { format } from '@/lib/format';
import {
  ContractItem,
  ContractProgress,
  WorkInProgressItem,
  YearlySummaryItem,
} from '@/services/contract-progress/type';
import { ColumnDef } from '@tanstack/react-table';
import {
  EyeIcon,
  PenLineIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

export type ContractProgressMeta = {
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onCancel: () => void;
  onSave: (index: number) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  form: UseFormReturn<ContractProgressBatchFormValues>;
  loading?: boolean;
};

export type ContractItemMeta = {
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onCancel: () => void;
  onSave: (index: number) => Promise<void>;
  form: UseFormReturn<ProgressItemFormValues>;
};

export function getContractProgressColumns(): ColumnDef<ContractProgress>[] {
  return [
    {
      id: 'time',
      accessorFn: ({ periodStart, periodEnd }) =>
        `${format.date(periodStart)} - ${format.date(periodEnd)}`,
      header: 'Thời gian thực hiện',
      cell: ({ row, cell, table }) => {
        const meta = table.options.meta as unknown as ContractProgressMeta;
        const isEditingRaw = meta?.editingIndex === row.index;

        if (!isEditingRaw) return cell.getValue();

        return (
          <div className='flex items-center gap-2'>
            <FormDate
              control={meta.form.control}
              name={`items.${row.index}.periodStart`}
            />
            <span>~</span>
            <FormDate
              control={meta.form.control}
              name={`items.${row.index}.periodEnd`}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'progressTotal',
      header: 'Giá trị thực hiện',
      cell: ({ row }) => (
        <span className='font-bold'>
          {format.number(row.original.progressTotal || 0)}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Thao tác',
      cell: ({ row, table }) => {
        const meta = table.options.meta as unknown as ContractProgressMeta;
        const isEditingRaw = meta?.editingIndex === row.index;

        if (isEditingRaw) {
          return (
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
                onClick={meta.onCancel}
                type='button'
              >
                <XIcon className='size-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='text-primary hover:text-primary hover:bg-primary/10'
                onClick={() => meta.onSave(row.index)}
                type='button'
              >
                <SaveIcon className='size-4' />
              </Button>
            </div>
          );
        }

        return (
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => row.toggleExpanded()}
              type='button'
              disabled={meta.editingIndex !== null}
            >
              <EyeIcon className='size-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => meta.onEdit(row.index)}
              type='button'
              disabled={meta.editingIndex !== null}
            >
              <PenLineIcon className='size-4' />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive'
                  disabled={meta.editingIndex !== null}
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xoá dữ liệu này không? Hành động này
                    không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction onClick={() => meta.onDelete(row.index)}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}

export function getContractItemColumns({
  showAction = true,
}: {
  showAction?: boolean;
} = {}): ColumnDef<ContractItem>[] {
  const columns: ColumnDef<ContractItem>[] = [
    {
      accessorKey: 'materialCode',
      header: 'Mã svật tư, tài sản',
    },
    {
      accessorKey: 'materialName',
      header: 'Tên vật tư, tài sản',
    },
    {
      accessorKey: 'materialPrice',
      header: 'Đơn giá',
      cell: ({ cell }) => format.number(Number(cell.getValue() || 0)),
    },
    {
      accessorKey: 'contractQuantity',
      header: 'Khối lượng hợp đồng',
      cell: ({ cell }) => format.number(Number(cell.getValue() || 0)),
    },
    {
      id: 'contractTotalAmount',
      header: 'Thành tiền hợp đồng',
      accessorFn: ({ materialPrice, contractQuantity }) =>
        materialPrice * contractQuantity,
      cell: ({ cell }) => (
        <span className='font-bold'>
          {format.number(Number(cell.getValue() || 0))}
        </span>
      ),
    },
    {
      accessorKey: 'executedQuantity',
      header: 'Khối lượng thực hiện',
      cell: ({ table, row, cell }) => {
        const meta = table.options.meta as unknown as ContractItemMeta;
        const isEditing = meta?.editingIndex === row.index;

        if (!isEditing) return cell.getValue();

        const form = meta?.form;

        const watchedExecutedQuantity = form.watch(
          `items.${row.index}.executedQuantity`
        );
        const contractQuantity = row.original.contractQuantity;

        if (watchedExecutedQuantity > contractQuantity) {
          form.setError(`items.${row.index}.executedQuantity`, {
            type: 'manual',
            message: `Phải nhỏ hơn khối lượng hợp đồng`,
          });
        }

        return (
          <FormNumber
            control={form.control}
            name={`items.${row.index}.executedQuantity`}
            placeholder='Nhập khối lượng thực hiện'
            className='bg-background'
          />
        );
      },
    },
    {
      id: 'totalItemAmount',
      header: 'Thành tiền thực hiện',
      accessorFn: ({ materialPrice, executedQuantity }) =>
        materialPrice * executedQuantity,
      cell: ({ table, row, cell }) => {
        const meta = table.options.meta as unknown as ContractItemMeta;
        const isEditing = meta?.editingIndex === row.index;

        if (!isEditing) {
          return (
            <span className='font-bold'>
              {format.number(Number(cell.getValue()))}
            </span>
          );
        }

        return <FormReadonly value={format.number(Number(cell.getValue()))} />;
      },
    },
  ];

  if (showAction) {
    columns.push({
      id: 'action',
      header: 'Thao tác',
      cell: ({ row, table }) => {
        const meta = table.options.meta as unknown as ContractItemMeta;
        const isEditing = meta?.editingIndex === row.index;

        if (isEditing) {
          return (
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
                onClick={meta.onCancel}
                type='button'
              >
                <XIcon className='size-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='text-primary hover:text-primary hover:bg-primary/10'
                onClick={() => meta.onSave(row.index)}
                type='button'
              >
                <SaveIcon className='size-4' />
              </Button>
            </div>
          );
        }

        if (!meta?.onEdit) return null;

        return (
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => meta.onEdit(row.index)}
              type='button'
            >
              <PenLineIcon className='size-4' />
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}

export function getYearlySummaryColumns(): ColumnDef<YearlySummaryItem>[] {
  return [
    {
      id: 'year',
      header: 'Thời gian',
      accessorFn: ({ year }) => year,
    },
    {
      accessorKey: 'yearTotal',
      header: 'Giá trị thực hiện',
      cell: ({ row }) => (
        <span className='font-bold'>
          {format.number(row.original.yearTotal || 0)}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => row.toggleExpanded()}
          type='button'
        >
          <EyeIcon className='size-4' />
        </Button>
      ),
    },
  ];
}

export function getWorkInProgressColumns(): ColumnDef<WorkInProgressItem>[] {
  return [
    {
      accessorKey: 'materialCode',
      header: 'Mã vật tư, tài sản',
    },
    {
      accessorKey: 'materialName',
      header: 'Tên vật tư, tài sản',
    },
    {
      accessorKey: 'materialPrice',
      header: 'Đơn giá',
      cell: ({ cell }) => format.number(Number(cell.getValue())),
    },
    {
      accessorKey: 'contractQuantity',
      header: 'Khối lượng hợp đồng',
      cell: ({ cell }) => format.number(Number(cell.getValue())),
    },
    {
      accessorFn: ({ contractQuantity, materialPrice }) =>
        contractQuantity * materialPrice,
      header: 'Thành tiền hợp đồng',
      cell: ({ cell }) => (
        <span className='font-bold'>
          {format.number(Number(cell.getValue()))}
        </span>
      ),
    },
    {
      accessorKey: 'executedQuantity',
      header: 'Khối lượng thực hiện',
      cell: ({ cell }) => format.number(Number(cell.getValue())),
    },
    {
      accessorFn: ({ executedQuantity, materialPrice }) =>
        executedQuantity * materialPrice,
      header: 'Thành tiền thực hiện',
      cell: ({ cell }) => (
        <span className='font-bold'>
          {format.number(Number(cell.getValue()))}
        </span>
      ),
    },
    {
      id: 'unfinishedQuantity',
      header: 'Khối lượng dở dang',
      accessorFn: ({ contractQuantity, executedQuantity }) =>
        contractQuantity - executedQuantity,
      cell: ({ cell }) => format.number(Number(cell.getValue())),
    },
    {
      id: 'unfinishedValue',
      header: 'Thành tiền dở dang',
      accessorFn: ({ contractQuantity, executedQuantity, materialPrice }) =>
        (contractQuantity - executedQuantity) * materialPrice,
      cell: ({ cell }) => (
        <span className='font-bold'>
          {format.number(Number(cell.getValue()))}
        </span>
      ),
    },
  ];
}
