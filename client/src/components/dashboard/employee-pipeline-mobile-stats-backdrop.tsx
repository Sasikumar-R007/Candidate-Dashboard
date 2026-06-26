type EmployeePipelineMobileStatsBackdropProps = {
  onClose: () => void;
};

/** Dimmed tap area left of the mobile stats drawer; visibility tied to `.employee-pipeline-stats-open` on the root. */
export function EmployeePipelineMobileStatsBackdrop({
  onClose,
}: EmployeePipelineMobileStatsBackdropProps) {
  return (
    <button
      type="button"
      className="employee-pipeline-stats-backdrop fixed bottom-[4.25rem] left-0 top-[3.25rem] z-[90] md:hidden"
      style={{ width: "calc(100% - 13.75rem)" }}
      onClick={onClose}
      aria-label="Close pipeline stats"
    />
  );
}
