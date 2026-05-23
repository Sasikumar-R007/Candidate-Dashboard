/** Shared period filtering for Admin Reports & Analytics */

export type ReportPeriodType = 'monthly' | 'weekly' | 'quarterly' | 'yearly' | 'custom' | '';

export interface ReportPeriodSelection {
  period: ReportPeriodType;
  month?: string; // January, February, ...
  quarter?: string; // Q1, Q2, Q3, Q4
  year?: string;
  weekStart?: Date;
  customDate?: Date;
}

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export function parseMonthName(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return MONTH_MAP[String(value).toLowerCase()] || parseInt(String(value), 10) || 0;
}

export function getReportPeriodRange(selection: ReportPeriodSelection): { start: Date; end: Date } | null {
  const { period } = selection;
  if (!period) return null;

  const year = parseInt(selection.year || String(new Date().getFullYear()), 10);

  if (period === 'monthly' && selection.month) {
    const monthNum = parseMonthName(selection.month);
    if (monthNum < 1 || monthNum > 12) return null;
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'quarterly' && selection.quarter) {
    const q = parseInt(selection.quarter.replace(/\D/g, ''), 10);
    if (q < 1 || q > 4) return null;
    const startMonth = (q - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'yearly') {
    const y = year || new Date().getFullYear();
    return {
      start: new Date(y, 0, 1),
      end: new Date(y, 11, 31, 23, 59, 59, 999),
    };
  }

  if (period === 'weekly' && selection.weekStart) {
    const start = new Date(selection.weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'custom' && selection.customDate) {
    const start = new Date(selection.customDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return null;
}

export function isDateInReportPeriod(
  dateInput: string | Date | null | undefined,
  selection: ReportPeriodSelection,
): boolean {
  if (!selection.period) return true;
  const range = getReportPeriodRange(selection);
  if (!range) return true;
  if (!dateInput) return false;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  return d >= range.start && d <= range.end;
}

/** Cash outflow row: month name + year */
export function cashOutflowMatchesPeriod(
  item: { month?: string; year?: string | number },
  selection: ReportPeriodSelection,
): boolean {
  if (!selection.period) return true;
  const range = getReportPeriodRange(selection);
  if (!range) return true;
  const monthNum = parseMonthName(item.month);
  const itemYear = parseInt(String(item.year || ''), 10);
  if (monthNum < 1 || !itemYear) return false;
  const itemDate = new Date(itemYear, monthNum - 1, 15);
  return itemDate >= range.start && itemDate <= range.end;
}

export const REPORT_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const REPORT_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/** Returns an error message when period sub-fields are incomplete, or null if valid. */
export function getReportPeriodValidationError(selection: ReportPeriodSelection): string | null {
  if (!selection.period) return 'Select a period.';
  if (selection.period === 'monthly' && (!selection.month || !selection.year)) {
    return 'Select month and year.';
  }
  if (selection.period === 'quarterly' && (!selection.quarter || !selection.year)) {
    return 'Select quarter and year.';
  }
  if (selection.period === 'yearly' && !selection.year) return 'Select a year.';
  if (selection.period === 'weekly' && !selection.weekStart) return 'Select week start date.';
  if (selection.period === 'custom' && !selection.customDate) return 'Select a date.';
  if (!getReportPeriodRange(selection)) return 'Invalid period selection.';
  return null;
}
