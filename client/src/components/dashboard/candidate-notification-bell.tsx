import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NotificationPanel, {
  type NotificationPanelRow,
} from "@/components/dashboard/notification-panel";
import { useJobApplications } from "@/hooks/use-job-applications";
import { apiRequest } from "@/lib/queryClient";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useIsBelowLg } from "@/hooks/use-mobile";
import {
  buildCandidateNotificationRows,
  CANDIDATE_NOTIFICATION_SECTIONS,
  CANDIDATE_NOTIFICATION_TABS,
  loadDismissedCandidateNotificationKeys,
  persistDismissedCandidateNotificationKey,
  type CandidateNudgeRow,
} from "@/lib/candidate-notifications";

type CandidateNotificationBellProps = {
  onNavigateToMyJobs?: () => void;
};

type PanelPosition = {
  top: number;
  right: number;
  width: number;
};

export function CandidateNotificationBell({ onNavigateToMyJobs }: CandidateNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() =>
    loadDismissedCandidateNotificationKeys(),
  );
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const { data: jobApplications = [], isLoading: appsLoading } = useJobApplications();
  const { data: candidateNudges = [], isLoading: nudgesLoading } = useQuery<CandidateNudgeRow[]>({
    queryKey: ["/api/candidate/nudges"],
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  const rows = useMemo(
    () => buildCandidateNotificationRows(jobApplications, candidateNudges, dismissedKeys),
    [jobApplications, candidateNudges, dismissedKeys],
  );

  const unreadCount = useMemo(
    () => rows.filter((r) => r.isUnread).length,
    [rows],
  );

  useNotificationSound(unreadCount, true);

  const markNudgeReadMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      await apiRequest("PATCH", `/api/candidate/nudges/${nudgeId}/read`, {});
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["/api/candidate/nudges"] });
    },
  });

  const updatePanelPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const isMobile = window.innerWidth < 1024;
    const width = isMobile
      ? Math.min(window.innerWidth - 16, 440)
      : Math.min(440, Math.max(320, window.innerWidth - 24));
    const right = isMobile ? 8 : Math.max(12, window.innerWidth - rect.right);
    const top = isMobile
      ? Math.min(rect.bottom + 8, window.innerHeight * 0.12)
      : rect.bottom + 10;
    setPanelPosition({
      top,
      right,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPosition(null);
      return;
    }
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleDismiss = (row: NotificationPanelRow) => {
    persistDismissedCandidateNotificationKey(row.key);
    setDismissedKeys((prev) => new Set([...prev, row.key]));
    if (row.kind === "nudgeUpdate") {
      markNudgeReadMutation.mutate(row.id);
    }
  };

  const handleNavigate = () => {
    setOpen(false);
    onNavigateToMyJobs?.();
  };

  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const isBelowLg = useIsBelowLg();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
        aria-label="Notifications"
        aria-expanded={open}
        data-testid="button-candidate-notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
            {unreadCount > 1 && (
              <span className="absolute -bottom-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {open && portalTarget && panelPosition &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[240] bg-slate-900/50 backdrop-blur-md"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-[250] flex max-h-[min(85vh,640px)] lg:max-h-[min(78vh,640px)] flex-col overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.45)] ring-1 ring-slate-400/30"
              style={{
                top: panelPosition.top,
                right: panelPosition.right,
                width: panelPosition.width,
              }}
              role="dialog"
              aria-label="Notifications"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <NotificationPanel
                  className="bg-slate-50"
                  rows={rows}
                  tabs={CANDIDATE_NOTIFICATION_TABS}
                  sections={CANDIDATE_NOTIFICATION_SECTIONS.map((s) => ({
                    ...s,
                    showActButton: false,
                    showTimeRemaining: false,
                  }))}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isLoading={appsLoading || nudgesLoading}
                  onDismiss={handleDismiss}
                  onNavigate={() => handleNavigate()}
                  showDismissAlways={isBelowLg}
                />
              </div>
            </div>
          </>,
          portalTarget,
        )}
    </div>
  );
}
