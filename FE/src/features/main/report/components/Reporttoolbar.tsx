import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Printer, Search, Maximize2 } from 'lucide-react';
// Reporttoolbar.tsx
import { ContractType } from '@/services/contract-type/type';
import { ContractStructureCatalog } from '@/services/structure/type';
import { ProcurementMethod } from '@/services/procurement-method/type';
import { Partner } from '@/services/partner/type';

// Tab nào dùng ContractType dropdown
const TABS_USING_CONTRACT_TYPE = ['by-category', 'by-sector'];
// Tab nào dùng ContractStructureCatalog dropdown  
const TABS_USING_STRUCTURE_CATALOG = ['by-form'];
const TABS_USING_PROCUREMENT_METHOD = ['by-bidding'];
const TABS_USING_PARTNER = ['by-partner'];
const TABS_USING_END_DATE = ['by-expiry'];
const TABS_USING_LIQUIDATION = ['by-liquidation'];

interface ReportToolbarProps {
    activeReport: string;  // ← thêm để toolbar tự biết đang ở tab nào
    isMaterialUnitPrice: boolean;

    // ContractType filter
    contractTypes: ContractType[];
    selectedContractTypeId: string;
    onContractTypeChange: (id: string) => void;

    // ContractStructureCatalog filter
    contractStructureCatalogs: ContractStructureCatalog[];
    selectedContractStructureCatalogId: string;
    onContractStructureCatalogChange: (id: string) => void;

    procurementMethods: ProcurementMethod[];
    selectedProcurementMethodId: string;
    onProcurementMethodChange: (id: string) => void;

    partners: Partner[];
    selectedPartnerId: string;
    onPartnerChange: (id: string) => void;

    // ... các props cũ khác giữ nguyên
    reportEndDate: string;
    onEndDateChange: (date: string) => void;

    reportYear: string;
    onYearChange: (year: string) => void;
    reportMonth: string;
    onMonthChange: (month: string) => void;
    searchText: string;
    onSearchChange: (text: string) => void;
    reportStartDateFrom: string;
    onStartDateFromChange: (date: string) => void;
    reportStartDateTo: string;
    onStartDateToChange: (date: string) => void;
    onFullscreen: () => void;
    onPrintPreview: () => void;

    selectedLiquidationType: 'all' | 'liquidated' | 'auto-liquidated';
    onLiquidationTypeChange: (value: 'all' | 'liquidated' | 'auto-liquidated') => void;
}

