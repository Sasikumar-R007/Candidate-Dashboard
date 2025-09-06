import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import RecruiterProfileHeader from '@/components/dashboard/recruiter-profile-header';
import RecruiterTabNavigation from '@/components/dashboard/recruiter-tab-navigation';
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, EditIcon, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';

interface RecruiterProfile {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  phone: string;
  email: string;
  joiningDate: string;
  department: string;
  reportingTo: string;
  totalContribution: string;
  bannerImage?: string | null;
  profilePicture?: string | null;
}

export default function RecruiterDashboard2() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('updates');
  const [, setLocation] = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['/api/recruiter/profile'],
  }) as { data: RecruiterProfile };

  const { data: targetMetrics } = useQuery({
    queryKey: ['/api/recruiter/target-metrics'],
  }) as { data: any };

  const { data: dailyMetrics } = useQuery({
    queryKey: ['/api/recruiter/daily-metrics'],
  }) as { data: any };

  const { data: meetings } = useQuery({
    queryKey: ['/api/recruiter/meetings'],
  }) as { data: any[] };

  const { data: ceoComments } = useQuery({
    queryKey: ['/api/recruiter/ceo-comments'],
  }) as { data: any[] };

  if (sidebarTab === 'jobs') {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeTab={sidebarTab} />
        <div className="flex-1 flex flex-col">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Recruiter Dashboard 2</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">&gt;</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">Job Board</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Board - Recruiter 2</h1>
          </div>
          <div className="flex-1 overflow-auto">
            <JobBoardTab />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={sidebarTab} />
      <div className="flex-1 flex flex-col">
        <RecruiterProfileHeader profile={profile} />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Recruiter Dashboard 2</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">&gt;</span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard 2</h1>
            </div>

            <RecruiterTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'updates' && (
              <div className="space-y-6">
                {/* Welcome Message */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Welcome to Recruiter Dashboard 2! 🎯
                    </h2>
                    <p className="text-blue-700 dark:text-blue-200">
                      This is your enhanced recruiter workspace with additional features and improved workflows.
                    </p>
                  </CardContent>
                </Card>

                {/* Target Section */}
                {targetMetrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Target Overview - Enhanced
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {targetMetrics.currentQuarter}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Current Quarter</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {targetMetrics.minimumTarget}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Target</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {targetMetrics.targetAchieved}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Target Achieved</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ₹{targetMetrics.incentiveEarned}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Incentive Earned</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Daily Metrics */}
                {dailyMetrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                        Daily Metrics - Enhanced View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dailyMetrics.submissionCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Submissions</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dailyMetrics.interviewCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Lined Up</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dailyMetrics.selectionCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Selections</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {dailyMetrics.offerCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Offers</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <span className="text-blue-900 dark:text-blue-100 font-medium">Overall Performance</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {dailyMetrics.overallPerformance}
                            </span>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="text-green-900 dark:text-green-100 font-medium mb-2">Daily Delivery</div>
                            <div className="text-sm text-green-700 dark:text-green-200">
                              {dailyMetrics.dailyDelivery}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CEO Comments */}
                {ceoComments && ceoComments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-pink-600" />
                        CEO Comments - Priority View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ceoComments.map((comment: any) => (
                          <div key={comment.id} className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded border-l-4 border-pink-400">
                            <p className="text-pink-900 dark:text-pink-100">{comment.comment}</p>
                            <p className="text-sm text-pink-600 dark:text-pink-300 mt-2">- {comment.author}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Meetings */}
                {meetings && meetings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-600" />
                        Pending Meetings - Enhanced Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {meetings.map((meeting: any) => (
                          <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{meeting.type}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{meeting.date} with {meeting.person}</div>
                            </div>
                            <Button size="sm" variant="outline" data-testid={`button-view-meeting-${meeting.id}`}>
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}