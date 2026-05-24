import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_MODAL_SEARCH_INPUT_CLASS } from "@/lib/revenue-mapping-utils";

interface TeamPerformanceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
}

interface TeamPerformanceData {
  id: string;
  talentAdvisor: string;
  joiningDate: string;
  tenure: string;
  closures: number;
  lastClosure: string;
  qtrsAchieved: number;
}

export default function TeamPerformanceTableModal({ isOpen, onClose, teamId = "all" }: TeamPerformanceTableModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: teamPerformanceData = [], isLoading } = useQuery<TeamPerformanceData[]>({
    queryKey: ["/api/admin/team-performance", teamId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teamId && teamId !== "all") {
        params.append("teamId", teamId);
      }
      const url = `/api/admin/team-performance${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: isOpen,
  });

  const filteredData = useMemo(() => {
    if (!searchTerm) return teamPerformanceData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return teamPerformanceData.filter((member) => {
      const talentAdvisor = String(member.talentAdvisor ?? "").toLowerCase();
      const joiningDate = String(member.joiningDate ?? "").toLowerCase();
      const tenure = String(member.tenure ?? "").toLowerCase();
      const closures = String(member.closures ?? "").toLowerCase();
      const lastClosure = String(member.lastClosure ?? "").toLowerCase();
      const qtrsAchieved = String(member.qtrsAchieved ?? "").toLowerCase();

      return (
        talentAdvisor.includes(lowerSearchTerm) ||
        joiningDate.includes(lowerSearchTerm) ||
        tenure.includes(lowerSearchTerm) ||
        closures.includes(lowerSearchTerm) ||
        lastClosure.includes(lowerSearchTerm) ||
        qtrsAchieved.includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, teamPerformanceData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
        <DialogHeader className="p-4 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Performance - Table View
            </DialogTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={ADMIN_MODAL_SEARCH_INPUT_CLASS}
                data-testid="input-search-team-performance"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="overflow-x-auto" data-testid="table-team-performance">
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Talent Advisor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Joining Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Tenure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Closures
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Last Closure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Qtrs Achieved
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading team performance data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((member, index) => (
                    <tr key={member.id || index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {member.talentAdvisor}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {member.joiningDate}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {member.tenure}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {member.closures}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {member.lastClosure}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {member.qtrsAchieved}
                      </td>
                    </tr>
                  ))
                ) : teamPerformanceData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No team performance data available
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No results found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
