/**
 * Nudge escalation (working hours, Mon–Fri 9:00–18:00) and candidate cooldown (wall-clock).
 * Server sync: routes.ts `syncActiveNudgeEscalations`.
 */

export const NUDGE_WORKING_HOUR_START = 9;
export const NUDGE_WORKING_HOUR_END = 18;

/** Working hours from nudge creation until each escalation tier (standard pipeline). */
export const NUDGE_ESCALATION_WORKING_HOURS = {
  toTeamLeader: 6,
  toAdmin: 12,
  toClient: 18,
} as const;

/** Working hours for offer-stage applications. */
export const NUDGE_OFFER_ESCALATION_WORKING_HOURS = {
  toTeamLeader: 3,
  toAdmin: 6,
  toClient: 9,
} as const;

/** Candidate re-nudge cooldown after last nudge (wall-clock hours). */
export const CANDIDATE_NUDGE_COOLDOWN_HOURS = {
  appliedOrReview: 48,
  interviewOrHr: 24,
  offer: 3,
} as const;

export function isOfferStageStatus(status: string | null | undefined): boolean {
  return (status || "").toLowerCase().includes("offer");
}

export function escalationTargetWorkingHours(
  escalationLevel: string,
  isOffer: boolean,
): number {
  const level = (escalationLevel || "recruiter").toLowerCase();
  if (isOffer) {
    if (level === "recruiter") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toTeamLeader;
    if (level === "team_leader") return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toAdmin;
    return NUDGE_OFFER_ESCALATION_WORKING_HOURS.toClient;
  }
  if (level === "recruiter") return NUDGE_ESCALATION_WORKING_HOURS.toTeamLeader;
  if (level === "team_leader") return NUDGE_ESCALATION_WORKING_HOURS.toAdmin;
  return NUDGE_ESCALATION_WORKING_HOURS.toClient;
}

export function candidateNudgeCooldownHours(status: string | null | undefined): number | null {
  const s = (status || "").toLowerCase();
  if (s.includes("screened out") || s.includes("rejected") || s.includes("withdrawn")) {
    return null;
  }
  if (isOfferStageStatus(s)) return CANDIDATE_NUDGE_COOLDOWN_HOURS.offer;
  if (s.includes("interview") || s.includes("hr")) return CANDIDATE_NUDGE_COOLDOWN_HOURS.interviewOrHr;
  return CANDIDATE_NUDGE_COOLDOWN_HOURS.appliedOrReview;
}
