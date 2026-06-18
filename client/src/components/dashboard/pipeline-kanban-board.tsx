import { useRef, type ReactElement } from "react";
import { PipelineColumnScroll } from "@/components/dashboard/pipeline-column-scroll";
import { PipelineCandidateCard } from "@/components/dashboard/pipeline-candidate-card";
import { useHorizontalWheelScroll } from "@/hooks/use-horizontal-wheel-scroll";
import {
  PIPELINE_CARD_RADIUS_PX,
  PIPELINE_COLUMN_WIDTH_PX,
  PIPELINE_PANEL_RADIUS_PX,
} from "@/lib/pipeline-ui-tokens";
import {
  FULL_PIPELINE_STAGES,
  type PipelineStageKey,
} from "@shared/pipeline-stages";

export type PipelineKanbanBoardProps = {
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  onCandidateClick?: (candidate: any) => void;
  getCandidateName: (candidate: any) => string;
  getRoleApplied: (candidate: any) => string;
  getCompany?: (candidate: any) => string;
  getSubtitle?: (candidate: any) => string;
  getAppliedTimestamp?: (candidate: any) => string;
  getProfilePicture?: (candidate: any) => string | null | undefined;
  isRejectedCandidate?: (candidate: any) => boolean;
  shouldSkipCandidate?: (candidate: any) => boolean;
  emptyMessage?: string;
  className?: string;
  columnMinWidth?: number;
  /** TA-style cards: rounded-xl, profile photo, slightly wider columns */
  cardVariant?: "default" | "classic";
  /** viewport: fixed-height board with inner column scroll; page: board grows with content, page scrolls */
  scrollMode?: "viewport" | "page";
  /** Inside a parent card that already provides border/title (admin pipeline) */
  embedded?: boolean;
  /** Use native scrollbars; do not map vertical wheel to horizontal scroll */
  naturalScroll?: boolean;
};

