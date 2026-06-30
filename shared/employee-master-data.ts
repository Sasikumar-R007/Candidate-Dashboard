export const EMPLOYMENT_TYPE_OPTIONS = [
  "Permanent",
  "Temporary",
  "External Consultant",
] as const;

export const WORK_MODE_OPTIONS = [
  "Work from Office",
  "Work from Home",
  "Hybrid",
] as const;

export const EMPLOYEE_CURRENT_STATUS_OPTIONS = [
  "Active",
  "Probation",
  "Notice Period",
  "Resigned",
] as const;

/** Appraised year dropdown: current year down to 5 years prior. */
export function getAppraisedYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => String(currentYear - i));
}
