import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClosureData {
  id: string;
  candidate: string;
  position: string;
  client: string;
  quarter: string;
  talentAdvisor: string;
  ctc: string;
  revenue: string;
}

export default function ClosureModal({ isOpen, onClose }: ClosureModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: closureData = [], isLoading } = useQuery<ClosureData[]>({
    queryKey: ['/api/admin/closures-list'],
  });

  const filteredData = useMemo(() => {
    if (!searchTerm) return closureData;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return closureData.filter(closure => {
      const candidate = String(closure.candidate ?? "").toLowerCase();
      const position = String(closure.position ?? "").toLowerCase();
      const client = String(closure.client ?? "").toLowerCase();
      const quarter = String(closure.quarter ?? "").toLowerCase();
      const talentAdvisor = String(closure.talentAdvisor ?? "").toLowerCase();
      const ctc = String(closure.ctc ?? "").toLowerCase();
      const revenue = String(closure.revenue ?? "").toLowerCase();
      
      return (
        candidate.includes(lowerSearchTerm) ||
        position.includes(lowerSearchTerm) ||
        client.includes(lowerSearchTerm) ||
        quarter.includes(lowerSearchTerm) ||
        talentAdvisor.includes(lowerSearchTerm) ||
        ctc.includes(lowerSearchTerm) ||
        revenue.includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, closureData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
        <DialogHeader className="p-4 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              List of Closures - Detailed View
            </DialogTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
                data-testid="input-search-closures"
              />
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Candidate</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Position</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Client</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">CTC</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading closures data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((closure, index) => (
                    <tr key={closure.id || index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 text-xs text-gray-900 dark:text-white font-medium">{closure.candidate}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.position}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.client}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.quarter}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.talentAdvisor}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.ctc}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.revenue}</td>
                    </tr>
                  ))
                ) : closureData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No closures data available
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