export function ReportToolbar({
    activeReport,
    isMaterialUnitPrice,
    contractTypes,
    selectedContractTypeId,
    onContractTypeChange,
    contractStructureCatalogs,
    selectedContractStructureCatalogId,
    onContractStructureCatalogChange,
    procurementMethods,
    selectedProcurementMethodId,
    onProcurementMethodChange,
    reportYear,
    onYearChange,
    reportMonth,
    onMonthChange,
    searchText,
    onSearchChange,
    reportStartDateFrom,
    onStartDateFromChange,
    reportStartDateTo,
    onStartDateToChange,
    onFullscreen,
    onPrintPreview,
    partners,
    selectedPartnerId,
    onPartnerChange,
    reportEndDate,
    onEndDateChange,
    selectedLiquidationType,
    onLiquidationTypeChange,
}: ReportToolbarProps) {

    const showContractTypeFilter = TABS_USING_CONTRACT_TYPE.includes(activeReport);
    const showStructureCatalogFilter = TABS_USING_STRUCTURE_CATALOG.includes(activeReport);
    const showProcurementMethodFilter = TABS_USING_PROCUREMENT_METHOD.includes(activeReport);
    const showPartnerFilter = TABS_USING_PARTNER.includes(activeReport);
    const showEndDateFilter = TABS_USING_END_DATE.includes(activeReport);
    const showLiquidationFilter = TABS_USING_LIQUIDATION.includes(activeReport);  // ← thêm

    return (
        <div className="flex items-center gap-3 flex-wrap px-4 py-2.5 border-b"
            style={{ background: '#fff', borderColor: '#e2e8f0' }}>

            {(isMaterialUnitPrice || activeReport === 'by-time') ? (
                <>
                    {/* date range giữ nguyên */}
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Từ ngày</span>
                        <input type="date" className="h-8 rounded border px-2"
                            style={{ fontSize: 11, borderColor: '#e2e8f0' }}
                            value={reportStartDateFrom}
                            onChange={(e) => onStartDateFromChange(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Đến ngày</span>
                        <input type="date" className="h-8 rounded border px-2"
                            style={{ fontSize: 11, borderColor: '#e2e8f0' }}
                            value={reportStartDateTo}
                            onChange={(e) => onStartDateToChange(e.target.value)} />
                    </div>
                </>
            ) : (
                <>
                    {/* ── Dropdown động theo tab ── */}
                    {showContractTypeFilter && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Loại HĐ</span>
                            <Select value={selectedContractTypeId} onValueChange={onContractTypeChange}>
                                <SelectTrigger className="h-8 w-56" style={{ fontSize: 11 }}>
                                    <SelectValue placeholder="Tất cả loại HĐ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả loại HĐ</SelectItem>
                                    {contractTypes.map((ct) => (
                                        <SelectItem key={ct.id} value={ct.id} className="text-xs">
                                            {ct.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showStructureCatalogFilter && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Hình thức HĐ</span>
                            <Select
                                value={selectedContractStructureCatalogId}
                                onValueChange={onContractStructureCatalogChange}
                            >
                                <SelectTrigger className="h-8 w-56" style={{ fontSize: 11 }}>
                                    <SelectValue placeholder="Tất cả hình thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả hình thức</SelectItem>
                                    {contractStructureCatalogs.map((c) => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showProcurementMethodFilter && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Hình thức đấu thầu
                            </span>
                            <Select
                                value={selectedProcurementMethodId}
                                onValueChange={onProcurementMethodChange}
                            >
                                <SelectTrigger className="h-8 w-56" style={{ fontSize: 11 }}>
                                    <SelectValue placeholder="Tất cả hình thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả hình thức</SelectItem>
                                    {procurementMethods.map((pm) => (
                                        <SelectItem key={pm.id} value={pm.id} className="text-xs">
                                            {pm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showPartnerFilter && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Khách hàng / NCC
                            </span>
                            <Select value={selectedPartnerId} onValueChange={onPartnerChange}>
                                <SelectTrigger className="h-8 w-64" style={{ fontSize: 11 }}>
                                    <SelectValue placeholder="Tất cả đối tác" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả đối tác</SelectItem>
                                    {partners.map((p) => (
                                        <SelectItem key={p.id} value={p.id} className="text-xs">
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showEndDateFilter && (
                        <div className="flex items-center gap-2">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Ngày kết thúc
                            </span>
                            <input
                                type="date"
                                className="h-8 rounded border px-2"
                                style={{ fontSize: 11, borderColor: '#e2e8f0' }}
                                value={reportEndDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                            />
                        </div>
                    )}

                    {showLiquidationFilter && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                Loại thanh lý
                            </span>
                            <Select
                                value={selectedLiquidationType}
                                onValueChange={(v) => onLiquidationTypeChange(v as 'all' | 'liquidated' | 'auto-liquidated')}
                            >
                                <SelectTrigger className="h-8 w-48" style={{ fontSize: 11 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">Tất cả</SelectItem>
                                    <SelectItem value="liquidated" className="text-xs">Thanh lý</SelectItem>
                                    <SelectItem value="auto-liquidated" className="text-xs">Tự động thanh lý</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Năm */}
                    {activeReport !== 'by-expiry' && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280' }}>Năm</span>
                            <Select value={reportYear} onValueChange={onYearChange}>
                                <SelectTrigger className="h-8 w-24" style={{ fontSize: 11 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['2023', '2024', '2025', '2026'].map((y) => (
                                        <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {activeReport !== 'by-expiry' && (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 11, color: '#6b7280' }}>Tháng</span>
                            <Select value={reportMonth} onValueChange={onMonthChange}>
                                <SelectTrigger className="h-8 w-28" style={{ fontSize: 11 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">
                                            Tháng {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/* Tháng */}


                    {/* Search */}
                    <div className="flex-1 min-w-48">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                style={{ width: 13, height: 13 }} />
                            <input type="text"
                                placeholder="Tìm theo tên HĐ, số HĐ, đối tác, mã..."
                                className="w-full pl-8 pr-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                style={{ fontSize: 11, borderColor: '#e2e8f0' }}
                                value={searchText}
                                onChange={(e) => onSearchChange(e.target.value)} />
                        </div>
                    </div>
                </>
            )}

            {/* Buttons */}
            <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" className="h-8 gap-1.5"
                    style={{ fontSize: 11 }} onClick={onFullscreen}>
                    <Maximize2 style={{ width: 13, height: 13 }} />
                    Toàn màn hình
                </Button>
                <Button size="sm" className="h-8 gap-1.5"
                    style={{ fontSize: 11, background: '#2563eb' }} onClick={onPrintPreview}>
                    <Printer style={{ width: 13, height: 13 }} />
                    In / Xuất PDF
                </Button>
            </div>
        </div>
    );
}