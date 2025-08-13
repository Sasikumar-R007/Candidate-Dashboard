import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, PhoneIcon, MailIcon, LogOutIcon, EditIcon, SettingsIcon, UploadIcon, DownloadIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function TeamLeaderDashboard() {
  const [activeTab, setActiveTab] = useState("team");

  // Mock data matching the UI design
  const teamLeaderProfile = {
    name: "John Mathew",
    role: "Team Leader",
    employeeId: "STL01",
    phone: "90347 59092",
    email: "john@scalingtheory.com",
    joiningDate: "03-March-2021",
    department: "Talent Advisory",
    reportingTo: "Yatna Prakash",
    totalContribution: "2,50,000"
  };

  const teamMembers = [
    { name: "Sudharshan", salary: "2,95,000 INR", year: "2024-2025", profilesCount: "10" },
    { name: "Deepika", salary: "1,95,000 INR", year: "2024-2025", profilesCount: "5" },
    { name: "Dharshan", salary: "1,80,000 INR", year: "2024-2025", profilesCount: "4" },
    { name: "Kavya", salary: "2,30,000 INR", year: "2024-2025", profilesCount: "2" },
    { name: "Thamarai Selvi", salary: "2,50,000 INR", year: "2024-2025", profilesCount: "3" },
    { name: "Karthikayan", salary: "2,50,000 INR", year: "2024-2025", profilesCount: "2" }
  ];

  const targetMetrics = {
    currentQuarter: "ASO-2025",
    minimumTarget: "15,00,000",
    targetAchieved: "10,00,000",
    incentiveEarned: "50,000"
  };

  const dailyMetrics = {
    date: "12-Aug-2025",
    totalRequirements: "20",
    completedRequirements: "12",
    avgResumesPerRequirement: "02",
    requirementsPerRecruiter: "03",
    dailyDeliveryDelivered: "3",
    dailyDeliveryDefaulted: "1"
  };

  const meetings = [
    { type: "TL's Meeting", count: "3" },
    { type: "CEO's Meeting", count: "1" }
  ];

  const ceoComments = [
    "Discuss with Shri Ragavi on her production",
    "Discuss with Kavya about her leaves",
    "Discuss with Umar for data"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 dark:bg-slate-900 text-white p-6">
        <div className="flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <h2 className="text-xl font-semibold" data-testid="text-dashboard-title">Dashboard</h2>
            
            <nav className="space-y-2">
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-slate-700 dark:hover:bg-slate-800" data-testid="button-job-board">
                Job Board
              </button>
              <Link href="/" data-testid="link-sign-out">
                <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-slate-700 dark:hover:bg-slate-800" data-testid="button-sign-out">
                  <LogOutIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </Link>
              <button className="block w-full text-left px-3 py-2 rounded hover:bg-slate-700 dark:hover:bg-slate-800" data-testid="button-settings">
                <SettingsIcon className="h-4 w-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/api/placeholder/80/80" />
              <AvatarFallback>JM</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-profile-name">
                {teamLeaderProfile.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300" data-testid="text-profile-role">
                {teamLeaderProfile.role} - {teamLeaderProfile.employeeId}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1" data-testid="text-profile-phone">
                  <PhoneIcon className="h-4 w-4" />
                  {teamLeaderProfile.phone}
                </span>
                <span className="flex items-center gap-1" data-testid="text-profile-email">
                  <MailIcon className="h-4 w-4" />
                  {teamLeaderProfile.email}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                <span data-testid="text-joining-date">Joining Date: {teamLeaderProfile.joiningDate}</span> • 
                <span data-testid="text-department"> Department: {teamLeaderProfile.department}</span> • 
                <span data-testid="text-reporting-to"> Reporting to: {teamLeaderProfile.reportingTo}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Contribution</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-total-contribution">
                {teamLeaderProfile.totalContribution}
              </p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-edit-profile">
              <EditIcon className="h-4 w-4 mr-1" />
              Edit profile
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
            <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" data-testid="button-upload-resume">
              <UploadIcon className="h-4 w-4 mr-1" />
              Upload Resume
            </Button>
            <Button variant="outline" size="sm" data-testid="button-source-resume">
              <DownloadIcon className="h-4 w-4 mr-1" />
              Source Resume
            </Button>
          </div>

          <TabsContent value="team" className="mt-6">
            <div className="space-y-6">
              {/* Team Section */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-team-section-title">Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {teamMembers.map((member, index) => (
                      <Card key={index} className="p-4">
                        <div className="text-center">
                          <h3 className="font-semibold" data-testid={`text-member-name-${index}`}>{member.name}</h3>
                          <p className="text-sm text-gray-500" data-testid={`text-member-salary-${index}`}>{member.salary}</p>
                          <p className="text-xs text-gray-400" data-testid={`text-member-year-${index}`}>{member.year}</p>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-blue-600" data-testid={`text-member-profiles-${index}`}>
                              {member.profilesCount}
                            </span>
                          </div>
                        </div>
                      </Card>
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
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Current Quarter</p>
                      <p className="font-semibold" data-testid="text-current-quarter">{targetMetrics.currentQuarter}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Minimum Target</p>
                      <p className="font-semibold" data-testid="text-minimum-target">{targetMetrics.minimumTarget}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Target Achieved</p>
                      <p className="font-semibold" data-testid="text-target-achieved">{targetMetrics.targetAchieved}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Incentive Earned</p>
                      <p className="font-semibold" data-testid="text-incentive-earned">{targetMetrics.incentiveEarned}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle data-testid="text-daily-metrics-title">Daily Metrics</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    <span data-testid="text-daily-metrics-date">{dailyMetrics.date}</span>
                    <EditIcon className="h-4 w-4 cursor-pointer" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Requirements</span>
                        <span className="font-bold text-blue-600" data-testid="text-total-requirements">
                          {dailyMetrics.totalRequirements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Requirements</span>
                        <span className="font-bold text-blue-600" data-testid="text-completed-requirements">
                          {dailyMetrics.completedRequirements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Resumes per Requirement</span>
                        <span className="font-bold text-blue-600" data-testid="text-avg-resumes">
                          {dailyMetrics.avgResumesPerRequirement}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requirements per Recruiter</span>
                        <span className="font-bold text-blue-600" data-testid="text-requirements-per-recruiter">
                          {dailyMetrics.requirementsPerRecruiter}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Daily Delivery</p>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Delivered</p>
                            <p className="font-bold text-green-600" data-testid="text-daily-delivered">
                              {dailyMetrics.dailyDeliveryDelivered}
                            </p>
                            <Button variant="outline" size="sm" className="mt-1" data-testid="button-view-delivered">
                              View
                            </Button>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Defaulted</p>
                            <p className="font-bold text-red-600" data-testid="text-daily-defaulted">
                              {dailyMetrics.dailyDeliveryDefaulted}
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
                        {ceoComments.map((comment, index) => (
                          <li key={index} data-testid={`text-ceo-comment-${index}`}>
                            {comment}
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
                      {meetings.map((meeting, index) => (
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
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Requirements content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Pipeline content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Performance content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}