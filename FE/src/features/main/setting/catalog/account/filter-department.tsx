import { useDataTableContext } from '@/components/data-table/context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Department } from '@/services/department/type';

interface AccountFilterDepartmentProps {
  departments: Department[];
}

export function AccountFilterDepartment({
  departments,
}: AccountFilterDepartmentProps) {
  const { table } = useDataTableContext();

  return (
    <Select
      defaultValue='all'
      onValueChange={(value) => {
        table
          .getColumn('departmentName')
          ?.setFilterValue(value === 'all' ? '' : value);
      }}
    >
      <SelectTrigger size='lg'>
        <SelectValue placeholder='Chọn phòng ban' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả phòng ban</SelectItem>
        {departments.map((department) => (
          <SelectItem key={department.id} value={department.name}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
