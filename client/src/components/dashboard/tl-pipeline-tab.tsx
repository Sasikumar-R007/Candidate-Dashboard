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
import { isSameDay } from "date-fns";
import { Users } from "lucide-react";
import type { ReactNode } from "react";

const filterRadiusStyle = { borderRadius: PIPELINE_FILTER_RADIUS_PX };
const buttonRadiusStyle = { borderRadius: PIPELINE_BUTTON_RADIUS_PX };

function formatPipelineDaysAgo(dateString: string | null | undefined): string {
  if (!dateString || dateString === "N/A") return "N/A";
  try {
    let date: Date;
    if (dateString.includes("-") && dateString.split("-").length === 3) {
      const [partA, partB, partC] = dateString.split("-");
      if (partA.length <= 2 && partB.length <= 2 && partC.length === 4) {
        date = new Date(parseInt(partC, 10), parseInt(partB, 10) - 1, parseInt(partA, 10));
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    if (Number.isNaN(date.getTime())) return "N/A";
    const diffDays = Math.floor(
      Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "0 days ago";
    if (diffDays === 1) return "01 day ago";
    return diffDays < 10 ? `0${diffDays} days ago` : `${diffDays} days ago`;
  } catch {
    return "N/A";
  }
}

export type TlPipelineTabProps = {
  isLoading: boolean;
  isError?: boolean;
  isEmpty: boolean;
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  onCandidateClick: (candidate: any) => void;
  selectedRecruiter: string;
  onRecruiterChange: (value: string) => void;
  teamMembers: any[];
  pipelineDate: Date | null;
  onPipelineDateChange: (date: Date | null) => void;
  closureReportsFooter?: ReactNode;
  pipelineView?: "board" | "candidate-session";
  candidateSession?: ReactNode | null;
};

/** Team Leader pipeline — matches Admin pipeline layout (TL-specific filters). */
export function TlPipelineTab({
  isLoading,
  isError = false,
  isEmpty,
  groupedByStage,
  onCandidateClick,
  selectedRecruiter,
  onRecruiterChange,
  teamMembers,
  pipelineDate,
  onPipelineDateChange,
  closureReportsFooter,
  pipelineView = "board",
  candidateSession = null,
}: TlPipelineTabProps) {
  const isTodayActive =
    pipelineDate !== null && isSameDay(pipelineDate, new Date());
  const isAllDatesActive = pipelineDate === null;

  const pipelineFilters = (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <Select value={selectedRecruiter} onValueChange={onRecruiterChange}>
        <SelectTrigger
          style={filterRadiusStyle}
          className="h-9 w-52 min-w-[12rem] border-gray-200 bg-gray-50 text-sm shadow-none hover:bg-gray-100"
          data-testid="select-pipeline-recruiter"
        >
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {Array.isArray(teamMembers) &&
            teamMembers.map((member: any) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
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
          className="shrink-0 text-xl font-semibold text-gray-900 dark:text-white"
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
        ) : isError ? (
          <div className="flex h-full min-h-[320px] items-center justify-center text-red-500">
            Failed to load pipeline data
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center">
            <Users className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Pipeline Data</h3>
            <p className="max-w-md text-center text-gray-500">
              When recruiters tag candidates to requirements and update their statuses,
              they will appear here automatically.
            </p>
          </div>
        ) : (
          <PipelineKanbanBoard
            embedded
            naturalScroll
            className="h-full min-h-0"
            groupedByStage={groupedByStage}
            onCandidateClick={onCandidateClick}
            getCandidateName={(c) => c.name || c.candidateName || "N/A"}
            getRoleApplied={(c) => c.position || c.roleApplied || "N/A"}
            getCompany={(c) => c.company || "N/A"}
            getAppliedTimestamp={(c) =>
              formatPipelineDaysAgo(
                c.appliedDate || c.appliedOn || c.createdAt || c.updatedAt,
              )
            }
            isRejectedCandidate={(c) =>
              (c.currentStatus || c.status) === "Rejected" ||
              (c.currentStatus || c.status) === "Screened Out"
            }
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
            tlScrollLayout
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
