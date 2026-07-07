import { cn } from '@/lib/utils';
import { ComponentProps, useRef } from 'react';
import {
  Control,
  FieldErrors,
  FieldValues,
  FormProvider,
  Path,
  UseFormReturn,
} from 'react-hook-form';

export type FormProps<T extends FieldValues> = {
  context: UseFormReturn<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  /** Gọi thêm khi validate fail (ngoài việc tự scroll tới lỗi) */
  onInvalid?: (errors: FieldErrors<T>) => void;
  /** Tự động scroll + focus tới field lỗi đầu tiên khi submit fail. Mặc định: true */
  scrollToError?: boolean;
} & Omit<ComponentProps<'form'>, 'onSubmit'>;

/**
 * Tìm field đang invalid đầu tiên theo THỨ TỰ DOM (đúng thứ tự hiển thị
 * trên trang, không phải thứ tự key trong object errors), rồi scroll + focus.
 *
 * Dựa vào attribute `data-invalid="true"` mà các field component dùng chung
 * (FormInput, FormSelect, FormDate, FormNumber, FormTextArea...) đã tự set
 * sẵn trên <Field>. Nếu field-array custom (vd RoleUserArrayInput) hay các
 * component khác (FormFiles, VirtualMaterialMultiSelect...) muốn tham gia
 * cơ chế này, chỉ cần thêm `data-invalid={invalid}` lên wrapper của chúng.
 *
 * QUAN TRỌNG: chỉ tìm trong phạm vi `container` (chính thẻ <form> đang
 * submit), KHÔNG query toàn `document`. Trang có thể đang render nhiều
 * <Form> độc lập cùng lúc (vd Dialog tạo mới vật tư lồng bên trong trang
 * hợp đồng) — nếu query toàn document có thể vô tình nhảy/scroll sang field
 * lỗi của một form khác không liên quan tới lần submit này.
 */
function scrollToFirstInvalidField(container: HTMLElement | null) {
  if (!container) return;

  // Đợi 1 nhịp render để React kịp cập nhật data-invalid trên DOM
  requestAnimationFrame(() => {
    const invalidEls = container.querySelectorAll<HTMLElement>(
      '[data-invalid="true"]'
    );
    const firstInvalid = invalidEls[0];
    if (!firstInvalid) return;

    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusable = firstInvalid.querySelector<HTMLElement>(
      'input, textarea, select, button, [tabindex]'
    );
    focusable?.focus({ preventScroll: true });
  });
}

export function Form<T extends FieldValues>({
  context,
  onSubmit,
  onInvalid,
  scrollToError = true,
  className,
  ...props
}: FormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleInvalid = (errors: FieldErrors<T>) => {
    onInvalid?.(errors);
    if (scrollToError) {
      scrollToFirstInvalidField(formRef.current);
    }
  };

  return (
    <FormProvider {...context}>
      <form
        ref={formRef}
        onSubmit={onSubmit && context.handleSubmit(onSubmit, handleInvalid)}
        className={cn('flex flex-col gap-4', className)}
        {...props}
      >
        {props.children}
      </form>
    </FormProvider>
  );
}

export type FormControlProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  disabled?: boolean;
};