function renderPipelineCandidateCard(options: {
  candidate: any;
  index: number;
  stageKey: PipelineStageKey;
  cardVariant: "default" | "classic";
  getCandidateName: (candidate: any) => string;
  getRoleApplied: (candidate: any) => string;
  getCompany?: (candidate: any) => string;
  getSubtitle?: (candidate: any) => string;
  getAppliedTimestamp?: (candidate: any) => string;
  getProfilePicture?: (candidate: any) => string | null | undefined;
  isRejectedCandidate?: (candidate: any) => boolean;
  onCandidateClick?: (candidate: any) => void;
}): ReactElement | null {
  const {
    candidate,
    index,
    stageKey,
    cardVariant,
    getCandidateName,
    getRoleApplied,
    getCompany,
    getSubtitle,
    getAppliedTimestamp,
    getProfilePicture,
    isRejectedCandidate,
    onCandidateClick,
  } = options;

  const name = getCandidateName(candidate);
  const roleApplied = getRoleApplied(candidate);
  const company = getCompany?.(candidate);
  const subtitle = getSubtitle?.(candidate);
  const timestamp = getAppliedTimestamp?.(candidate);
  const rejected = isRejectedCandidate?.(candidate) ?? false;
  const hasUnreadComments = Boolean(candidate?.hasUnreadComments);
  const clickable = Boolean(onCandidateClick);
  const key = candidate.id || `${stageKey}-${index}`;

  if (cardVariant === "classic") {
    return (
      <PipelineCandidateCard
        key={key}
        name={name}
        roleApplied={roleApplied}
        company={company}
        subtitle={subtitle}
        timestamp={timestamp}
        profilePicture={getProfilePicture?.(candidate)}
        rejected={rejected}
        hasUnreadComments={hasUnreadComments}
        clickable={clickable}
        onClick={clickable ? () => onCandidateClick?.(candidate) : undefined}
        testId={`pipeline-${stageKey}-candidate-${index}`}
      />
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      key={key}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onCandidateClick?.(candidate) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCandidateClick?.(candidate);
              }
            }
          : undefined
      }
      style={{ borderRadius: PIPELINE_CARD_RADIUS_PX }}
      className={`relative border bg-white p-1.5 shadow-sm transition-all ${
        rejected ? "border-red-200 bg-red-50" : "border-gray-200"
      } ${clickable ? "cursor-pointer hover:border-blue-300 hover:shadow" : ""}`}
      data-testid={`pipeline-${stageKey}-candidate-${index}`}
    >
      {hasUnreadComments ? (
        <span
          className="absolute right-1.5 top-1.5 z-10 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
          aria-label="Unread team messages"
        />
      ) : null}
      <div className="flex items-start gap-2">
        <div className="shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
            <span className="text-[10px] font-medium text-blue-700">
              {initials || "?"}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <h4 className="truncate text-[11px] font-semibold text-gray-900">
            {name || "N/A"}
          </h4>
          <p className="truncate text-[10px] text-gray-600">{roleApplied}</p>
          {subtitle ? (
            <p className="truncate text-[10px] text-gray-500">{subtitle}</p>
          ) : company ? (
            <p className="truncate text-[10px] text-gray-500">{company}</p>
          ) : null}
        </div>
      </div>
      {timestamp ? (
        <div className="absolute bottom-1.5 right-2">
          <p className="text-[9px] text-gray-400">{timestamp}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PipelineKanbanBoard({
  groupedByStage,
  onCandidateClick,
  getCandidateName,
  getRoleApplied,
  getCompany,
  getSubtitle,
  getAppliedTimestamp,
  getProfilePicture,
  isRejectedCandidate,
  shouldSkipCandidate,
  emptyMessage = "No candidates",
  className = "",
  columnMinWidth,
  cardVariant = "default",
  scrollMode = "viewport",
  embedded = false,
  naturalScroll = false,
}: PipelineKanbanBoardProps) {
  const resolvedColumnWidth = columnMinWidth ?? PIPELINE_COLUMN_WIDTH_PX;
  const pageScroll = scrollMode === "page";
  const hScrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(hScrollRef, !pageScroll && !naturalScroll);

  return (
    <div
      data-testid={embedded ? undefined : "pipeline-session-panel"}
      data-pipeline-stage-count={FULL_PIPELINE_STAGES.length}
      style={embedded ? undefined : { borderRadius: PIPELINE_PANEL_RADIUS_PX }}
      className={
        embedded
          ? `flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden ${className}`
          : `pipeline-session-panel flex w-full flex-col border border-gray-200 bg-white shadow-sm ${
              pageScroll ? "min-h-[420px]" : "h-full min-h-0 overflow-hidden"
            } ${className}`
      }
    >
      <div
        ref={hScrollRef}
        className={
          pageScroll
            ? "pipeline-h-scroll overflow-x-auto"
            : naturalScroll
              ? "pipeline-h-scroll pipeline-session-scroll min-h-0 flex-1 overflow-auto"
              : "pipeline-h-scroll pipeline-session-scroll min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
        }
      >
        <div className={`flex min-w-max ${pageScroll ? "items-stretch" : "h-full min-h-0"}`}>
          {FULL_PIPELINE_STAGES.map((stage, stageIndex) => {
            const candidates = groupedByStage[stage.key] || [];
            const count = candidates.length;
            const isLast = stageIndex === FULL_PIPELINE_STAGES.length - 1;

            const candidateCards = candidates
              .map((candidate: any, index: number) => {
                if (shouldSkipCandidate?.(candidate)) return null;
                return renderPipelineCandidateCard({
                  candidate,
                  index,
                  stageKey: stage.key,
                  cardVariant,
                  getCandidateName,
                  getRoleApplied,
                  getCompany,
                  getSubtitle,
                  getAppliedTimestamp,
                  getProfilePicture,
                  isRejectedCandidate,
                  onCandidateClick,
                });
              })
              .filter((card): card is ReactElement => card != null);

            const candidateList = (
              <div className={cardVariant === "classic" ? "space-y-2.5" : "space-y-2"}>
                {candidateCards}
              </div>
            );

            return (
              <div
                key={stage.key}
                className={`flex shrink-0 flex-col bg-white ${
                  pageScroll ? "min-h-[320px]" : "h-full min-h-0"
                } ${isLast ? "" : "border-r border-gray-200"}`}
                style={{
                  width: resolvedColumnWidth,
                  minWidth: resolvedColumnWidth,
                  maxWidth: resolvedColumnWidth,
                }}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-3">
                  <h3
                    className="truncate text-xs font-medium text-gray-800"
                    data-testid={`header-pipeline-${stage.key}`}
                  >
                    {stage.display}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[11px] font-medium text-gray-600">
                      {count}
                    </span>
                  </div>
                </div>

                {pageScroll ? (
                  <div className="px-2 py-2">
                    {count === 0 ? (
                      <div className="flex min-h-[200px] items-center justify-center px-2">
                        <p className="text-center text-xs text-gray-400">{emptyMessage}</p>
                      </div>
                    ) : (
                      candidateList
                    )}
                  </div>
                ) : (
                  <PipelineColumnScroll>
                    {count === 0 ? (
                      <div className="flex h-full min-h-[200px] items-center justify-center px-2">
                        <p className="text-center text-xs text-gray-400">{emptyMessage}</p>
                      </div>
                    ) : (
                      candidateList
                    )}
                  </PipelineColumnScroll>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
