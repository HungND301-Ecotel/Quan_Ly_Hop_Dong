import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from '@/lib/format';
import { contractPaymentService } from '@/services/contract-payment';
import { Contract } from '@/services/contract/type';
import { cn } from '@/lib/utils';
import { useExternalSyncConnections } from '@/hooks/useExternalSyncConnections';
import { ExternalSyncConnection } from '@/services/server';
import {
  CheckCircle2Icon,
  Database,
  FileTextIcon,
  Loader2,
  PlusCircleIcon,
  ReceiptIcon,
  RefreshCwIcon,
  SkipForwardIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SyncResult = {
  sourceCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
};

type Invoice = {
  numberInvoice: string;
  dateInvoice: string;
};

type Tax = {
  declarationDate: string;
  vatRate: number;
  taxableRevenue: number;
  vatAmount: number;
  taxCode: string;
};

type Payment = {
  id: string;
  periodNumber: number;
  paymentDate: string;
  amount: number;
  invoice: Invoice | null;
  tax: Tax | null;
};

type DocumentSectionProps = {
  contract: Contract;
};

export function DocumentSection({ contract }: DocumentSectionProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showConnectionPicker, setShowConnectionPicker] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    invoice: SyncResult | null;
    tax: SyncResult | null;
  }>({ invoice: null, tax: null });

  const { connections, loading: loadingConnections, loadConnections } =
    useExternalSyncConnections();

  const loadData = async () => {
    try {
      setDataLoading(true);
      const res = await contractPaymentService.getContractPaymentDetail(contract.id);
      const transformedPayments = (res?.payments ?? []).map((p) => ({
        id: p.id,
        periodNumber: p.periodNumber,
        paymentDate: p.paymentDate,
        amount: p.amount,
        invoice: (p.invoice as Invoice) ?? null,
        tax: (p.tax as Tax) ?? null,
      }));
      setPayments(transformedPayments);
    } catch {
      toast.error('Không thể tải dữ liệu chứng từ');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contract.id]);

  useEffect(() => {
    if (showConnectionPicker) {
      loadConnections();
    }
  }, [showConnectionPicker, loadConnections]);

  const handleSelectConnection = async (conn: ExternalSyncConnection) => {
    setShowConnectionPicker(false);
    setSyncing(true);
    setSyncResults({ invoice: null, tax: null });

    try {
      const payload = {
        contractNumber: contract.contractNumber,
        contractDate: contract.startDate,
        sourceConnectionId: conn.id!,
      };

      const [invoiceResult, taxResult] = await Promise.allSettled([
        contractPaymentService.syncInvoice(payload),
        contractPaymentService.syncTax(payload),
      ]);

      const invoiceRes = invoiceResult.status === 'fulfilled' ? invoiceResult.value : null;
      const taxRes = taxResult.status === 'fulfilled' ? taxResult.value : null;

      setSyncResults({ invoice: invoiceRes ?? null, tax: taxRes ?? null });

      if (invoiceResult.status === 'rejected' && taxResult.status === 'rejected') {
        toast.error('Đồng bộ thất bại');
      } else if (invoiceResult.status === 'rejected') {
        toast.warning('Đồng bộ thuế thành công, hóa đơn thất bại');
      } else if (taxResult.status === 'rejected') {
        toast.warning('Đồng bộ hóa đơn thành công, thuế thất bại');
      } else {
        toast.success('Đồng bộ hóa đơn và thuế thành công');
      }

      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Modal chọn kết nối */}
      <Dialog open={showConnectionPicker} onOpenChange={setShowConnectionPicker}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Chọn kết nối đồng bộ
            </DialogTitle>
            <DialogDescription>
              Chọn cổng kết nối để đồng bộ hóa đơn và thuế
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {loadingConnections ? (
              <div className="flex justify-center items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải danh sách kết nối...</span>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có kết nối nào được cấu hình</p>
              </div>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => handleSelectConnection(conn)}
                  disabled={!conn.isActive}
                  className="w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-md">
                        <Database className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">
                          {conn.connection.server}
                          <span className="text-slate-400 font-normal">:{conn.connection.port}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {conn.connection.database} · {conn.connection.userId}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${conn.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                      {conn.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Toolbar đồng bộ ── */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Hóa đơn:</span>
            {syncResults.invoice
              ? <SyncResultBadges result={syncResults.invoice} />
              : <span className="text-xs text-muted-foreground"></span>
            }
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <ReceiptIcon className="size-4 text-emerald-600" />
            <span className="text-sm font-medium">Thuế:</span>
            {syncResults.tax
              ? <SyncResultBadges result={syncResults.tax} />
              : <span className="text-xs text-muted-foreground"></span>
            }
          </div>
        </div>

        <Button
          size='sm'
          variant='default'
          onClick={() => setShowConnectionPicker(true)}
          disabled={syncing || dataLoading}
          className='gap-1.5 shrink-0'
        >
          <RefreshCwIcon className={cn('size-4', syncing && 'animate-spin')} />
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
        </Button>
      </div>

      {/* ── Hóa đơn ── */}
      <Card className='overflow-hidden'>
        <CardHeader className='px-5 py-4 border-b bg-muted/30'>
          <div className='flex items-center gap-2.5'>
            <div className='flex items-center justify-center size-8 rounded-md bg-blue-50 text-blue-600'>
              <FileTextIcon className='size-4' />
            </div>
            <div>
              <p className='text-sm font-semibold leading-none'>Hóa đơn</p>
              {!dataLoading && (
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {payments.length} đợt thanh toán
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {dataLoading ? (
            <TableSkeleton cols={5} />
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<FileTextIcon className='size-6' />}
              message='Chưa có dữ liệu hóa đơn'
              hint='Nhấn "Đồng bộ" để tải về từ hệ thống'
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/20 hover:bg-muted/20'>
                  <TableHead className='w-14 text-center pl-5'>Đợt</TableHead>
                  <TableHead>Số hóa đơn</TableHead>
                  <TableHead>Ngày hóa đơn</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead className='text-right pr-5'>Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className='hover:bg-muted/30'>
                    <TableCell className='text-center pl-5'>
                      <span className='inline-flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold'>
                        {p.periodNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.invoice?.numberInvoice ? (
                        <span className='font-mono text-sm font-medium'>{p.invoice.numberInvoice}</span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {p.invoice?.dateInvoice
                        ? new Date(p.invoice.dateInvoice).toLocaleDateString('vi-VN')
                        : <span className='text-muted-foreground'>—</span>}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString('vi-VN')
                        : <span className='text-muted-foreground'>—</span>}
                    </TableCell>
                    <TableCell className='text-right pr-5'>
                      <span className='text-sm font-semibold tabular-nums'>
                        {format.number(p.amount)}&nbsp;đ
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Thuế ── */}
      <Card className='overflow-hidden'>
        <CardHeader className='px-5 py-4 border-b bg-muted/30'>
          <div className='flex items-center gap-2.5'>
            <div className='flex items-center justify-center size-8 rounded-md bg-emerald-50 text-emerald-600'>
              <ReceiptIcon className='size-4' />
            </div>
            <div>
              <p className='text-sm font-semibold leading-none'>Thuế</p>
              {!dataLoading && (
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {payments.filter((p) => p.tax).length} đợt có dữ liệu thuế
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {dataLoading ? (
            <TableSkeleton cols={6} />
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<ReceiptIcon className='size-6' />}
              message='Chưa có dữ liệu thuế'
              hint='Nhấn "Đồng bộ" để tải về từ hệ thống'
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/20 hover:bg-muted/20'>
                  <TableHead className='w-14 text-center pl-5'>Đợt</TableHead>
                  <TableHead>Mã số thuế</TableHead>
                  <TableHead>Ngày khai thuế</TableHead>
                  <TableHead className='text-right'>Doanh thu chịu thuế</TableHead>
                  <TableHead className='text-right'>Thuế suất</TableHead>
                  <TableHead className='text-right pr-5'>Tiền thuế VAT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className='hover:bg-muted/30'>
                    <TableCell className='text-center pl-5'>
                      <span className='inline-flex items-center justify-center size-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold'>
                        {p.periodNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.tax?.taxCode ? (
                        <span className='font-mono text-sm font-medium'>{p.tax.taxCode}</span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {p.tax?.declarationDate
                        ? new Date(p.tax.declarationDate).toLocaleDateString('vi-VN')
                        : <span className='text-muted-foreground'>—</span>}
                    </TableCell>
                    <TableCell className='text-right'>
                      {p.tax?.taxableRevenue != null ? (
                        <span className='text-sm tabular-nums'>
                          {format.number(p.tax.taxableRevenue)}&nbsp;đ
                        </span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {p.tax?.vatRate != null ? (
                        <Badge
                          variant={p.tax.vatRate === 0 ? 'secondary' : 'default'}
                          className='font-mono tabular-nums'
                        >
                          {(p.tax.vatRate * 100).toFixed(0)}%
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right pr-5'>
                      {p.tax?.vatAmount != null ? (
                        <span className='text-sm font-semibold tabular-nums'>
                          {format.number(p.tax.vatAmount)}&nbsp;đ
                        </span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ icon, message, hint }: { icon: React.ReactNode; message: string; hint: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground'>
      <div className='opacity-25'>{icon}</div>
      <p className='text-sm font-medium text-foreground'>{message}</p>
      <p className='text-xs'>{hint}</p>
    </div>
  );
}

function SyncResultBadges({ result }: { result: SyncResult }) {
  return (
    <div className='flex items-center gap-1 flex-wrap'>
      <Badge variant='secondary' className='gap-1 text-xs h-6'>
        <span className='text-muted-foreground'>Nguồn:</span>
        <span className='font-semibold'>{result.sourceCount}</span>
      </Badge>
      {result.createdCount > 0 && (
        <Badge variant='outline' className='gap-1 text-xs h-6 text-green-700 border-green-200 bg-green-50'>
          <PlusCircleIcon className='size-3' /> {result.createdCount} tạo mới
        </Badge>
      )}
      {result.updatedCount > 0 && (
        <Badge variant='outline' className='gap-1 text-xs h-6 text-blue-700 border-blue-200 bg-blue-50'>
          <RefreshCwIcon className='size-3' /> {result.updatedCount} cập nhật
        </Badge>
      )}
      {result.skippedCount > 0 && (
        <Badge variant='outline' className='gap-1 text-xs h-6 text-orange-700 border-orange-200 bg-orange-50'>
          <SkipForwardIcon className='size-3' /> {result.skippedCount} bỏ qua
        </Badge>
      )}
      {result.createdCount === 0 && result.updatedCount === 0 && result.skippedCount === 0 && (
        <Badge variant='outline' className='gap-1 text-xs h-6 text-green-700 border-green-200 bg-green-50'>
          <CheckCircle2Icon className='size-3' /> Đã đồng bộ
        </Badge>
      )}
    </div>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className='flex flex-col divide-y'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex gap-3 px-5 py-3'>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn('h-5 rounded', j === 0 ? 'w-8' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}