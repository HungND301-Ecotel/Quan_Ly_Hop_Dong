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
import { procurementMethodService } from '@/services/procurement-method';
import { Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PROCUREMENT_METHOD_COLUMNS } from './columns';
import { CreateProcurementMethodDialog } from './components/create/procurement-method-dialog';
import { DeleteProcurementMethodDialog } from './components/delete/procurement-method-dialog';

export function ProcurementMethodPage() {
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
    keys: ['procurement-method'],
    service: procurementMethodService.getProcurementMethodList,
    columns: PROCUREMENT_METHOD_COLUMNS,
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

          <CreateProcurementMethodDialog refresh={refresh} />
          <DeleteProcurementMethodDialog
            ids={table
              .getFilteredSelectedRowModel()
              .rows.map((r) => r.original.id)}
            open={openDelete}
            onOpenChange={setOpenDelete}
            onSuccess={() => {
              table.resetRowSelection();
              table.options.meta?.refresh?.();
            }}
          />
        </div>

        <DataTableSearch />
      </DataTableHeader>

      <DataTableContent />

      <DataTableFooter>
        <DataTablePagination className='w-full' />
      </DataTableFooter>
    </DataTable>
  );
}
