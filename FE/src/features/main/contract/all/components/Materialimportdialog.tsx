import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { FormNumber } from '@/components/form/form-number';
import { FormSelect } from '@/components/form/form-select';
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
import { UnitOfMeasure } from '@/services/unit/type';
import ExcelJS from 'exceljs';
import {
  CheckCircle2,
  Download,
  Loader2,
  PlusIcon,
  Trash2Icon,
  Upload,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Control,
  useFieldArray,
  useForm,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportedRow {
  materialCode: string;
  quantity: number;
  name: string;
  unitOfMeasureName: string;
  unitOfMeasureId?: string;
  price: number;
  materialId?: string;
  existsInCatalog?: boolean;
  isCreating?: boolean;
}

interface ImportFormValues {
  rows: ImportedRow[];
}

interface MaterialImportDialogProps {
  isOtherMaterial?: boolean;
  contractFormat: number | undefined;
  existingMaterials: Material[];
  onSuccess: (items: { materialId: string; quantity: number }[]) => void;
  onReloadMaterials: () => void;
}

// ─── Excel columns ────────────────────────────────────────────────────────────
// Giờ chỉ còn 2 cột: Mã vật tư + Số lượng (rule contract thì chỉ còn Mã vật tư)
const COL = {
  materialCode: 0,
  quantity: 1,
} as const;

// ─── Cell chọn đơn vị tính — tách riêng để sync unitOfMeasureName khi chọn ────
function UnitSelectCell({
  control,
  idx,
  units,
  setValue,
}: {
  control: Control<ImportFormValues>;
  idx: number;
  units: UnitOfMeasure[];
  setValue: UseFormSetValue<ImportFormValues>;
}) {
  const currentValue = useWatch({
    control,
    name: `rows.${idx}.unitOfMeasureId`,
  });

  // Mỗi khi user chọn 1 unit khác, đồng bộ luôn unitOfMeasureName tương ứng
  // (để hiển thị đúng sau khi tạo material, và để khớp dữ liệu gửi đi sau này).
  useEffect(() => {
    if (!currentValue) return;
    const unit = units.find((u) => u.id === currentValue);
    if (unit) {
      setValue(`rows.${idx}.unitOfMeasureName`, unit.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, units]);

  return (
    <FormSelect
      control={control}
      name={`rows.${idx}.unitOfMeasureId`}
      placeholder='Chọn đơn vị'
      options={units.map((u) => ({ value: u.id, label: u.name }))}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialImportDialog({
  isOtherMaterial = false,
  contractFormat,
  onSuccess,
  existingMaterials,
  onReloadMaterials,
}: MaterialImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const label = isOtherMaterial ? 'dịch vụ khác' : 'vật tư, tài sản';
  const isRuleContract =
    contractFormat !== undefined && [0, 1].includes(contractFormat);

  // ── Form nội bộ chỉ phục vụ dialog preview/import, tách biệt form cha ──────
  const form = useForm<ImportFormValues>({
    mode: 'onChange',
    defaultValues: { rows: [] },
  });

  const { fields, replace, remove } = useFieldArray({
    control: form.control,
    name: 'rows',
  });

  const watchedRows = useWatch({ control: form.control, name: 'rows' }) || [];

  // ── Load danh sách đơn vị tính khi mở dialog (dùng cho dropdown inline) ────
  useEffect(() => {
    if (!open) return;
    unitOfMeasureService.getUnitOfMeasureList().then((data) => {
      setUnits(data ?? []);
    });
  }, [open]);

  // ── Download template (chỉ còn Mã vật tư + Số lượng) ───────────────────────
  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Danh sách vật tư');

      const headers = isRuleContract
        ? ['Mã vật tư (*)']
        : ['Mã vật tư (*)', 'Số lượng (*)'];

      ws.addRow(headers);

      const headerRow = ws.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' },
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

      const sampleRows: ExcelJS.Row[] = isRuleContract
        ? [ws.addRow(['VT001']), ws.addRow(['VT002'])]
        : [ws.addRow(['VT001', 10]), ws.addRow(['VT002', 5])];

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

      ws.columns = isRuleContract
        ? [{ width: 20 }]
        : [{ width: 20 }, { width: 18 }];

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

  // ── Parse uploaded Excel (chỉ còn Mã vật tư + Số lượng) ─────────────────
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
        const rawQuantity = row[COL.quantity];
        const parsedQuantity = Number(rawQuantity);
        const quantity = isRuleContract ? 0 : parsedQuantity;

        if (
          !isRuleContract &&
          (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0)
        ) {
          toast.error(`Số lượng không hợp lệ tại dòng ${i + 1}`);
          return;
        }

        if (!materialCode) continue;
        parsed.push({
          materialCode,
          quantity,
          name: '',
          unitOfMeasureName: '',
          unitOfMeasureId: undefined,
          price: 0,
        });
      }

      // Gộp các dòng trùng mã vật tư (cộng dồn số lượng) trước khi đối chiếu danh mục
      const mergedMap = new Map<string, ImportedRow>();
      parsed.forEach((row) => {
        const key = row.materialCode.toLowerCase();
        const existing = mergedMap.get(key);
        if (existing) {
          existing.quantity += row.quantity;
        } else {
          mergedMap.set(key, { ...row });
        }
      });
      const dedupedParsed = Array.from(mergedMap.values());
      const duplicateCount = parsed.length - dedupedParsed.length;

      if (dedupedParsed.length === 0) {
        toast.error('Không tìm thấy dữ liệu hợp lệ trong file');
        return;
      }

      // Match against existing catalog — nếu đã có thì lấy luôn info hiển thị
      const matched = dedupedParsed.map((row) => {
        const found = existingMaterials.find(
          (m) =>
            m.materialCode.trim().toLowerCase() ===
            row.materialCode.toLowerCase()
        );

        if (found) {
          return {
            ...row,
            materialId: found.id,
            existsInCatalog: true,
            name: found.name,
            // ⚠️ Kiểm tra lại đúng tên field trong type Material của bạn
            unitOfMeasureName: (found as any).unitOfMeasureName ?? '',
            unitOfMeasureId: (found as any).unitOfMeasureId,
            price: found.price ?? 0,
          };
        }

        return { ...row, existsInCatalog: false };
      });

      // Reset toàn bộ field array với dữ liệu mới parse được
      replace(matched);
      setOpen(true);
      if (duplicateCount > 0) {
        toast.warning(
          `Phát hiện ${duplicateCount} mã vật tư bị trùng trong file, đã tự động gộp số lượng`
        );
      }
    } catch {
      toast.error('Lỗi khi đọc file Excel');
    }
  };

  // ── Validate 1 dòng đã nhập đủ tên/đơn vị/giá chưa ──────────────────────────
  const isRowFilled = (row: ImportedRow) =>
    !!row.name?.trim() && !!row.unitOfMeasureId && Number(row.price) > 0;

  // ── Tạo 1 vật tư riêng lẻ khi bấm dấu + ─────────────────────────────────────
  const handleCreateSingleMaterial = async (idx: number) => {
    const row = form.getValues(`rows.${idx}`);
    if (!row || row.existsInCatalog || !isRowFilled(row)) return;

    form.setValue(`rows.${idx}.isCreating`, true);

    try {
      const created = await materialService.createMaterial({
        materialCode: row.materialCode,
        name: row.name,
        unitOfMeasureId: row.unitOfMeasureId ?? '',
        price: row.price,
        ...(isOtherMaterial && { isOtherMaterial: true }),
      });

      onReloadMaterials();

      // ⚠️ Nếu createMaterial không trả về object có `id`, thay đoạn dưới
      // bằng cách gọi lại getMaterialList()/getOtherMaterialList() và map
      // theo materialCode, giống cách handleCreateMissing đang làm.
      form.setValue(`rows.${idx}.materialId`, (created as any)?.id);
      form.setValue(`rows.${idx}.existsInCatalog`, true);
      form.setValue(`rows.${idx}.isCreating`, false);
      toast.success(`Đã tạo ${label} "${row.name}"`);
    } catch {
      toast.error(`Lỗi khi tạo ${label} "${row.materialCode}"`);
      form.setValue(`rows.${idx}.isCreating`, false);
    }
  };

  // ── Create missing materials (hàng loạt) ────────────────────────────────────
  const handleCreateMissing = async () => {
    const allRows = form.getValues('rows');
    const missing = allRows
      .map((r, idx) => ({ ...r, idx }))
      .filter((r) => !r.existsInCatalog);
    if (missing.length === 0) return;
    if (!missing.every(isRowFilled)) return; // guard, dù nút đã disable

    try {
      setCreating(true);

      const seen = new Set<string>();
      const toCreate = missing.filter((r) => {
        const key = r.materialCode.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      await Promise.all(
        toCreate.map((r) =>
          materialService.createMaterial({
            materialCode: r.materialCode,
            name: r.name,
            unitOfMeasureId: r.unitOfMeasureId ?? '',
            price: r.price,
            ...(isOtherMaterial && { isOtherMaterial: true }),
          })
        )
      );

      toast.success(`Đã tạo ${toCreate.length} ${label} mới`);

      const fresh = isOtherMaterial
        ? await materialService.getOtherMaterialList()
        : await materialService.getMaterialList();

      onReloadMaterials();

      allRows.forEach((r, idx) => {
        if (r.existsInCatalog) return;
        const found = (fresh ?? []).find(
          (m) =>
            m.materialCode.trim().toLowerCase() === r.materialCode.toLowerCase()
        );
        if (found) {
          form.setValue(`rows.${idx}.materialId`, found.id);
          form.setValue(`rows.${idx}.existsInCatalog`, true);
        }
      });
    } catch {
      toast.error(`Lỗi khi tạo ${label}`);
    } finally {
      setCreating(false);
    }
  };

  // ── Add to form cha ──────────────────────────────────────────────────────
  const handleAddToForm = async () => {
    const allRows = form.getValues('rows');
    const allExist = allRows.every((r) => r.existsInCatalog && r.materialId);
    if (!allExist) return;

    setAdding(true);
    try {
      const items = allRows.map((r) => ({
        materialId: r.materialId!,
        quantity: r.quantity,
      }));

      onSuccess(items);
      setOpen(false);
      replace([]);

      toast.success(`Đã thêm ${items.length} ${label} vào hợp đồng`);
    } finally {
      setAdding(false);
    }
  };

  const hasMissing = watchedRows.some((r) => !r.existsInCatalog);
  const allMissingFilled = watchedRows
    .filter((r) => !r.existsInCatalog)
    .every(isRowFilled);
  const allResolved =
    watchedRows.length > 0 && watchedRows.every((r) => r.existsInCatalog);

  const handleDialogOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      replace([]);
    }
  };

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

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='flex flex-col gap-0 w-full md:min-w-3xl lg:min-w-5xl px-0 overflow-hidden max-h-[90vh]'>
          <DialogHeader className='gap-1 p-6 pb-4 border-b'>
            <DialogTitle className='text-xl font-semibold'>
              Kiểm tra danh sách {label} từ Excel
            </DialogTitle>
            <p className='text-sm text-muted-foreground'>
              {watchedRows.length} dòng được đọc •{' '}
              {watchedRows.filter((r) => r.existsInCatalog).length} có trong
              danh mục •{' '}
              <span
                className={
                  hasMissing
                    ? 'text-red-600 font-medium'
                    : 'text-green-600 font-medium'
                }
              >
                {watchedRows.filter((r) => !r.existsInCatalog).length} chưa có
              </span>
            </p>
          </DialogHeader>

          {/* Form nội bộ chỉ bọc phần bảng — không submit, chỉ tận dụng RHF context */}
          <Form context={form} onSubmit={() => {}} className='contents'>
            <div className='flex-1 overflow-auto p-6'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='bg-muted/60'>
                    <th className='text-left px-3 py-2 border font-medium w-8'>
                      #
                    </th>
                    <th className='text-left px-3 py-2 border font-medium'>
                      Mã vật tư, tài sản
                    </th>
                    <th className='text-left px-3 py-2 border font-medium w-56'>
                      Tên vật tư, tài sản
                    </th>
                    <th className='text-left px-3 py-2 border font-medium w-48'>
                      Đơn vị tính
                    </th>
                    <th className='text-right px-3 py-2 border font-medium w-40'>
                      Đơn giá
                    </th>
                    {!isRuleContract && (
                      <th className='text-right px-3 py-2 border font-medium'>
                        Khối lượng
                      </th>
                    )}
                    <th className='text-center px-3 py-2 border font-medium w-44'>
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, idx) => {
                    const row = watchedRows[idx];
                    if (!row) return null;

                    return (
                      <tr
                        key={field.id}
                        className={
                          row.existsInCatalog
                            ? 'bg-white hover:bg-green-50/40'
                            : 'bg-red-50 hover:bg-red-100/60'
                        }
                      >
                        <td className='px-3 py-2 border text-muted-foreground align-top pt-3'>
                          {idx + 1}
                        </td>
                        <td className='px-3 py-2 border font-mono text-xs align-top pt-3'>
                          {row.materialCode}
                        </td>

                        {/* Tên vật tư: text nếu đã có, FormInput nếu chưa có */}
                        <td className='px-2 py-1.5 border align-top'>
                          {row.existsInCatalog ? (
                            <div className='px-1 py-2'>{row.name}</div>
                          ) : (
                            <FormInput
                              control={form.control}
                              name={`rows.${idx}.name`}
                              placeholder='Nhập tên vật tư'
                              className='h-9'
                            />
                          )}
                        </td>

                        {/* Đơn vị tính: text nếu đã có, UnitSelectCell nếu chưa có */}
                        <td className='px-2 py-1.5 border align-top'>
                          {row.existsInCatalog ? (
                            <div className='px-1 py-2'>
                              {row.unitOfMeasureName}
                            </div>
                          ) : (
                            <UnitSelectCell
                              control={form.control}
                              idx={idx}
                              units={units}
                              setValue={form.setValue}
                            />
                          )}
                        </td>

                        {/* Đơn giá: text nếu đã có, FormNumber nếu chưa có */}
                        <td className='px-2 py-1.5 border align-top'>
                          {row.existsInCatalog ? (
                            <div className='px-1 py-2 text-right'>
                              {row.price.toLocaleString('vi-VN')} đ
                            </div>
                          ) : (
                            <FormNumber
                              control={form.control}
                              name={`rows.${idx}.price`}
                              placeholder='Đơn giá'
                              className='h-9'
                            />
                          )}
                        </td>

                        {!isRuleContract && (
                          <td className='px-3 py-2 border text-right font-medium align-top pt-3'>
                            {row.quantity}
                          </td>
                        )}

                        {/* Trạng thái + dấu + tạo từng dòng */}
                        <td className='px-3 py-2 border text-center align-top pt-3'>
                          {row.existsInCatalog ? (
                            <span className='inline-flex items-center gap-1 text-green-600 text-xs font-medium'>
                              <CheckCircle2 className='size-3.5' />
                              Có trong danh mục
                            </span>
                          ) : (
                            <div className='flex items-center justify-center gap-2'>
                              <span className='inline-flex items-center gap-1 text-red-600 text-xs font-medium'>
                                <XCircle className='size-3.5' />
                                Chưa có
                              </span>
                              <Button
                                type='button'
                                size='icon'
                                variant='outline'
                                className='size-6'
                                disabled={!isRowFilled(row) || row.isCreating}
                                onClick={() => handleCreateSingleMaterial(idx)}
                              >
                                {row.isCreating ? (
                                  <Loader2 className='size-3 animate-spin' />
                                ) : (
                                  <PlusIcon className='size-3' />
                                )}
                              </Button>
                              <Button
                                type='button'
                                size='icon'
                                variant='outline'
                                className='size-6 text-destructive hover:text-destructive'
                                disabled={row.isCreating}
                                onClick={() => remove(idx)}
                              >
                                <Trash2Icon className='size-3' />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Form>

          <div className='flex items-center justify-between gap-3 p-4 px-6 border-t bg-muted/20'>
            <Button
              variant='outline'
              type='button'
              onClick={() => handleDialogOpenChange(false)}
            >
              Hủy
            </Button>

            <div className='flex items-center gap-3'>
              {hasMissing && (
                <Button
                  type='button'
                  variant='destructive'
                  onClick={handleCreateMissing}
                  disabled={creating || !allMissingFilled}
                  className='min-w-48'
                  title={
                    !allMissingFilled
                      ? `Vui lòng nhập đủ thông tin cho các ${label} chưa có`
                      : ''
                  }
                >
                  {creating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='size-4 mr-2' />
                      Tạo các {label} chưa có (
                      {watchedRows.filter((r) => !r.existsInCatalog).length})
                    </>
                  )}
                </Button>
              )}

              <Button
                type='button'
                onClick={handleAddToForm}
                disabled={!allResolved || adding}
                className='min-w-40 bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                title={
                  hasMissing
                    ? `Vui lòng tạo hết các ${label} chưa có trước`
                    : ''
                }
              >
                {adding ? (
                  <>
                    <Loader2 className='size-4 mr-2 animate-spin' />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <Upload className='size-4 mr-2' />
                    Thêm {label} ({watchedRows.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
