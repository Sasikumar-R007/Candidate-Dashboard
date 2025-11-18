import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <DialogHeader className="p-4 border-b dark:border-gray-700">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            List of Closures - Detailed View
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 max-h-96 overflow-y-auto">
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
                {closureData.map((closure, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-xs text-gray-900 dark:text-white font-medium">{closure.candidate}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.position}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.client}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.quarter}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.talentAdvisor}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.ctc}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">{closure.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t dark:border-gray-700">
          <Button 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}