import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractStatus } from '@/constants/contract-status';
import { useDataTableContext } from './context';

export function DataTableFilterContractStatus() {
  const { table } = useDataTableContext();

  return (
    <Select
      defaultValue='all'
      onValueChange={(value) => {
        table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value);
      }}
    >
      <SelectTrigger size={'lg'}>
        <SelectValue placeholder='Chọn trạng thái' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả trạng thái</SelectItem>
        {Object.entries(ContractStatus).map(([key, status]) => (
          <SelectItem key={key} value={key}>
            {status.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
