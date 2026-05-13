import { SearchIcon } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import { useDataTableContext } from './context';

export function DataTableSearch<TData>() {
  const { table } = useDataTableContext<TData>();

  return (
    <InputGroup className='flex-1 h-10 shadow-xs'>
      <InputGroupInput
        placeholder='Tìm kiếm'
        value={table.getState().globalFilter}
        onChange={(e) => table.setGlobalFilter(String(e.target.value))}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
}
