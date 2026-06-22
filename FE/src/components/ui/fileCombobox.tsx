import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

type FileOption = {
    fileIndex: number;
    file: { name: string };
    group: 'contract' | 'attachment';
};

export function FileCombobox({
    icon,
    label,
    placeholder,
    files,
    selectedIndex,
    onSelect,
}: {
    icon: ReactNode;
    label: string;
    placeholder: string;
    files: FileOption[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = files.find((f) => f.fileIndex === selectedIndex);

    return (
        <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-medium text-foreground/80'>
                {icon}
                {label}
                <span className='ml-auto text-xs font-normal text-muted-foreground bg-background/80 border rounded-full px-2 py-0.5'>
                    {files.length}
                </span>
            </label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type='button'
                        className={cn(
                            'w-full h-11 flex items-center gap-2 rounded-xl border bg-background px-3 text-sm shadow-sm transition-all hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30',
                            !selected && 'text-muted-foreground'
                        )}
                    >
                        <span className='truncate flex-1 text-left'>
                            {selected ? selected.file.name : placeholder}
                        </span>
                        <ChevronDownIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    className='p-0'
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                    align='start'
                >
                    <Command>
                        <CommandInput placeholder='Tìm kiếm tệp...' />
                        <CommandList
                            className='max-h-64'
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup>
                                {files.map((f) => {
                                    const isSelected = f.fileIndex === selectedIndex;
                                    return (
                                        <CommandItem
                                            key={f.fileIndex}
                                            value={`${f.file.name}-${f.fileIndex}`}
                                            onSelect={() => {
                                                onSelect(f.fileIndex);
                                                setOpen(false);
                                            }}
                                        >
                                            <CheckIcon
                                                className={cn(
                                                    'h-4 w-4 text-primary',
                                                    isSelected ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                            <span className='truncate'>{f.file.name}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}