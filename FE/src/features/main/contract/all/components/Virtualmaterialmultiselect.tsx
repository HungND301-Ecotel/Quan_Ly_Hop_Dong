import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Material } from '@/services/material/type';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { FieldValues, useController } from 'react-hook-form';

export type VirtualMaterialMultiSelectProps<T extends FieldValues> =
  FormControlProps<T> & {
    placeholder?: string;
    materials: Material[];
    required?: boolean;
    isLoading?: boolean;
    /** Các materialId đã có trong form rồi — sẽ bị ẩn khỏi danh sách */
    excludedIds?: string[];
    /** Callback khi user xác nhận chọn — trả về danh sách Material được chọn */
    onConfirm: (selected: Material[]) => void;
  };

export function VirtualMaterialMultiSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Chọn vật tư, tài sản',
  materials,
  required,
  disabled,
  isLoading,
  excludedIds = [],
  onConfirm,
}: VirtualMaterialMultiSelectProps<T>) {
  // field chỉ dùng để lấy fieldState (error), value không dùng trực tiếp
  const { fieldState } = useController({ control, name, disabled });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  const availableMaterials = useMemo(
    () => materials.filter((m) => !excludedIds.includes(m.id)),
    [materials, excludedIds]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return availableMaterials;
    const lower = search.toLowerCase();
    return availableMaterials.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.materialCode.toLowerCase().includes(lower)
    );
  }, [search, availableMaterials]);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      parentRef.current && rowVirtualizer.measure();
    }, 0);
    return () => clearTimeout(id);
  }, [open, filtered.length, rowVirtualizer]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setSearch('');
      setSelectedIds(new Set());
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = materials.filter((m) => selectedIds.has(m.id));
    onConfirm(selected);
    setOpen(false);
    setSearch('');
    setSelectedIds(new Set());
  };

  const triggerLabel =
    selectedIds.size === 0
      ? ''
      : selectedIds.size === 1
        ? (() => {
            const m = materials.find((m) => selectedIds.has(m.id));
            return m ? `${m.materialCode} - ${m.name}` : '';
          })()
        : `Đã chọn ${selectedIds.size} vật tư`;

  return (
    <Field data-invalid={fieldState.invalid} className='w-full'>
      {label && (
        <FieldLabel>
          <span>{label}</span>
          {required && <span className='text-destructive'>*</span>}
        </FieldLabel>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          disabled={disabled || isLoading}
          className={cn(
            'cursor-pointer w-full',
            (disabled || isLoading) && 'cursor-not-allowed'
          )}
        >
          <InputGroup
            className={cn('h-10', (disabled || isLoading) && 'opacity-50')}
          >
            <InputGroupInput
              placeholder={isLoading ? 'Đang tải vật tư...' : placeholder}
              value={isLoading ? '' : triggerLabel}
              readOnly
              className={cn(
                'cursor-pointer',
                (disabled || isLoading) && 'cursor-not-allowed'
              )}
            />
            <InputGroupAddon
              align='inline-end'
              className='hover:text-primary cursor-pointer'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              ) : (
                <ChevronDownIcon />
              )}
            </InputGroupAddon>
          </InputGroup>
        </PopoverTrigger>

        <PopoverContent
          className='p-0 flex flex-col'
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align='start'
        >
          {/* Search */}
          <div className='p-2 border-b'>
            <input
              className='w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground'
              placeholder='Tìm theo mã hoặc tên...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Virtual list */}
          <div
            ref={parentRef}
            className='h-54 overflow-auto'
            onWheel={(e) => e.stopPropagation()}
          >
            {filtered.length === 0 ? (
              <div className='p-4 text-center text-sm text-muted-foreground'>
                Không tìm thấy.
              </div>
            ) : (
              <div
                style={{ height: rowVirtualizer.getTotalSize() }}
                className='relative'
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const material = filtered[virtualRow.index];
                  const isSelected = selectedIds.has(material.id);

                  return (
                    <div
                      key={material.id}
                      style={{
                        position: 'absolute',
                        top: virtualRow.start,
                        height: virtualRow.size,
                        width: '100%',
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 cursor-pointer hover:bg-accent text-sm',
                        isSelected && 'bg-accent'
                      )}
                      onClick={() => toggleItem(material.id)}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border shadow-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background'
                        )}
                      >
                        {isSelected && <CheckIcon className='size-3' />}
                      </div>
                      <span className='truncate'>
                        {material.materialCode} - {material.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer confirm */}
          <div className='p-2 border-t flex items-center justify-between gap-2'>
            <span className='text-xs text-muted-foreground'>
              {selectedIds.size > 0
                ? `Đã chọn ${selectedIds.size} vật tư`
                : 'Chưa chọn vật tư nào'}
            </span>
            <Button
              type='button'
              size='sm'
              disabled={selectedIds.size === 0}
              onClick={handleConfirm}
              className='h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700'
            >
              Xác nhận ({selectedIds.size})
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
