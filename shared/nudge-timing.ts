/**
 * Nudge escalation (working hours, Mon–Fri 9:00–18:00) and candidate cooldown (wall-clock).
 * Server sync: routes.ts `syncActiveNudgeEscalations`.
 */

import { resolvePipelineStageKey } from "./pipeline-stages";

export const NUDGE_WORKING_HOUR_START = 9;
export const NUDGE_WORKING_HOUR_END = 18;

/** Working hours from nudge creation until each escalation tier (3h per step). */
export const NUDGE_ESCALATION_WORKING_HOURS = {
  toTeamLeader: 3,
  toAdmin: 6,
  toClient: 9,
  toClientAdmin: 12,
} as const;

/** Working hours for offer-stage applications (3h per step). */
export const NUDGE_OFFER_ESCALATION_WORKING_HOURS = {
  toTeamLeader: 3,
  toAdmin: 6,
  toClient: 9,
  toClientAdmin: 12,
} as const;

/**
 * Candidate re-nudge cooldown (wall-clock hours) by pipeline progression:
 * Applied → In-Review → Interview → HR Round → Offer → blocked (terminal).
 */
export const CANDIDATE_NUDGE_COOLDOWN_HOURS = {
  applied: 48,
  inReview: 36,
  interview: 24,
  hrRound: 18,
  offer: 12,
} as const;

export function isOfferStageStatus(status: string | null | undefined): boolean {
  const s = (status || "").toLowerCase();
  if (s.includes("offer") || s.includes("closure") || s.includes("joined") || s.includes("hired") || s === "selected") {
    return true;
  }
  return resolvePipelineStageKey(status) === "offerStage" || resolvePipelineStageKey(status) === "closure";
}

export function escalationTargetWorkingHours(
  escalationLevel: string,
  isOffer: boolean,
): number {
  const level = (escalationLevel || "recruiter").toLowerCase();
  if (isOffer) {
    if (level === "recruiter") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toTeamLeader;
    if (level === "team_leader") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toAdmin;
    if (level === "admin") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toClient;
    if (level === "client") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toClientAdmin;
    return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toClientAdmin;
  }
  if (level === "recruiter") return NUDGE_ESCALATION_WORKING_HOURS.toTeamLeader;
  if (level === "team_leader") return NUDGE_ESCALATION_WORKING_HOURS.toAdmin;
  if (level === "admin") return NUDGE_ESCALATION_WORKING_HOURS.toClient;
  if (level === "client") return NUDGE_ESCALATION_WORKING_HOURS.toClientAdmin;
  return NUDGE_ESCALATION_WORKING_HOURS.toClientAdmin;
}

/** Returns cooldown hours, or null when nudging is blocked for this status. */
export function candidateNudgeCooldownHours(status: string | null | undefined): number | null {
  const s = (status || "").toLowerCase();
  if (s.includes("withdrawn") || s.includes("archived")) {
    return null;
  }

  const stageKey = resolvePipelineStageKey(status);

  if (stageKey === "rejected") {
    return null;
  }
  if (stageKey === "offerStage" || stageKey === "closure") {
    return CANDIDATE_NUDGE_COOLDOWN_HOURS.offer;
  }
  if (stageKey === "hrRound") {
    return CANDIDATE_NUDGE_COOLDOWN_HOURS.hrRound;
  }
  if (
    stageKey === "level1" ||
    stageKey === "level2" ||
    stageKey === "level3" ||
    stageKey === "finalRound"
  ) {
    return CANDIDATE_NUDGE_COOLDOWN_HOURS.interview;
  }
  if (stageKey === "shortlisted" || stageKey === "screening") {
    return CANDIDATE_NUDGE_COOLDOWN_HOURS.inReview;
  }
  return CANDIDATE_NUDGE_COOLDOWN_HOURS.applied;
}

/** Mon–Fri working hours elapsed between two instants (matches server escalation sync). */
export function calculateWorkingHoursBetween(start: Date, end: Date): number {
  if (start >= end) return 0;

  let totalMinutes = 0;
  const current = new Date(start);
  const endLimit = new Date(end);

  while (current < endLimit) {
    const day = current.getDay();
    const isWorkingDay = day !== 0 && day !== 6;

    if (isWorkingDay) {
      const currentHour = current.getHours();
      if (currentHour >= NUDGE_WORKING_HOUR_START && currentHour < NUDGE_WORKING_HOUR_END) {
        const hourStart = new Date(current);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(current);
        hourEnd.setMinutes(59, 59, 999);

        const effectiveStart = current > hourStart ? current : hourStart;
        const effectiveEnd = endLimit < hourEnd ? endLimit : hourEnd;

        const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
        if (diffMs > 0) {
          totalMinutes += diffMs / (1000 * 60);
        }
      }
    }

    current.setHours(current.getHours() + 1);
    current.setMinutes(0, 0, 0);
  }

  return totalMinutes / 60;
}

/** Remaining working time until the next escalation tier (for TA/TL/Admin/Client UI). */
export function formatEscalationRemainingLabel(
  createdAt: string | Date | null | undefined,
  escalationLevel: string | null | undefined,
  currentStatus: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!createdAt) return null;
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return null;

  const isOffer = isOfferStageStatus(currentStatus);
  const totalTarget = escalationTargetWorkingHours(escalationLevel || "recruiter", isOffer);
  const elapsedHours = calculateWorkingHoursBetween(start, now);
  const remaining = totalTarget - elapsedHours;

  if (remaining <= 0) return "Escalating...";

  const totalMins = Math.max(0, Math.floor(remaining * 60));
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return `${hours}hrs ${minutes}min`;
}

/** Table-friendly label (e.g. Active Nudges "Escalates In" column). */
export function formatEscalationRemainingTableLabel(
  createdAt: string | Date | null | undefined,
  escalationLevel: string | null | undefined,
  currentStatus: string | null | undefined,
  now: Date = new Date(),
): string {
  const compact = formatEscalationRemainingLabel(createdAt, escalationLevel, currentStatus, now);
  if (!compact) return "—";
  if (compact === "Escalating...") return compact;
  const match = compact.match(/^(\d+)hrs (\d+)min$/);
  if (!match) return compact;
  return `${match[1]} hrs ${match[2]} mins`;
}
