'use client';

import { Form } from '@/components/form/form';
import {
  FormArray,
  FormArrayIndicator,
  FormArrayRemove,
} from '@/components/form/form-array';
import { FormFile } from '@/components/form/form-file';
import { FormInput } from '@/components/form/form-input';
import { FormNumber } from '@/components/form/form-number';
import { FormRow } from '@/components/form/form-row';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldLabel } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from '@/lib/format';
import { Contract } from '@/services/contract/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const progressItemSchema = z.object({
  time: z.string().min(1, 'Vui lòng nhập thời gian'),
  quantity: z.number().min(0, 'Số lượng không được âm'),
  price: z.number().min(0, 'Đơn giá không được âm'),
});

const paymentItemSchema = z.object({
  period: z.string().min(1, 'Vui lòng nhập kỳ thanh toán'),
  value: z.number().min(0, 'Giá trị không được âm'),
});

const financeSchema = z.object({
  progress: z.array(progressItemSchema),
  payments: z.array(paymentItemSchema),
  acceptanceMinute: z.any().optional(),
  invoice: z.any().optional(),
  taxDocument: z.any().optional(),
});

type FinanceFormValues = z.infer<typeof financeSchema>;

export type EditFinanceDialogProps = {
  contract: Contract;
};

export function EditFinanceDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      progress: [{ time: '', quantity: 0, price: 0 }],
      payments: [{ period: '', value: 0 }],
    },
  });

  const onSubmit = (data: FinanceFormValues) => {
    // TODO: Implement actual update logic
    console.log(data);
    toast.success('Cập nhật thành công');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full'>
          <PencilIcon className='size-4 text-primary' />
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className='max-w-5xl p-0 gap-0 h-[calc(100vh-4rem)] min-w-[calc(100vw-4rem)] flex flex-col overflow-hidden'
      >
        <Form
          context={form}
          onSubmit={onSubmit}
          className='flex-1 flex flex-col min-h-0'
        >
          <Tabs
            defaultValue='progress'
            className='flex-1 flex flex-col min-h-0'
          >
            <div className='px-6 pt-4 border-b bg-muted/10'>
              <TabsList className='w-full mb-4'>
                <TabsTrigger value='progress'>Tiến độ thực hiện</TabsTrigger>
                <TabsTrigger value='payment'>Thanh toán & Chứng từ</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className='flex-1 overflow-hidden'>
              <div className='p-6 space-y-8'>
                <TabsContent value='progress' className='m-0 space-y-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-slate-700'>
                      Tiến độ thực hiện theo tháng/năm
                    </h3>
                  </div>

                  <FormArray control={form.control} name='progress'>
                    {(fieldArray) => (
                      <div className='space-y-4'>
                        {fieldArray.fields.map((field, index) => (
                          <div
                            key={field.id}
                            className='group relative border p-6 rounded-xl bg-card hover:border-primary/50 transition-colors shadow-sm'
                          >
                            <FormRow className='items-start'>
                              <FormArrayIndicator index={index} />
                              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 flex-1'>
                                <FormInput
                                  control={form.control}
                                  name={`progress.${index}.time`}
                                  label='Thời gian (Tháng/Năm)'
                                  placeholder='MM/YYYY'
                                  required
                                />
                                <FormNumber
                                  control={form.control}
                                  name={`progress.${index}.quantity`}
                                  label='Số lượng'
                                  required
                                />
                                <FormNumber
                                  control={form.control}
                                  name={`progress.${index}.price`}
                                  label='Đơn giá'
                                  required
                                />
                                <ProgressAmount
                                  control={form.control}
                                  index={index}
                                />
                              </div>
                              <FormArrayRemove
                                fieldArray={fieldArray}
                                index={index}
                              />
                            </FormRow>
                          </div>
                        ))}
                        <div className='h-10' />
                        <div className='fixed bottom-26 z-50 right-6 left-6'>
                          <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            className='w-full border-dashed border-2 py-8 bg-blue-50 border-primary/50 hover:bg-blue-50 hover:border-primary transition-all rounded-xl'
                            onClick={() =>
                              fieldArray.append({
                                time: '',
                                quantity: 0,
                                price: 0,
                              })
                            }
                          >
                            <PlusIcon className='mr-2 size-5' />
                            Thêm tiến độ thực hiện
                          </Button>
                        </div>
                      </div>
                    )}
                  </FormArray>
                </TabsContent>

                <TabsContent value='payment' className='m-0 space-y-8'>
                  <section className='space-y-6 pt-6 border-t'>
                    <h3 className='text-lg font-semibold text-slate-700'>
                      Chứng từ đính kèm
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      <FormFile
                        control={form.control}
                        name='acceptanceMinute'
                        label='Biên bản nghiệm thu'
                        placeholder='Chọn file PDF hoặc Docx'
                      />
                      <FormFile
                        control={form.control}
                        name='invoice'
                        label='Hóa đơn'
                        placeholder='Chọn file PDF hoặc Docx'
                      />
                      <FormFile
                        control={form.control}
                        name='taxDocument'
                        label='Chứng từ thuế'
                        placeholder='Chọn file PDF hoặc Docx'
                      />
                    </div>
                  </section>

                  <section className='space-y-6'>
                    <h3 className='text-lg font-semibold text-slate-700'>
                      Tiến độ trả tiền thanh toán
                    </h3>
                    <FormArray control={form.control} name='payments'>
                      {(fieldArray) => (
                        <div className='space-y-4'>
                          {fieldArray.fields.map((field, index) => (
                            <div
                              key={field.id}
                              className='group relative border p-6 rounded-xl bg-card hover:border-primary/50 transition-colors shadow-sm'
                            >
                              <FormRow className='items-start'>
                                <FormArrayIndicator index={index} />
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 flex-1'>
                                  <FormInput
                                    control={form.control}
                                    name={`payments.${index}.period`}
                                    label='Kỳ thanh toán'
                                    placeholder='Ví dụ: Đợt 1, Tạm ứng...'
                                    required
                                  />
                                  <FormNumber
                                    control={form.control}
                                    name={`payments.${index}.value`}
                                    label='Giá trị thanh toán'
                                    required
                                  />
                                </div>
                                <FormArrayRemove
                                  fieldArray={fieldArray}
                                  index={index}
                                />
                              </FormRow>
                            </div>
                          ))}

                          <div className='h-10' />
                          <div className='fixed bottom-26 z-50 right-6 left-6'>
                            <Button
                              type='button'
                              variant='outline'
                              size='lg'
                              className='w-full border-dashed border-2 py-8 hover:bg-blue-50 hover:border-primary transition-all rounded-xl'
                              onClick={() =>
                                fieldArray.append({ period: '', value: 0 })
                              }
                            >
                              <PlusIcon className='mr-2 size-5' />
                              Thêm kỳ thanh toán
                            </Button>
                          </div>
                        </div>
                      )}
                    </FormArray>
                  </section>
                </TabsContent>
              </div>
            </ScrollArea>

            <DialogFooter className='p-6 border-t bg-muted/20'>
              <DialogClose asChild>
                <Button variant='outline' size='lg' type='button'>
                  <XIcon />
                  Hủy bỏ
                </Button>
              </DialogClose>
              <Button type='submit' size='lg'>
                <SaveIcon />
                Xác nhận
              </Button>
            </DialogFooter>
          </Tabs>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProgressAmount({
  control,
  index,
}: {
  control: Control<FinanceFormValues>;
  index: number;
}) {
  const quantity =
    useWatch({ control, name: `progress.${index}.quantity` }) || 0;
  const price = useWatch({ control, name: `progress.${index}.price` }) || 0;
  const amount = quantity * price;

  return (
    <div className='flex flex-col gap-3'>
      <FieldLabel>Thành tiền</FieldLabel>
      <div className='h-10 flex items-center px-4 rounded-lg bg-primary/5 border border-primary/20 text-primary font-black'>
        {format.number(amount)}
        <span className='ml-1 text-[10px] font-bold opacity-70'>VNĐ</span>
      </div>
    </div>
  );
}
