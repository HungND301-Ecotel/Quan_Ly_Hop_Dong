import { Form } from '@/components/form/form';
import { FormFile } from '@/components/form/form-file';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { fileService } from '@/services/file';
import { userService } from '@/services/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const signatureSchema = z.object({
  SignatureFile: z
    .file({
      error: 'Hợp đồng ký kết không được để trống',
    })
    .optional(),
  Pin: z.string().optional(),
  SavePin: z.boolean().optional(),
});

type SignatureFormValues = z.infer<typeof signatureSchema>;

interface SignatureFormProps {
  userId: string;
  signatureType: { id: number; name: string };
  existingSignature?: {
    id: string;
    signatureFile: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SignatureForm({
  userId,
  signatureType,
  existingSignature,
  onSuccess,
  onCancel,
}: SignatureFormProps) {
  const [preview, setPreview] = useState<string | null>(
    existingSignature?.signatureFile || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!existingSignature);

  useEffect(() => {
    if (!existingSignature) return;
    fileService
      .getFile(existingSignature.signatureFile, false)
      .then((file) => {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      })
      .finally(() => setLoading(false));
  }, [existingSignature]);

  const form = useForm<SignatureFormValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      SavePin: false,
    },
  });

  const file = form.watch('SignatureFile');

  useEffect(() => {
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const onSubmit = async (values: SignatureFormValues) => {
    // Validate that we have a file (either new or existing)
    if (!values.SignatureFile && !existingSignature) {
      toast.error('Vui lòng chọn tệp chữ ký');
      return;
    }

    try {
      setSubmitting(true);

      // Only send SignatureFile if user selected a new file
      const payload: {
        SignatureType: number;
        Pin: string;
        SavePin: boolean;
        SignatureFile?: File;
      } = {
        SignatureType: signatureType.id,
        Pin: values.Pin || '',
        SavePin: !!values.SavePin,
      };

      if (values.SignatureFile) {
        payload.SignatureFile = values.SignatureFile;
      }

      await userService.createSignature(userId, payload);
      toast.success('Cập nhật chữ ký thành công');
      onSuccess();
    } catch {
      toast.error('Lỗi khi cập nhật chữ ký');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<SignatureFormValues>
      context={form}
      onSubmit={onSubmit}
      className='space-y-4 pt-4'
    >
      <div className='space-y-4'>
        {!preview ? (
          <FormFile<SignatureFormValues>
            name='SignatureFile'
            control={form.control}
            label='Tệp chữ ký (Ảnh)'
            accept='.png,.jpg,.jpeg'
            placeholder='Tải lên ảnh chữ ký'
            required
          />
        ) : (
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium'>Xem trước chữ ký</label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  form.resetField('SignatureFile');
                  setPreview(null);
                }}
                className='h-8 text-destructive hover:text-destructive'
              >
                <X className='size-4 mr-1' />
                Gỡ bỏ
              </Button>
            </div>
            <div className='relative aspect-video rounded-xl border-2 border-dashed bg-muted overflow-hidden flex items-center justify-center p-4 group'>
              {loading ? (
                <Spinner />
              ) : (
                <img
                  src={preview}
                  alt='Preview'
                  className='max-w-full max-h-full object-contain'
                />
              )}
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                <p className='text-white text-xs font-medium flex items-center gap-1.5'>
                  <ImageIcon className='size-4' />
                  {file?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className='pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button type='submit' disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Xác nhận'}
        </Button>
      </DialogFooter>
    </Form>
  );
}
