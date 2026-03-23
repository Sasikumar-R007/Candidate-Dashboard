import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchBar } from "@/components/ui/search-bar";

type QuarterMemberContribution = {
  teamMemberId: string;
  teamMemberName: string;
  employeeId: string;
  minimumTarget: number;
  targetAchieved: number;
  defaultAmount: number;
  incentiveEarned: number;
  closures: number;
  status: string;
};

type QuarterTargetData = {
  quarter: string;
  year: number;
  minimumTarget: number;
  targetAchieved: number;
  defaultAmount: number;
  incentiveEarned: number;
  closures: number;
  status: string;
  members: QuarterMemberContribution[];
};

interface AllQuartersTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allQuarters?: QuarterTargetData[];
  formatIndianCurrency: (value: number) => string;
}

const statusClasses: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  "Not Completed": "bg-rose-100 text-rose-700",
};

export default function AllQuartersTargetDialog({
  open,
  onOpenChange,
  allQuarters = [],
  formatIndianCurrency,
}: AllQuartersTargetDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuarterKey, setExpandedQuarterKey] = useState<string | null>(null);

  const filteredQuarters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return allQuarters;

    return allQuarters.filter((quarter) => {
      const quarterLabel = `${quarter.quarter}-${quarter.year}`.toLowerCase();
      const summaryFields = [
        quarterLabel,
        formatIndianCurrency(quarter.minimumTarget).toLowerCase(),
        formatIndianCurrency(quarter.targetAchieved).toLowerCase(),
        formatIndianCurrency(quarter.defaultAmount).toLowerCase(),
        formatIndianCurrency(quarter.incentiveEarned).toLowerCase(),
        quarter.status.toLowerCase(),
      ];

      const memberMatches = quarter.members.some((member) =>
        [
          member.teamMemberName,
          member.employeeId,
          formatIndianCurrency(member.minimumTarget),
          formatIndianCurrency(member.targetAchieved),
          formatIndianCurrency(member.defaultAmount),
          formatIndianCurrency(member.incentiveEarned),
          member.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );

      return summaryFields.some((field) => field.includes(normalizedQuery)) || memberMatches;
    });
  }, [allQuarters, formatIndianCurrency, searchQuery]);

  const toggleQuarter = (quarterKey: string) => {
    setExpandedQuarterKey((currentKey) => (currentKey === quarterKey ? null : quarterKey));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-0 bg-[#eef2f8] p-0 sm:rounded-[28px] overflow-hidden">
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                All Quarters Target Data
              </DialogTitle>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Target"
                testId="input-search-targets"
                className="w-full sm:w-auto"
              />
            </div>
          </DialogHeader>

          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <div className="hidden md:grid grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1.2fr_1fr_44px] gap-4 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-gray-900">
              <div>Quarter</div>
              <div>Minimum Target</div>
              <div>Target Achieved</div>
              <div>Default</div>
              <div>Incentives Earned</div>
              <div>Status</div>
              <div />
            </div>

            <div className="mt-3 space-y-3">
              {filteredQuarters.length > 0 ? (
                filteredQuarters.map((quarter) => {
                  const quarterKey = `${quarter.quarter}-${quarter.year}`;
                  const isExpanded = expandedQuarterKey === quarterKey;
                  const statusClass = statusClasses[quarter.status] || statusClasses["Not Completed"];
                  const members = quarter.members ?? [];

                  return (
                    <div
                      key={quarterKey}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuarter(quarterKey)}
                        className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 md:grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1.2fr_1fr_44px] md:items-center md:gap-4 md:px-5"
                        data-testid={`button-quarter-${quarterKey}`}
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Quarter</p>
                          <p className="font-semibold text-gray-900">{quarterKey}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Minimum Target</p>
                          <p className="font-semibold text-gray-900">
                            {formatIndianCurrency(quarter.minimumTarget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Target Achieved</p>
                          <p className="font-semibold text-gray-900">
                            {formatIndianCurrency(quarter.targetAchieved)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Default</p>
                          <p className="font-semibold text-gray-900">
                            {formatIndianCurrency(quarter.defaultAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Incentives Earned</p>
                          <p className="font-semibold text-gray-900">
                            {formatIndianCurrency(quarter.incentiveEarned)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 md:hidden">Status</p>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}
                          >
                            {quarter.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-end text-gray-500">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>

                      <div
                        className={`grid transition-all duration-200 ease-out ${
                          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-gray-100 bg-[#fafbff] px-4 py-3 md:px-5">
                            {members.length > 0 ? (
                              <div className="space-y-2">
                                {members.map((member) => {
                                  const memberStatusClass =
                                    statusClasses[member.status] || statusClasses["Not Completed"];

                                  return (
                                    <div
                                      key={`${quarterKey}-${member.teamMemberId}`}
                                      className="grid grid-cols-1 gap-3 rounded-xl bg-white px-4 py-3 text-sm md:grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1.2fr_1fr_44px] md:items-center md:gap-4"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-500">
                                          {member.teamMemberName} ({member.employeeId})
                                        </p>
                                      </div>
                                      <div className="text-gray-500">
                                        {formatIndianCurrency(member.minimumTarget)}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-green-600">
                                          {formatIndianCurrency(member.targetAchieved)}
                                        </span>
                                        <span className="text-gray-400">
                                          /{formatIndianCurrency(member.minimumTarget)}
                                        </span>
                                      </div>
                                      <div className="text-gray-500">
                                        {formatIndianCurrency(member.defaultAmount)}
                                      </div>
                                      <div className="text-gray-500">
                                        {formatIndianCurrency(member.incentiveEarned)}
                                      </div>
                                      <div>
                                        <span
                                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${memberStatusClass}`}
                                        >
                                          {member.status}
                                        </span>
                                      </div>
                                      <div />
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-xl bg-white px-4 py-4 text-sm text-gray-500">
                                No team member contributions recorded for this quarter.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-gray-500">
                  {searchQuery ? "No matching target records found." : "No quarter target data available yet."}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
