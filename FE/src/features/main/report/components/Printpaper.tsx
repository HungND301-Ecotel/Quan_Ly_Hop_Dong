import { useMemo } from 'react';
import { ContractRecord } from '../api/Apimapper';
import { PrintTable } from './Printtable';
import { format } from 'date-fns';

interface PrintPaperProps {
    contracts: ContractRecord[];
    reportYear: string;
    selectedFilterLabel?: string;
    activeLabel: string;
    isMaterialUnitPrice: boolean;
    reportStartDateFrom: string;
    reportStartDateTo: string;
    renderMaterialUnitPricePrintTable?: () => React.ReactNode;
    printRef: React.RefObject<HTMLDivElement | null>;
}

export function PrintPaper({
    contracts,
    reportYear,
    selectedFilterLabel,
    activeLabel,
    isMaterialUnitPrice,
    reportStartDateFrom,
    reportStartDateTo,
    renderMaterialUnitPricePrintTable,
    printRef,
}: PrintPaperProps) {
    const stats = useMemo(
        () => ({
            total: contracts.length,
            totalValue: contracts.reduce((s, c) => s + c.totalAmount, 0),
            executed: contracts.reduce((s, c) => s + c.yearCumulativeAmount, 0),
            liquidated: contracts.filter((c) => c.liquidationStatus === 'R')
                .length,
        }),
        [contracts]
    );

    const formatRangeLabel = useMemo(() => {
        if (!reportStartDateFrom && !reportStartDateTo)
            return 'Toàn thời gian';
        const fromLabel = reportStartDateFrom
            ? format(new Date(reportStartDateFrom), 'dd/MM/yyyy')
            : '';
        const toLabel = reportStartDateTo
            ? format(new Date(reportStartDateTo), 'dd/MM/yyyy')
            : '';

        if (fromLabel && toLabel) return `Từ ${fromLabel} đến ${toLabel}`;
        if (fromLabel) return `Từ ${fromLabel}`;
        if (toLabel) return `Đến ${toLabel}`;
        return 'Toàn thời gian';
    }, [reportStartDateFrom, reportStartDateTo]);

    const fmt = (n: number) =>
        new Intl.NumberFormat('vi-VN').format(Math.round(n));

    return (
        <div
            ref={printRef}
            id="report-paper"
            style={{
                width: '100%',
                background: '#fff',
                padding: '28px 36px 36px',
                fontFamily: '"Times New Roman", Times, serif',
                color: '#000',
                fontSize: 10,
            }}
        >
            {/* ── HEADER ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 6,
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 0.3,
                        }}
                    >
                        CÔNG TY CỔ PHẦN THAN UÔNG BÍ - VINACOMIN
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 11, marginTop: 1 }}>
                        PHÒNG KẾ HOẠCH - VẬT TƯ
                    </div>
                    <div
                        style={{
                            borderBottom: '2.5px solid #000',
                            width: 380,
                            marginTop: 5,
                        }}
                    />
                </div>
                {!isMaterialUnitPrice && (
                    <div style={{ textAlign: 'right', fontSize: 10 }}>
                        <div style={{ marginBottom: 2 }}>
                            <b>Năm báo cáo: {reportYear}</b>
                        </div>
                        {selectedFilterLabel && (  // ← thay điều kiện
                            <div>
                                <b>Loại HĐ: {selectedFilterLabel}</b>
                            </div>
                        )}
                        <div style={{ marginTop: 2 }}>
                            <b>Tổng số HĐ: {stats.total}</b>
                        </div>
                    </div>
                )}
            </div>

            {/* ── TITLE ── */}
            <div style={{ textAlign: 'center', margin: '14px 0 10px' }}>
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                    }}
                >
                    {isMaterialUnitPrice
                        ? 'Báo cáo tổng hợp đơn giá vật tư theo hợp đồng'
                        : 'Sổ Theo Dõi Hợp Đồng'}
                </div>
                {!isMaterialUnitPrice && (
                    <>
                        <div style={{ fontWeight: 700, fontSize: 11, marginTop: 4 }}>
                            {activeLabel} — Lũy kế năm {reportYear}
                        </div>
                        {selectedFilterLabel && (  // ← thay điều kiện
                            <div style={{ fontSize: 10, marginTop: 2 }}>
                                ({selectedFilterLabel})
                            </div>
                        )}
                    </>
                )}
                {isMaterialUnitPrice && (
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 11,
                            marginTop: 4,
                        }}
                    >
                        {formatRangeLabel}
                    </div>
                )}
            </div>

            {/* ── BẢNG THỐNG KÊ TỔNG HỢP ── */}
            {!isMaterialUnitPrice && (
                <table
                    style={{
                        borderCollapse: 'collapse',
                        marginBottom: 12,
                        fontSize: 9,
                    }}
                >
                    <tbody>
                        <tr>
                            <td
                                style={{
                                    border: '1px solid #000',
                                    padding: '4px 12px',
                                    background: '#fff',
                                }}
                            >
                                Tổng số HĐ
                            </td>
                            <td
                                style={{
                                    border: '1px solid #999',
                                    padding: '4px 16px',
                                    fontWeight: 700,
                                }}
                            >
                                {stats.total}
                            </td>
                            <td style={{ width: 20 }} />
                            <td
                                style={{
                                    border: '1px solid #000',
                                    padding: '4px 12px',
                                    background: '#fff',
                                }}
                            >
                                Tổng giá trị HĐ
                            </td>
                            <td
                                style={{
                                    border: '1px solid #999',
                                    padding: '4px 16px',
                                    fontWeight: 700,
                                    textAlign: 'right',
                                }}
                            >
                                {fmt(stats.totalValue)}
                            </td>
                            <td style={{ width: 20 }} />
                            <td
                                style={{
                                    border: '1px solid #000',
                                    padding: '4px 12px',
                                    background: '#fff',
                                }}
                            >
                                Lũy kế thực hiện
                            </td>
                            <td
                                style={{
                                    border: '1px solid #999',
                                    padding: '4px 16px',
                                    fontWeight: 700,
                                    textAlign: 'right',
                                }}
                            >
                                {fmt(stats.executed)}
                            </td>
                            <td style={{ width: 20 }} />
                            <td
                                style={{
                                    border: '1px solid #000',
                                    padding: '4px 12px',
                                    background: '#fff',
                                }}
                            >
                                Đã thanh lý
                            </td>
                            <td
                                style={{
                                    border: '1px solid #999',
                                    padding: '4px 16px',
                                    fontWeight: 700,
                                }}
                            >
                                {stats.liquidated} HĐ
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* ── BẢNG CHÍNH ── */}
            {isMaterialUnitPrice ? (
                renderMaterialUnitPricePrintTable?.()
            ) : (
                <PrintTable
                    contracts={contracts}
                    reportYear={reportYear}
                />
            )}

            {/* ── FOOTER CHỮ KÝ ── */}
            <div style={{ marginTop: 28 }}>
                <div
                    style={{
                        textAlign: 'right',
                        fontStyle: 'italic',
                        fontSize: 10,
                        marginBottom: 20,
                    }}
                >
                    Uông Bí, ngày _____ tháng _____ năm {reportYear}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        textAlign: 'center',
                        gap: 8,
                    }}
                >
                    {[
                        { title: 'NGƯỜI LẬP BIỂU', note: '(Ký, ghi rõ họ tên)' },
                        {
                            title: 'TRƯỞNG PHÒNG KẾ HOẠCH',
                            note: '(Ký, ghi rõ họ tên)',
                        },
                        {
                            title: 'GIÁM ĐỐC CÔNG TY',
                            note: '(Ký, ghi rõ họ tên, đóng dấu)',
                        },
                    ].map((sig, i) => (
                        <div key={i} style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 10 }}>
                                {sig.title}
                            </div>
                            <div
                                style={{
                                    fontSize: 9,
                                    marginTop: 2,
                                    color: '#555',
                                }}
                            >
                                {sig.note}
                            </div>
                            <div
                                style={{
                                    marginTop: 56,
                                    borderBottom: '1px solid #000',
                                    width: '60%',
                                    margin: '56px auto 0',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}