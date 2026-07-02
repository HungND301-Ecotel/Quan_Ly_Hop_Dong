import {
  DataTable,
  DataTableContent,
  DataTableFooter,
  DataTableHeader,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { materialService } from '@/services/material';
import { MATERIAL_COLUMNS } from './columns';
import { useMainLayoutContext } from '@/features/main/layout/context';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useExternalSyncConnections } from '@/hooks/useExternalSyncConnections';
import { EditMaterialAction } from './edit/page';
import { MaterialDelete } from './delete/page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MaterialManagementPage() {
  const { setAction } = useMainLayoutContext();
  const [showConnectionPicker, setShowConnectionPicker] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    connections,
    loading: loadingConnections,
    loadConnections,
  } = useExternalSyncConnections();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [isSynced, setIsSynced] = useState<'true' | 'false' | ''>('');

  // Load danh sách kết nối khi mở modal chọn
  useEffect(() => {
    if (showConnectionPicker) {
      loadConnections();
    }
  }, [showConnectionPicker, loadConnections]);

  const handleOpenPicker = () => {
    setShowConnectionPicker(true);
  };

  const handleSelectConnection = async (connectionId: string) => {
    setShowConnectionPicker(false);
    setSyncing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      await materialService.syncMaterial({ sourceConnectionId: connectionId });
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setSyncing(false);
        toast.success('Đồng bộ thành công');
        dataTable.refresh(); // Refresh table after sync
      }, 500);
    } catch {
      clearInterval(interval);
      setSyncing(false);
      toast.error('Đồng bộ thất bại');
    }
  };

  const dataTable = useDataTable({
    keys: [
      'material',
      String(pageIndex),
      String(pageSize),
      keyword,
      String(isSynced),
    ],
    service: () =>
      materialService.getMaterialList({
        pageNumber: pageIndex + 1,
        pageSize: pageSize,
        keyword: keyword || undefined,
        isSynced: isSynced === '' ? undefined : isSynced === 'true',
      }),
    columns: MATERIAL_COLUMNS,
    pagination: {
      pageIndex,
      pageSize,
      onPageChange: setPageIndex,
      onPageSizeChange: setPageSize,
      onKeywordChange: (kw) => {
        setKeyword(kw);
        setPageIndex(0); // Reset page index when searching
      },
    },
  });

  useEffect(() => {
    setAction(
      <Button variant='default' onClick={handleOpenPicker} disabled={syncing}>
        <RefreshCw className='w-4 h-4 mr-2' />
        Đồng bộ
      </Button>
    );

    return () => setAction(undefined);
  }, [setAction, syncing]);

  return (
    <>
      {/* Modal chọn kết nối */}
      <Dialog
        open={showConnectionPicker}
        onOpenChange={setShowConnectionPicker}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Database className='w-5 h-5' />
              Chọn kết nối đồng bộ
            </DialogTitle>
            <DialogDescription>
              Chọn cổng kết nối cơ sở dữ liệu để tiến hành đồng bộ dữ liệu
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            {loadingConnections ? (
              <div className='flex justify-center items-center gap-2 py-8 text-muted-foreground'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>Đang tải danh sách kết nối...</span>
              </div>
            ) : connections.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Database className='w-10 h-10 mx-auto mb-2 opacity-30' />
                <p className='text-sm'>Chưa có kết nối nào được cấu hình</p>
              </div>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => conn.id && handleSelectConnection(conn.id)}
                  disabled={!conn.isActive}
                  className='w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-100 rounded-md'>
                        <Database className='w-4 h-4 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-semibold text-sm text-slate-900'>
                          {conn.connection.server}
                          <span className='text-slate-400 font-normal'>
                            :{conn.connection.port}
                          </span>
                        </p>
                        <p className='text-xs text-slate-500 mt-0.5'>
                          {conn.connection.database} · {conn.connection.userId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        conn.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {conn.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal tiến độ */}
      <Dialog open={syncing} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className='sm:max-w-md'
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Đang đồng bộ dữ liệu...</DialogTitle>
          </DialogHeader>
          <div className='space-y-3 py-4'>
            <Progress value={progress} className='h-2' />
            <p className='text-sm text-muted-foreground text-center'>
              {progress < 100 ? `Đang xử lý... ${progress}%` : 'Hoàn tất!'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <DataTable dataTable={dataTable}>
        <DataTableHeader>
          <MaterialDelete table={dataTable.table} />
          <EditMaterialAction table={dataTable.table} />
          <Select
            value={isSynced === '' ? 'all' : isSynced}
            onValueChange={(value) => {
              setIsSynced(value === 'all' ? '' : (value as 'true' | 'false'));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className='w-44'>
              <SelectValue placeholder='Trạng thái đồng bộ' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='true'>Đồng bộ</SelectItem>
              <SelectItem value='false'>Tạo mới</SelectItem>
            </SelectContent>
          </Select>
          <DataTableSearch />
        </DataTableHeader>
        <DataTableContent />
        <DataTableFooter>
          <DataTablePagination />
        </DataTableFooter>
      </DataTable>
    </>
  );
}
