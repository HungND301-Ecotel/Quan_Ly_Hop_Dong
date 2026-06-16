import { DataTableEvent } from '@/components/data-table/types';
import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormNumber } from '@/components/form/form-number';
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
import { materialService } from '@/services/material';
import { Material } from '@/services/material/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  MaterialInformationDefault,
  MaterialInformationValues,
  MaterialSchema,
} from './schema';
import { FormSelect } from '@/components/form/form-select';
import { unitOfMeasureService } from '@/services/unit';

export function EditMaterialAction({ row, table }: DataTableEvent<Material>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return materialService.getMaterialDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const unitOfMeasures = useApi({
    service: unitOfMeasureService.getUnitOfMeasureList,
  });


  const form = useForm<MaterialInformationValues>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: MaterialInformationDefault,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      name: detail.data.name,
      materialCode: detail.data.materialCode,
      unitOfMeasureId: detail.data.unitOfMeasureId || '',
      price: detail.data.price ?? undefined,
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: MaterialInformationValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        unitOfMeasureId: values.unitOfMeasureId || null,
        price: values.price === undefined || values.price === null || String(values.price) === '' ? null : Number(values.price),
      };
      if (row) {
        await materialService.updateMaterial({
          id: row.original.id,
          ...payload,
        });
        toast.success('Cập nhật thông tin thành phần hợp đồng thành công');
      } else {
        await materialService.createMaterial(payload);
        toast.success('Tạo mới thành phần hợp đồng thành công');
      }

      setOpen(false);
      onRefresh();
      table.options.meta?.refresh?.();
    } catch {
      toast.error('Lỗi khi cập nhật thông tin thành phần hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant={'ghost'} size={'icon'}>
            <EditIcon />
          </Button>
        ) : (
          <Button variant={'default'} size={'lg'}>
            <PlusIcon />
            <span>Tạo mới</span>
          </Button>
        )}
      </DialogTrigger>
 
      <DialogContent className='flex flex-col gap-0 w-full md:min-w-2xl lg:min-w-4xl px-0 overflow-hidden'>
        <DialogHeader className='gap-1 p-6 pt-0 border-b'>
          <DialogTitle className='text-2xl font-semibold'>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thành phần hợp đồng
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin thành phần hợp đồng
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
                name='materialCode'
                label='Mã thành phần hợp đồng'
                placeholder='Nhập mã thành phần hợp đồng'
              />
              <FormInput
                control={form.control}
                name='name'
                label='Tên thành phần hợp đồng'
                placeholder='Nhập tên thành phần hợp đồng'
              />
            </FormRow>
 
            <FormRow>
              <FormSelect
                control={form.control}
                name='unitOfMeasureId'
                label='Đơn vị tính'
                placeholder='Chọn đơn vị tính'
                options={[
                  { label: 'Không chọn', value: '' },
                  ...(unitOfMeasures.data?.map((u) => ({
                    label: u.name,
                    value: u.id,
                  })) ?? [])
                ]}
              />
              <FormNumber
                control={form.control}
                name='price'
                label='Đơn giá'
                placeholder='Nhập đơn giá'
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
