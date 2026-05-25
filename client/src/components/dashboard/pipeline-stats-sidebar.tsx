import type { PipelineStageKey } from "@shared/pipeline-stages";
import { PIPELINE_STAT_RADIUS_PX } from "@/lib/pipeline-ui-tokens";

const STAT_ROWS: Array<{
  label: string;
  key: PipelineStageKey;
  color: string;
}> = [
  { label: "RESUME REVIEW", key: "resumeReview", color: "bg-green-50 text-gray-800" },
  { label: "SHORTLISTED", key: "shortlisted", color: "bg-green-100 text-gray-800" },
  { label: "SCREENING", key: "screening", color: "bg-green-50 text-gray-800" },
  { label: "LEVEL 1", key: "level1", color: "bg-green-200 text-gray-900" },
  { label: "LEVEL 2", key: "level2", color: "bg-green-300 text-gray-900" },
  { label: "LEVEL 3", key: "level3", color: "bg-green-400 text-white" },
  { label: "FINAL ROUND", key: "finalRound", color: "bg-green-500 text-white" },
  { label: "HR ROUND", key: "hrRound", color: "bg-green-600 text-white" },
  { label: "OFFER STAGE", key: "offerStage", color: "bg-green-700 text-white" },
  { label: "CLOSURE", key: "closure", color: "bg-green-800 text-white" },
  { label: "REJECTED", key: "rejected", color: "bg-orange-500 text-white" },
];

/** Admin pipeline right rail — matches reference image 2 */
const ADMIN_IMAGE_STAT_ROWS: Array<{
  label: string;
  key: PipelineStageKey;
  backgroundColor: string;
  textColor: string;
}> = [
  { label: "SHORTLISTED", key: "shortlisted", backgroundColor: "#D4F5E4", textColor: "#111827" },
  { label: "SCREENING", key: "screening", backgroundColor: "#F0FAF4", textColor: "#111827" },
  { label: "L1", key: "level1", backgroundColor: "#7FE09E", textColor: "#111827" },
  { label: "L2", key: "level2", backgroundColor: "#4CD67E", textColor: "#111827" },
  { label: "L3", key: "level3", backgroundColor: "#2DB85E", textColor: "#111827" },
  { label: "FINAL ROUND", key: "finalRound", backgroundColor: "#1E9B4D", textColor: "#111827" },
  { label: "HR ROUND", key: "hrRound", backgroundColor: "#177A3D", textColor: "#F9FAFB" },
  { label: "OFFER STAGE", key: "offerStage", backgroundColor: "#115E31", textColor: "#F9FAFB" },
  { label: "CLOSURE", key: "closure", backgroundColor: "#0B3D22", textColor: "#F9FAFB" },
  { label: "OFFER DROP", key: "rejected", backgroundColor: "#F97316", textColor: "#111827" },
];

type PipelineStatsSidebarProps = {
  groupedByStage: Partial<Record<PipelineStageKey, any[]>>;
  /** Pin to viewport height — no scroll; blocks fill the right rail */
  pinned?: boolean;
  /** Stack stat blocks from the top (admin pipeline rail) */
  alignTop?: boolean;
  /** Fill viewport height; blocks grow evenly (admin right rail) */
  fullHeight?: boolean;
  /** Image-2 style blocks for admin pipeline */
  variant?: "default" | "admin";
  /** Extra spacing between stat blocks (client / admin rail) */
  paddedRail?: boolean;
};

/** Display-only pipeline stage counts (TA / TL / Admin). */
export function PipelineStatsSidebar({
  groupedByStage,
  pinned = false,
  alignTop = false,
  fullHeight = false,
  variant = "default",
  paddedRail = false,
}: PipelineStatsSidebarProps) {
  const useAdminDesign = variant === "admin" && fullHeight;
  const adminRows = ADMIN_IMAGE_STAT_ROWS;
  const defaultRows = STAT_ROWS;

  return (
    <div className="pipeline-stats-sidebar flex h-full min-h-0 flex-1 flex-col">
      <div
        className={
          useAdminDesign
            ? "flex h-full min-h-0 flex-1 flex-col justify-between gap-1.5 overflow-y-auto"
            : fullHeight
              ? "flex h-full min-h-0 flex-1 flex-col justify-between gap-2 overflow-y-auto p-2"
              : pinned || paddedRail
                ? `flex flex-col overflow-hidden ${
                    alignTop
                      ? "gap-1.5"
                      : paddedRail
                        ? "h-full gap-2 p-4"
                        : "h-full justify-between gap-1 p-3"
                  }`
                : "pipeline-session-scroll min-h-0 flex-1 overflow-y-auto p-4"
        }
      >
        {useAdminDesign
          ? adminRows.map((row) => (
              <div
                key={row.key}
                style={{
                  borderRadius: 8,
                  backgroundColor: row.backgroundColor,
                  color: row.textColor,
                }}
                className="pipeline-stat-row flex min-h-[2.75rem] flex-1 items-center justify-between px-5 py-1.5"
                data-testid={`stat-pipeline-${row.key}`}
              >
                <span className="text-xs font-medium uppercase tracking-wide leading-tight">
                  {row.label}
                </span>
                <span className="text-xl font-bold tabular-nums leading-none" data-testid={`count-${row.key}`}>
                  {groupedByStage[row.key]?.length ?? 0}
                </span>
              </div>
            ))
          : defaultRows.map((row) => (
              <div
                key={row.key}
                style={{ borderRadius: PIPELINE_STAT_RADIUS_PX }}
                className={`pipeline-stat-row flex items-center justify-between ${
                  fullHeight ? "min-h-[2.75rem] flex-1 px-4 py-3" : "shrink-0 px-3"
                } ${
                  !fullHeight && (pinned || paddedRail) ? "min-h-[2.125rem] py-2" : !fullHeight ? "py-3" : ""
                } ${row.color}`}
                data-testid={`stat-pipeline-${row.key}`}
              >
                <span
                  className={`font-medium uppercase tracking-wide ${
                    fullHeight ? "text-xs" : "text-[11px]"
                  } ${row.color.includes("text-white") ? "text-white" : "text-gray-800"}`}
                >
                  {row.label}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    fullHeight ? "text-lg" : "text-base"
                  } ${row.color.includes("text-white") ? "text-white" : "text-gray-900"}`}
                  data-testid={`count-${row.key}`}
                >
                  {groupedByStage[row.key]?.length ?? 0}
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}
