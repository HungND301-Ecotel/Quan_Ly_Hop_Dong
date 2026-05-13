import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, X, Minimize2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useContractData } from './Usecontractdata';
import { ReportSidebar, REPORT_TYPES } from './components/ReportSidebar';
import { ReportToolbar } from './components/Reporttoolbar';
import { PrintPaper } from './components/Printpaper';
import { MaterialUnitPriceTable } from './components/MaterialUnitPriceTable';
import { ContractRecord } from './api/Apimapper';
import { useContractTypes } from './useContractType';
import { useContractStructureCatalogs } from './useContractStructureCatalog';
import { useProcurementMethods } from './useProcucrementMethod';
import { usePartners } from './usePartners';
import { useMaterialUnitPriceReport } from './useMaterialUnitPriceReport';

export default function Reports() {
  // ── State ────────────────────────────────────────────────
  const [activeReport, setActiveReport] = useState('by-category');
  const [reportYear, setReportYear] = useState('2025');
  const [reportMonth, setReportMonth] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [reportStartDateFrom, setReportStartDateFrom] = useState('');
  const [reportStartDateTo, setReportStartDateTo] = useState('');
  const [selectedContractTypeId, setSelectedContractTypeId] = useState('ALL');
  const [selectedContractStructureCatalogId, setSelectedContractStructureCatalogId] = useState('ALL');
  const [selectedProcurementMethodId, setSelectedProcurementMethodId] = useState('ALL');
  const [selectedPartnerId, setSelectedPartnerId] = useState('ALL');
  const [reportEndDate, setReportEndDate] = useState('');
  const [selectedLiquidationType, setSelectedLiquidationType] =
    useState<'all' | 'liquidated' | 'auto-liquidated'>('all');

  const { data: partners } = usePartners();
  const { data: contractTypes } = useContractTypes();
  const { data: contractStructureCatalogs } = useContractStructureCatalogs();
  const { data: procurementMethods } = useProcurementMethods();
  const printRef = useRef<HTMLDivElement | null>(null);

  const isMaterialUnitPrice = activeReport === 'material-unit-price';

  // ── Fetch API Data ───────────────────────────────────────
  // reset khi đổi tab — thêm vào handleReportChange
  const handleReportChange = (id: string) => {
    setActiveReport(id);
    setSelectedContractTypeId('ALL');
    setSelectedContractStructureCatalogId('ALL');
    setSelectedProcurementMethodId('ALL');  // ← thêm
    setSelectedPartnerId('ALL');
    setReportEndDate('');
    setSelectedLiquidationType('all');
  };

  const { data: apiContracts, loading, error } = useContractData({
    contractTypeId:
      ['by-category', 'by-sector'].includes(activeReport) && selectedContractTypeId !== 'ALL'
        ? selectedContractTypeId : undefined,
    contractStructureCatalogId:
      activeReport === 'by-form' && selectedContractStructureCatalogId !== 'ALL'
        ? selectedContractStructureCatalogId : undefined,
    procurementMethodId:
      activeReport === 'by-bidding' && selectedProcurementMethodId !== 'ALL'  // ← thêm
        ? selectedProcurementMethodId : undefined,
    partnerId:
      activeReport === 'by-partner' && selectedPartnerId !== 'ALL'
        ? selectedPartnerId : undefined,
    endDate: activeReport === 'by-expiry' && reportEndDate
      ? reportEndDate
      : undefined,
    isLiquidated: activeReport === 'by-liquidation' && selectedLiquidationType === 'liquidated'
      ? true : undefined,
    isAutoLiquidated: activeReport === 'by-liquidation' && selectedLiquidationType === 'auto-liquidated'
      ? true : undefined,

    startDateFrom: (isMaterialUnitPrice || activeReport === 'by-time') ? reportStartDateFrom : undefined,
    startDateTo: (isMaterialUnitPrice || activeReport === 'by-time') ? reportStartDateTo : undefined,
  });

  const {
    data: materialReportYears,
    loading: materialLoading,
    error: materialError,
  } = useMaterialUnitPriceReport({
    startDateFrom: reportStartDateFrom,
    startDateTo: reportStartDateTo,
    enabled: isMaterialUnitPrice,
  });

  // ── Get active report label ──────────────────────────────
  const activeLabel = useMemo(
    () => REPORT_TYPES.find((r) => r.id === activeReport)?.label ?? '',
    [activeReport]
  );

  const selectedFilterLabel = useMemo(() => {
    if (['by-category', 'by-sector'].includes(activeReport)) {
      if (selectedContractTypeId === 'ALL') return undefined;
      return contractTypes.find((ct) => ct.id === selectedContractTypeId)?.name;
    }
    if (activeReport === 'by-form') {
      if (selectedContractStructureCatalogId === 'ALL') return undefined;
      return contractStructureCatalogs.find((c) => c.id === selectedContractStructureCatalogId)?.name;
    }
    if (activeReport === 'by-bidding') {
      if (selectedProcurementMethodId === 'ALL') return undefined;
      return procurementMethods.find((pm) => pm.id === selectedProcurementMethodId)?.name;
    }
    if (activeReport === 'by-partner') {
      if (selectedPartnerId === 'ALL') return undefined;
      return partners.find((p) => p.id === selectedPartnerId)?.name;
    }
    return undefined;
  }, [
    activeReport,
    selectedContractTypeId, contractTypes,
    selectedContractStructureCatalogId, contractStructureCatalogs,
    selectedProcurementMethodId, procurementMethods, selectedPartnerId, partners,
  ]);



  // ── Filter contracts ─────────────────────────────────────
  const contracts = useMemo<ContractRecord[]>(() => {
    let list = apiContracts;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name ?? '').toLowerCase().includes(q) ||
          (c.contractNumber ?? '').toLowerCase().includes(q) ||
          (c.partner ?? '').toLowerCase().includes(q)
      );
    }

    if (reportMonth !== 'ALL') {
      const m = Number(reportMonth);
      list = list.filter((c) =>
        c.monthlyExecutions.some((e) => e.month === m && e.amount > 0)
      );
    }

    return list;
  }, [apiContracts, searchText, reportMonth]);

  // ── Print handler ────────────────────────────────────────
  const handlePrint = useCallback(() => {
    const win = window.open('', '_blank', 'width=1400,height=900');
    if (!win || !printRef.current) return;

    const printTitle = isMaterialUnitPrice
      ? 'Báo cáo tổng hợp đơn giá vật tư'
      : `Sổ theo dõi hợp đồng - ${reportYear}`;

    const html = printRef.current.outerHTML;

    win.document.open();
    win.document.write('<!DOCTYPE html>');
    win.document.write('<html><head>');
    win.document.write('<meta charset="utf-8"/>');
    win.document.write(`<title>${printTitle}</title>`);
    win.document.write(`
      <style>
        @page { size: A3 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: "Times New Roman", serif; }
        @media print { .no-print { display: none; } }
      </style>
    `);
    win.document.write('</head><body>');
    win.document.write(html);
    win.document.write('</body></html>');
    win.document.close();

    win.focus();
    setTimeout(() => win.print(), 400);
  }, [isMaterialUnitPrice, reportYear]);

  // ── Render ───────────────────────────────────────────────
  const isLoading = isMaterialUnitPrice ? materialLoading : loading;
  const activeError = isMaterialUnitPrice ? materialError : error;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#e5e7eb', fontFamily: 'inherit' }}
    >
      {/* Sidebar */}
      <ReportSidebar
        activeReport={activeReport}
        onReportChange={handleReportChange}
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <ReportToolbar
          activeReport={activeReport}
          isMaterialUnitPrice={isMaterialUnitPrice}
          reportYear={reportYear}
          onYearChange={setReportYear}
          reportMonth={reportMonth}
          onMonthChange={setReportMonth}
          searchText={searchText}
          onSearchChange={setSearchText}
          reportStartDateFrom={reportStartDateFrom}
          onStartDateFromChange={setReportStartDateFrom}
          reportStartDateTo={reportStartDateTo}
          onStartDateToChange={setReportStartDateTo}
          onFullscreen={() => setIsFullscreen(true)}
          onPrintPreview={() => setIsPrintPreview(true)}
          contractTypes={contractTypes}
          selectedContractTypeId={selectedContractTypeId}
          onContractTypeChange={setSelectedContractTypeId}
          contractStructureCatalogs={contractStructureCatalogs}
          selectedContractStructureCatalogId={selectedContractStructureCatalogId}
          onContractStructureCatalogChange={setSelectedContractStructureCatalogId}
          procurementMethods={procurementMethods}
          selectedProcurementMethodId={selectedProcurementMethodId}
          onProcurementMethodChange={setSelectedProcurementMethodId}
          partners={partners}
          selectedPartnerId={selectedPartnerId}
          onPartnerChange={setSelectedPartnerId}
          reportEndDate={reportEndDate}
          onEndDateChange={setReportEndDate}
          selectedLiquidationType={selectedLiquidationType}
          onLiquidationTypeChange={setSelectedLiquidationType}
        />

        {/* Paper area */}
        <div
          className="flex-1 overflow-auto p-6 flex justify-center"
          style={{ background: '#d1d5db' }}
        >
          {isLoading ? (
            <div style={{
              background: '#fff',
              borderRadius: 2,
              width: '100%',
              maxWidth: 1500,
              padding: '60px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}>
              {/* Spinner */}
              <div style={{
                width: 36,
                height: 36,
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                Đang tải dữ liệu báo cáo...
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                {activeLabel || 'Vui lòng chờ trong giây lát'}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : activeError ? (
            <div
              style={{
                background: '#fff',
                padding: '40px 20px',
                borderRadius: 2,
                textAlign: 'center',
                color: '#dc2626',
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                Lỗi tải dữ liệu
              </div>
              <div style={{ fontSize: 12 }}>{activeError.message}</div>
            </div>
          ) : (
            <div
              className="w-full"
              style={{
                maxWidth: 1500,
                boxShadow: '0 6px 32px rgba(0,0,0,0.22)',
                background: '#fff',
                borderRadius: 2,
              }}
            >
              <PrintPaper
                contracts={contracts}
                reportYear={reportYear}
                activeLabel={activeLabel}
                selectedFilterLabel={selectedFilterLabel}
                isMaterialUnitPrice={isMaterialUnitPrice}
                reportStartDateFrom={reportStartDateFrom}
                reportStartDateTo={reportStartDateTo}
                renderMaterialUnitPricePrintTable={() => (
                  <MaterialUnitPriceTable years={materialReportYears} />
                )}
                printRef={printRef}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="top-0! left-0! flex h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col overflow-hidden rounded-none border-0 p-0"
        >
          <DialogTitle hidden />
          <DialogDescription hidden />

          <div className="flex shrink-0 items-center gap-3 border-b bg-white px-6 py-3">
            <h3 className="flex-1 font-semibold" style={{ fontSize: 14 }}>
              {isMaterialUnitPrice
                ? 'Báo cáo tổng hợp đơn giá vật tư'
                : `Sổ theo dõi hợp đồng — ${activeLabel}`}
            </h3>
            <Button
              size="sm"
              className="gap-2 h-8"
              style={{ fontSize: 11, background: '#2563eb' }}
              onClick={() => {
                setIsFullscreen(false);
                setIsPrintPreview(true);
              }}
            >
              <Printer style={{ width: 13, height: 13 }} />
              In / Xuất PDF
            </Button>
            <Minimize2
              className="cursor-pointer text-gray-400 hover:text-gray-700"
              style={{ width: 16, height: 16 }}
              onClick={() => setIsFullscreen(false)}
            />
            <X
              className="cursor-pointer text-gray-400 hover:text-gray-700"
              style={{ width: 18, height: 18 }}
              onClick={() => setIsFullscreen(false)}
            />
          </div>

          <div
            className="flex-1 overflow-auto p-6 flex justify-center"
            style={{ background: '#d1d5db' }}
          >
            <div
              className="w-full"
              style={{
                boxShadow: '0 6px 32px rgba(0,0,0,0.22)',
                background: '#fff',
                borderRadius: 2,
              }}
            >
              <PrintPaper
                contracts={contracts}
                reportYear={reportYear}
                activeLabel={activeLabel}
                selectedFilterLabel={selectedFilterLabel}
                isMaterialUnitPrice={isMaterialUnitPrice}
                reportStartDateFrom={reportStartDateFrom}
                reportStartDateTo={reportStartDateTo}
                renderMaterialUnitPricePrintTable={() => (
                  <MaterialUnitPriceTable years={materialReportYears} />
                )}
                printRef={printRef}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={isPrintPreview} onOpenChange={setIsPrintPreview}>
        <DialogContent
          showCloseButton={false}
          className="top-0! left-0! flex h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col overflow-hidden rounded-none border-0 p-0"
        >
          <DialogTitle hidden />
          <DialogDescription hidden />

          <div className="flex shrink-0 items-center gap-3 border-b bg-white px-6 py-3">
            <h3
              className="flex-1 text-gray-700"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              {isMaterialUnitPrice
                ? `Xem trước khi in — Báo cáo đơn giá vật tư`
                : `Xem trước khi in — Sổ theo dõi hợp đồng năm ${reportYear}`}
            </h3>
            <Button
              size="sm"
              className="gap-2 h-8"
              style={{ fontSize: 11, background: '#1d4ed8' }}
              onClick={handlePrint}
            >
              <Printer style={{ width: 13, height: 13 }} />
              In / Lưu PDF
            </Button>
            <X
              className="cursor-pointer text-gray-400 hover:text-gray-700 ml-2"
              style={{ width: 18, height: 18 }}
              onClick={() => setIsPrintPreview(false)}
            />
          </div>

          <div
            className="flex-1 overflow-auto p-8 flex justify-center"
            style={{ background: '#9ca3af' }}
          >
            <div
              style={{
                boxShadow: '0 6px 32px rgba(0,0,0,0.35)',
                background: '#fff',
                borderRadius: 2,
                width: '100%',
                maxWidth: 1500,
              }}
            >
              <PrintPaper
                contracts={contracts}
                reportYear={reportYear}
                activeLabel={activeLabel}
                selectedFilterLabel={selectedFilterLabel}
                isMaterialUnitPrice={isMaterialUnitPrice}
                reportStartDateFrom={reportStartDateFrom}
                reportStartDateTo={reportStartDateTo}
                renderMaterialUnitPricePrintTable={() => (
                  <MaterialUnitPriceTable years={materialReportYears} />
                )}
                printRef={printRef}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}