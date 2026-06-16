import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormRow } from '@/components/form/form-row';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApi } from '@/hooks/use-api';
import { level1CodeService } from '@/services/level1code';
import { Level1Code } from '@/services/level1code/type';
import { contractTypeService } from '@/services/contract-type';
import { ContractRegisterService } from '@/services/contract-register';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Level1CodeDefault,
  Level1CodeSchema,
  Level1CodeValues,
} from './schema';

export function EditLevel1CodeAction({ row, table }: DataTableEvent<Level1Code>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách loại hợp đồng cho FormSelect
  const contractTypes = useApi({
    service: contractTypeService.getContractTypeList,
  });

  // ✅ Lấy danh sách sổ theo dõi cho FormSelect
  const contractRegisters = useApi({
    service: ContractRegisterService.getContractRegisterList,
  });

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return level1CodeService.getLevel1CodeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<Level1CodeValues>({
    resolver: zodResolver(Level1CodeSchema),
    defaultValues: Level1CodeDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      code: detail.data.code,
      description: detail.data.description,
      contractTypeId: detail.data.contractTypeId,
      contractRegisterId: detail.data.contractRegisterId ?? '',
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset(Level1CodeDefault);
    }
  }, [open, form]);

  const onSubmit = async (values: Level1CodeValues) => {
    try {
      setLoading(true);
      const submitValues = {
        ...values,
        contractRegisterId: values.contractRegisterId || null,
      };
      if (row) {
        await level1CodeService.updateLevel1Code({
          id: row.original.id,
          ...submitValues,
        } as any);
        toast.success('Cập nhật mã cấp 1 thành công');
      } else {
        await level1CodeService.createLevel1Code(submitValues as any);
        toast.success('Tạo mới mã cấp 1 thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(row ? 'Lỗi khi cập nhật mã cấp 1' : 'Lỗi khi tạo mã cấp 1');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant='ghost' size='icon'>
            <EditIcon />
          </Button>
        ) : (
          <Button variant='default' size='lg'>
            <PlusIcon />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 w-full md:min-w-xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} mã cấp 1
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin mã cấp 1
          </DialogDescription>
        </DialogHeader>

        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <FormRow>
              <FormInput
                control={form.control}
                name='code'
                label='Mã cấp 1'
                placeholder='Nhập mã cấp 1'
              />
              <FormSelect
                control={form.control}
                name='contractTypeId'
                label='Loại hợp đồng'
                placeholder='Chọn loại hợp đồng'
                options={
                  contractTypes.data?.map((t) => ({
                    label: t.name,
                    value: t.id,
                  })) ?? []
                }
              />
            </FormRow>
             <FormRow>
              <FormSelect
                control={form.control}
                name='contractRegisterId'
                label='Sổ theo dõi hợp đồng'
                placeholder='Chọn sổ theo dõi'
                options={
                  contractRegisters.data?.map((r) => ({
                    label: `${r.name} - ${r.year ? `Năm ${r.year}` : ''}`,
                    value: r.id,
                  })) ?? []
                }
              />
              <FormInput
                control={form.control}
                name='description'
                label='Mô tả'
                placeholder='Nhập mô tả'
              />
            </FormRow>
          </div>

          <div className='flex justify-end items-center gap-3 p-4 px-6 pb-0 border-t'>
            <Button
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='min-w-32 bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4 mr-2' />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}