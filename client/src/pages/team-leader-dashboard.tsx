import { useState } from 'react';
import TeamLeaderMainSidebar from '@/components/dashboard/team-leader-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamLeaderTeamBoxes from '@/components/dashboard/team-leader-team-boxes';
import TeamLeaderSidebar from '@/components/dashboard/team-leader-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, EditIcon, MoreVertical, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function TeamLeaderDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('team');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isClosureDetailsModalOpen, setIsClosureDetailsModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Define color mapping for consistent candidate colors
  const candidateColors = {
    'Keerthana': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Vishnu Purana': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Chanakya': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Adhya': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Vanshika': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Reyansh': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Saurang': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Vihana': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  };

  // Use API data
  const { data: teamLeaderProfile } = useQuery({
    queryKey: ['/api/team-leader/profile'],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/team-leader/team-members'],
  });

  const { data: targetMetrics } = useQuery({
    queryKey: ['/api/team-leader/target-metrics'],
  });

  const { data: dailyMetrics } = useQuery({
    queryKey: ['/api/team-leader/daily-metrics'],
  });

  const { data: meetings } = useQuery({
    queryKey: ['/api/team-leader/meetings'],
  });

  const { data: ceoComments } = useQuery({
    queryKey: ['/api/team-leader/ceo-comments'],
  });

  if (!teamLeaderProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return renderTeamContent();
      case 'requirements':
        return renderRequirementsContent();
      case 'pipeline':
        return renderPipelineContent();
      case 'performance':
        return renderPerformanceContent();
      default:
        return renderTeamContent();
    }
  };

  const renderTeamContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="John Mathew" companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto h-full">
              <TeamLeaderTeamBoxes />

              {/* Target Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Target</CardTitle>
                  <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="text-sm px-4 py-2 border-gray-300 hover:bg-gray-50"
                      >
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">All Quarters Target Data</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Quarter</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Minimum Target</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Target Achieved</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Incentive Earned</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 px-4 py-3">ASO-2025</td>
                                <td className="border border-gray-300 px-4 py-3">15,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">10,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">50,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">In Progress</span>
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">JSO-2024</td>
                                <td className="border border-gray-300 px-4 py-3">12,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">14,50,000</td>
                                <td className="border border-gray-300 px-4 py-3">85,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completed</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 px-4 py-3">AMJ-2024</td>
                                <td className="border border-gray-300 px-4 py-3">13,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">11,75,000</td>
                                <td className="border border-gray-300 px-4 py-3">35,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Below Target</span>
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">JFM-2024</td>
                                <td className="border border-gray-300 px-4 py-3">11,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">12,80,000</td>
                                <td className="border border-gray-300 px-4 py-3">75,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completed</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 px-4 py-3">OND-2023</td>
                                <td className="border border-gray-300 px-4 py-3">10,50,000</td>
                                <td className="border border-gray-300 px-4 py-3">13,20,000</td>
                                <td className="border border-gray-300 px-4 py-3">90,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completed</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-4 gap-0 bg-cyan-50 rounded-lg overflow-hidden">
                    <div className="text-center py-6 px-4 border-r border-cyan-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Current Quarter</p>
                      <p className="text-xl font-bold text-gray-900">ASO-2025</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-cyan-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Minimum Target</p>
                      <p className="text-xl font-bold text-gray-900">15,00,000</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-cyan-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Target Achieved</p>
                      <p className="text-xl font-bold text-gray-900">10,00,000</p>
                    </div>
                    <div className="text-center py-6 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Incentive Earned</p>
                      <p className="text-xl font-bold text-gray-900">50,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daily Metrics</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="overall">
                      <SelectTrigger className="w-24 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        <SelectItem value="team1">Team 1</SelectItem>
                        <SelectItem value="team2">Team 2</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 h-8 px-3">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">12-Aug-2025</span>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-4">
                          <p className="text-sm">Calendar would go here</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left side - Metrics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Total Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">20</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Avg. Resumes per Requirement</span>
                        <span className="text-2xl font-bold text-blue-600">02</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Requirements per Recruiter</span>
                        <span className="text-2xl font-bold text-blue-600">03</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Completed Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">12</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-slate-800 rounded-lg p-6 text-white">
                      <h4 className="text-lg font-semibold text-white mb-6 text-center">Daily Delivery</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-cyan-300 mb-3">Delivered</h5>
                          <div className="text-4xl font-bold text-white mb-4">3</div>
                          <Button 
                            size="sm" 
                            className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                          >
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-cyan-300 mb-3">Defaulted</h5>
                          <div className="text-4xl font-bold text-white mb-4">1</div>
                          <Button 
                            size="sm" 
                            className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Overall Performance */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Overall Performance</h4>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-bold">G</span>
                        </div>
                      </div>
                      <div className="h-24 relative">
                        <svg viewBox="0 0 300 100" className="w-full h-full">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Performance line */}
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            points="30,80 60,70 90,60 120,50 150,45 180,40 210,35 240,30 270,25"
                          />
                          
                          {/* Data points */}
                          <circle cx="30" cy="80" r="3" fill="#f59e0b"/>
                          <circle cx="60" cy="70" r="3" fill="#f59e0b"/>
                          <circle cx="90" cy="60" r="3" fill="#f59e0b"/>
                          <circle cx="120" cy="50" r="3" fill="#f59e0b"/>
                          <circle cx="150" cy="45" r="3" fill="#f59e0b"/>
                          <circle cx="180" cy="40" r="3" fill="#f59e0b"/>
                          <circle cx="210" cy="35" r="3" fill="#f59e0b"/>
                          <circle cx="240" cy="30" r="3" fill="#f59e0b"/>
                          <circle cx="270" cy="25" r="3" fill="#f59e0b"/>
                        </svg>
                      </div>
                      <div className="text-right mt-2">
                        <Button variant="link" className="text-xs text-blue-600 p-0">View More</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Section - Meetings and CEO Commands */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pending Meetings */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Meetings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">TL's Meeting</h3>
                          <div className="text-4xl font-bold text-gray-900 mb-4">3</div>
                          <Button 
                            size="sm" 
                            className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                          >
                            View
                          </Button>
                        </div>
                        <div className="text-center border-l border-gray-300 pl-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">CEO's Meeting</h3>
                          <div className="text-4xl font-bold text-gray-900 mb-4">1</div>
                          <Button 
                            size="sm" 
                            className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Commands */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">CEO Commands</CardTitle>
                    <Button variant="link" className="text-sm text-blue-600 p-0">View More</Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-slate-800 rounded-lg p-6 text-white space-y-4">
                      <div className="text-cyan-300 text-sm font-medium">
                        Discuss with Shri Ragavi on her production
                      </div>
                      <div className="text-cyan-300 text-sm font-medium">
                        Discuss with Kavya about her leaves
                      </div>
                      <div className="text-cyan-300 text-sm font-medium">
                        Discuss with Umar for data
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Team Members Sidebar - Right Section (Non-scrollable) */}
            <div className="flex-shrink-0">
              <TeamLeaderSidebar />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequirementsContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="John Mathew" companyName="Gumlat Marketing Private Limited" />
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            {/* Requirements Section with Priority Distribution - Exact copy from admin */}
            <div className="flex gap-6">
              {/* Left Section - Requirements Table */}
              <div className="flex-1">
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 font-semibold text-gray-700">Positions</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Criticality</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Company</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Contact</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Talent Advisor</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Recruiter</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Reallocate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="p-3 text-gray-900">Frontend Developer</td>
                          <td className="p-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">HIGH</span>
                          </td>
                          <td className="p-3 text-gray-600">TechCorp</td>
                          <td className="p-3 text-gray-600">David Wilson</td>
                          <td className="p-3 text-gray-600">kavitha</td>
                          <td className="p-3">
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-3 text-gray-900">UI/UX Designer</td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">MEDIUM</span>
                          </td>
                          <td className="p-3 text-gray-600">Designify</td>
                          <td className="p-3 text-gray-600">Tom Anderson</td>
                          <td className="p-3 text-gray-600">Rajesh</td>
                          <td className="p-3">
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-3 text-gray-900">Backend Developer</td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">LOW</span>
                          </td>
                          <td className="p-3 text-gray-600">CodeLabs</td>
                          <td className="p-3 text-gray-600">Robert Kim</td>
                          <td className="p-3 text-gray-600">Sowmiya</td>
                          <td className="p-3">
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-center gap-3 p-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="px-6 py-2 rounded bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                    >
                      Archives
                    </Button>
                    <Button 
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      View More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Section - Priority Distribution */}
              <div className="w-60">
                <div className="bg-white border border-gray-200 px-6 pb-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50">
                      <div className="flex items-center space-x-2">
                        <div className="text-4xl font-bold text-red-600">H</div>
                        <div className="text-sm text-gray-600">IGH</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">15</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50">
                      <div className="flex items-center space-x-2">
                        <div className="text-4xl font-bold text-blue-600">M</div>
                        <div className="text-sm text-gray-600">EDIUM</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">9</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <div className="text-4xl font-bold text-gray-600">L</div>
                        <div className="text-sm text-gray-600">OW</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-600">3</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className="text-4xl font-bold text-gray-900">T</div>
                        <div className="text-sm text-gray-600">OTAL</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">27</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPipelineContent = () => {
    return (
      <div className="flex h-full">
        {/* Middle Pipeline Content - Scrollable */}
        <div className="flex-1 ml-16 overflow-y-auto admin-scrollbar">
          <div className="p-6 space-y-6">
            {/* Pipeline Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pipeline</h2>
              <div className="flex items-center gap-4">
                {/* Simple Arun box instead of dropdown */}
                <div className="w-48 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm input-styled btn-rounded">
                  Arun
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="btn-rounded input-styled">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "dd-MMM-yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Pipeline Stages - matching admin design */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Level 1</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Level 2</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Level 3</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Final Round</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">HR Round</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Offer Stage</th>
                        <th className="text-center p-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[140px]">Closure</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vishnu Purana
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Chanakya
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Adhya
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vanshika
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Reyansh
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Shaurya
                            </div>
                            <div className="px-3 py-2 bg-green-200 dark:bg-green-800 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vihana
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-300 dark:bg-green-700 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-300 dark:bg-green-700 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vishnu Purana
                            </div>
                            <div className="px-3 py-2 bg-green-300 dark:bg-green-700 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Chanakya
                            </div>
                            <div className="px-3 py-2 bg-green-300 dark:bg-green-700 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Adhya
                            </div>
                            <div className="px-3 py-2 bg-green-300 dark:bg-green-700 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vanshika
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-400 dark:bg-green-600 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-400 dark:bg-green-600 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vishnu Purana
                            </div>
                            <div className="px-3 py-2 bg-green-400 dark:bg-green-600 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Chanakya
                            </div>
                            <div className="px-3 py-2 bg-green-400 dark:bg-green-600 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Adhya
                            </div>
                            <div className="px-3 py-2 bg-green-400 dark:bg-green-600 rounded text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                              Vanshika
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-500 dark:bg-green-600 rounded text-center text-sm font-medium text-white">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-500 dark:bg-green-600 rounded text-center text-sm font-medium text-white">
                              Vishnu Purana
                            </div>
                            <div className="px-3 py-2 bg-green-500 dark:bg-green-600 rounded text-center text-sm font-medium text-white">
                              Chanakya
                            </div>
                            <div className="px-3 py-2 bg-green-500 dark:bg-green-600 rounded text-center text-sm font-medium text-white">
                              Adhya
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-600 dark:bg-green-500 rounded text-center text-sm font-medium text-white">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-600 dark:bg-green-500 rounded text-center text-sm font-medium text-white">
                              Vishnu Purana
                            </div>
                            <div className="px-3 py-2 bg-green-600 dark:bg-green-500 rounded text-center text-sm font-medium text-white">
                              Chanakya
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-700 dark:bg-green-500 rounded text-center text-sm font-medium text-white">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-700 dark:bg-green-500 rounded text-center text-sm font-medium text-white">
                              Vishnu Purana
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-green-800 dark:bg-green-400 rounded text-center text-sm font-medium text-white">
                              Keerthana
                            </div>
                            <div className="px-3 py-2 bg-green-800 dark:bg-green-400 rounded text-center text-sm font-medium text-white">
                              Vishnu Purana
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Closure Reports Table */}
            <Card className="mt-6">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Closure Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidate</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Positions</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Client</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Fixed CTC</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Offered Date</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 text-gray-900 dark:text-white">David Johnson</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Frontend Developer</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Kavitha</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">12-06-2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">12-04-2025</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 text-gray-900 dark:text-white">Tom Anderson</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">UI/UX Designer</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Designify</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Rajesh</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">ASO, 2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">18-06-2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">05-05-2025</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 text-gray-900 dark:text-white">Robert Kim</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Backend Developer</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Sowmiya</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">28-06-2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">19-08-2025</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 text-gray-900 dark:text-white">Kevin Brown</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">QA Tester</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Kalaiselvi</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">FMA, 2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">03-07-2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">03-09-2025</td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 text-gray-900 dark:text-white">Mel Gibson</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Mobile App Developer</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Tesco</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">Malathi</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">NDJ, 2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">18-07-2025</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">10-10-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-blue-600 hover:text-blue-700 text-sm"
                      onClick={() => setIsClosureDetailsModalOpen(true)}
                    >
                      See More...
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar with Stats - Fixed, Non-scrollable */}
        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-hidden">
          <div className="p-4 space-y-1">
            <div className="flex justify-between items-center py-3 px-4 bg-green-100 dark:bg-green-900 rounded">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SOURCED</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">15</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-200 dark:bg-green-800 rounded">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SHORTLISTED</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-300 dark:bg-green-700 rounded">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">INTRO CALL</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">7</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-400 dark:bg-green-600 rounded">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ASSIGNMENT</span>
              <span className="text-lg font-bold text-gray-800 dark:text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-500 dark:bg-green-600 rounded">
              <span className="text-sm font-medium text-white">L1</span>
              <span className="text-lg font-bold text-white">15</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-600 dark:bg-green-500 rounded">
              <span className="text-sm font-medium text-white">L2</span>
              <span className="text-lg font-bold text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-700 dark:bg-green-500 rounded">
              <span className="text-sm font-medium text-white">L3</span>
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-800 dark:bg-green-400 rounded">
              <span className="text-sm font-medium text-white">FINAL ROUND</span>
              <span className="text-lg font-bold text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-900 dark:bg-green-400 rounded">
              <span className="text-sm font-medium text-white">HR ROUND</span>
              <span className="text-lg font-bold text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-900 dark:bg-green-300 rounded">
              <span className="text-sm font-medium text-white">OFFER STAGE</span>
              <span className="text-lg font-bold text-white">9</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-green-950 dark:bg-green-300 rounded">
              <span className="text-sm font-medium text-white">CLOSURE</span>
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-amber-500 dark:bg-amber-600 rounded">
              <span className="text-sm font-medium text-white">OFFER DROP</span>
              <span className="text-lg font-bold text-white">3</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="John Mathew" companyName="Gumlat Marketing Private Limited" />
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            {/* Team Performance Section */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Position</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Company</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Closure Month</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Package</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-900">Emily Davis</td>
                        <td className="p-3 text-gray-900">Frontend Developer</td>
                        <td className="p-3 text-gray-900">TechCorp</td>
                        <td className="p-3 text-gray-900">JFM, 2025</td>
                        <td className="p-3 text-gray-900">kavitha</td>
                        <td className="p-3 text-gray-900">12,00,000</td>
                        <td className="p-3 text-gray-900">89,892</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-900">Michael Brown</td>
                        <td className="p-3 text-gray-900">UI/UX Designer</td>
                        <td className="p-3 text-gray-900">Designify</td>
                        <td className="p-3 text-gray-900">AMJ, 2025</td>
                        <td className="p-3 text-gray-900">Rajesh</td>
                        <td className="p-3 text-gray-900">8,00,000</td>
                        <td className="p-3 text-gray-900">59,928</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-900">Sarah Wilson</td>
                        <td className="p-3 text-gray-900">Backend Developer</td>
                        <td className="p-3 text-gray-900">CodeLabs</td>
                        <td className="p-3 text-gray-900">MJJ, 2025</td>
                        <td className="p-3 text-gray-900">Sowmiya</td>
                        <td className="p-3 text-gray-900">18,00,000</td>
                        <td className="p-3 text-gray-900">1,34,946</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-900">Kevin Brown</td>
                        <td className="p-3 text-gray-900">QA Tester</td>
                        <td className="p-3 text-gray-900">AppLogic</td>
                        <td className="p-3 text-gray-900">PMA, 2025</td>
                        <td className="p-3 text-gray-900">Kalaiselvi</td>
                        <td className="p-3 text-gray-900">30,00,000</td>
                        <td className="p-3 text-gray-900">2,24,910</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">View Full List</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        {/* Target Section */}
        <Card>
          <CardHeader>
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-0 bg-blue-50 rounded overflow-hidden">
              <div className="bg-blue-100 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Current Quarter</p>
                <p className="text-lg font-bold text-gray-900">{targetMetrics?.currentQuarter || "ASO-2025"}</p>
              </div>
              <div className="bg-blue-50 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Minimum Target</p>
                <p className="text-lg font-bold text-gray-900">{targetMetrics?.minimumTarget || "15,00,000"}</p>
              </div>
              <div className="bg-blue-100 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Target Achieved</p>
                <p className="text-lg font-bold text-gray-900">{targetMetrics?.targetAchieved || "10,00,000"}</p>
              </div>
              <div className="bg-blue-50 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Incentive Earned</p>
                <p className="text-lg font-bold text-gray-900">{targetMetrics?.incentiveEarned || "50,000"}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">View All</Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Metrics Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Metrics</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Overall</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{format(selectedDate, "dd-MMM-yyyy")}</span>
                    <EditIcon className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {/* Left side - 2x2 Grid */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Total Requirements</p>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-blue-600">20</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Avg. Resumes per Requirement</p>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-blue-600">02</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Requirements per Recruiter</p>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-blue-600">03</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Completed Requirements</p>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-blue-600">12</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Daily Delivery & Performance */}
              <div className="space-y-4">
                <div className="bg-slate-800 text-white p-6 rounded">
                  <h3 className="text-lg font-semibold mb-4">Daily Delivery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-2">Delivered</p>
                      <p className="text-3xl font-bold mb-3">3</p>
                      <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">View</Button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-2">Defaulted</p>
                      <p className="text-3xl font-bold mb-3">1</p>
                      <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">View</Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                  <div className="text-sm text-gray-600 mb-2">Overall Performance</div>
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">G</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">View More</Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pending Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-50 p-4 rounded text-center">
                  <h3 className="font-semibold text-sm mb-2">TL's Meeting</h3>
                  <p className="text-3xl font-bold text-cyan-600 mb-2">3</p>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">View</Button>
                </div>
                <div className="bg-cyan-50 p-4 rounded text-center">
                  <h3 className="font-semibold text-sm mb-2">CEO's Meeting</h3>
                  <p className="text-3xl font-bold text-cyan-600 mb-2">1</p>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CEO Commands */}
          <Card>
            <CardHeader>
              <CardTitle>CEO Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 text-white p-4 rounded">
                <div className="space-y-2 text-sm">
                  <div>Discuss with Shri Ragavi on her production</div>
                  <div>Discuss with Kavya about her leaves</div>
                  <div>Discuss with Umar for data</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTeamSidebar = () => {
    const teamData = [
      { name: "Deepika", salary: "3,50,000 INR", year: "2024-2025", count: 6 },
      { name: "Priyanka", salary: "4,30,000 INR", year: "2024-2025", count: 12 },
      { name: "Thamarai Selvi", salary: "1,00,000 INR", year: "2022-2025", count: 7 },
      { name: "Kavya", salary: "5,50,000 INR", year: "2020-2025", count: 2 },
      { name: "Karthikayan", salary: "3,00,000 INR", year: "2024-2025", count: 11 },
      { name: "Vishnu Priya", salary: "4,50,000 INR", year: "2018-2025", count: 3 },
      { name: "Helen", salary: "5,50,000 INR", year: "2017-2025", count: 10 },
      { name: "Kavin", salary: "2,00,000 INR", year: "2022-2025", count: 12 },
      { name: "Thrisha", salary: "3,50,000 INR", year: "2024-2025", count: 6 },
      { name: "Megna", salary: "8,30,000 INR", year: "2022-2025", count: 12 }
    ];

    return (
      <div className="p-6">
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Team</h3>
          <div className="space-y-4">
            {teamData.map((member, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://images.unsplash.com/photo-150${7 + index}003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32`}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{member.name}</div>
                    <div className="text-xs text-blue-600">{member.salary}</div>
                    <div className="text-xs text-gray-500">{member.year}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{member.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOldDashboardTabContent = () => {
    switch (activeTab) {
      case 'team':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Team Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-team-section-title">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {(teamMembers || []).map((member: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1" data-testid={`text-member-name-${index}`}>
                            {member.name}
                          </h3>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1" data-testid={`text-member-salary-${index}`}>
                            {member.salary}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`text-member-year-${index}`}>
                            {member.year}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400" data-testid={`text-member-profiles-${index}`}>
                            {member.profilesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-target-section-title">Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                  <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Quarter</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-current-quarter">{targetMetrics?.currentQuarter || 'ASO-2025'}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Target</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-minimum-target">{targetMetrics?.minimumTarget || '15,00,000'}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Achieved</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-target-achieved">{targetMetrics?.targetAchieved || '10,00,000'}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incentive Earned</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-incentive-earned">{targetMetrics?.incentiveEarned || '50,000'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Metrics Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle data-testid="text-daily-metrics-title">Daily Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="text-sm text-gray-500 dark:text-gray-400 border-none p-2">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span data-testid="text-daily-metrics-date">{format(selectedDate, "dd-MMM-yyyy")}</span>
                        <EditIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {/* Left side - 2x2 Grid */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Requirements</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-requirements">
                          {dailyMetrics?.totalRequirements || "20"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Completed Requirements</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-completed-requirements">
                          {dailyMetrics?.completedRequirements || "12"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Resumes per Requirement</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-resumes">
                          {dailyMetrics?.avgResumesPerRequirement || "02"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requirements per Recruiter</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-requirements-per-recruiter">
                          {dailyMetrics?.requirementsPerRecruiter || "05"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Daily Delivery */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded shadow-sm p-6 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Daily Delivery</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Delivered</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-daily-delivered">
                          {dailyMetrics?.dailyDeliveryDelivered || "3"}
                        </p>
                        <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4" data-testid="button-view-delivered">
                          View
                        </Button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Defaulted</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-daily-defaulted">
                          {dailyMetrics?.dailyDeliveryDefaulted || "1"}
                        </p>
                        <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4" data-testid="button-view-defaulted">
                          View
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view-more">
                      View More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-6">
              {/* CEO Comments */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-ceo-comments-title">CEO Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded">
                    <ul className="space-y-2 text-sm">
                      {(ceoComments || []).map((commentObj: any, index: number) => (
                        <li key={index} data-testid={`text-ceo-comment-${index}`}>
                          {commentObj.comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-pending-meetings-title">Pending Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {(meetings || []).map((meeting: any, index: number) => (
                      <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded text-center">
                        <h3 className="font-semibold text-sm" data-testid={`text-meeting-type-${index}`}>{meeting.type}</h3>
                        <p className="text-2xl font-bold text-blue-600 my-2" data-testid={`text-meeting-count-${index}`}>
                          {meeting.count}
                        </p>
                        <Button variant="outline" size="sm" data-testid={`button-view-meeting-${index}`}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Priority Distribution Section */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-red-500 mb-1">HIGH</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-red-500">10</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-blue-500 mb-1">MEDIUM</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-500">5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">LOW</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-gray-500">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Table */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Positions</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Criticality</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Recruiter</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Reallocate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">Frontend Developer</td>
                        <td className="py-4 px-4">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">HIGH</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">TechCorp</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">David Wilson</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-4 px-4">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">UI/UX Designer</td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">MEDIUM</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Designify</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Rajesh</td>
                        <td className="py-4 px-4">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">Backend Developer</td>
                        <td className="py-4 px-4">
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">LOW</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">CodeLabs</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Sowmiya</td>
                        <td className="py-4 px-4">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">QA Tester</td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">MEDIUM</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">AppLogic</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Kalaiselvi</td>
                        <td className="py-4 px-4">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Assign</Button>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-900 dark:text-white">Mobile App Developer</td>
                        <td className="py-4 px-4">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">HIGH</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Tesco</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Malathi</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Arun</td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'pipeline':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Pipeline Stages */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 1</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 2</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 3</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Final Round</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">HR Round</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Offer Stage</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Closure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <div className="flex items-center justify-between">
                            <span className={`inline-block flex-1 text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                              Keerthana
                            </span>
                            <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="ml-2 p-1">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Closure Report</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="candidate-name">Candidate Name</Label>
                                    <Input id="candidate-name" placeholder="Enter name" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="fixed-ctc">Fixed CTC</Label>
                                    <Input id="fixed-ctc" placeholder="Enter CTC" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Input id="client" placeholder="Enter client" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="talent-advisor">Talent Advisor</Label>
                                    <Input id="talent-advisor" placeholder="Enter advisor" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input id="position" placeholder="Enter position" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="offered-date">Offered Date</Label>
                                    <Input id="offered-date" type="date" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="joining-date">Joining Date</Label>
                                    <Input id="joining-date" type="date" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="comments">Comments</Label>
                                    <Input id="comments" placeholder="Enter comments" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">Send Report</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                      {/* Row 2 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <div className="flex items-center justify-between">
                            <span className={`inline-block flex-1 text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                              Vishnu Purana
                            </span>
                            <Button variant="ghost" size="sm" className="ml-2 p-1">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Row 3 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 4 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 5 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 6 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Reyansh']}`}>
                            Reyansh
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Reyansh']}`}>
                            Reyansh
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 7 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Saurang']}`}>
                            Saurang
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 8 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vihana']}`}>
                            Vihana
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Closure Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Closure Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Candidate</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Fixed CTC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Offered Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">David Wilson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Frontend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">TechCorp</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kavitha</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">12-06-2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">12-04-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tom Anderson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">UI/UX Designer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Designify</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Rajesh</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">ASO, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18-08-2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">05-05-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Robert Kim</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Backend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">CodeLabs</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Sowmiya</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">28-06-2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">19-08-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kevin Brown</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">QA Tester</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">AppLogic</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kalaiselvi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">PMA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">03-07-2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">03-09-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mel Gibson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mobile App Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tesco</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Malathi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">NDA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18-07-2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">10-10-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Team Performance Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Joining Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Tenure</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Closures</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Last Closure</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Qtrs Achieved</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">David Wilson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">23-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,3 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">4</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">23-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">3</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tom Anderson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">28-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,3 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">8</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">29-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">6</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Robert Kim</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">04-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,2 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">9</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">02-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">11</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kevin Brown</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">12-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,2 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">13</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">5</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mel Gibson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">05-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">5</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">01-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">13</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">View Full List</Button>
                </div>
              </CardContent>
            </Card>

            {/* List of Closures Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>List Of Closures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Candidate</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Quarter</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">CTC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">David Wilson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Frontend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">TechCorp</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kavitha</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">15,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,12,455</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tom Anderson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">UI/UX Designer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Designify</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">ASO, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Rajesh</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">25,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,87,425</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Robert Kim</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Backend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">CodeLabs</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Sowmiya</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,34,946</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kevin Brown</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">QA Tester</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">AppLogic</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">PMA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kalaiselvi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">30,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2,24,910</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mel Gibson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mobile App Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tesco</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">NDA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Malathi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">50,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">4,49,820</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">View Full List</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Default content - same as team tab */}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <TeamLeaderMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      {renderMainContent()}
      
      {/* Closure Details Modal */}
      <Dialog open={isClosureDetailsModalOpen} onOpenChange={setIsClosureDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Closure Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidate</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Position</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Client</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Package</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">David Johnson</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Frontend Developer</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Kavitha</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹12,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Joined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹89,892</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Tom Anderson</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">UI/UX Designer</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Designify</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Rajesh</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹8,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Joined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹59,928</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Robert Kim</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Backend Developer</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Sowmiya</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹18,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹1,34,946</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Sarah Wilson</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Data Scientist</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">DataTech</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Malathi</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹22,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Joined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹1,64,934</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Michael Chen</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">DevOps Engineer</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">CloudSoft</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Kalaiselvi</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹15,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Joined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹1,12,455</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Lisa Rodriguez</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Product Manager</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">InnovateHub</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Kavitha</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹25,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Offer Declined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹0</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">James Martinez</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Full Stack Developer</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">WebSolutions</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Rajesh</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹14,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Joined</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹1,04,916</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 text-gray-900 dark:text-white">Emma Thompson</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">QA Lead</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">QualityFirst</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">Sowmiya</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹16,00,000</td>
                    <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Offer Extended</span></td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Closures: 8 | Total Revenue: ₹7,66,071
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsClosureDetailsModalOpen(false)}
                className="btn-rounded"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}