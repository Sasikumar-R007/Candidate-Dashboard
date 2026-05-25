import type { ReactNode } from "react";

interface RequirementRoleCellProps {
  title: string;
  noOfPositions?: number | null;
  badges?: ReactNode;
  titleClassName?: string;
}

export function RequirementRoleCell({
  title,
  noOfPositions,
  badges,
  titleClassName = "text-sm font-semibold text-gray-900 dark:text-gray-100",
}: RequirementRoleCellProps) {
  const count = Math.max(1, Number(noOfPositions) || 1);
  const positionLabel = count === 1 ? "position" : "positions";

  return (
    <div>
      <div className={`flex items-center gap-2 ${badges ? "flex-wrap" : ""}`}>
        <span className={titleClassName}>{title}</span>
        {badges}
      </div>
      <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">
        {count} {positionLabel}
      </p>
    </div>
  );
}
