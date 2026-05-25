import type { IStorage } from "./storage";
import type { RevenueMapping, TargetMappings } from "@shared/schema";

const QUARTER_ALIASES: Record<string, string> = {
  JFM: "JFM",
  AMJ: "AMJ",
  JAS: "JAS",
  OND: "OND",
  Q1: "JFM",
  Q2: "AMJ",
  Q3: "JAS",
  Q4: "OND",
};

export function normalizeQuarter(value: string | null | undefined): string {
  const raw = (value || "").trim().toUpperCase();
  return QUARTER_ALIASES[raw] || raw;
}

export function revenueMatchesTargetMapping(
  rm: Pick<RevenueMapping, "talentAdvisorId" | "quarter" | "year">,
  mapping: Pick<TargetMappings, "teamMemberId" | "quarter" | "year">,
): boolean {
  return (
    rm.talentAdvisorId === mapping.teamMemberId &&
    Number(rm.year) === Number(mapping.year) &&
    normalizeQuarter(rm.quarter) === normalizeQuarter(mapping.quarter)
  );
}

export function computeTargetStatsFromRevenue(
  mapping: Pick<TargetMappings, "teamMemberId" | "quarter" | "year">,
  allRevenue: RevenueMapping[],
): { closures: number; targetAchieved: number; incentives: number } {
  const matched = allRevenue.filter((rm) => revenueMatchesTargetMapping(rm, mapping));
  const closures = matched.length;
  const targetAchieved = Math.round(
    matched.reduce((sum, rm) => sum + (Number(rm.revenue) || 0), 0),
  );
  const incentives = Math.round(
    matched.reduce((sum, rm) => sum + (Number(rm.incentive) || 0), 0),
  );
  return { closures, targetAchieved, incentives };
}

export async function syncAllTargetMappingsFromRevenue(
  storage: IStorage,
): Promise<void> {
  const allMappings = await storage.getAllTargetMappings();
  const allRevenue = await storage.getRevenueDataMappings();

  for (const mapping of allMappings) {
    const stats = computeTargetStatsFromRevenue(mapping, allRevenue);
    await storage.updateTargetMapping(mapping.id, stats);
  }
}

export function enrichTargetMappingWithRevenue<T extends TargetMappings>(
  mapping: T,
  allRevenue: RevenueMapping[],
): T & { closures: number; targetAchieved: number; incentives: number } {
  return { ...mapping, ...computeTargetStatsFromRevenue(mapping, allRevenue) };
}

export function countQuartersTargetMet(
  mappings: Array<Pick<TargetMappings, "minimumTarget" | "targetAchieved">>,
): number {
  return mappings.filter(
    (m) => (m.targetAchieved ?? 0) >= (m.minimumTarget || 0) && (m.minimumTarget || 0) > 0,
  ).length;
}

/** Calendar quarter label used in Admin target mappings (Q1–Q4). */
export function getCalendarTargetQuarterLabel(date = new Date()): string {
  const month = date.getMonth();
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
}

export function getRevenueMappingRecencyTs(mapping: {
  closureDate?: string | null;
  createdAt?: string | null;
  offeredDate?: string | null;
}): number {
  for (const value of [mapping.closureDate, mapping.offeredDate, mapping.createdAt]) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  }
  return 0;
}

export function getRevenueMappingBestDate(mapping: {
  closureDate?: string | null;
  createdAt?: string | null;
  offeredDate?: string | null;
}): Date | null {
  const ts = getRevenueMappingRecencyTs(mapping);
  return ts > 0 ? new Date(ts) : null;
}

export function formatRelativeClosureTime(
  dateInput: string | Date | null | undefined,
): { relative: string; dateLabel: string | null } {
  if (!dateInput) return { relative: "N/A", dateLabel: null };
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return { relative: "N/A", dateLabel: null };

  const dateLabel = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return { relative: "Just now", dateLabel };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    if (diffHours < 1) return { relative: "Less than 1 hour ago", dateLabel };
    return {
      relative: `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`,
      dateLabel,
    };
  }

  if (diffDays < 30) {
    return {
      relative: `${diffDays} day${diffDays === 1 ? "" : "s"} ago`,
      dateLabel,
    };
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return {
      relative: `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`,
      dateLabel,
    };
  }

  const diffYears = Math.floor(diffDays / 365);
  return {
    relative: `${diffYears} year${diffYears === 1 ? "" : "s"} ago`,
    dateLabel,
  };
}
