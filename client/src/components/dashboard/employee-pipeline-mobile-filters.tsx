import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import {
  PIPELINE_BUTTON_RADIUS_PX,
} from "@/lib/pipeline-ui-tokens";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

const buttonRadiusStyle = { borderRadius: PIPELINE_BUTTON_RADIUS_PX };

type EmployeePipelineMobileFiltersProps = {
  /** First-row control (e.g. recruiter / TL-TA select). Omit for date-only filters (TA). */
  primaryFilter?: ReactNode;
  pipelineDate: Date | null;
  onPipelineDateChange: (date: Date | null) => void;
  isTodayActive: boolean;
  isAllDatesActive: boolean;
};

/** Mobile filter grid matching client portal pipeline (dropdown + date, then Today / All). */
export function EmployeePipelineMobileFilters({
  primaryFilter,
  pipelineDate,
  onPipelineDateChange,
  isTodayActive,
  isAllDatesActive,
}: EmployeePipelineMobileFiltersProps) {
  const datePicker = (
    <div className="relative min-w-0" data-testid="button-pipeline-date-picker">
      <StandardDatePicker
        value={pipelineDate || undefined}
        onChange={(date) => onPipelineDateChange(date || null)}
        placeholder="dd-mm-yyyy"
        className={cn(
          "h-9 w-full shrink-0 rounded-[6px] border-gray-200 bg-white text-sm md:w-36",
          isAllDatesActive &&
            "text-transparent [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-datetime-edit]:text-transparent",
        )}
      />
      {isAllDatesActive ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center gap-1.5 text-sm font-medium text-gray-500"
          aria-hidden
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          Any date
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-4">
      {primaryFilter ? (
        <div className="grid w-full grid-cols-[minmax(0,1fr)_8.75rem] items-center gap-2 md:contents">
          {primaryFilter}
          {datePicker}
        </div>
      ) : (
        <div className="w-full md:contents">{datePicker}</div>
      )}
      <div className="flex gap-2 md:contents">
        <button
          type="button"
          style={buttonRadiusStyle}
          className={`h-9 flex-1 border px-3 text-sm font-medium transition-colors md:flex-none md:px-4 ${
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
          className={`h-9 flex-1 border px-3 text-sm font-medium transition-colors md:flex-none md:px-4 ${
            isAllDatesActive
              ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          }`}
          onClick={() => onPipelineDateChange(null)}
        >
          All
        </button>
      </div>
    </div>
  );
}
