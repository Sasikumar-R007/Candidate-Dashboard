import type { ReactNode } from "react";

type PipelineWorkspaceProps = {
  header?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  /** Page fixed; header + right stats pinned; only kanban board scrolls */
  isolateBoardScroll?: boolean;
  /** Page scrolls; board has fixed viewport height; closure flows below at full width */
  adminScrollLayout?: boolean;
  /** Same split layout as admin (TL pipeline) */
  tlScrollLayout?: boolean;
  /** Same split layout as admin (TA / recruiter pipeline) */
  taScrollLayout?: boolean;
  /** Same split layout as admin (client portal pipeline) */
  clientScrollLayout?: boolean;
  /** Client Member portal pipeline (separate CSS class from client admin) */
  clientMemberScrollLayout?: boolean;
  /** @deprecated Use clientScrollLayout */
  clientPortalPipelineLayout?: boolean;
};

/** Full-height pipeline page shell: grey page bg, filters outside, white board fills remainder. */
export function PipelineWorkspace({
  header,
  children,
  sidebar,
  footer,
  isolateBoardScroll = false,
  adminScrollLayout = false,
  tlScrollLayout = false,
  taScrollLayout = false,
  clientScrollLayout = false,
  clientMemberScrollLayout = false,
  clientPortalPipelineLayout = false,
}: PipelineWorkspaceProps) {
  const useClientSplitLayout = clientScrollLayout || clientPortalPipelineLayout;
  const splitScrollLayout =
    adminScrollLayout ||
    tlScrollLayout ||
    taScrollLayout ||
    useClientSplitLayout ||
    clientMemberScrollLayout;
  const splitLayoutClass = clientMemberScrollLayout
    ? "pipeline-workspace--client-member"
    : useClientSplitLayout
    ? "pipeline-workspace--client"
    : taScrollLayout
      ? "pipeline-workspace--ta"
      : tlScrollLayout
        ? "pipeline-workspace--tl"
        : "pipeline-workspace--admin";

  if (splitScrollLayout) {
    return (
      <div
        className={`pipeline-workspace ${splitLayoutClass} flex h-full min-h-0 w-full overflow-hidden bg-gray-50`}
      >
        <div className="admin-pipeline-main min-w-0 flex-1 overflow-x-hidden overflow-y-auto admin-scrollbar">
          <div className="flex min-w-0 w-full max-w-full flex-col px-6 pt-4 pb-6">
            <div className="admin-pipeline-board-slot">{children}</div>
            {footer ? (
              <div className="admin-pipeline-closure-section pt-4">{footer}</div>
            ) : null}
          </div>
        </div>
        {sidebar ? (
          <aside className="pipeline-stats-rail shrink-0">{sidebar}</aside>
        ) : null}
      </div>
    );
  }

  if (clientPortalPipelineLayout) {
    return (
      <div className="pipeline-workspace pipeline-workspace--client-portal flex h-full min-h-0 w-full flex-col overflow-hidden bg-gray-50">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-gray-50 px-6 py-4">
          {header}
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="client-portal-pipeline-board-area min-h-0 flex-1 overflow-hidden px-6 pt-4 pb-2">
              {children}
            </div>
            {footer ? (
              <div className="shrink-0 border-t border-gray-200/80 bg-gray-50 px-6 pb-4 pt-3">
                {footer}
              </div>
            ) : null}
          </div>
          {sidebar ? (
            <aside className="pipeline-stats-rail flex h-full w-64 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
              {sidebar}
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  if (isolateBoardScroll) {
    return (
      <div className="pipeline-workspace pipeline-workspace--isolated flex h-full min-h-0 w-full flex-col overflow-hidden bg-gray-50">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-gray-50 px-6 py-4">
          {header}
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="pipeline-board-area isolate-board-scroll min-h-0 flex-1 overflow-hidden px-6 py-4">
              {children}
            </div>
            {footer ? (
              <div className="max-h-[min(32vh,300px)] shrink-0 overflow-y-auto border-t border-gray-200 bg-gray-50 px-6 pb-4 pt-3">
                {footer}
              </div>
            ) : null}
          </div>
          {sidebar ? (
            <aside className="pipeline-stats-rail flex h-full w-64 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
              {sidebar}
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-workspace flex h-full min-h-0 w-full overflow-hidden bg-gray-50">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-gray-50 px-6 py-4">
          {header}
        </div>
        <div className="pipeline-board-area min-h-0 flex-1 overflow-hidden px-6 py-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-gray-200 bg-white">{footer}</div>
        ) : null}
      </div>
      {sidebar ? (
        <div className="flex h-full w-64 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
          {sidebar}
        </div>
      ) : null}
    </div>
  );
}
