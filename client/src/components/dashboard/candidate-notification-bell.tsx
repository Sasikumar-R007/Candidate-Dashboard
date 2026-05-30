import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NotificationPanel, {
  type NotificationPanelRow,
} from "@/components/dashboard/notification-panel";
import { useJobApplications } from "@/hooks/use-job-applications";
import { apiRequest } from "@/lib/queryClient";
import { useNotificationSound } from "@/hooks/use-notification-sound";
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

export function CandidateNotificationBell({ onNavigateToMyJobs }: CandidateNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() =>
    loadDismissedCandidateNotificationKeys(),
  );
  const panelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <div className="relative z-[80] notification-panel-container" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
        aria-label="Notifications"
        data-testid="button-candidate-notifications"
      >
        <Bell className="h-5 w-5" />
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

      {open && (
        <div className="absolute right-0 top-full z-[90] mt-2 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="max-h-[min(70vh,560px)] overflow-y-auto">
            <NotificationPanel
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
