import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PipelineCandidateSessionShell } from "@/components/dashboard/pipeline-candidate-session-shell";
import { PipelineKanbanBoard } from "@/components/dashboard/pipeline-kanban-board";
import { PipelineWorkspace } from "@/components/dashboard/pipeline-workspace";
import type { PipelineStageKey } from "@shared/pipeline-stages";
import { PipelineStatsSidebar } from "@/components/dashboard/pipeline-stats-sidebar";
import { EmployeePipelineMobileFilters } from "@/components/dashboard/employee-pipeline-mobile-filters";
import { EmployeePipelineMobileStatsBackdrop } from "@/components/dashboard/employee-pipeline-mobile-stats-backdrop";
import { PIPELINE_FILTER_RADIUS_PX } from "@/lib/pipeline-ui-tokens";
import { isSameDay } from "date-fns";
import { BarChart3, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const filterRadiusStyle = { borderRadius: PIPELINE_FILTER_RADIUS_PX };

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

export type AdminPipelineTabProps = {
  isLoading: boolean;
  isEmpty: boolean;
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  onCandidateClick: (candidate: any) => void;
  selectedPipelineTL: string;
  selectedPipelineTeamMember: string;
  onFilterChange: (value: string) => void;
  pipelineDate: Date | null;
  onPipelineDateChange: (date: Date | null) => void;
  teamLeads: any[];
  employees: any[];
  closureReportsFooter?: ReactNode;
  pipelineView?: "board" | "candidate-session";
  candidateSession?: ReactNode | null;
};

export function AdminPipelineTab({
  isLoading,
  isEmpty,
  groupedByStage,
  onCandidateClick,
  selectedPipelineTL,
  selectedPipelineTeamMember,
  onFilterChange,
  pipelineDate,
  onPipelineDateChange,
  teamLeads,
  employees,
  closureReportsFooter,
  pipelineView = "board",
  candidateSession = null,
}: AdminPipelineTabProps) {
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const isMobile = useIsMobile();
  const filterValue =
    selectedPipelineTL !== "all"
      ? `tl-${selectedPipelineTL}`
      : selectedPipelineTeamMember !== "all"
        ? `ta-${selectedPipelineTeamMember}`
        : "all";

  const isTodayActive =
    pipelineDate !== null && isSameDay(pipelineDate, new Date());
  const isAllDatesActive = pipelineDate === null;

  const pipelineFilters = (
    <EmployeePipelineMobileFilters
      pipelineDate={pipelineDate}
      onPipelineDateChange={onPipelineDateChange}
      isTodayActive={isTodayActive}
      isAllDatesActive={isAllDatesActive}
      primaryFilter={
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger
            style={filterRadiusStyle}
            className="h-9 min-w-0 w-full border-gray-200 bg-gray-50 text-sm shadow-none hover:bg-gray-100 md:w-52 md:min-w-[12rem]"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {teamLeads.map((tl: any) => (
              <SelectItem key={`tl-${tl.id}`} value={`tl-${tl.id}`}>
                {tl.name} (TL)
              </SelectItem>
            ))}
            {employees
              .filter((emp: any) => emp.role === "recruiter")
              .map((ta: any) => (
                <SelectItem key={`ta-${ta.id}`} value={`ta-${ta.id}`}>
                  {ta.name} (TA)
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      }
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
              When recruiters tag candidates to requirements and update their statuses,
              they will appear here automatically.
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
            getCandidateName={(c) => c.candidateName || "N/A"}
            getRoleApplied={(c) => c.roleApplied || c.jobTitle || "N/A"}
            getCompany={(c) => c.company || "N/A"}
            getProfilePicture={(c) => c.profilePicture || c.profile_picture || null}
            getAppliedTimestamp={(c) =>
              formatPipelineDaysAgo(
                c.appliedDate || c.updatedAt || c.createdAt || c.appliedOn,
              )
            }
            isRejectedCandidate={(c) =>
              c.currentStatus === "Rejected" || c.currentStatus === "Screened Out"
            }
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
            adminScrollLayout
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
