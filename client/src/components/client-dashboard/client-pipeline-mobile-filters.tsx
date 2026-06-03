import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import {
  PIPELINE_BUTTON_RADIUS_PX,
  PIPELINE_FILTER_RADIUS_PX,
} from "@/lib/pipeline-ui-tokens";

const filterRadiusStyle = { borderRadius: PIPELINE_FILTER_RADIUS_PX };
const buttonRadiusStyle = { borderRadius: PIPELINE_BUTTON_RADIUS_PX };

export type ClientPipelineFilterRoleOption = {
  id: string;
  label: string;
};

type ClientPipelineMobileFiltersProps = {
  selectedRequirement: string;
  onRequirementChange: (value: string) => void;
  roleOptions: ClientPipelineFilterRoleOption[];
  pipelineDate: Date;
  pipelinePeriod: string;
  onPipelineDateChange: (date: Date) => void;
  onTodayClick: () => void;
  onAllClick: () => void;
};

export function ClientPipelineMobileFilters({
  selectedRequirement,
  onRequirementChange,
  roleOptions,
  pipelineDate,
  pipelinePeriod,
  onPipelineDateChange,
  onTodayClick,
  onAllClick,
}: ClientPipelineMobileFiltersProps) {
  const isTodayActive = pipelinePeriod === "today";
  const isAllDatesActive = pipelinePeriod === "all";

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-4">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_8.75rem] items-center gap-2 md:contents">
        <Select value={selectedRequirement} onValueChange={onRequirementChange}>
          <SelectTrigger
            style={filterRadiusStyle}
            className="h-9 min-w-0 w-full border-gray-200 bg-gray-50 text-sm shadow-none hover:bg-gray-100 md:w-52 md:min-w-[12rem]"
          >
            <SelectValue placeholder="All Requirements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requirements</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <StandardDatePicker
          value={isTodayActive ? pipelineDate : undefined}
          onChange={(date) => {
            if (date) onPipelineDateChange(date);
          }}
          placeholder="dd-mm-yyyy"
          className="h-9 w-full shrink-0 rounded-[6px] border-gray-200 bg-white text-sm md:w-36"
        />
      </div>
      <div className="flex gap-2 md:contents">
        <button
          type="button"
          style={buttonRadiusStyle}
          className={`h-9 flex-1 border px-3 text-sm font-medium transition-colors md:flex-none md:px-4 ${
            isTodayActive
              ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          }`}
          onClick={onTodayClick}
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
          onClick={onAllClick}
        >
          All
        </button>
      </div>
    </div>
  );
}
