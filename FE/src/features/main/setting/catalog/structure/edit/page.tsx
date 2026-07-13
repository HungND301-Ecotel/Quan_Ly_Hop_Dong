import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormRow } from '@/components/form/form-row';
import { FormTextArea } from '@/components/form/form-text-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import { useApi } from '@/hooks/use-api';
import { contractStructureCatalogService } from '@/services/structure/index';
import { ContractStructureCatalog } from '@/services/structure/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ContractStructureCatalogDefault,
  ContractStructureCatalogSchema,
  ContractStructureCatalogValues,
} from './schema';

export function EditContractStructureCatalogAction({
  row,
  table,
}: DataTableEvent<ContractStructureCatalog>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return contractStructureCatalogService.getContractStructureCatalogDetail(
      row.original.id
    );
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<ContractStructureCatalogValues>({
    resolver: zodResolver(ContractStructureCatalogSchema),
    defaultValues: ContractStructureCatalogDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      name: detail.data.name,
      code: detail.data.code,
      description: detail.data.description ?? '',
      isActive: detail.data.isActive ?? true,
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset(ContractStructureCatalogDefault);
    }
  }, [open, form]);

  const onSubmit = async (values: ContractStructureCatalogValues) => {
    try {
      setLoading(true);
      if (row) {
        await contractStructureCatalogService.updateContractStructureCatalog({
          id: row.original.id,
          ...values,
        });
        toast.success('Cập nhật hình thức hợp đồng thành công');
      } else {
        await contractStructureCatalogService.createContractStructureCatalog(
          values
        );
        toast.success('Tạo mới hình thức hợp đồng thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(
        row
          ? 'Lỗi khi cập nhật hình thức hợp đồng'
          : 'Lỗi khi tạo hình thức hợp đồng'
      );
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
            {row ? 'Chỉnh sửa' : 'Tạo mới'} hình thức hợp đồng
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin hình thức hợp đồng
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
                label='Mã hình thức hợp đồng'
                placeholder='Nhập mã hình thức hợp đồng'
              />
              <FormInput
                control={form.control}
                name='name'
                label='Hình thức hợp đồng'
                placeholder='Nhập hình thức hợp đồng'
              />
            </FormRow>
            <FormRow>
              <FormTextArea
                control={form.control}
                name='description'
                label='Ghi chú'
                placeholder='Nhập ghi chú'
              />
            </FormRow>
            {/* <FormRow>
              <div className='flex items-center gap-3'>
                <Switch
                  id='isActive'
                  checked={form.watch('isActive')}
                  onCheckedChange={(val) => form.setValue('isActive', val)}
                />
                <Label htmlFor='isActive'>Đang hoạt động</Label>
              </div>
            </FormRow> */}
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
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Save className='w-4 h-4' />
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
