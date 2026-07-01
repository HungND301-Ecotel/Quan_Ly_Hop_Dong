import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractFormat } from '@/constants/contract-format';
import { ContractStatus, ContractSubStatus } from '@/constants/contract-status';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FilePlus,
  FileSignature,
  FileText,
  RefreshCw,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { ContractCreate } from './components/QuickCreateContract';

// ─── Local types ───────────────────────────────────────────────────────────────

type FilterOption = 'ALL' | 'PRINCIPLE' | 'ECONOMIC_BUY' | 'ECONOMIC_SELL';

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

/**
 * Hiển thị badge trạng thái hợp đồng:
 * - Archive → chỉ 1 badge cha
 * - Còn lại → badge cha + badge con cạnh nhau (fallback chỉ badge cha nếu không có subStatus)
 */
const getContractBadge = (
  status: string,
  subStatus?: string,
  signingFlows?: Contract['signingFlows']
) => {
  const badgeClass = 'justify-center text-center whitespace-nowrap';

  const parentStatus = ContractStatus[status];
  const childStatus = subStatus ? ContractSubStatus[subStatus] : undefined;

  // Archive: chỉ badge cha
  if (status === 'Archive' || status === 'Archived') {
    return parentStatus ? (
      <Badge
        className={`${parentStatus.background} ${parentStatus.foreground} ${badgeClass} w-full`}
      >
        {parentStatus.title}
      </Badge>
    ) : (
      <Badge variant='outline' className={badgeClass}>
        Không xác định
      </Badge>
    );
  }

  // ✅ Lấy tên phòng ban đang chờ ký (giống logic ở ContractColumns)
  const awaitingDeptName =
    subStatus === 'AwaitingSigning'
      ? signingFlows
          ?.sort((a, b) => a.sequenceOrder - b.sequenceOrder)
          .find((flow) => flow.status === 'Pending')?.departmentName
      : undefined;

  return (
    <div className='flex flex-col items-end gap-1 w-full'>
      {parentStatus && (
        <Badge
          className={`${parentStatus.background} ${parentStatus.foreground} ${badgeClass} w-full`}
        >
          {parentStatus.title}
        </Badge>
      )}
      {childStatus && (
        <Badge
          className={`${childStatus.background} ${childStatus.foreground} ${badgeClass} w-full`}
        >
          {childStatus.title}
          {awaitingDeptName && ` - ${awaitingDeptName}`}{' '}
          {/* ✅ Thêm tên phòng ban */}
        </Badge>
      )}
      {!parentStatus && !childStatus && (
        <Badge variant='outline' className={`${badgeClass} w-full`}>
          Không xác định
        </Badge>
      )}
    </div>
  );
};

// contractFormat: 0 = Nguyên tắc Mua, 1 = Nguyên tắc Bán, 2 = Kinh tế Mua, 3 = Kinh tế Bán
const isPrinciple = (c: Contract) =>
  c.contractFormat === 0 || c.contractFormat === 1;
const isEconomicBuy = (c: Contract) => c.contractFormat === 2;
const isEconomicSell = (c: Contract) => c.contractFormat === 3;

// ─── Mock finance data (no API yet) ──────────────────────────────────────────

