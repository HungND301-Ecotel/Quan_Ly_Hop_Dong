import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
} from '@/components/data-table';
import { useDataTable } from '@/components/data-table/hook';
import { Button } from '@/components/ui/button';
import { departmentService } from '@/services/department';
import { Department } from '@/services/department/type';
import { positionService } from '@/services/postion';
import { Position } from '@/services/postion/type';
import { userService } from '@/services/user';
import { Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { USER_COLUMNS } from './columns';
import { CreateUserDialog } from './components/create/create-user-dialog';
import { DeleteUserDialog } from './components/delete/delete-user-dialog';
import { AccountFilterDepartment } from './filter-department';
import { AccountFilterPosition } from './filter-position';

export function AccountManagementPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, depRes] = await Promise.all([
          positionService.getPositionList(),
          departmentService.getDepartmentList(),
        ]);
        setPositions(posRes || []);
        setDepartments(depRes || []);
      } catch (error) {
        console.error('Failed to fetch filter data', error);
      }
    };
    fetchData();
  }, []);

  const dataTable = useDataTable({
    keys: ['account'],
    service: userService.getUserList,
    columns: USER_COLUMNS,
    meta: {
      positions,
      departments,
    },
  });

  const { table, refresh } = dataTable;

  const selected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <DataTable dataTable={dataTable}>
      <DataTableHeader>
        <div className='flex items-center gap-2'>
          <Button
            variant={'destructive'}
            size={'lg'}
            disabled={selected === 0}
            className='px-4'
            onClick={() => setOpenDelete(true)}
          >
            <Trash2Icon />
            <span>Xóa ({selected})</span>
          </Button>

          <CreateUserDialog
            positions={positions}
            departments={departments}
            refresh={refresh}
          />
          <DeleteUserDialog
            ids={table
              .getFilteredSelectedRowModel()
              .rows.map((r) => r.original.id)}
            open={openDelete}
            onOpenChange={setOpenDelete}
            onSuccess={() => {
              table.resetRowSelection();
              refresh?.();
            }}
          />
        </div>

        <DataTableSearch />

        <div className='flex items-center gap-2'>
          <AccountFilterPosition positions={positions} />
          <AccountFilterDepartment departments={departments} />
        </div>
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination className='w-full' />
      </DataTableFooter>
    </DataTable>
  );
}
