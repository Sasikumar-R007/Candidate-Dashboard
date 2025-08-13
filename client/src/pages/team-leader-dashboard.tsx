import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import TeamLeaderProfileHeader from '@/components/dashboard/team-leader-profile-header';
import TeamLeaderTabNavigation from '@/components/dashboard/team-leader-tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, EditIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function TeamLeaderDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('team');

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
                          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid={`text-member-profiles-${index}`}>
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
                <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
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
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span data-testid="text-daily-metrics-date">{dailyMetrics?.date}</span>
                  <EditIcon className="h-4 w-4 cursor-pointer" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Requirements</span>
                      <span className="font-bold text-blue-600" data-testid="text-total-requirements">
                        {dailyMetrics?.totalRequirements}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Requirements</span>
                      <span className="font-bold text-blue-600" data-testid="text-completed-requirements">
                        {dailyMetrics?.completedRequirements}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Resumes per Requirement</span>
                      <span className="font-bold text-blue-600" data-testid="text-avg-resumes">
                        {dailyMetrics?.avgResumesPerRequirement}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requirements per Recruiter</span>
                      <span className="font-bold text-blue-600" data-testid="text-requirements-per-recruiter">
                        {dailyMetrics?.requirementsPerRecruiter}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Daily Delivery</p>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                          <p className="font-bold text-green-600" data-testid="text-daily-delivered">
                            {dailyMetrics?.dailyDeliveryDelivered}
                          </p>
                          <Button variant="outline" size="sm" className="mt-1" data-testid="button-view-delivered">
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Defaulted</p>
                          <p className="font-bold text-red-600" data-testid="text-daily-defaulted">
                            {dailyMetrics?.dailyDeliveryDefaulted}
                          </p>
                          <Button variant="outline" size="sm" className="mt-1" data-testid="button-view-defaulted">
                            View
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full" data-testid="button-view-more">
                        View More
                      </Button>
                    </div>
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
                  <div className="space-y-4">
                    {meetings?.map((meeting: any, index: number) => (
                      <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded text-center">
                        <h3 className="font-semibold" data-testid={`text-meeting-type-${index}`}>{meeting.type}</h3>
                        <p className="text-2xl font-bold text-blue-600" data-testid={`text-meeting-count-${index}`}>
                          {meeting.count}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" data-testid={`button-view-meeting-${index}`}>
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
          <div className="px-6 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">Requirements content will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'pipeline':
        return (
          <div className="px-6 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">Pipeline content will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">Performance content will be implemented here.</p>
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