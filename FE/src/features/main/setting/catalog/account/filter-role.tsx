import { useDataTableContext } from '@/components/data-table/context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/constants/user-role';

export function AccountFilterRole() {
  const { table } = useDataTableContext();

  return (
    <Select
      defaultValue='all'
      onValueChange={(value) => {
        table.getColumn('role')?.setFilterValue(value === 'all' ? '' : value);
      }}
    >
      <SelectTrigger size='lg'>
        <SelectValue placeholder='Chọn vai trò' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả vai trò</SelectItem>
        {Object.entries(UserRole).map(([key, role]) => (
          <SelectItem key={key} value={key}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
