import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, CalendarIcon } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { useState } from "react";
import { format } from "date-fns";

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
  { memberIndex: 6, member: "Michael Davis", resumesA: 11, resumesB: 10 }
];

const memberCompletionStatsByPeriod: Record<string, Record<string, Record<string, { total: number, completed: number }>>> = {
  "Sudharshan": {
    "2024-11": {
      "HT": { total: 10, completed: 8 },
      "HM": { total: 8, completed: 6 },
      "MM": { total: 12, completed: 10 },
      "ME": { total: 6, completed: 5 }
    },
    "2024-10": {
      "HT": { total: 8, completed: 6 },
      "HM": { total: 7, completed: 5 },
      "MM": { total: 10, completed: 8 },
      "ME": { total: 5, completed: 4 }
    },
    "2024-09": {
      "HT": { total: 9, completed: 7 },
      "HM": { total: 6, completed: 4 },
      "MM": { total: 11, completed: 9 },
      "ME": { total: 7, completed: 6 }
    }
  },
  "Deepika": {
    "2024-11": {
      "HT": { total: 8, completed: 7 },
      "HM": { total: 10, completed: 8 },
      "MM": { total: 9, completed: 7 },
      "ME": { total: 7, completed: 6 }
    },
    "2024-10": {
      "HT": { total: 7, completed: 6 },
      "HM": { total: 8, completed: 6 },
      "MM": { total: 8, completed: 6 },
      "ME": { total: 6, completed: 5 }
    },
    "2024-09": {
      "HT": { total: 6, completed: 5 },
      "HM": { total: 9, completed: 7 },
      "MM": { total: 7, completed: 5 },
      "ME": { total: 5, completed: 4 }
    }
  },
  "Dharshan": {
    "2024-11": {
      "HT": { total: 6, completed: 4 },
      "HM": { total: 9, completed: 7 },
      "MM": { total: 11, completed: 9 },
      "ME": { total: 8, completed: 7 }
    },
    "2024-10": {
      "HT": { total: 5, completed: 3 },
      "HM": { total: 7, completed: 5 },
      "MM": { total: 9, completed: 7 },
      "ME": { total: 6, completed: 5 }
    },
    "2024-09": {
      "HT": { total: 7, completed: 5 },
      "HM": { total: 8, completed: 6 },
      "MM": { total: 10, completed: 8 },
      "ME": { total: 7, completed: 6 }
    }
  },
  "Kavya": {
    "2024-11": {
      "HT": { total: 7, completed: 6 },
      "HM": { total: 11, completed: 9 },
      "MM": { total: 10, completed: 8 },
      "ME": { total: 5, completed: 4 }
    },
    "2024-10": {
      "HT": { total: 6, completed: 5 },
      "HM": { total: 9, completed: 7 },
      "MM": { total: 8, completed: 6 },
      "ME": { total: 4, completed: 3 }
    },
    "2024-09": {
      "HT": { total: 5, completed: 4 },
      "HM": { total: 10, completed: 8 },
      "MM": { total: 9, completed: 7 },
      "ME": { total: 6, completed: 5 }
    }
  },
  "Thamarai Selvi": {
    "2024-11": {
      "HT": { total: 12, completed: 10 },
      "HM": { total: 9, completed: 8 },
      "MM": { total: 8, completed: 7 },
      "ME": { total: 6, completed: 6 }
    },
    "2024-10": {
      "HT": { total: 10, completed: 8 },
      "HM": { total: 8, completed: 7 },
      "MM": { total: 7, completed: 6 },
      "ME": { total: 5, completed: 5 }
    },
    "2024-09": {
      "HT": { total: 11, completed: 9 },
      "HM": { total: 7, completed: 6 },
      "MM": { total: 9, completed: 8 },
      "ME": { total: 7, completed: 7 }
    }
  },
  "Karthikayan": {
    "2024-11": {
      "HT": { total: 5, completed: 3 },
      "HM": { total: 7, completed: 5 },
      "MM": { total: 10, completed: 8 },
      "ME": { total: 9, completed: 8 }
    },
    "2024-10": {
      "HT": { total: 4, completed: 2 },
      "HM": { total: 6, completed: 4 },
      "MM": { total: 8, completed: 6 },
      "ME": { total: 7, completed: 6 }
    },
    "2024-09": {
      "HT": { total: 6, completed: 4 },
      "HM": { total: 5, completed: 3 },
      "MM": { total: 9, completed: 7 },
      "ME": { total: 8, completed: 7 }
    }
  }
};

