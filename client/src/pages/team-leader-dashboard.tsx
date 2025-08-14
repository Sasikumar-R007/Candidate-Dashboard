import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import TeamLeaderProfileHeader from '@/components/dashboard/team-leader-profile-header';
import TeamLeaderTabNavigation from '@/components/dashboard/team-leader-tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, EditIcon, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function TeamLeaderDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('team');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);

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

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <>
            <TeamLeaderProfileHeader profile={teamLeaderProfile} />
            <TeamLeaderTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto">
              {renderDashboardTabContent()}
            </div>
          </>
        );
      case 'job-board':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Board</h2>
              <p className="text-gray-600 dark:text-gray-400">Team leader job board functionality will be implemented here</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and team settings</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <TeamLeaderProfileHeader profile={teamLeaderProfile} />
            <TeamLeaderTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto">
              {renderDashboardTabContent()}
            </div>
          </>
        );
    }
  };

  const renderDashboardTabContent = () => {
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
                  {teamMembers?.map((member: any, index: number) => (
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
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-current-quarter">{targetMetrics?.currentQuarter}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Target</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-minimum-target">{targetMetrics?.minimumTarget}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Achieved</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-target-achieved">{targetMetrics?.targetAchieved}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incentive Earned</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-incentive-earned">{targetMetrics?.incentiveEarned}</p>
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
                      {ceoComments?.map((commentObj: any, index: number) => (
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
                    {meetings?.map((meeting: any, index: number) => (
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <div className="flex min-h-screen">
        <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          {renderSidebarContent()}
        </div>
      </div>
    </div>
  );
}