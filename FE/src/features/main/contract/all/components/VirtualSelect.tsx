import { FormControlProps } from '@/components/form/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Material } from '@/services/material/type';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDownIcon, Loader2 } from 'lucide-react';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { FieldValues, useController } from 'react-hook-form';

export type VirtualMaterialSelectProps<T extends FieldValues> = FormControlProps<T> & {
    placeholder?: string;
    materials: Material[];
    required?: boolean;
    isLoading?: boolean;
};

export function VirtualMaterialSelect<T extends FieldValues>({
    control,
    name,
    label,
    placeholder = 'Chọn vật tư',
    materials,
    required,
    disabled,
    isLoading,
}: VirtualMaterialSelectProps<T>) {
    const { field, fieldState } = useController({ control, name, disabled });
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const parentRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return materials;
        const lower = search.toLowerCase();
        return materials.filter(
            (m) =>
                m.name.toLowerCase().includes(lower) ||
                m.materialCode.toLowerCase().includes(lower)
        );
    }, [search, materials]);

    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36,
        overscan: 10,
    });

    useLayoutEffect(() => {
        if (!open) return;

        const id = setTimeout(() => {
            if (parentRef.current) {
                rowVirtualizer.measure();
            }
        }, 0);

        return () => clearTimeout(id);
    }, [open, filtered.length, rowVirtualizer]);


    const selected = materials.find((m) => m.id === field.value);

    return (
        <Field data-invalid={fieldState.invalid}>
            {label && (
                <FieldLabel>
                    <span>{label}</span>
                    {required && <span className='text-destructive'>*</span>}
                </FieldLabel>
            )}

            <Popover
                open={open}
                onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setSearch(''); // reset search khi đóng
                }}
            >
                <PopoverTrigger
                    disabled={disabled || isLoading}
                    className={cn('cursor-pointer w-full', (disabled || isLoading) && 'cursor-not-allowed')}
                >
                    <InputGroup className={cn('h-10', (disabled || isLoading) && 'opacity-50')}>
                        <InputGroupInput
                            placeholder={isLoading ? 'Đang tải vật tư...' : placeholder}
                            value={isLoading ? '' : (selected ? `${selected.materialCode} - ${selected.name}` : '')}
                            readOnly
                            className={cn('cursor-pointer', (disabled || isLoading) && 'cursor-not-allowed')}
                        />
                        <InputGroupAddon align='inline-end' className='hover:text-primary cursor-pointer'>
                            {isLoading
                                ? <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                : <ChevronDownIcon />
                            }
                        </InputGroupAddon>
                    </InputGroup>
                </PopoverTrigger>

                <PopoverContent
                    className='p-0'
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
                    <div ref={parentRef} className='h-54 overflow-auto'>
                        {filtered.length === 0 ? (
                            <div className='p-4 text-center text-sm text-muted-foreground'>
                                Không tìm thấy.
                            </div>
                        ) : (
                            <div style={{ height: rowVirtualizer.getTotalSize() }} className='relative'>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const material = filtered[virtualRow.index];
                                    const isSelected = String(field.value) === String(material.id);

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
                                            onClick={() => {
                                                field.onChange(material.id);
                                                setOpen(false);
                                                setSearch('');
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'flex size-4 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-input bg-background'
                                                )}
                                            >
                                                {isSelected && <div className='size-1.5 rounded-full bg-current' />}
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
                </PopoverContent>
            </Popover>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
    );
}