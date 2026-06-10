import { useEffect, useState, type ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getEmployeeHoldTooltipContent } from "@/lib/employee-hold-display";

type UserHoldRowTooltipProps = {
  employee: {
    accountStatus?: string | null;
    holdUntil?: string | null;
  };
  children: ReactElement;
};

export function UserHoldRowTooltip({ employee, children }: UserHoldRowTooltipProps) {
  const isOnHold = (employee.accountStatus || "active") === "hold";
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isOnHold || !employee.holdUntil) return;
    const interval = setInterval(() => setTick((value) => value + 1), 15_000);
    return () => clearInterval(interval);
  }, [isOnHold, employee.holdUntil]);

  if (!isOnHold) {
    return children;
  }

  const { resumeLabel, scheduledAt } = getEmployeeHoldTooltipContent(employee);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[280px] border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
      >
        <p className="text-sm font-semibold">{resumeLabel}</p>
        {scheduledAt ? (
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">{scheduledAt}</p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
