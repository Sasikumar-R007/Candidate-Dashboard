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
  const allRevenue = await storage.getAllRevenueMappings();

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
