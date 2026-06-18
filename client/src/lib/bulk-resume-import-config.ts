export const BULK_UPLOAD_LIMIT = 40;
export const BULK_PARSE_BATCH_SIZE = 5;
export const BULK_IMPORT_BATCH_SIZE = 15;
export const BULK_PARSE_BATCH_RETRIES = 2;

export type ImportStep = "upload" | "confirm" | "result";

export type ParsedResumeFields = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  designation?: string | null;
  experience?: string | null;
  skills?: string | null;
  location?: string | null;
  filePath?: string;
  company?: string | null;
  education?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  websiteUrl?: string | null;
  currentRole?: string | null;
};

export type BulkParseResult = {
  fileName: string;
  success: boolean;
  data?: ParsedResumeFields;
  error?: string;
};

export type BulkImportResults = {
  total: number;
  successCount: number;
  failedCount: number;
  results: Array<{ fileName: string; success: boolean; error?: string }>;
};

export type BulkParseProgress = {
  batch: number;
  totalBatches: number;
  filesDone: number;
  fileTotal: number;
};

import {
  DATA_ENTRY_PORTAL_PATH,
  LEGACY_DATA_ENTRY_PORTAL_PATH,
} from "@shared/data-entry-roles";

export const MASTER_DATABASE_PATH = "/master-database" as const;

function isDataEntryPortalPath(pathname: string): boolean {
  return (
    pathname === DATA_ENTRY_PORTAL_PATH ||
    pathname.startsWith(`${DATA_ENTRY_PORTAL_PATH}/`) ||
    pathname === LEGACY_DATA_ENTRY_PORTAL_PATH ||
    pathname.startsWith(`${LEGACY_DATA_ENTRY_PORTAL_PATH}/`)
  );
}

export function createApiUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return `${apiUrl}${path}`;
}

export function getBulkImportApiBase(pathname: string): string {
  if (isDataEntryPortalPath(pathname)) {
    return "/api/data-entry";
  }
  return "/api/admin";
}

export function getBulkImportPortalPath(pathname: string): string {
  if (isDataEntryPortalPath(pathname)) {
    return DATA_ENTRY_PORTAL_PATH;
  }
  return MASTER_DATABASE_PATH;
}
