import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TeamPerformanceModalProps {
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

export default function TeamPerformanceModal({ isOpen, onClose }: TeamPerformanceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Team Performance - Detailed View
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Talent Advisor</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Joining Date</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Tenure</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Closures</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Last Closure</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Qtrs Achieved</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformanceData.map((member, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium">{member.talentAdvisor}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{member.joiningDate}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{member.tenure}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{member.closures}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{member.lastClosure}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{member.qtrsAchieved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}