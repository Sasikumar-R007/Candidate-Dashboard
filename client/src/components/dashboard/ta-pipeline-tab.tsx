import { PipelineCandidateSessionShell } from "@/components/dashboard/pipeline-candidate-session-shell";
import { PipelineKanbanBoard } from "@/components/dashboard/pipeline-kanban-board";
import { PipelineWorkspace } from "@/components/dashboard/pipeline-workspace";
import type { PipelineStageKey } from "@shared/pipeline-stages";
import { PipelineStatsSidebar } from "@/components/dashboard/pipeline-stats-sidebar";
import { EmployeePipelineMobileFilters } from "@/components/dashboard/employee-pipeline-mobile-filters";
import { EmployeePipelineMobileStatsBackdrop } from "@/components/dashboard/employee-pipeline-mobile-stats-backdrop";
import { isSameDay } from "date-fns";
import { BarChart3, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export type TaPipelineTabProps = {
  isLoading?: boolean;
  isEmpty: boolean;
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  onCandidateClick: (candidate: any) => void;
  pipelineDate: Date | null;
  onPipelineDateChange: (date: Date | null) => void;
  getCandidateName: (candidate: any) => string;
  getRoleApplied: (candidate: any) => string;
  getCompany: (candidate: any) => string;
  getProfilePicture?: (candidate: any) => string | null | undefined;
  getAppliedTimestamp: (candidate: any) => string;
  isRejectedCandidate: (candidate: any) => boolean;
  closureReportsFooter?: ReactNode;
  pipelineView?: "board" | "candidate-session";
  candidateSession?: ReactNode | null;
};

/** Talent Advisor pipeline — matches Admin layout (date filters only, classic cards). */
export function TaPipelineTab({
  isLoading = false,
  isEmpty,
  groupedByStage,
  onCandidateClick,
  pipelineDate,
  onPipelineDateChange,
  getCandidateName,
  getRoleApplied,
  getCompany,
  getProfilePicture,
  getAppliedTimestamp,
  isRejectedCandidate,
  closureReportsFooter,
  pipelineView = "board",
  candidateSession = null,
}: TaPipelineTabProps) {
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTodayActive =
    pipelineDate !== null && isSameDay(pipelineDate, new Date());
  const isAllDatesActive = pipelineDate === null;

  const pipelineFilters = (
    <EmployeePipelineMobileFilters
      pipelineDate={pipelineDate}
      onPipelineDateChange={onPipelineDateChange}
      isTodayActive={isTodayActive}
      isAllDatesActive={isAllDatesActive}
    />
  );

  const isSessionOpen =
    pipelineView === "candidate-session" && Boolean(candidateSession);

  const pipelineBoard = (
    <div
      className="pipeline-admin-session flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-sm"
      data-testid="pipeline-session-panel"
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-gray-200 px-3 py-2.5 md:gap-3 md:py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5">
        <div className="flex items-center justify-between gap-2 md:contents">
          <h2
            className="shrink-0 text-base font-semibold text-gray-900 md:text-xl"
            data-testid="text-pipeline-header"
          >
            Pipeline
          </h2>
          <button
            type="button"
            onClick={() => setMobileStatsOpen((open) => !open)}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 md:hidden"
            aria-expanded={mobileStatsOpen}
            aria-label={mobileStatsOpen ? "Hide pipeline stats" : "Show pipeline stats"}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Stats
          </button>
        </div>
        {pipelineFilters}
      </div>
      <div className="pipeline-session-board-body min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full min-h-[240px] items-center justify-center md:min-h-[320px]">
            <p className="text-gray-500">Loading pipeline data...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-4 md:min-h-[320px]">
            <Users className="mb-4 h-12 w-12 text-gray-300 md:h-16 md:w-16" />
            <h3 className="mb-2 text-base font-semibold text-gray-900 md:text-lg">No Pipeline Data</h3>
            <p className="max-w-md text-center text-sm text-gray-500 md:text-base">
              When you tag candidates to requirements and update their statuses, they
              will appear here automatically.
            </p>
          </div>
        ) : (
          <PipelineKanbanBoard
            embedded
            naturalScroll
            cardVariant="classic"
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            groupedByStage={groupedByStage}
            onCandidateClick={onCandidateClick}
            getCandidateName={getCandidateName}
            getRoleApplied={getRoleApplied}
            getCompany={getCompany}
            getProfilePicture={getProfilePicture}
            getAppliedTimestamp={getAppliedTimestamp}
            isRejectedCandidate={isRejectedCandidate}
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`employee-pipeline-mobile-root relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden${
        isSessionOpen ? " pipeline-tab-session-open" : ""
      }${mobileStatsOpen ? " employee-pipeline-stats-open" : ""}`}
    >
      <EmployeePipelineMobileStatsBackdrop onClose={() => setMobileStatsOpen(false)} />
      <PipelineCandidateSessionShell
        fullscreen
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden md:overflow-hidden"
        mode={isSessionOpen ? "candidate-session" : "board"}
        board={
          <PipelineWorkspace
            taScrollLayout
            sidebar={
              <PipelineStatsSidebar
                groupedByStage={groupedByStage}
                pinned
                fullHeight
                variant="admin"
              />
            }
            footer={isMobile ? undefined : closureReportsFooter}
          >
            {pipelineBoard}
          </PipelineWorkspace>
        }
        session={candidateSession}
      />
    </div>
  );
}
