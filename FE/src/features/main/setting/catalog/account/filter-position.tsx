import { useDataTableContext } from '@/components/data-table/context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Position } from '@/services/postion/type';

interface AccountFilterPositionProps {
  positions: Position[];
}

export function AccountFilterPosition({
  positions,
}: AccountFilterPositionProps) {
  const { table } = useDataTableContext();

  return (
    <Select
      defaultValue='all'
      onValueChange={(value) => {
        table
          .getColumn('positionName')
          ?.setFilterValue(value === 'all' ? '' : value);
      }}
    >
      <SelectTrigger size='lg'>
        <SelectValue placeholder='Chọn chức vụ' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả chức vụ</SelectItem>
        {positions.map((position) => (
          <SelectItem key={position.id} value={position.name}>
            {position.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
