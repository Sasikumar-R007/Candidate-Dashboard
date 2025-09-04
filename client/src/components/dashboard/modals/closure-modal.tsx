import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const closureData = [
  { candidate: "David Wilson", position: "Frontend Developer", client: "TechCorp", quarter: "MJJ, 2025", talentAdvisor: "Kavitha", ctc: "15,00,000", revenue: "1,12,455" },
  { candidate: "Tom Anderson", position: "UI/UX Designer", client: "Designify", quarter: "ASO, 2025", talentAdvisor: "Rajesh", ctc: "25,00,000", revenue: "1,87,425" },
  { candidate: "Robert Kim", position: "Backend Developer", client: "CodeLabs", quarter: "MJJ, 2025", talentAdvisor: "Sowmiya", ctc: "18,00,000", revenue: "1,34,948" },
  { candidate: "Kevin Brown", position: "QA Tester", client: "AppLogic", quarter: "FMA, 2025", talentAdvisor: "Kalaiselvi", ctc: "30,00,000", revenue: "2,24,910" },
  { candidate: "Sarah Johnson", position: "DevOps Engineer", client: "CloudTech", quarter: "ASO, 2025", talentAdvisor: "Priya", ctc: "22,00,000", revenue: "1,65,000" },
  { candidate: "Michael Davis", position: "Full Stack Developer", client: "WebSolutions", quarter: "MJJ, 2025", talentAdvisor: "Arjun", ctc: "20,00,000", revenue: "1,50,000" },
  { candidate: "Emily Chen", position: "Data Scientist", client: "DataCorp", quarter: "FMA, 2025", talentAdvisor: "Meera", ctc: "35,00,000", revenue: "2,62,500" },
  { candidate: "James Wilson", position: "Product Manager", client: "InnovateLabs", quarter: "ASO, 2025", talentAdvisor: "Nisha", ctc: "28,00,000", revenue: "2,10,000" },
  { candidate: "Lisa Martinez", position: "Mobile Developer", client: "AppMakers", quarter: "MJJ, 2025", talentAdvisor: "Kavitha", ctc: "19,00,000", revenue: "1,42,500" },
  { candidate: "Alex Thompson", position: "System Administrator", client: "TechServe", quarter: "FMA, 2025", talentAdvisor: "Rajesh", ctc: "16,00,000", revenue: "1,20,000" },
  { candidate: "Jennifer Garcia", position: "Business Analyst", client: "AnalyticsPro", quarter: "ASO, 2025", talentAdvisor: "Sowmiya", ctc: "24,00,000", revenue: "1,80,000" },
  { candidate: "Daniel Rodriguez", position: "Security Engineer", client: "SecureNet", quarter: "MJJ, 2025", talentAdvisor: "Kalaiselvi", ctc: "32,00,000", revenue: "2,40,000" }
];

export default function ClosureModal({ isOpen, onClose }: ClosureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            List of Closures - Detailed View
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
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Candidate</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Position</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Client</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Quarter</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Talent Advisor</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">CTC</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {closureData.map((closure, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium">{closure.candidate}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.position}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.client}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.quarter}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.talentAdvisor}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.ctc}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{closure.revenue}</td>
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