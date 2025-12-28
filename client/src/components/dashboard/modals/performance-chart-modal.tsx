import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface PerformanceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PerformanceDataItem {
  period: string;
  resumesA: number;
  resumesB: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface DefaultRateData {
  memberName: string;
  stats: Record<string, { total: number; completed: number }>;
}

export default function PerformanceChartModal({ isOpen, onClose }: PerformanceChartModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [period, setPeriod] = useState<string>("monthly");
  const [selectedDefaultRateMember, setSelectedDefaultRateMember] = useState<string>("");
  const [defaultRateDateFrom, setDefaultRateDateFrom] = useState<Date | undefined>(undefined);
  const [defaultRateDateTo, setDefaultRateDateTo] = useState<Date | undefined>(undefined);

  // Fetch team members list for dropdown
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['/api/admin/team-members-list'],
  });

  // Fetch monthly performance data for team names
  const { data: monthlyPerformanceData } = useQuery<{
    data: Array<Record<string, any>>;
    teams: string[];
    members: Array<{ key: string; name: string; teamLeader: string }>;
  }>({
    queryKey: ['/api/admin/monthly-performance'],
  });

  // Fetch performance graph data from backend
  const { data: performanceData = [], isLoading: isLoadingPerformance } = useQuery<PerformanceDataItem[]>({
    queryKey: ['/api/admin/performance-graph', selectedTeam, dateFrom?.toISOString(), dateTo?.toISOString(), period],
  });

  // Fetch default rate data for selected member
  const { data: defaultRateData, isLoading: isLoadingDefaultRate } = useQuery<DefaultRateData>({
    queryKey: ['/api/admin/default-rate', selectedDefaultRateMember, defaultRateDateFrom?.toISOString(), defaultRateDateTo?.toISOString()],
    enabled: !!selectedDefaultRateMember,
  });

  // Set default member when team members load (using useEffect to avoid state update during render)
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedDefaultRateMember) {
      setSelectedDefaultRateMember(teamMembers[0].name);
    }
  }, [teamMembers, selectedDefaultRateMember]);

  const filteredPerformanceData = performanceData;

  const maxResume = filteredPerformanceData.length > 0 
    ? Math.max(...filteredPerformanceData.map(d => Math.max(d.resumesA, d.resumesB)))
    : 0;
  const roundedMax = Math.ceil(maxResume / 2) * 2 + 2;
  const ticks = Array.from({ length: Math.ceil(roundedMax / 2) + 1 }, (_, i) => i * 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Graph
          </DialogTitle>
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
                {monthlyPerformanceData?.teams?.map((team) => (
                  <SelectItem key={team} value={team.toLowerCase()}>
                    {team}
                  </SelectItem>
                ))}
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
                <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
              </div>
            </div>
            <div className="h-[400px]">
              {isLoadingPerformance ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">Loading performance data...</p>
                </div>
              ) : filteredPerformanceData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
                </div>
              ) : (
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
                      dataKey="period"
                      stroke="#6b7280" 
                      style={{ fontSize: '11px' }}
                      tick={{ fill: '#6b7280' }}
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
                      name="Delivered"
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
                      name="Required"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Default Rate (Individually) Section */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Rate (Individually)</h3>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={selectedDefaultRateMember} onValueChange={setSelectedDefaultRateMember}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-default-rate-member">
                <SelectValue placeholder="Select Member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                ))}
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
            {isLoadingDefaultRate ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading default rate data...</p>
              </div>
            ) : !defaultRateData || !defaultRateData.stats || Object.keys(defaultRateData.stats).length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No data available for selected member</p>
              </div>
            ) : (
              (() => {
                const chartData = Object.entries(defaultRateData.stats).map(([criticality, stats]) => ({
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
              })()
            )}
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
