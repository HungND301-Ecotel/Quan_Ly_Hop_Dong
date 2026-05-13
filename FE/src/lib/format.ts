import { format as date } from 'date-fns';
import { vi } from 'date-fns/locale';

function formatDate(value: string) {
  try {
    return date(value, 'dd/MM/yyyy', { locale: vi });
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  try {
    return date(value, 'HH:mm dd/MM/yyyy', { locale: vi });
  } catch {
    return value;
  }
}

export function formatNumber(
  value: number | undefined | null,
  options?: Intl.NumberFormatOptions
) {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('vi-VN', options);
}

export const format = {
  date: formatDate,
  number: formatNumber,
  dateTime: formatDateTime,
};
