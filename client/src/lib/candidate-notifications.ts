import type { JobApplication } from "@shared/schema";
import type { NotificationPanelRow } from "@/components/dashboard/notification-panel";

export type CandidateNudgeRow = {
  id: string;
  applicationId?: string;
  jobTitle?: string;
  company?: string;
  message?: string | null;
  isResponded?: boolean;
  isRead?: boolean;
  createdAt?: string | Date | null;
  respondedAt?: string | Date | null;
};

const INITIAL_STATUS_PATTERNS = [
  /^applied$/i,
  /^in[- ]?process$/i,
  /^new$/i,
  /^sourced$/i,
];

function isInitialApplicationStatus(status: string | null | undefined): boolean {
  const s = (status || "").trim();
  if (!s) return true;
  return INITIAL_STATUS_PATTERNS.some((re) => re.test(s));
}

function isOfferStatus(status: string | null | undefined): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("offer") || s.includes("selected") || s === "joined" || s === "closure";
}

function isArchivedStatus(status: string | null | undefined): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("archived") || s.includes("withdrawn");
}

export function buildCandidateNotificationRows(
  applications: JobApplication[],
  nudges: CandidateNudgeRow[],
  dismissedKeys: Set<string>,
): NotificationPanelRow[] {
  const rows: NotificationPanelRow[] = [];

  for (const nudge of nudges.filter((n) => n.isResponded || n.message)) {
    const key = `nudge-${nudge.id}`;
    if (dismissedKeys.has(key)) continue;
    const title = nudge.jobTitle || "Your application";
    const company = nudge.company || "Company";
    const preview = (nudge.message || "Recruiter responded to your nudge").slice(0, 120);
    rows.push({
      key,
      id: nudge.id,
      kind: "nudgeUpdate",
      line: `Nudge update - ${title} - ${company} - ${preview}`,
      createdAt: nudge.respondedAt || nudge.createdAt || new Date().toISOString(),
      isUnread: !nudge.isRead,
    });
  }

  for (const app of applications) {
    if (isArchivedStatus(app.status)) continue;

    if (isOfferStatus(app.status)) {
      const key = `offer-${app.id}`;
      if (dismissedKeys.has(key)) continue;
      rows.push({
        key,
        id: app.id,
        kind: "offer",
        line: `Offer update - ${app.jobTitle} - ${app.company} - ${app.status}`,
        createdAt: app.appliedDate ? String(app.appliedDate) : new Date().toISOString(),
        isUnread: false,
      });
      continue;
    }

    if (!isInitialApplicationStatus(app.status)) {
      const key = `status-${app.id}-${app.status}`;
      if (dismissedKeys.has(key)) continue;
      rows.push({
        key,
        id: app.id,
        kind: "statusUpdate",
        line: `Status updated - ${app.jobTitle} - ${app.company} - ${app.status}`,
        createdAt: app.appliedDate ? String(app.appliedDate) : new Date().toISOString(),
        isUnread: false,
      });
    }
  }

  return rows.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export const CANDIDATE_NOTIFICATION_SECTIONS = [
  {
    id: "statusUpdates",
    heading: "Applied jobs status updated",
    headingClassName: "text-blue-700",
    kinds: ["statusUpdate"],
    tabId: "statusUpdates",
    navigateTo: "pipeline" as const,
  },
  {
    id: "offers",
    heading: "Offer notifications",
    headingClassName: "text-emerald-700",
    kinds: ["offer"],
    tabId: "offers",
    navigateTo: "pipeline" as const,
  },
  {
    id: "nudgeUpdates",
    heading: "Nudge updates received",
    headingClassName: "text-indigo-700",
    kinds: ["nudgeUpdate"],
    tabId: "nudgeUpdates",
    navigateTo: "pipeline" as const,
  },
];

export const CANDIDATE_NOTIFICATION_TABS = [
  { id: "all", label: "All" },
  { id: "statusUpdates", label: "Status Updated" },
  { id: "offers", label: "Offers" },
  { id: "nudgeUpdates", label: "Nudge Updates" },
];

const DISMISS_STORAGE_KEY = "staffos.candidate.notifications.dismissed";

export function loadDismissedCandidateNotificationKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function persistDismissedCandidateNotificationKey(key: string) {
  const set = loadDismissedCandidateNotificationKeys();
  set.add(key);
  localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify([...set]));
}