export default function PerformanceChartModal({ isOpen, onClose }: PerformanceChartModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [period, setPeriod] = useState<string>("monthly");
  const [selectedDefaultRateMember, setSelectedDefaultRateMember] = useState<string>("Sudharshan");
  const [defaultRateDateFrom, setDefaultRateDateFrom] = useState<Date | undefined>(undefined);
  const [defaultRateDateTo, setDefaultRateDateTo] = useState<Date | undefined>(undefined);

  // Filter performance data based on selected filters
  const filteredPerformanceData = performanceChartData.filter((item) => {
    // Team filter logic (currently showing all as we don't have team assignment in mock data)
    // In production, this would filter based on team assignment
    return true;
  });

  const maxResume = Math.max(...filteredPerformanceData.map(d => Math.max(d.resumesA, d.resumesB)));
  const roundedMax = Math.ceil(maxResume / 2) * 2 + 2;
  const ticks = Array.from({ length: Math.ceil(roundedMax / 2) + 1 }, (_, i) => i * 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
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
        
        <div className="p-6 overflow-y-auto flex-1">
          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-team">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="arun">Arun (TL)</SelectItem>
                <SelectItem value="anusha">Anusha (TL)</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-48 justify-start text-left font-normal ${!dateFrom && "text-gray-500 dark:text-gray-400"}`}
                  data-testid="button-date-from"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : <span>From Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-48 justify-start text-left font-normal ${!dateTo && "text-gray-500 dark:text-gray-400"}`}
                  data-testid="button-date-to"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : <span>To Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4" data-testid="chart-performance">
            <div className="flex justify-start space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Resume Count A</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Resume Count B</span>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredPerformanceData}>
                  <defs>
                    <linearGradient id="colorResumesAModal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorResumesBModal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis 
                    dataKey="member"
                    stroke="#6b7280" 
                    style={{ fontSize: '11px' }}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value, index) => {
                      if (filteredPerformanceData[index]?.memberIndex !== undefined) {
                        return `${filteredPerformanceData[index].memberIndex}. ${value}`;
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
                  <Area 
                    type="monotone" 
                    dataKey="resumesA" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    fill="url(#colorResumesAModal)"
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Resume Count A"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resumesB" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    fill="url(#colorResumesBModal)"
                    fillOpacity={0.6}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Resume Count B"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Default Rate (Individually) Section */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Rate (Individually)</h3>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={selectedDefaultRateMember} onValueChange={setSelectedDefaultRateMember}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-default-rate-member">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sudharshan">Sudharshan</SelectItem>
                <SelectItem value="Deepika">Deepika</SelectItem>
                <SelectItem value="Dharshan">Dharshan</SelectItem>
                <SelectItem value="Kavya">Kavya</SelectItem>
                <SelectItem value="Thamarai Selvi">Thamarai Selvi</SelectItem>
                <SelectItem value="Karthikayan">Karthikayan</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-48 justify-start text-left font-normal ${!defaultRateDateFrom && "text-gray-500 dark:text-gray-400"}`}
                  data-testid="button-default-rate-date-from"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {defaultRateDateFrom ? format(defaultRateDateFrom, "PPP") : <span>From Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={defaultRateDateFrom}
                  onSelect={setDefaultRateDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-48 justify-start text-left font-normal ${!defaultRateDateTo && "text-gray-500 dark:text-gray-400"}`}
                  data-testid="button-default-rate-date-to"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {defaultRateDateTo ? format(defaultRateDateTo, "PPP") : <span>To Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={defaultRateDateTo}
                  onSelect={setDefaultRateDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Stacked Bar Chart */}
          <div className="h-[300px] bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            {(() => {
              const memberData = memberCompletionStatsByPeriod[selectedDefaultRateMember];
              
              if (!memberData) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No data available for selected member</p>
                  </div>
                );
              }
              
              const selectedPeriod = defaultRateDateFrom 
                ? `${defaultRateDateFrom.getFullYear()}-${String(defaultRateDateFrom.getMonth() + 1).padStart(2, '0')}`
                : "2024-11";
              
              const periodStats = memberData[selectedPeriod];
              
              if (!periodStats) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      No data for {format(defaultRateDateFrom || new Date(), "MMMM yyyy")}
                    </p>
                  </div>
                );
              }
              
              const chartData = Object.entries(periodStats).map(([criticality, stats]) => ({
                criticality,
                completed: stats.completed,
                incomplete: stats.total - stats.completed,
                total: stats.total
              }));
              
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="criticality" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6b7280' }}
                      label={{ value: 'Number of Requirements', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                              <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.criticality}</p>
                              <p className="text-sm text-green-600 dark:text-green-400">Completed: {data.completed}</p>
                              <p className="text-sm text-red-600 dark:text-red-400">Incomplete: {data.incomplete}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total: {data.total}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => {
                        if (value === 'completed') return 'Completed';
                        if (value === 'incomplete') return 'Incomplete';
                        return value;
                      }}
                    />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" name="completed" barSize={28} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="incomplete" stackId="a" fill="#ef4444" name="incomplete" barSize={28} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t dark:border-gray-700 flex-shrink-0">
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
