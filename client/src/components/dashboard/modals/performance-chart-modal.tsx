import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface PerformanceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const performanceChartData = [
  { memberIndex: 1, member: "David Wilson", resumesA: 6, resumesB: 8 },
  { memberIndex: 2, member: "Tom Anderson", resumesA: 8, resumesB: 10 },
  { memberIndex: 3, member: "Robert Kim", resumesA: 10, resumesB: 9 },
  { memberIndex: 4, member: "Kevin Brown", resumesA: 7, resumesB: 12 },
  { memberIndex: 5, member: "Sarah Johnson", resumesA: 5, resumesB: 7 },
  { memberIndex: 6, member: "Michael Davis", resumesA: 11, resumesB: 10 },
  { memberIndex: 7, member: "Emily Chen", resumesA: 4, resumesB: 6 },
  { memberIndex: 8, member: "James Wilson", resumesA: 9, resumesB: 11 },
  { memberIndex: 9, member: "Lisa Martinez", resumesA: 3, resumesB: 5 },
  { memberIndex: 10, member: "Alex Thompson", resumesA: 10, resumesB: 8 }
];

export default function PerformanceChartModal({ isOpen, onClose }: PerformanceChartModalProps) {
  const maxResume = Math.max(...performanceChartData.map(d => Math.max(d.resumesA, d.resumesB)));
  const roundedMax = Math.ceil(maxResume / 2) * 2 + 2;
  const ticks = Array.from({ length: Math.ceil(roundedMax / 2) + 1 }, (_, i) => i * 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-gray-700">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Graph
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            data-testid="button-close-performance-chart-modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4" data-testid="chart-performance">
            <div className="flex justify-start space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Resume Count A</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Resume Count B</span>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="member"
                    stroke="#6b7280" 
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value, index) => {
                      if (performanceChartData[index]?.memberIndex !== undefined) {
                        return `${performanceChartData[index].memberIndex}. ${value}`;
                      }
                      return value;
                    }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#6b7280' }}
                    ticks={ticks}
                    domain={[0, roundedMax]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="resumesA" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Resume Count A"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resumesB" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Resume Count B"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t dark:border-gray-700">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
