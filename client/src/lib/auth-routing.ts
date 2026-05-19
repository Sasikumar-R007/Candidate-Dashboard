import type { AuthUser } from "@/contexts/auth-context";
import { isClientPortalRole } from "@shared/client-roles";

export function getDefaultRouteForAuthUser(user: AuthUser | null): string | null {
  if (!user) {
    return null;
  }

  if (user.type === "candidate") {
    return "/candidate";
  }

  const employeeRole = (user.data as { role?: string }).role;

  switch (employeeRole) {
    case "admin":
      return "/admin";
    case "team_leader":
      return "/team-leader";
    case "recruiter":
    case "talent_advisor":
      return "/recruiter";
    case "support":
      return "/support-dashboard";
    default:
      if (isClientPortalRole(employeeRole)) {
        return "/client";
      }
      return null;
  }
}