const MOCK_DEBT_DATA = [
  {
    name: 'Tổng công nợ',
    buyLabel: '',
    sellLabel: '',
    buy: 1_200_000_000,
    sell: 980_000_000,
  },
  {
    name: '',
    buyLabel: 'Đã trả',
    sellLabel: 'Đã thu',
    buy: 800_000_000,
    sell: 650_000_000,
  },
  {
    name: '',
    buyLabel: 'Chưa trả',
    sellLabel: 'Chưa thu',
    buy: 400_000_000,
    sell: 330_000_000,
  },
  {
    name: 'Quá hạn',
    buyLabel: '',
    sellLabel: '',
    buy: 150_000_000,
    sell: 80_000_000,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  // ── Filter state ──
  const [contractListFilter, setContractListFilter] =
    useState<FilterOption>('ALL');
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [recentContractFilter, setRecentContractFilter] =
    useState<string>('ALL');
  const [expiringContractFilter, setExpiringContractFilter] =
    useState<string>('ALL');

  // ── Data state ──
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([]);
  const [soonExpiredContracts, setSoonExpiredContracts] = useState<Contract[]>(
    []
  );
  const [paymentDueSoonContracts, setPaymentDueSoonContracts] = useState<
    Contract[]
  >([]);

  // ── Loading ──
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingSoonExpired, setLoadingSoonExpired] = useState(false);
  const [loadingPaymentDue, setLoadingPaymentDue] = useState(false);

  // ── Reload keys ──
  const [reloadKeys, setReloadKeys] = useState({
    contracts: 0,
    recent: 0,
    expiring: 0,
  });
  const handleReload = (key: keyof typeof reloadKeys) =>
    setReloadKeys((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  // ── Finance date range (mock only) ──
  const form = useForm({
    defaultValues: {
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: new Date().getMonth() + 1,
      endYear: new Date().getFullYear(),
    },
  });
  const startMonth = form.watch('startMonth');
  const startYear = form.watch('startYear');
  const endMonth = form.watch('endMonth');
  const endYear = form.watch('endYear');

  // ─── Fetchers ───────────────────────────────────────────────────────────────

  const fetchAllContracts = useCallback(async () => {
    setLoadingContracts(true);
    try {
      const res = await contractService.getMyVisibleContractList();
      setAllContracts(res ?? []);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  const fetchPendingContracts = useCallback(async () => {
    setLoadingPending(true);
    try {
      const res = await contractService.getContractPendingList();
      setPendingContracts(res ?? []);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const fetchSoonExpired = useCallback(async () => {
    setLoadingSoonExpired(true);
    try {
      const res = await contractService.getContractSoonExpired();
      setSoonExpiredContracts(res ?? []);
    } finally {
      setLoadingSoonExpired(false);
    }
  }, []);

  const fetchPaymentDueSoon = useCallback(async () => {
    setLoadingPaymentDue(true);
    try {
      const res = await contractService.getContractPaymentDueSoon();
      setPaymentDueSoonContracts(res ?? []);
    } finally {
      setLoadingPaymentDue(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts, reloadKeys.contracts, reloadKeys.recent]);
  useEffect(() => {
    fetchPendingContracts();
  }, [fetchPendingContracts, reloadKeys.contracts]);
  useEffect(() => {
    fetchSoonExpired();
  }, [fetchSoonExpired, reloadKeys.expiring]);
  useEffect(() => {
    fetchPaymentDueSoon();
  }, [fetchPaymentDueSoon, reloadKeys.contracts]);

  // ─── Derived: Pie chart ─────────────────────────────────────────────────────

  const filteredContractsForChart = useMemo(() => {
    switch (contractListFilter) {
      case 'PRINCIPLE':
        return allContracts.filter(isPrinciple);
      case 'ECONOMIC_BUY':
        return allContracts.filter(isEconomicBuy);
      case 'ECONOMIC_SELL':
        return allContracts.filter(isEconomicSell);
      default:
        return allContracts;
    }
  }, [allContracts, contractListFilter]);

  const contractStatusData = useMemo(() => {
    // Dùng title từ ContractStatus constants làm key
    const counts = Object.fromEntries(
      Object.values(ContractStatus).map((s) => [s.title, 0])
    ) as Record<string, number>;

    filteredContractsForChart.forEach((c) => {
      const matched = ContractStatus[c.status ?? ''];
      if (matched) {
        counts[matched.title] = (counts[matched.title] ?? 0) + 1;
      }
    });

    const colorMap: Record<string, string> = {
      'Soạn thảo': '#9CA3AF',
      'Chờ phê duyệt': '#3B82F6',
      'Hiệu lực': '#22C55E',
      'Hết hạn': '#EAB308',
      'Thanh lý / Hủy': '#EF4444',
      'Lưu trữ': '#8B5CF6',
    };

    return Object.keys(counts).map((k) => ({
      name: k,
      value: counts[k],
      color: colorMap[k] ?? '#9CA3AF',
    }));
  }, [filteredContractsForChart]);

  // ─── Derived: Recent contracts ──────────────────────────────────────────────

  const recentContracts = useMemo(() => {
    let list = [...allContracts];
    if (recentContractFilter !== 'ALL') {
      list = list.filter(
        (c) => c.contractFormat === parseInt(recentContractFilter)
      );
    }
    return list
      .sort(
        (a, b) =>
          new Date(b.draftDate ?? '').getTime() -
          new Date(a.draftDate ?? '').getTime()
      )
      .slice(0, 5);
  }, [allContracts, recentContractFilter]);

  // ─── Derived: Expiring contracts ────────────────────────────────────────────

  const expiringContracts = useMemo(() => {
    const today = new Date();
    const oneDayMs = 86_400_000;

    let list = [...soonExpiredContracts];
    if (expiringContractFilter !== 'ALL') {
      list = list.filter(
        (c) => c.contractFormat === parseInt(expiringContractFilter)
      );
    }

    return list
      .map((c) => ({
        ...c,
        daysLeft: Math.ceil(
          (new Date(c.completionDate ?? '').getTime() - today.getTime()) /
            oneDayMs
        ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [soonExpiredContracts, expiringContractFilter]);

  // ─── Pie label ───────────────────────────────────────────────────────────────

  const renderCustomizedLabel = (props: PieLabelProps) => {
    const { cx, cy, midAngle, outerRadius, percent, name, color } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent * 100 < 3) return null;
    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
        style={{ fontSize: 15, fontWeight: 600 }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='space-y-6'>
      {/* ── Quick actions ── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <ContractCreate
          trigger={
            <Card className='hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100'>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='p-3 bg-blue-500 rounded-lg'>
                  <FilePlus className='h-6 w-6 text-white' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-blue-600 font-semibold mb-1'>
                    Tạo mới hợp đồng
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        />

        <Link to='/contract/approval/pending'>
          <Card className='hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100'>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='p-3 bg-green-500 rounded-lg'>
                <FileCheck className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm text-green-600 font-semibold mb-1'>
                  Phê duyệt hợp đồng
                </p>
                <p className='text-xs text-green-700 mt-1'>
                  {loadingPending
                    ? 'Đang tải...'
                    : `(${pendingContracts.length}) Hợp đồng chờ duyệt`}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to='/contract/expired'>
          <Card className='hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100'>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='p-3 bg-orange-500 rounded-lg'>
                <Clock className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm text-orange-600 font-semibold mb-1'>
                  Hợp đồng sắp hết hạn
                </p>
                <p className='text-xs text-orange-700 mt-1'>
                  {loadingSoonExpired
                    ? 'Đang tải...'
                    : `(${soonExpiredContracts.length}) Hợp đồng trong 10 ngày tới`}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to='/contract/payment-due'>
          <Card className='hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-purple-500 bg-purple-50 hover:bg-purple-100'>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='p-3 bg-purple-500 rounded-lg'>
                <CreditCard className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-purple-900'>
                  Hợp đồng đến hạn thanh toán
                </p>
                <span className='text-xs text-purple-700 mt-1'>
                  {loadingPaymentDue
                    ? 'Đang tải...'
                    : `(${paymentDueSoonContracts.length}) Hợp đồng trong 7 ngày tới`}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Charts ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Pie – Contract status */}
        <Card className='flex flex-col h-full'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-primary' />
                  <span className='text-lg font-semibold'>
                    Quản lý hợp đồng
                  </span>
                </div>
                <span className='text-sm text-muted-foreground'>
                  {loadingContracts
                    ? 'Đang tải...'
                    : `Tổng số: ${filteredContractsForChart.length} hợp đồng`}
                </span>
              </div>

              <div className='flex items-center gap-3'>
                <label className='text-sm font-medium whitespace-nowrap'>
                  Lọc:
                </label>
                <Select
                  value={contractListFilter}
                  onValueChange={(val) =>
                    setContractListFilter(val as FilterOption)
                  }
                >
                  <SelectTrigger className='w-56 h-9 px-3 rounded-md'>
                    <SelectValue placeholder='Chọn loại hợp đồng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Tất cả mẫu hợp đồng</SelectItem>
                    <SelectItem value='PRINCIPLE'>
                      Hợp đồng nguyên tắc
                    </SelectItem>
                    <SelectItem value='ECONOMIC_BUY'>
                      Hợp đồng kinh tế - Mua
                    </SelectItem>
                    <SelectItem value='ECONOMIC_SELL'>
                      Hợp đồng kinh tế - Bán
                    </SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => handleReload('contracts')}
                  className='p-1.5 rounded-md hover:bg-muted transition-colors'
                  title='Tải lại'
                >
                  <RefreshCw className='h-4 w-4 text-muted-foreground' />
                </button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className='flex-1 flex flex-col'>
            <div className='flex-1 min-h-75'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={contractStatusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={(entryProps) => {
                      const { payload, ...rest } = entryProps;
                      return renderCustomizedLabel({
                        ...rest,
                        name: payload.name,
                        color: payload.color,
                        percent: entryProps.percent,
                      } as PieLabelProps);
                    }}
                    outerRadius={80}
                    dataKey='value'
                  >
                    {contractStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-4 flex justify-center'>
              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                {contractStatusData.map((item, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-sm'>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar – Finance (mock data, pending dedicated API) */}
        <Card className='flex flex-col h-full'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' /> Tài chính - công nợ
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className='w-50'>
                    <SelectValue placeholder='Chọn loại hợp đồng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Tất cả hợp đồng kinh tế</SelectItem>
                    <SelectItem value='2'>Hợp đồng kinh tế mua</SelectItem>
                    <SelectItem value='3'>Hợp đồng kinh tế bán</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className='flex-1 flex flex-col gap-4'>
            <div className='flex gap-2 items-center justify-center flex-wrap'>
              <span className='text-sm font-medium'>Từ:</span>
              <Select
                value={startMonth?.toString()}
                onValueChange={(val) =>
                  form.setValue('startMonth', parseInt(val))
                }
              >
                <SelectTrigger className='w-28'>
                  <SelectValue placeholder='Tháng' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={startYear?.toString()}
                onValueChange={(val) =>
                  form.setValue('startYear', parseInt(val))
                }
              >
                <SelectTrigger className='w-24'>
                  <SelectValue placeholder='Năm' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-sm font-medium mx-1'>Đến:</span>
              <Select
                value={endMonth?.toString()}
                onValueChange={(val) =>
                  form.setValue('endMonth', parseInt(val))
                }
              >
                <SelectTrigger className='w-28'>
                  <SelectValue placeholder='Tháng' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={endYear?.toString()}
                onValueChange={(val) => form.setValue('endYear', parseInt(val))}
              >
                <SelectTrigger className='w-24'>
                  <SelectValue placeholder='Năm' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex-1 min-h-75'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={MOCK_DEBT_DATA}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 12 }}
                    height={80}
                    textAnchor='middle'
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                      if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
                      return v.toLocaleString('vi-VN');
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString('vi-VN')} đ`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend verticalAlign='top' height={36} />
                  <Bar
                    dataKey='buy'
                    name='Hợp đồng kinh tế mua'
                    fill='#3B82F6'
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey='buy'
                      position='top'
                      formatter={(v: number) => {
                        if (v === 0) return '';
                        if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                        if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                        return `${(v / 1000).toFixed(0)}K`;
                      }}
                      style={{ fontSize: 10, fontWeight: 600, fill: '#3B82F6' }}
                    />
                    <LabelList
                      dataKey='buyLabel'
                      position='bottom'
                      offset={10}
                      style={{ fontSize: 11, fontWeight: 500, fill: '#3B82F6' }}
                    />
                  </Bar>
                  <Bar
                    dataKey='sell'
                    name='Hợp đồng kinh tế bán'
                    fill='#F97316'
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey='sell'
                      position='top'
                      formatter={(v: number) => {
                        if (v === 0) return '';
                        if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                        if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                        return `${(v / 1000).toFixed(0)}K`;
                      }}
                      style={{ fontSize: 10, fontWeight: 600, fill: '#F97316' }}
                    />
                    <LabelList
                      dataKey='sellLabel'
                      position='bottom'
                      offset={10}
                      style={{ fontSize: 11, fontWeight: 500, fill: '#F97316' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent + Expiring ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Hợp đồng gần đây */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <FileSignature className='h-5 w-5' /> Hợp đồng gần đây
              </CardTitle>
              <div className='flex gap-2'>
                <Select
                  value={recentContractFilter}
                  onValueChange={setRecentContractFilter}
                >
                  <SelectTrigger className='w-fit h-8 text-xs'>
                    <SelectValue placeholder='Mẫu Hợp đồng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Tất cả mẫu hợp đồng</SelectItem>
                    {Object.values(ContractFormat).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => handleReload('recent')}
                  className='p-1.5 rounded-md hover:bg-muted transition-colors'
                  title='Tải lại'
                >
                  <RefreshCw className='h-4 w-4 text-muted-foreground' />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='space-y-4'>
              {loadingContracts ? (
                <p className='text-center text-sm text-muted-foreground py-4'>
                  Đang tải...
                </p>
              ) : recentContracts.length === 0 ? (
                <p className='text-center text-sm text-muted-foreground py-4'>
                  Không có dữ liệu
                </p>
              ) : (
                recentContracts.map((c: Contract) => (
                  <Link key={c.id} to={`/contracts/${c.id}`} className='block'>
                    <div className='grid grid-cols-12 gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors items-center'>
                      <div className='col-span-4 flex flex-col min-w-0'>
                        <p className='font-medium truncate text-sm'>
                          {c.contractNumber}
                        </p>
                        <p className='text-xs text-muted-foreground truncate mt-0.5'>
                          {c.title}
                        </p>
                      </div>
                      <div className='col-span-5'>
                        <p className='text-sm font-medium text-right truncate'>
                          {c.partnerName}
                        </p>
                      </div>
                      <div className='col-span-3 flex justify-end'>
                        {getContractBadge(
                          c.status ?? '',
                          c.subStatus,
                          c.signingFlows
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link to='/contract/all'>
              <Button variant='outline' className='w-full mt-4'>
                Xem thêm
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cảnh báo hợp đồng sắp hết hạn */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-warning'>
                <AlertTriangle className='h-5 w-5' /> Cảnh báo hợp đồng sắp hết
                hạn
              </CardTitle>
              <div className='flex gap-2'>
                <Select
                  value={expiringContractFilter}
                  onValueChange={setExpiringContractFilter}
                >
                  <SelectTrigger className='w-fit h-8 text-xs'>
                    <SelectValue placeholder='Mẫu Hợp đồng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Tất cả mẫu hợp đồng</SelectItem>
                    {Object.values(ContractFormat).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => handleReload('expiring')}
                  className='p-1.5 rounded-md hover:bg-muted transition-colors'
                  title='Tải lại'
                >
                  <RefreshCw className='h-4 w-4 text-muted-foreground' />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='space-y-4'>
              {loadingSoonExpired ? (
                <p className='text-center text-sm text-muted-foreground py-4'>
                  Đang tải...
                </p>
              ) : expiringContracts.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <CheckCircle2 className='h-12 w-12 mx-auto mb-2 text-success' />
                  <p>Không có hợp đồng sắp hết hạn</p>
                </div>
              ) : (
                expiringContracts.map((c) => (
                  <Link key={c.id} to={`/contracts/${c.id}`}>
                    <div className='grid grid-cols-12 gap-2 p-3 rounded-lg border border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors items-center'>
                      <div className='col-span-5 flex flex-col min-w-0'>
                        <p className='font-medium text-sm truncate'>
                          {c.contractNumber}
                        </p>
                        <p className='text-xs text-muted-foreground truncate mt-0.5'>
                          {c.title}
                        </p>
                      </div>
                      <div className='col-span-4'>
                        <p className='text-sm font-medium truncate text-right'>
                          {c.partnerName}
                        </p>
                      </div>
                      <div className='col-span-3 text-right'>
                        <p className='text-sm font-medium text-warning whitespace-nowrap'>
                          Còn {c.daysLeft} ngày
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDate(c.completionDate ?? '')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Link to='/contract/expired'>
              <Button variant='outline' className='w-full mt-4'>
                Xem tất cả
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomPieTooltip = (props: TooltipProps<ValueType, NameType>) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const p = payload[0];
    return (
      <div className='bg-background border border-border p-3 rounded-lg shadow-lg'>
        <p className='font-medium'>{p.name}</p>
        <p className='text-sm text-primary font-semibold'>{p.value} Hợp đồng</p>
      </div>
    );
  }
  return null;
};
