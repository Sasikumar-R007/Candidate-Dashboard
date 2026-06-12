import { isClientAdminRole, isClientMemberRole } from "./client-roles";

/** Escalation order: TA → TL → Admin → Client Member → Client Admin (final). */
export const NUDGE_ESCALATION_LEVEL_ORDER: Record<string, number> = {
  recruiter: 0,
  talent_advisor: 0,
  ta: 0,
  team_leader: 1,
  teamlead: 1,
  admin: 2,
  client: 3,
  client_member: 3,
  client_admin: 4,
};

export function normalizeNudgeRoleKey(role: string | null | undefined): string {
  return (role || "recruiter").toLowerCase().trim().replace(/[\s-]+/g, "_");
}

export function getNudgeEscalationLevelOrder(level: string | null | undefined): number {
  const key = normalizeNudgeRoleKey(level);
  return NUDGE_ESCALATION_LEVEL_ORDER[key] ?? 0;
}

/** Client Admin is the final escalation owner — enabled only at client_admin level. */
export function canUserUpdateNudge(
  userRole: string | null | undefined,
  nudgeEscalationLevel: string | null | undefined,
  isResponded: boolean,
): boolean {
  if (isResponded) return false;

  const nudgeKey = normalizeNudgeRoleKey(nudgeEscalationLevel);

  if (isClientAdminRole(userRole)) {
    return nudgeKey === "client_admin";
  }

  if (isClientMemberRole(userRole)) {
    return nudgeKey === "client";
  }

  const userLevel = getNudgeEscalationLevelOrder(userRole);
  const nudgeLevel = getNudgeEscalationLevelOrder(nudgeEscalationLevel);
  return nudgeLevel <= userLevel;
}
