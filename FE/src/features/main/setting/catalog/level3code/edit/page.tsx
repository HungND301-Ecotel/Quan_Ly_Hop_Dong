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
import { level3CodeService } from '@/services/level3code';
import { Level3Code } from '@/services/level3code/type';
import { level1CodeService } from '@/services/level1code';
import { level2CodeService } from '@/services/level2code';
import { Level2CodeLookup } from '@/services/level2code/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, PlusIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Level3CodeDefault,
  Level3CodeSchema,
  Level3CodeValues,
} from './schema';
import { FormTextArea } from '@/components/form/form-text-area';

export function EditLevel3CodeAction({
  row,
  table,
}: DataTableEvent<Level3Code>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách mã cấp 1 cho FormSelect
  const level1Codes = useApi({
    service: level1CodeService.getLevel1CodeList,
  });

  const onRefresh = () => {
    table.options.meta?.refresh();
  };

  const detailService = useCallback(() => {
    if (!row || !open) return;
    return level3CodeService.getLevel3CodeDetail(row.original.id);
  }, [row, open]);

  const detail = useApi({ service: detailService });

  const form = useForm<Level3CodeValues>({
    resolver: zodResolver(Level3CodeSchema),
    defaultValues: Level3CodeDefault,
    mode: 'onSubmit',
  });

  const [level2Codes, setLevel2Codes] = useState<Level2CodeLookup[]>([]);
  const [isLevel2Loading, setIsLevel2Loading] = useState(false);

  const watchedLevel1CodeId = form.watch('level1CodeId');
  const watchedLevel2CodeId = form.watch('level2CodeId');
  const watchedSuffix = form.watch('suffix');

  // Load Level 2 codes when Level 1 changes
  useEffect(() => {
    if (!watchedLevel1CodeId) {
      setLevel2Codes([]);
      form.setValue('level2CodeId', '');
      return;
    }
    setIsLevel2Loading(true);
    level2CodeService
      .getLevel2CodeByLevel1(watchedLevel1CodeId)
      .then((data) => {
        setLevel2Codes(data || []);
      })
      .finally(() => {
        setIsLevel2Loading(false);
      });
  }, [watchedLevel1CodeId, form]);

  // Parse existing code on edit mode when detail data and lists are loaded
  useEffect(() => {
    const detailData = detail.data;
    if (!detailData || level1Codes.loading || level2Codes.length === 0) return;

    const lvl1 = level1Codes.data?.find(
      (c) => c.id === detailData.level1CodeId
    );
    if (!lvl1) return;

    const fullCode = detailData.code;
    const remaining = fullCode.startsWith(lvl1.code)
      ? fullCode.slice(lvl1.code.length)
      : fullCode;

    const matchingLvl2 = level2Codes.find((c) => remaining.startsWith(c.code));
    if (matchingLvl2) {
      const suffix = remaining.slice(matchingLvl2.code.length);
      form.setValue('level2CodeId', matchingLvl2.id);
      form.setValue('suffix', suffix);
    } else {
      form.setValue('suffix', remaining);
    }
  }, [detail.data, level2Codes, level1Codes.data, form]);

  // Calculate the final computed code dynamically
  useEffect(() => {
    const lvl1 = level1Codes.data?.find((c) => c.id === watchedLevel1CodeId);
    const lvl2 = level2Codes.find((c) => c.id === watchedLevel2CodeId);
    const finalCode = `${lvl1?.code || ''}${lvl2?.code || ''}${watchedSuffix || ''}`;
    form.setValue('code', finalCode);
  }, [
    watchedLevel1CodeId,
    watchedLevel2CodeId,
    watchedSuffix,
    level1Codes.data,
    level2Codes,
    form,
  ]);

  useEffect(() => {
    if (!detail.data) return;
    form.reset({
      code: detail.data.code,
      description: detail.data.description,
      level1CodeId: detail.data.level1CodeId,
      level2CodeId: '',
      suffix: '',
    });
  }, [detail.data, form]);

  useEffect(() => {
    if (!open) {
      form.reset(Level3CodeDefault);
      setLevel2Codes([]);
    }
  }, [open, form]);

  const onSubmit = async (values: Level3CodeValues) => {
    try {
      setLoading(true);
      if (row) {
        await level3CodeService.updateLevel3Code({
          id: row.original.id,
          code: values.code,
          description: values.description,
          level1CodeId: values.level1CodeId,
          level2CodeId: values.level2CodeId || undefined,
        });
        toast.success('Cập nhật mã cấp 3 thành công');
      } else {
        await level3CodeService.createLevel3Code({
          code: values.code,
          description: values.description,
          level1CodeId: values.level1CodeId,
          level2CodeId: values.level2CodeId || undefined,
        });
        toast.success('Tạo mới mã cấp 3 thành công');
      }
      setOpen(false);
      onRefresh();
    } catch {
      toast.error(row ? 'Lỗi khi cập nhật mã cấp 3' : 'Lỗi khi tạo mã cấp 3');
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
            {row ? 'Chỉnh sửa' : 'Tạo mới'} mã cấp 3
          </DialogTitle>
          <DialogDescription>
            {row ? 'Chỉnh sửa' : 'Tạo mới'} thông tin mã cấp 3
          </DialogDescription>
        </DialogHeader>

        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex flex-col overflow-hidden'
        >
          <div className='flex-1 p-6 flex flex-col gap-6'>
            <FormRow>
              <FormSelect
                control={form.control}
                name='level1CodeId'
                label='Mã cấp 1'
                placeholder='Chọn mã cấp 1'
                options={
                  level1Codes.data?.map((c) => ({
                    label: `${c.code} - ${c.description}`,
                    value: c.id,
                  })) ?? []
                }
              />
              <FormSelect
                control={form.control}
                name='level2CodeId'
                label='Mã cấp 2'
                placeholder={
                  !watchedLevel1CodeId
                    ? 'Chọn mã cấp 1 trước'
                    : isLevel2Loading
                      ? 'Đang tải...'
                      : 'Chọn mã cấp 2'
                }
                disabled={!watchedLevel1CodeId || isLevel2Loading}
                options={level2Codes.map((c) => ({
                  label: `${c.code}`,
                  value: c.id,
                }))}
              />
            </FormRow>
            <FormRow>
              <FormInput
                control={form.control}
                name='suffix'
                label='Mã số'
                placeholder='Nhập mã số, ví dụ: 01'
              />
              <FormInput
                control={form.control}
                name='code'
                label='Mã cấp 3'
                readOnly
                className='opacity-50 cursor-not-allowed select-none bg-muted'
                placeholder='Mã cấp 3 tự sinh'
              />
            </FormRow>
            <FormTextArea
              control={form.control}
              name='description'
              label='Ghi chú'
              placeholder='Nhập ghi chú'
              rows={3}
            />
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
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
