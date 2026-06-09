import type { RevenueMapping, TargetMappings } from "@shared/schema";
import {
  computeTargetStatsFromRevenue,
  normalizeQuarter,
} from "./target-revenue-sync";

export type IncentiveMappingContext = {
  revenueMappingId: string;
  candidateName: string | null;
  teamLeadId: string;
  teamLeadName: string;
  talentAdvisorId: string;
  talentAdvisorName: string;
  quarter: string;
  year: number;
  tlTargetAmount: number;
  taTargetAmount: number;
  tlRevenueAmount: number;
  taRevenueAmount: number;
  tlAchievedAmount: number;
  taAchievedAmount: number;
  tlRemainingTarget: number;
  taRemainingTarget: number;
};

function quartersMatch(a: string, b: string): boolean {
  return normalizeQuarter(a) === normalizeQuarter(b);
}

function findTaTargetMapping(
  targetMappings: TargetMappings[],
  teamLeadId: string,
  talentAdvisorId: string,
  quarter: string,
  year: number,
): TargetMappings | undefined {
  return targetMappings.find(
    (tm) =>
      tm.teamLeadId === teamLeadId &&
      tm.teamMemberId === talentAdvisorId &&
      quartersMatch(tm.quarter, quarter) &&
      Number(tm.year) === Number(year),
  );
}

function sumTlTeamTarget(
  targetMappings: TargetMappings[],
  teamLeadId: string,
  quarter: string,
  year: number,
): number {
  return targetMappings
    .filter(
      (tm) =>
        tm.teamLeadId === teamLeadId &&
        quartersMatch(tm.quarter, quarter) &&
        Number(tm.year) === Number(year),
    )
    .reduce((sum, tm) => sum + (tm.minimumTarget || 0), 0);
}

function sumTlQuarterRevenue(
  allRevenue: RevenueMapping[],
  teamLeadId: string,
  quarter: string,
  year: number,
): number {
  return Math.round(
    allRevenue
      .filter(
        (rm) =>
          rm.teamLeadId === teamLeadId &&
          quartersMatch(rm.quarter, quarter) &&
          Number(rm.year) === Number(year),
      )
      .reduce((sum, rm) => sum + (Number(rm.revenue) || 0), 0),
  );
}

export function buildIncentiveMappingContext(
  revenueMapping: RevenueMapping,
  targetMappings: TargetMappings[],
  allRevenue: RevenueMapping[],
): IncentiveMappingContext {
  const placementRevenue = Number(revenueMapping.revenue) || 0;
  const quarter = revenueMapping.quarter;
  const year = Number(revenueMapping.year);

  const taTargetMapping = findTaTargetMapping(
    targetMappings,
    revenueMapping.teamLeadId,
    revenueMapping.talentAdvisorId,
    quarter,
    year,
  );

  const taTargetAmount = taTargetMapping?.minimumTarget || 0;
  const tlTargetAmount = sumTlTeamTarget(
    targetMappings,
    revenueMapping.teamLeadId,
    quarter,
    year,
  );

  const taStats = taTargetMapping
    ? computeTargetStatsFromRevenue(taTargetMapping, allRevenue)
    : { targetAchieved: 0, closures: 0, incentives: 0 };

  const taAchievedAmount = taStats.targetAchieved;
  const tlAchievedAmount = sumTlQuarterRevenue(
    allRevenue,
    revenueMapping.teamLeadId,
    quarter,
    year,
  );

  return {
    revenueMappingId: revenueMapping.id,
    candidateName: revenueMapping.candidateName,
    teamLeadId: revenueMapping.teamLeadId,
    teamLeadName: revenueMapping.teamLeadName,
    talentAdvisorId: revenueMapping.talentAdvisorId,
    talentAdvisorName: revenueMapping.talentAdvisorName,
    quarter,
    year,
    tlTargetAmount,
    taTargetAmount,
    tlRevenueAmount: placementRevenue,
    taRevenueAmount: placementRevenue,
    tlAchievedAmount,
    taAchievedAmount,
    tlRemainingTarget: Math.max(0, tlTargetAmount - tlAchievedAmount),
    taRemainingTarget: Math.max(0, taTargetAmount - taAchievedAmount),
  };
}
