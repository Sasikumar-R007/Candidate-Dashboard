import { useMemo, useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { formatEscalationRemainingLabel } from "@shared/nudge-timing";

export type NotificationPanelRow = {
  key: string;
  id: string;
  kind: string;
  line: string;
  createdAt?: string | null;
  isUnread?: boolean;
  nudgeId?: string;
  escalationLevel?: string | null;
  currentStatus?: string | null;
  applicationId?: string | null;
};

export type NotificationNavigateSection =
  | "closures"
  | "nudges"
  | "escalations"
  | "pipeline"
  | "requirements"
  | "newCandidates";

export type NotificationSectionConfig = {
  id: string;
  heading: string;
  headingClassName: string;
  kinds: string[];
  tabId: string;
  showActButton?: boolean;
  showTimeRemaining?: boolean;
  navigateTo: NotificationNavigateSection;
};

type NotificationPanelProps = {
  rows: NotificationPanelRow[];
  tabs: { id: string; label: string }[];
  sections: NotificationSectionConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  hasStaleFeed?: boolean;
  onRetry?: () => void;
  onDismiss: (row: NotificationPanelRow) => void;
  onNavigate: (section: NotificationNavigateSection, row: NotificationPanelRow) => void;
  onActOnNudge?: (row: NotificationPanelRow) => void;
  showActButton?: boolean;
  previewLimit?: number;
  /** Optional root class (e.g. candidate portal panel surface) */
  className?: string;
  /** Always show per-notification dismiss (touch devices / mobile) */
  showDismissAlways?: boolean;
};

function formatNotificationDisplayLine(line: string): string {
  return line.replace(/[\[\]]/g, "").trim();
}

function parseLineParts(line: string): string[] {
  const clean = formatNotificationDisplayLine(line);
  if (!clean) return [];
  const normalized = clean.replace(/\s*·\s*/g, " - ").replace(/,/g, " - ");
  return normalized
    .split(/\s+-\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function isDateLikeSegment(segment: string): boolean {
  return (
    /^\d/.test(segment) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
      segment,
    ) ||
    /\d{1,2}(st|nd|rd|th)?\s+\w+/i.test(segment)
  );
}

function formatTimeLabel(createdAt?: string | null): string {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

const NUDGE_TIMER_KINDS = new Set(["nudge", "escalation", "escalatedNudge"]);

/** Bold only person names (employee/TA/candidate) and company names — not roles, dates, or labels. */
function getBoldIndices(parts: string[], kind: string): Set<number> {
  const bold = new Set<number>();
  if (parts.length === 0) return bold;

  if (kind === "newRequirement" || kind === "clientJd") {
    if (parts.length >= 1) bold.add(0);
    if (parts.length >= 2) bold.add(1);
    return bold;
  }

  if (kind === "nudge") {
    if (parts.length >= 2) bold.add(1);
    return bold;
  }

  if (kind === "closure") {
    if (parts.length >= 3 && isDateLikeSegment(parts[2])) bold.add(1);
    else if (parts.length >= 2) bold.add(1);
    return bold;
  }

  if (kind === "newProfile" || kind === "newCandidate") {
    if (parts.length >= 1) bold.add(0);
    return bold;
  }

  if (kind === "escalation" || kind === "escalatedNudge") {
    if (parts.length >= 1 && !/^escalated to/i.test(parts[0])) bold.add(0);
    return bold;
  }

  return bold;
}

function NotificationLineText({ parts, boldIndices }: { parts: string[]; boldIndices: Set<number> }) {
  if (parts.length === 0) return null;
  return (
    <span className="text-sm font-normal leading-snug text-slate-700">
      {parts.map((part, index) => {
        const companyMatch = part.match(/^(Escalated to)\s+(.+)$/i);
        return (
          <span key={`${part}-${index}`}>
            {index > 0 && <span> - </span>}
            {companyMatch ? (
              <>
                <span>{companyMatch[1]} </span>
                <span className="font-semibold text-slate-900">{companyMatch[2]}</span>
              </>
            ) : (
              <span className={boldIndices.has(index) ? "font-semibold text-slate-900" : undefined}>{part}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function NotificationCard({
  row,
  section,
  isExiting,
  onDismiss,
  onNavigate,
  onAct,
  showDismissAlways = false,
  now = new Date(),
}: {
  row: NotificationPanelRow;
  section: NotificationSectionConfig;
  isExiting: boolean;
  onDismiss: (row: NotificationPanelRow) => void;
  onNavigate: (section: NotificationNavigateSection, row: NotificationPanelRow) => void;
  onAct?: (row: NotificationPanelRow) => void;
  showDismissAlways?: boolean;
  now?: Date;
}) {
  const parts = parseLineParts(row.line);
  const boldIndices = getBoldIndices(parts, row.kind);
  const timeLabel = formatTimeLabel(row.createdAt);
  const remaining =
    section.showTimeRemaining &&
    row.createdAt &&
    NUDGE_TIMER_KINDS.has(row.kind)
      ? formatEscalationRemainingLabel(
          row.createdAt,
          row.escalationLevel,
          row.currentStatus,
          now,
        )
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition-all duration-300 ease-out ${
        isExiting ? "notification-card-exit pointer-events-none" : ""
      } cursor-pointer hover:border-red-200 hover:bg-red-50/90`}
      onClick={() => onNavigate(section.navigateTo, row)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(section.navigateTo, row);
        }
      }}
    >
      <div className={`flex items-start gap-3 ${showDismissAlways ? "pr-10" : "pr-8"}`}>
        <div className="min-w-0 flex-1">
          <NotificationLineText parts={parts} boldIndices={boldIndices} />
          {remaining && (
            <span className="ml-1 text-sm font-medium text-red-600">{remaining}</span>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {section.showActButton && onAct && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAct(row);
              }}
              className="rounded-md bg-[#C9A227] px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b8921f]"
            >
              Act
            </button>
          )}
          {timeLabel && <span className="text-xs text-slate-400">{timeLabel}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(row);
        }}
        className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-95 ${
          showDismissAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function NotificationSectionBlock({
  section,
  rows,
  previewLimit,
  exitingKeys,
  onDismiss,
  onNavigate,
  onAct,
  showDismissAlways,
  now,
}: {
  section: NotificationSectionConfig;
  rows: NotificationPanelRow[];
  previewLimit: number;
  exitingKeys: Set<string>;
  onDismiss: (row: NotificationPanelRow) => void;
  onNavigate: (section: NotificationNavigateSection, row: NotificationPanelRow) => void;
  onAct?: (row: NotificationPanelRow) => void;
  showDismissAlways?: boolean;
  now: Date;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, previewLimit);
  const hiddenCount = Math.max(0, rows.length - previewLimit);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {section.heading ? (
        <h4 className={`mb-2 text-sm font-semibold ${section.headingClassName}`}>{section.heading}</h4>
      ) : null}
      <div className="space-y-2">
        {visible.map((row) => (
          <NotificationCard
            key={row.key}
            row={row}
            section={section}
            isExiting={exitingKeys.has(row.key)}
            onDismiss={onDismiss}
            onNavigate={onNavigate}
            onAct={section.showActButton ? onAct : undefined}
            showDismissAlways={showDismissAlways}
            now={now}
          />
        ))}
      </div>
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-slate-500 transition hover:text-slate-700"
        >
          {hiddenCount} more
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
      {expanded && rows.length > previewLimit && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-slate-500 transition hover:text-slate-700"
        >
          Show less
          <ChevronDown className="h-4 w-4 rotate-180" />
        </button>
      )}
    </div>
  );
}

export default function NotificationPanel({
  rows,
  tabs,
  sections,
  activeTab,
  onTabChange,
  isLoading,
  isError,
  hasStaleFeed,
  onRetry,
  onDismiss,
  onNavigate,
  onActOnNudge,
  previewLimit = 3,
  className,
  showDismissAlways = false,
}: NotificationPanelProps) {
  const [exitingKeys, setExitingKeys] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => new Date());

  const hasNudgeTimers = useMemo(
    () =>
      rows.some(
        (row) =>
          NUDGE_TIMER_KINDS.has(row.kind) &&
          sections.some((s) => s.showTimeRemaining && s.kinds.includes(row.kind)),
      ),
    [rows, sections],
  );

  useEffect(() => {
    if (!hasNudgeTimers) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [hasNudgeTimers]);

  const filteredRows = useMemo(() => {
    if (activeTab === "all") return rows;
    const section = sections.find((s) => s.tabId === activeTab);
    if (!section) return rows;
    return rows.filter((r) => section.kinds.includes(r.kind));
  }, [rows, activeTab, sections]);

  const sortRowsNewestFirst = (list: NotificationPanelRow[]) =>
    [...list].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

  const groupedSections = useMemo(() => {
    if (activeTab === "all") {
      const sorted = sortRowsNewestFirst(filteredRows);
      if (sorted.length === 0) {
        return [];
      }
      return [
        {
          section: {
            id: "all-chronological",
            heading: "",
            headingClassName: "",
            kinds: [],
            tabId: "all",
            navigateTo: "pipeline" as NotificationNavigateSection,
          },
          rows: sorted,
        },
      ];
    }

    return sections
      .map((section) => ({
        section,
        rows: sortRowsNewestFirst(filteredRows.filter((r) => section.kinds.includes(r.kind))),
      }))
      .filter((g) => g.rows.length > 0);
  }, [sections, filteredRows, activeTab]);

  const addExitingKey = (key: string) => {
    setExitingKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const removeExitingKey = (key: string) => {
    setExitingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleDismissWithAnimation = (row: NotificationPanelRow) => {
    addExitingKey(row.key);
    window.setTimeout(() => {
      onDismiss(row);
      removeExitingKey(row.key);
    }, 320);
  };

  const handleNavigateWithDismiss = (section: NotificationNavigateSection, row: NotificationPanelRow) => {
    addExitingKey(row.key);
    window.setTimeout(() => {
      onDismiss(row);
      onNavigate(section, row);
      removeExitingKey(row.key);
    }, 220);
  };

  const handleAct = (row: NotificationPanelRow) => {
    if (!onActOnNudge) return;
    addExitingKey(row.key);
    window.setTimeout(() => {
      onDismiss(row);
      onActOnNudge(row);
      removeExitingKey(row.key);
    }, 220);
  };

  const totalCount = rows.length;

  return (
    <div className={`flex h-full flex-col bg-white ${className ?? ""}`}>
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Notification</h3>
          <span className="text-sm text-slate-500">
            {totalCount} Notification{totalCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-3 w-full">
          <div className="flex w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 px-1 py-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
        {isError && !isLoading && rows.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-amber-700">Notifications could not be loaded.</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700">
                Try again
              </button>
            )}
          </div>
        )}
        {hasStaleFeed && rows.length > 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Showing last loaded notifications. Refresh if something looks out of date.
          </p>
        )}
        {!isLoading && groupedSections.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No notifications yet.</p>
        )}
        {!isLoading && groupedSections.length > 0 && (
          <div className="space-y-4">
            {groupedSections.map(({ section, rows: sectionRows }) => (
              <NotificationSectionBlock
                key={section.id}
                section={section}
                rows={sectionRows}
                previewLimit={previewLimit}
                exitingKeys={exitingKeys}
                onDismiss={handleDismissWithAnimation}
                onNavigate={handleNavigateWithDismiss}
                onAct={onActOnNudge ? handleAct : undefined}
                showDismissAlways={showDismissAlways}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
