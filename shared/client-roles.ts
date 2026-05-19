/** Client portal role identifiers (stored in employees.role). */
export const CLIENT_ADMIN_ROLE = "client_admin" as const;
export const CLIENT_MEMBER_ROLE = "client_member" as const;
/** @deprecated Migrated to client_admin on startup; kept for transitional checks only. */
export const LEGACY_CLIENT_ROLE = "client" as const;

export const CLIENT_PORTAL_ROLES = [CLIENT_ADMIN_ROLE, CLIENT_MEMBER_ROLE] as const;
export type ClientPortalRole = (typeof CLIENT_PORTAL_ROLES)[number];

export function isClientPortalRole(role: string | null | undefined): boolean {
  const r = (role || "").toLowerCase().trim();
  return r === CLIENT_ADMIN_ROLE || r === CLIENT_MEMBER_ROLE || r === LEGACY_CLIENT_ROLE;
}

export function isClientAdminRole(role: string | null | undefined): boolean {
  const r = (role || "").toLowerCase().trim();
  return r === CLIENT_ADMIN_ROLE || r === LEGACY_CLIENT_ROLE;
}

export function isClientMemberRole(role: string | null | undefined): boolean {
  return (role || "").toLowerCase().trim() === CLIENT_MEMBER_ROLE;
}

export function getClientRoleDisplayName(role: string | null | undefined): string {
  const r = (role || "").toLowerCase().trim();
  if (r === CLIENT_ADMIN_ROLE) return "Client Admin";
  if (r === CLIENT_MEMBER_ROLE) return "Client Member";
  if (r === LEGACY_CLIENT_ROLE) return "Client (legacy)";
  return role || "Unknown";
}

export function isAnyClientRole(role: string | null | undefined): boolean {
  return isClientPortalRole(role);
}
