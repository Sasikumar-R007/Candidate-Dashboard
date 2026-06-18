/** Human-readable role label for profile UI (no snake_case or internal titles like CEO). */
export function formatEmployeeRoleDisplay(
  role?: string | null,
  options?: { employeeRole?: string | null },
): string {
  const authRole = (options?.employeeRole || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const normalized = (role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (authRole === "admin" || normalized === "admin" || normalized === "ceo") {
    return "Admin";
  }

  if (!role?.trim()) return "User";

  switch (normalized) {
    case "team_leader":
    case "teamleader":
    case "tl":
      return "Team Leader";
    case "recruiter":
      return "Recruiter";
    case "talent_advisor":
    case "ta":
      return "Talent Advisor";
    case "client_admin":
      return "Client Admin";
    case "client_member":
      return "Client Member";
    case "client":
      return "Client";
    case "data_entry":
      return "Data Entry";
    default:
      return role
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
  }
}

/** True for Talent Advisor workspace users (DB role is often `recruiter`). */
export function isTalentAdvisorEmployee(role?: string | null): boolean {
  const normalized = (role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (
    normalized === "talent_advisor" ||
    normalized === "ta" ||
    normalized === "recruiter"
  );
}

/** Profile ID is shown only for client portal users. */
export function shouldShowEmployeeProfileId(role?: string | null, employeeId?: string | null): boolean {
  if (!employeeId?.trim()) return false;

  const normalized = (role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalized === "client_admin" || normalized === "client_member" || normalized === "client";
}
