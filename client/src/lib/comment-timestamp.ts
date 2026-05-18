/** Parse API/DB timestamps consistently for display in the user's local timezone. */
export function parseCommentTimestamp(value: string | Date | null | undefined): Date {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }
  if (value == null || value === "") {
    return new Date();
  }
  const s = String(value).trim();
  if (/[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const withUtc = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
  const d = new Date(withUtc);
  return Number.isNaN(d.getTime()) ? new Date(s) : d;
}

export function formatCommentTime(value: string | Date | null | undefined): string {
  return parseCommentTimestamp(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatCommentDayKey(value: string | Date | null | undefined): string {
  const d = parseCommentTimestamp(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
