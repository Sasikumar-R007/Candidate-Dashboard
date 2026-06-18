/** Data Entry portal role (stored in employees.role). */
export const DATA_ENTRY_ROLE = "data_entry" as const;

export const DATA_ENTRY_PORTAL_PATH = "/upload-hub" as const;
export const DATA_ENTRY_PORTAL_TITLE = "Resume Upload Hub" as const;
/** @deprecated Old route — redirects to DATA_ENTRY_PORTAL_PATH */
export const LEGACY_DATA_ENTRY_PORTAL_PATH = "/resume-intake" as const;
export const DATA_ENTRY_ROLE_DISPLAY = "Data Entry" as const;

export function isDataEntryRole(role: string | null | undefined): boolean {
  return (role || "").toLowerCase().trim() === DATA_ENTRY_ROLE;
}

export function getDataEntryRoleDisplayName(): string {
  return DATA_ENTRY_ROLE_DISPLAY;
}
