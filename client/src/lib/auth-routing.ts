import type { AuthUser } from "@/contexts/auth-context";

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
      return "/recruiter-login-2";
    case "client":
      return "/client";
    case "support":
      return "/support-dashboard";
    default:
      return null;
  }
}
