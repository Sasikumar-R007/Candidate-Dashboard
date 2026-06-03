import { PipelineCandidateSessionShell } from "@/components/dashboard/pipeline-candidate-session-shell";
import { PipelineKanbanBoard } from "@/components/dashboard/pipeline-kanban-board";
import { PipelineWorkspace } from "@/components/dashboard/pipeline-workspace";
import type { PipelineStageKey } from "@shared/pipeline-stages";
import { PipelineStatsSidebar } from "@/components/dashboard/pipeline-stats-sidebar";
import { ClientPipelineMobileFilters } from "@/components/client-dashboard/client-pipeline-mobile-filters";
import { BarChart3, Users } from "lucide-react";
import { useState, type ReactNode } from "react";

export type ClientMemberPipelineRoleOption = {
  id: string;
  label: string;
};

export type ClientMemberPipelineTabProps = {
  isLoading: boolean;
  isEmpty: boolean;
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  selectedRequirement: string;
  onRequirementChange: (value: string) => void;
  roleOptions: ClientMemberPipelineRoleOption[];
  pipelineDate: Date;
  pipelinePeriod: string;
  onPipelineDateChange: (date: Date) => void;
  onTodayClick: () => void;
  onAllClick: () => void;
  onCandidateClick: (candidate: any) => void;
  getCandidateName: (candidate: any) => string;
  getRoleApplied: (candidate: any) => string;
  getSubtitle: (candidate: any) => string;
  getAppliedTimestamp: (candidate: any) => string;
  isRejectedCandidate: (candidate: any) => boolean;
  shouldSkipCandidate?: (candidate: any) => boolean;
  closureReportsFooter?: ReactNode;
  pipelineView?: "board" | "candidate-session";
  candidateSession?: ReactNode | null;
};

/** Client Member pipeline — same shell/layout as AdminPipelineTab (adminScrollLayout). */
export function ClientMemberPipelineTab({
  isLoading,
  isEmpty,
  groupedByStage,
  selectedRequirement,
  onRequirementChange,
  roleOptions,
  pipelineDate,
  pipelinePeriod,
  onPipelineDateChange,
  onTodayClick,
  onAllClick,
  onCandidateClick,
  getCandidateName,
  getRoleApplied,
  getSubtitle,
  getAppliedTimestamp,
  isRejectedCandidate,
  shouldSkipCandidate,
  closureReportsFooter,
  pipelineView = "board",
  candidateSession = null,
}: ClientMemberPipelineTabProps) {
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);

  const isSessionOpen =
    pipelineView === "candidate-session" && Boolean(candidateSession);

  const pipelineBoard = (
    <div
      className="pipeline-admin-session flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-sm"
      data-testid="pipeline-session-panel"
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-gray-200 px-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5">
        <div className="flex items-center justify-between gap-2 md:contents">
          <h2
            className="shrink-0 text-lg font-semibold text-gray-900 md:text-xl"
            data-testid="text-pipeline-header"
          >
            Pipeline
          </h2>
          <button
            type="button"
            onClick={() => setMobileStatsOpen((open) => !open)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 md:hidden"
            aria-expanded={mobileStatsOpen}
            aria-label={mobileStatsOpen ? "Hide pipeline stats" : "Show pipeline stats"}
            data-testid="button-client-pipeline-mobile-stats"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Stats
          </button>
        </div>
        <ClientPipelineMobileFilters
          selectedRequirement={selectedRequirement}
          onRequirementChange={onRequirementChange}
          roleOptions={roleOptions}
          pipelineDate={pipelineDate}
          pipelinePeriod={pipelinePeriod}
          onPipelineDateChange={onPipelineDateChange}
          onTodayClick={onTodayClick}
          onAllClick={onAllClick}
        />
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
              Candidates will appear here as they move through your hiring pipeline.
            </p>
          </div>
        ) : (
          <PipelineKanbanBoard
            embedded
            naturalScroll
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            groupedByStage={groupedByStage}
            onCandidateClick={onCandidateClick}
            getCandidateName={getCandidateName}
            getRoleApplied={getRoleApplied}
            getSubtitle={getSubtitle}
            getAppliedTimestamp={getAppliedTimestamp}
            isRejectedCandidate={isRejectedCandidate}
            shouldSkipCandidate={shouldSkipCandidate}
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`client-portal-pipeline-root relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto md:overflow-hidden${
        isSessionOpen ? " pipeline-tab-session-open" : ""
      }${mobileStatsOpen ? " client-pipeline-stats-open" : ""}`}
    >
      {mobileStatsOpen && (
        <button
          type="button"
          className="fixed bottom-[4.25rem] left-0 top-[3.25rem] z-[90] bg-black/25 md:hidden"
          style={{ width: "calc(100% - 13.75rem)" }}
          onClick={() => setMobileStatsOpen(false)}
          aria-label="Close pipeline stats"
        />
      )}
      <PipelineCandidateSessionShell
        fullscreen
        className="flex min-h-0 w-full flex-1 flex-col overflow-visible md:h-full md:overflow-hidden"
        mode={isSessionOpen ? "candidate-session" : "board"}
        board={
          <PipelineWorkspace
            adminScrollLayout
            sidebar={
              <PipelineStatsSidebar
                groupedByStage={groupedByStage}
                pinned
                fullHeight
                variant="admin"
              />
            }
            footer={closureReportsFooter}
          >
            {pipelineBoard}
          </PipelineWorkspace>
        }
        session={candidateSession}
      />
    </div>
  );
}
