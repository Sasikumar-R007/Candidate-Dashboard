import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface TeamPerformanceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const teamPerformanceData = [
  { talentAdvisor: "David Wilson", joiningDate: "23-04-2023", tenure: "2 yrs,3 months", closures: 4, lastClosure: "23-04-2023", qtrsAchieved: 3 },
  { talentAdvisor: "Tom Anderson", joiningDate: "28-04-2023", tenure: "2 yrs,3 months", closures: 8, lastClosure: "29-04-2023", qtrsAchieved: 6 },
  { talentAdvisor: "Robert Kim", joiningDate: "04-05-2023", tenure: "2 yrs,2 months", closures: 9, lastClosure: "02-05-2023", qtrsAchieved: 11 },
  { talentAdvisor: "Kevin Brown", joiningDate: "12-05-2023", tenure: "2 yrs,2 months", closures: 13, lastClosure: "18-05-2023", qtrsAchieved: 5 },
  { talentAdvisor: "Sarah Johnson", joiningDate: "15-06-2023", tenure: "2 yrs,1 month", closures: 7, lastClosure: "10-07-2023", qtrsAchieved: 4 },
  { talentAdvisor: "Michael Davis", joiningDate: "20-06-2023", tenure: "2 yrs,1 month", closures: 12, lastClosure: "15-08-2023", qtrsAchieved: 8 },
  { talentAdvisor: "Emily Chen", joiningDate: "05-07-2023", tenure: "2 yrs", closures: 6, lastClosure: "22-08-2023", qtrsAchieved: 3 },
  { talentAdvisor: "James Wilson", joiningDate: "10-08-2023", tenure: "1 yr,11 months", closures: 10, lastClosure: "30-08-2023", qtrsAchieved: 7 },
  { talentAdvisor: "Lisa Martinez", joiningDate: "25-08-2023", tenure: "1 yr,10 months", closures: 5, lastClosure: "12-09-2023", qtrsAchieved: 2 },
  { talentAdvisor: "Alex Thompson", joiningDate: "15-09-2023", tenure: "1 yr,9 months", closures: 11, lastClosure: "28-09-2023", qtrsAchieved: 9 }
];

export default function TeamPerformanceTableModal({ isOpen, onClose }: TeamPerformanceTableModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return teamPerformanceData;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return teamPerformanceData.filter(member => {
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
  }, [searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
        <DialogHeader className="p-4 border-b dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Performance - Table View
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by talent advisor, date, tenure, closures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-team-performance"
              />
            </div>
          </div>
          <div className="overflow-x-auto" data-testid="table-team-performance">
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tenure</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Closures</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Last Closure</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Qtrs Achieved</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((member, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{member.talentAdvisor}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.joiningDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.tenure}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.closures}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.lastClosure}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.qtrsAchieved}</td>
                    </tr>
                  ))
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