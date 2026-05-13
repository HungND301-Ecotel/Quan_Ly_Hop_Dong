import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { materialService } from '@/services/material';
import { Material } from '@/services/material/type';
import { unitOfMeasureService } from '@/services/unit';
import ExcelJS from 'exceljs';
import { CheckCircle2, Download, Loader2, Upload, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportedRow {
    materialCode: string;
    name: string;
    unitOfMeasureName: string;
    price: number;
    quantity: number;
    materialId?: string;
    unitOfMeasureId?: string;
    existsInCatalog?: boolean;
}

interface MaterialImportDialogProps {
    isOtherMaterial?: boolean;
    contractFormat: number | undefined;
    existingMaterials: Material[];
    onSuccess: (items: { materialId: string; quantity: number }[]) => void;
    onReloadMaterials: () => void;
}

// ─── Excel columns ────────────────────────────────────────────────────────────
const COL = {
    materialCode: 0,
    name: 1,
    unitOfMeasureName: 2,
    price: 3,
    quantity: 4,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialImportDialog({
    isOtherMaterial = false,
    contractFormat,
    onSuccess,
    existingMaterials,
    onReloadMaterials,
}: MaterialImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<ImportedRow[]>([]);
    const [creating, setCreating] = useState(false);
    const [adding, setAdding] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const label = isOtherMaterial ? 'thành phần hợp đồng khác' : 'vật tư';

    const isRuleContract = contractFormat !== undefined && [0, 1].includes(contractFormat);
    // ── Download template với ExcelJS dropdown ─────────────────────────────────
    const handleDownloadTemplate = async () => {
        try {
            setDownloading(true);

            // 1. Fetch danh sách đơn vị tính thực tế
            const units = await unitOfMeasureService.getUnitOfMeasureList();
            const uomNames = (units ?? []).map((u) => u.name);

            // 2. Tạo workbook
            const wb = new ExcelJS.Workbook();

            // 3. Sheet ẩn "_UOM" — chứa danh sách đơn vị tính
            const wsUom = wb.addWorksheet('_UOM', { state: 'veryHidden' });
            uomNames.forEach((name) => wsUom.addRow([name]));

            // 4. Sheet chính
            const ws = wb.addWorksheet('Danh sách vật tư');

            // Header row
            const headers = isRuleContract
                ? ['Mã vật tư (*)', 'Tên vật tư (*)', 'Đơn vị tính (*)', 'Đơn giá (*)']
                : ['Mã vật tư (*)', 'Tên vật tư (*)', 'Đơn vị tính (*)', 'Đơn giá (*)', 'Khối lượng (*)'];

            ws.addRow(headers);

            // Style header
            const headerRow = ws.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF2563EB' }, // blue-600
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
            headerRow.height = 24;

            // Sample rows
            let sampleRows: ExcelJS.Row[] = [];

            if (isRuleContract) {
                sampleRows = [
                    ws.addRow(['VT001', 'Ống thép DN100', uomNames[0] ?? '', 150000]),
                    ws.addRow(['VT002', 'Van cầu DN50', uomNames[1] ?? '', 320000]),
                ];
            } else {
                sampleRows = [
                    ws.addRow(['VT001', 'Ống thép DN100', uomNames[0] ?? '', 150000, 10]),
                    ws.addRow(['VT002', 'Van cầu DN50', uomNames[1] ?? '', 320000, 5]),
                ];
            }

            sampleRows.forEach((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });

            // Column widths
            ws.columns = [
                { width: 20 },
                { width: 35 },
                { width: 22 },
                { width: 18 },
                { width: 18 },
            ];

            // 5. Data Validation dropdown cho cột C (đơn vị tính), từ hàng 2 đến 1000
            if (uomNames.length > 0) {
                (ws as any).dataValidations.add('C2:C1000', {
                    type: 'list',
                    allowBlank: false,
                    formulae: [`_UOM!$A$1:$A$${uomNames.length}`],
                    showErrorMessage: true,
                    errorStyle: 'stop',
                    errorTitle: 'Giá trị không hợp lệ',
                    error: 'Vui lòng chọn đơn vị tính từ danh sách có sẵn',
                });
            }

            // 6. Ghi file và trigger download
            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mau_nhap_${isOtherMaterial ? 'thanh_phan_khac' : 'vat_tu'}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Lỗi khi tạo file mẫu');
        } finally {
            setDownloading(false);
        }
    };

    // ── Parse uploaded Excel (vẫn dùng SheetJS để đọc — nhẹ hơn) ─────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = '';
        if (!file) return;

        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const targetSheetName =
                wb.SheetNames.find((n) => !n.startsWith('_')) ?? wb.SheetNames[0];
            const ws = wb.Sheets[targetSheetName];
            const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // Detect data start row: skip rows until we find "Mã vật tư" header
            let dataStartRow = 0;
            for (let i = 0; i < raw.length; i++) {
                const cellVal = String(raw[i]?.[COL.materialCode] ?? '');
                if (cellVal.startsWith('Mã')) {
                    dataStartRow = i + 1;
                    break;
                }
            }

            const parsed: ImportedRow[] = [];
            for (let i = dataStartRow; i < raw.length; i++) {
                const row = raw[i];
                if (!row || !row[COL.materialCode]) continue;

                const materialCode = String(row[COL.materialCode] ?? '').trim();
                const name = String(row[COL.name] ?? '').trim();
                const unitOfMeasureName = String(row[COL.unitOfMeasureName] ?? '').trim();
                const price = Number(row[COL.price]) || 0;
                const quantity = isRuleContract ? 0 : (Number(row[COL.quantity]) || 0);

                if (!materialCode) continue;
                parsed.push({ materialCode, name, unitOfMeasureName, price, quantity });
            }

            if (parsed.length === 0) {
                toast.error('Không tìm thấy dữ liệu hợp lệ trong file');
                return;
            }

            // Match against existing catalog
            const matched = parsed.map((row) => {
                const found = existingMaterials.find(
                    (m) => m.materialCode.trim().toLowerCase() === row.materialCode.toLowerCase()
                );
                return { ...row, materialId: found?.id, existsInCatalog: !!found };
            });

            setRows(matched);
            setOpen(true);
        } catch {
            toast.error('Lỗi khi đọc file Excel');
        }
    };

    // ── Create missing materials ───────────────────────────────────────────────
    const handleCreateMissing = async () => {
        const missing = rows.filter((r) => !r.existsInCatalog);
        if (missing.length === 0) return;

        try {
            setCreating(true);

            const units = await unitOfMeasureService.getUnitOfMeasureList();

            const seen = new Set<string>();
            const toCreate = missing.filter((r) => {
                if (seen.has(r.materialCode)) return false;
                seen.add(r.materialCode);
                return true;
            });

            await Promise.all(
                toCreate.map((r) => {
                    const unit = units?.find(
                        (u) => u.name.trim().toLowerCase() === r.unitOfMeasureName.toLowerCase()
                    );
                    return materialService.createMaterial({
                        materialCode: r.materialCode,
                        name: r.name,
                        unitOfMeasureId: unit?.id ?? '',
                        price: r.price,
                        ...(isOtherMaterial && { isOtherMaterial: true }),
                    });
                })
            );

            toast.success(`Đã tạo ${toCreate.length} ${label} mới`);

            const fresh = isOtherMaterial
                ? await materialService.getOtherMaterialList()
                : await materialService.getMaterialList();

            onReloadMaterials();

            setRows((prev) =>
                prev.map((r) => {
                    const found = (fresh ?? []).find(
                        (m) => m.materialCode.trim().toLowerCase() === r.materialCode.toLowerCase()
                    );
                    return { ...r, materialId: found?.id, existsInCatalog: !!found };
                })
            );
        } catch {
            toast.error(`Lỗi khi tạo ${label}`);
        } finally {
            setCreating(false);
        }
    };

    // ── Add to form ────────────────────────────────────────────────────────────
    const handleAddToForm = async () => {
        const allExist = rows.every((r) => r.existsInCatalog && r.materialId);
        if (!allExist) return;

        setAdding(true);
        try {
            const items = rows.map((r) => ({
                materialId: r.materialId!,
                quantity: r.quantity,
            }));
            onSuccess(items)
            setOpen(false);
            setRows([]);
            toast.success(`Đã thêm ${items.length} ${label} vào hợp đồng`);
        } finally {
            setAdding(false);
        }
    };

    const hasMissing = rows.some((r) => !r.existsInCatalog);
    const allResolved = rows.length > 0 && rows.every((r) => r.existsInCatalog);

    return (
        <>
            <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls'
                className='hidden'
                onChange={handleFileChange}
            />

            <div className='flex items-center gap-2'>
                <Button
                    type='button'
                    variant='outline'
                    size='default'
                    onClick={handleDownloadTemplate}
                    disabled={downloading}
                >
                    {downloading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <Download className='h-4 w-4' />
                    )}
                    <span>{downloading ? 'Đang tạo...' : 'Tải xuống mẫu'}</span>
                </Button>

                <Button
                    type='button'
                    variant='outline'
                    size='default'
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className='h-4 w-4' />
                    <span>Tải lên Excel</span>
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='flex flex-col gap-0 w-full md:min-w-3xl lg:min-w-5xl px-0 overflow-hidden max-h-[90vh]'>
                    <DialogHeader className='gap-1 p-6 pb-4 border-b'>
                        <DialogTitle className='text-xl font-semibold'>
                            Kiểm tra danh sách {label} từ Excel
                        </DialogTitle>
                        <p className='text-sm text-muted-foreground'>
                            {rows.length} dòng được đọc •{' '}
                            {rows.filter((r) => r.existsInCatalog).length} có trong danh mục •{' '}
                            <span className={hasMissing ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {rows.filter((r) => !r.existsInCatalog).length} chưa có
                            </span>
                        </p>
                    </DialogHeader>

                    <div className='flex-1 overflow-auto p-6'>
                        <table className='w-full text-sm border-collapse'>
                            <thead>
                                <tr className='bg-muted/60'>
                                    <th className='text-left px-3 py-2 border font-medium w-8'>#</th>
                                    <th className='text-left px-3 py-2 border font-medium'>Mã vật tư</th>
                                    <th className='text-left px-3 py-2 border font-medium'>Tên vật tư</th>
                                    <th className='text-left px-3 py-2 border font-medium'>Đơn vị tính</th>
                                    <th className='text-right px-3 py-2 border font-medium'>Đơn giá</th>
                                    {!isRuleContract && (
                                        <th className='text-right px-3 py-2 border font-medium'>Khối lượng</th>
                                    )}
                                    <th className='text-center px-3 py-2 border font-medium'>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            row.existsInCatalog
                                                ? 'bg-white hover:bg-green-50/40'
                                                : 'bg-red-50 hover:bg-red-100/60'
                                        }
                                    >
                                        <td className='px-3 py-2 border text-muted-foreground'>{idx + 1}</td>
                                        <td className='px-3 py-2 border font-mono text-xs'>{row.materialCode}</td>
                                        <td className='px-3 py-2 border'>{row.name}</td>
                                        <td className='px-3 py-2 border'>{row.unitOfMeasureName}</td>
                                        <td className='px-3 py-2 border text-right'>
                                            {row.price.toLocaleString('vi-VN')} đ
                                        </td>
                                        {!isRuleContract && (
                                            <td className='px-3 py-2 border text-right font-medium'>
                                                {row.quantity}
                                            </td>
                                        )}
                                        <td className='px-3 py-2 border text-center'>
                                            {row.existsInCatalog ? (
                                                <span className='inline-flex items-center gap-1 text-green-600 text-xs font-medium'>
                                                    <CheckCircle2 className='size-3.5' />
                                                    Có trong danh mục
                                                </span>
                                            ) : (
                                                <span className='inline-flex items-center gap-1 text-red-600 text-xs font-medium'>
                                                    <XCircle className='size-3.5' />
                                                    Chưa có trong danh mục
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex items-center justify-between gap-3 p-4 px-6 border-t bg-muted/20'>
                        <Button variant='outline' type='button' onClick={() => setOpen(false)}>
                            Hủy
                        </Button>

                        <div className='flex items-center gap-3'>
                            {hasMissing && (
                                <Button
                                    type='button'
                                    variant='destructive'
                                    onClick={handleCreateMissing}
                                    disabled={creating}
                                    className='min-w-48'
                                >
                                    {creating ? (
                                        <><Loader2 className='size-4 mr-2 animate-spin' />Đang tạo...</>
                                    ) : (
                                        <><CheckCircle2 className='size-4 mr-2' />Tạo các {label} chưa có ({rows.filter((r) => !r.existsInCatalog).length})</>
                                    )}
                                </Button>
                            )}

                            <Button
                                type='button'
                                onClick={handleAddToForm}
                                disabled={!allResolved || adding}
                                className='min-w-40 bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                                title={hasMissing ? `Vui lòng tạo hết các ${label} chưa có trước` : ''}
                            >
                                {adding ? (
                                    <><Loader2 className='size-4 mr-2 animate-spin' />Đang thêm...</>
                                ) : (
                                    <><Upload className='size-4 mr-2' />Thêm {label} ({rows.length})</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}