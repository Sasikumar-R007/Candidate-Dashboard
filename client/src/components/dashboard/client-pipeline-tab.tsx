import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Users } from "lucide-react";
import type { ReactNode } from "react";

const filterRadiusStyle = { borderRadius: PIPELINE_FILTER_RADIUS_PX };
const buttonRadiusStyle = { borderRadius: PIPELINE_BUTTON_RADIUS_PX };

export type ClientPipelineRoleOption = {
  id: string;
  label: string;
};

export type ClientPipelineTabProps = {
  title?: string;
  isLoading: boolean;
  isEmpty: boolean;
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  selectedRequirement: string;
  onRequirementChange: (value: string) => void;
  roleOptions: ClientPipelineRoleOption[];
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

/** Client Admin pipeline — same shell/layout as AdminPipelineTab (adminScrollLayout). */
export function ClientPipelineTab({
  title = "Pipeline",
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
}: ClientPipelineTabProps) {
  const isTodayActive = pipelinePeriod === "today";
  const isAllDatesActive = pipelinePeriod === "all";

  const pipelineFilters = (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <Select value={selectedRequirement} onValueChange={onRequirementChange}>
        <SelectTrigger
          style={filterRadiusStyle}
          className="h-9 w-52 min-w-[12rem] border-gray-200 bg-gray-50 text-sm shadow-none hover:bg-gray-100"
        >
          <SelectValue placeholder="All Requirements" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Requirements</SelectItem>
          {roleOptions.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <StandardDatePicker
        value={isTodayActive ? pipelineDate : undefined}
        onChange={(date) => {
          if (date) onPipelineDateChange(date);
        }}
        placeholder="dd-mm-yyyy"
        className="h-9 w-36 border-gray-200 bg-white text-sm rounded-[6px]"
      />
      <button
        type="button"
        style={buttonRadiusStyle}
        className={`h-9 border px-4 text-sm font-medium transition-colors ${
          isTodayActive
            ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onClick={onTodayClick}
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
        onClick={onAllClick}
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
          {title}
        </h2>
        {pipelineFilters}
      </div>
      <div className="pipeline-session-board-body min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <p className="text-gray-500">Loading pipeline data...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center">
            <Users className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Pipeline Data</h3>
            <p className="max-w-md text-center text-gray-500">
              Candidates will appear here as they move through your hiring pipeline.
            </p>
          </div>
        ) : (
          <PipelineKanbanBoard
            embedded
            naturalScroll
            className="h-full min-h-0 overflow-hidden"
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
      className={`relative flex h-full min-h-0 w-full min-w-0 overflow-hidden${
        isSessionOpen ? " pipeline-tab-session-open" : ""
      }`}
    >
      <PipelineCandidateSessionShell
        fullscreen
        className="h-full min-h-0 w-full"
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
