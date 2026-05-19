import {
  Briefcase,
  FileText,
  GitBranch,
  LayoutDashboard,
  Settings,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ClientPortalTabId =
  | "overview"
  | "pipeline"
  | "req_jd"
  | "team"
  | "reports"
  | "nudges"
  | "settings";

export type ClientPortalNavItem = {
  id: ClientPortalTabId;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const ADMIN_NAV: ClientPortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline & Closures", icon: GitBranch },
  { id: "req_jd", label: "Requirements / JD", icon: FileText },
  { id: "team", label: "Team", icon: Users, adminOnly: true },
  { id: "reports", label: "Reports", icon: Briefcase, adminOnly: true },
  { id: "nudges", label: "Nudges", icon: Zap },
  { id: "settings", label: "Settings", icon: Settings },
];

const MEMBER_NAV: ClientPortalNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "req_jd", label: "Req / JD", icon: FileText },
  { id: "nudges", label: "Nudges", icon: Zap },
  { id: "settings", label: "Settings", icon: Settings },
];

export function getClientPortalNav(isClientAdmin: boolean): ClientPortalNavItem[] {
  return isClientAdmin ? ADMIN_NAV : MEMBER_NAV;
}

/** Map legacy tab ids from bookmarks / old state */
export function normalizeClientPortalTab(tab: string): ClientPortalTabId {
  if (tab === "dashboard") return "overview";
  if (tab === "requirements") return "pipeline";
  return tab as ClientPortalTabId;
}

export function isClientPortalTabAllowed(
  tab: string,
  isClientAdmin: boolean,
): boolean {
  const normalized = normalizeClientPortalTab(tab);
  const nav = getClientPortalNav(isClientAdmin);
  return nav.some((item) => item.id === normalized);
}
