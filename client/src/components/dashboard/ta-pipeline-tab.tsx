import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { PipelineCandidateSessionShell } from "@/components/dashboard/pipeline-candidate-session-shell";
import { PipelineKanbanBoard } from "@/components/dashboard/pipeline-kanban-board";
import { PipelineWorkspace } from "@/components/dashboard/pipeline-workspace";
import type { PipelineStageKey } from "@shared/pipeline-stages";
import { PipelineStatsSidebar } from "@/components/dashboard/pipeline-stats-sidebar";
import {
  PIPELINE_BUTTON_RADIUS_PX,
  PIPELINE_FILTER_RADIUS_PX,
} from "@/lib/pipeline-ui-tokens";
import { isSameDay } from "date-fns";
import { Users } from "lucide-react";
import type { ReactNode } from "react";

const filterRadiusStyle = { borderRadius: PIPELINE_FILTER_RADIUS_PX };
const buttonRadiusStyle = { borderRadius: PIPELINE_BUTTON_RADIUS_PX };

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
  const isTodayActive =
    pipelineDate !== null && isSameDay(pipelineDate, new Date());
  const isAllDatesActive = pipelineDate === null;

  const pipelineFilters = (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <StandardDatePicker
        value={pipelineDate || undefined}
        onChange={(date) => onPipelineDateChange(date || null)}
        placeholder="dd-mm-yyyy"
        className="h-9 w-36 border-gray-200 bg-white text-sm rounded-[6px]"
        data-testid="button-pipeline-date-picker"
      />
      <button
        type="button"
        style={buttonRadiusStyle}
        className={`h-9 border px-4 text-sm font-medium transition-colors ${
          isTodayActive
            ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => onPipelineDateChange(new Date())}
      >
        Today
      </button>
      <button
        type="button"
        style={buttonRadiusStyle}
        className={`h-9 border px-4 text-sm font-medium transition-colors ${
          isAllDatesActive
            ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => onPipelineDateChange(null)}
      >
        All
      </button>
    </div>
  );

  const isSessionOpen =
    pipelineView === "candidate-session" && Boolean(candidateSession);

  const pipelineBoard = (
    <div
      className="pipeline-admin-session flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-sm"
      data-testid="pipeline-session-panel"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
        <h2
          className="shrink-0 text-xl font-semibold text-gray-900"
          data-testid="text-pipeline-header"
        >
          Pipeline
        </h2>
        {pipelineFilters}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span className="ml-3 text-gray-500">Loading pipeline data...</span>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center">
            <Users className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Pipeline Data</h3>
            <p className="max-w-md text-center text-gray-500">
              When you tag candidates to requirements and update their statuses, they
              will appear here automatically.
            </p>
          </div>
        ) : (
          <PipelineKanbanBoard
            embedded
            naturalScroll
            cardVariant="classic"
            className="h-full min-h-0"
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
      className={`relative flex h-full min-h-0 w-full overflow-hidden${
        isSessionOpen ? " pipeline-tab-session-open" : ""
      }`}
    >
      <PipelineCandidateSessionShell
        fullscreen
        className="h-full min-h-0 w-full"
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
