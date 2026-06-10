export type EmployeeHoldTooltipContent = {
  resumeLabel: string;
  scheduledAt?: string;
};

export function formatHoldUntilDateLabel(holdUntil: string): string {
  return new Date(holdUntil).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatHoldRemainingLabel(
  holdUntil: string | null | undefined,
  now = Date.now(),
): string {
  if (!holdUntil) {
    return "Until resumed by Admin";
  }

  const untilMs = new Date(holdUntil).getTime();
  if (Number.isNaN(untilMs)) {
    return "Until resumed by Admin";
  }

  const diffMs = untilMs - now;
  if (diffMs <= 0) {
    return "Hold period ended — access resumes automatically";
  }

  const totalMinutes = Math.ceil(diffMs / 60_000);
  if (totalMinutes < 60) {
    return `Resumes in ${totalMinutes} min${totalMinutes === 1 ? "" : "s"}`;
  }

  const totalHours = Math.floor(diffMs / 3_600_000);
  const remainderMinutes = Math.ceil((diffMs % 3_600_000) / 60_000);
  if (totalHours < 24) {
    if (remainderMinutes > 0 && totalHours < 6) {
      return `Resumes in ${totalHours} hr${totalHours === 1 ? "" : "s"} ${remainderMinutes} min`;
    }
    return `Resumes in ${totalHours} hr${totalHours === 1 ? "" : "s"}`;
  }

  const totalDays = Math.ceil(diffMs / 86_400_000);
  if (totalDays <= 14) {
    return `Resumes in ${totalDays} day${totalDays === 1 ? "" : "s"}`;
  }

  return `Resumes on ${formatHoldUntilDateLabel(holdUntil)}`;
}

export function getEmployeeHoldTooltipContent(employee: {
  holdUntil?: string | null;
}): EmployeeHoldTooltipContent {
  const resumeLabel = formatHoldRemainingLabel(employee.holdUntil);
  const scheduledAt =
    employee.holdUntil && resumeLabel.startsWith("Resumes in")
      ? formatHoldUntilDateLabel(employee.holdUntil)
      : undefined;

  return { resumeLabel, scheduledAt };
}
