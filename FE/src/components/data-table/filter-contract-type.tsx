import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/hooks/use-api';
import { contractTypeService } from '@/services/contract-type';
import { useDataTableContext } from './context';

export function DataTableFilterContractType() {
  const { table } = useDataTableContext();
  const contractTypes = useApi({
    service: contractTypeService.getContractTypeList,
  });

  return (
    <Select
      defaultValue='all'
      onValueChange={(value) => {
        table
          .getColumn('contractTypeId')
          ?.setFilterValue(value === 'all' ? '' : value);
      }}
    >
      <SelectTrigger size={'lg'}>
        <SelectValue placeholder='Chọn loại hợp đồng' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả loại hợp đồng</SelectItem>
        {contractTypes.data?.map((contractType) => (
          <SelectItem key={contractType.id} value={contractType.id}>
            {contractType.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
