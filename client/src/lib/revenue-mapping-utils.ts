export function getRevenueMappingRecencyTs(mapping: {
  closureDate?: string | null;
  createdAt?: string | null;
  offeredDate?: string | null;
}): number {
  for (const value of [mapping.closureDate, mapping.createdAt, mapping.offeredDate]) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  }
  return 0;
}

export function sortRevenueMappingsByRecency<T extends {
  closureDate?: string | null;
  createdAt?: string | null;
  offeredDate?: string | null;
}>(mappings: T[]): T[] {
  return [...mappings].sort(
    (a, b) => getRevenueMappingRecencyTs(b) - getRevenueMappingRecencyTs(a),
  );
}

export function formatRevenueCurrency(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatRevenuePaymentStatus(mapping: {
  paymentStatus?: string | null;
  receivedPayment?: number | string | null;
  paymentDetails?: string | null;
}): { label: string; isReceived: boolean } {
  const status = (mapping.paymentStatus || "").trim();
  if (status) {
    const lower = status.toLowerCase();
    return {
      label: status,
      isReceived: lower.includes("received") || lower.includes("paid"),
    };
  }
  const received = Number(mapping.receivedPayment);
  if (!Number.isNaN(received) && received > 0) {
    return { label: mapping.paymentDetails || "Received", isReceived: true };
  }
  return { label: "Pending", isReceived: false };
}

/** Light background so search inputs are visible on pale headers */
export const ADMIN_MODAL_SEARCH_INPUT_CLASS =
  "pl-10 h-9 bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-300 dark:bg-slate-700/70 dark:border-slate-600 dark:text-slate-100";

export const ADMIN_FILTER_SELECT_CLASS =
  "h-9 bg-slate-100 border-slate-200 text-slate-900 dark:bg-slate-700/70 dark:border-slate-600 dark:text-slate-100";

export const ADMIN_FILTER_DATE_CLASS =
  "h-9 bg-slate-100 border-slate-200 text-slate-900 dark:bg-slate-700/70 dark:border-slate-600 dark:text-slate-100";
