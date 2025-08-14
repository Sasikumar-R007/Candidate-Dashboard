import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/dashboard/admin-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTabNavigation from '@/components/dashboard/admin-tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, EditIcon } from "lucide-react";
import { format } from "date-fns";

// Admin profile will be fetched from API - fallback data matching server
const initialAdminProfile = {
  name: "John Mathew",
  role: "CEO",
  email: "john@scalingtheory.com",
  phone: "90347 59099",
  bannerImage: null as string | null,
  profilePicture: null as string | null
};

const teamsData = [
  {
    name: "Arun KS",
    teamName: "Arun's Team",
    teamMembers: 4,
    tenure: "4y3m",
    quartersAchieved: 6,
    nextMilestone: "+3",
    members: [
      { name: "Sudharshan", salary: "3,50,000 INR", year: "2024-2025", count: 10 },
      { name: "Deepika", salary: "4,50,000 INR", year: "2024-2025", count: 5 },
      { name: "Dharshan", salary: "1,00,000 INR", year: "2024-2025", count: 4 },
      { name: "Kavya", salary: "2,20,000 INR", year: "2024-2025", count: 2 },
      { name: "Thamarai Selvi", salary: "7,50,000 INR", year: "2024-2025", count: 3 },
      { name: "Karthikayan", salary: "2,90,000 INR", year: "2024-2025", count: 2 }
    ]
  },
  {
    name: "Anusha",
    teamName: "Anusha's Team", 
    teamMembers: 4,
    tenure: "4y3m",
    quartersAchieved: 6,
    nextMilestone: "+3",
    members: [
      { name: "Sudharshan", salary: "3,50,000 INR", year: "2024-2025", count: 10 },
      { name: "Deepika", salary: "4,50,000 INR", year: "2024-2025", count: 5 },
      { name: "Dharshan", salary: "1,00,000 INR", year: "2024-2025", count: 4 },
      { name: "Kavya", salary: "2,20,000 INR", year: "2024-2025", count: 2 },
      { name: "Thamarai Selvi", salary: "7,50,000 INR", year: "2024-2025", count: 3 },
      { name: "Karthikayan", salary: "2,90,000 INR", year: "2024-2025", count: 2 }
    ]
  }
];

const targetsData = [
  { resource: "Arun KS", role: "TL", quarter: "ASO 2025", minimumTarget: "15,00,000", targetAchieved: "13,00,000", closures: 6, incentives: "15,000" },
  { resource: "Anusha", role: "TL", quarter: "ASO 2025", minimumTarget: "12,00,000", targetAchieved: "8,00,000", closures: 3, incentives: "35,000" }
];

const dailyMetricsData = {
  totalRequirements: 20,
  completedRequirements: 12,
  overallPerformance: "G",
  avgResumesPerRequirement: "02",
  requirementsPerRecruiter: "03",
  dailyDeliveryDelivered: 3,
  dailyDeliveryDefaulted: 1
};

const messagesData = [
  { name: "Arun", message: "Discuss ...", date: "12-June", status: "active" },
  { name: "Anusha", message: "Discuss ...", date: "12-June", status: "active" },
  { name: "Umar", message: "Discuss ...", date: "10-Aug", status: "pending" },
  { name: "Siva", message: "Discuss ...", date: "22-Sep", status: "pending" }
];

export default function AdminDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('team');
  const [adminProfile, setAdminProfile] = useState(initialAdminProfile);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch('/api/admin/profile');
        if (response.ok) {
          const profile = await response.json();
          setAdminProfile(profile);
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
      }
    };

    fetchAdminProfile();
  }, []);

  const renderTeamSection = () => (
    <div className="px-6 py-6 space-y-8">
      {teamsData.map((team, teamIndex) => (
        <div key={teamIndex} className="space-y-6">
          {/* Team Header */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {team.teamName}
                </h3>
              </div>
              
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Members</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.teamMembers}</div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-2 border-blue-500">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tenure</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.tenure}</div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-2 border-blue-500">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quarters Achieved</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.quartersAchieved}</div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-2 border-blue-500">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Milestone</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{team.nextMilestone}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members Grid */}
          <div className="grid grid-cols-3 gap-4">
            {team.members.map((member, memberIndex) => (
              <div key={memberIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.salary}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{member.year}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{member.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Target & Incentives Section */}
      <Card>
        <CardHeader>
          <CardTitle>Target & Incentives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Quarter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Minimum Target</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Target Achieved</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Closures</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Incentives</th>
                </tr>
              </thead>
              <tbody>
                {targetsData.map((target, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{target.resource}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.role}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.quarter}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.minimumTarget}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.targetAchieved}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.closures}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.incentives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Metrics Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Metrics</CardTitle>
          <div className="flex items-center space-x-4">
            <Select defaultValue="overall">
              <SelectTrigger className="w-32">
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
                <Button variant="outline" className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(selectedDate, "dd-MMM-yyyy")}</span>
                  <EditIcon className="h-3 w-3" />
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Requirements</p>
                <div className="text-right">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyMetricsData.totalRequirements}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Completed Requirements</p>
                <div className="text-right">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyMetricsData.completedRequirements}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Resumes per Requirement</p>
                <div className="text-right">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyMetricsData.avgResumesPerRequirement}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requirements per Recruiter</p>
                <div className="text-right">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyMetricsData.requirementsPerRecruiter}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right side - Daily Delivery */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm p-6 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Daily Delivery</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Delivered</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {dailyMetricsData.dailyDeliveryDelivered}
                  </p>
                  <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4">
                    View
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Defaulted</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {dailyMetricsData.dailyDeliveryDefaulted}
                  </p>
                  <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4">
                    View
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View More
              </Button>
            </div>
          </div>
          
          {/* Overall Performance - Separate section below */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center min-w-48">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Overall Performance</div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                {dailyMetricsData.overallPerformance}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages and Meetings Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Arun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arun">Arun</SelectItem>
                  <SelectItem value="anusha">Anusha</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Textarea placeholder="Enter text..." className="min-h-20" />
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send ➤
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Message Status</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-white bg-blue-600 px-2">Name</th>
                      <th className="text-left py-2 text-white bg-blue-600 px-2">Message</th>
                      <th className="text-left py-2 text-white bg-blue-600 px-2">Date</th>
                      <th className="text-left py-2 text-white bg-blue-600 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messagesData.map((message, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2">{message.name}</td>
                        <td className="py-2 px-2">{message.message}</td>
                        <td className="py-2 px-2">{message.date}</td>
                        <td className="py-2 px-2">
                          <span className={`w-3 h-3 rounded-full inline-block ${
                            message.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-right">
                <Button variant="link" size="sm" className="text-blue-600">See More...</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Set Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Arun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arun">Arun</SelectItem>
                  <SelectItem value="anusha">Anusha</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="CEO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="tl">TL</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Set
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Pending Meetings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">TL's Meeting</div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">3</div>
                  <Button size="sm" className="mt-2 text-xs px-2 py-1 h-6">View</Button>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CEO's Meeting</div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">1</div>
                  <Button size="sm" variant="outline" className="mt-2 text-xs px-2 py-1 h-6">View</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return renderTeamSection();
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Priority Distribution Cards */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Priority Distribution</h2>
              <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">
                + Add Requirements
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">HIGH</div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">10</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">MEDIUM</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">LOW</div>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">4</div>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4">
                <CardContent className="p-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">19</div>
                </CardContent>
              </Card>
            </div>

            {/* Requirements Table */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Criticality</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Team Lead</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Frontend Developer</td>
                        <td className="py-4 px-3">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">HIGH</span>
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Unassigned</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                        <td className="py-4 px-3">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">UI/UX Designer</td>
                        <td className="py-4 px-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">MEDIUM</span>
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Unassigned</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                        <td className="py-4 px-3">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Backend Developer</td>
                        <td className="py-4 px-3">
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">LOW</span>
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                        <td className="py-4 px-3">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">QA Tester</td>
                        <td className="py-4 px-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">MEDIUM</span>
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Unassigned</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Unassigned</td>
                        <td className="py-4 px-3">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Mobile App Developer</td>
                        <td className="py-4 px-3">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">HIGH</span>
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                        <td className="py-4 px-3">
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" className="btn-rounded">Archives</Button>
                  <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">View More</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'pipeline':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Pipeline Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pipeline</h2>
              <div className="flex items-center gap-4">
                <Select>
                  <SelectTrigger className="w-48 input-styled btn-rounded">
                    <SelectValue placeholder="Arun/Anusha/All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="arun">Arun</SelectItem>
                    <SelectItem value="anusha">Anusha</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Pipeline Stages */}
            <Card>
              <CardContent className="p-6">
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
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Keerthana
                          </span>
                        </td>
                      </tr>
                      
                      {/* Row 2 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Vishnu Purana
                          </span>
                        </td>
                      </tr>
                      
                      {/* Row 3 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      
                      {/* Row 4 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
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
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
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
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                            Reyansh
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
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
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                            Shaurya
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
                          <span className="inline-block w-full text-center px-3 py-2 rounded text-sm bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
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
                        <td className="py-4 px-3 text-gray-900 dark:text-white">David Wilson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Frontend Developer</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Kavitha</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">12-06-2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">12-04-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Tom Anderson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">UI/UX Designer</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Rajesh</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">ASO, 2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">18-06-2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">05-05-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Robert Kim</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Backend Developer</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Sowmya</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">28-06-2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">19-08-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Kevin Brown</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">QA Tester</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Kalaiselvi</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">FMA, 2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">03-07-2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">03-09-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-3 text-gray-900 dark:text-white">Mel Gibson</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Mobile App Developer</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">Malathi</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">NDJ, 2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">18-07-2025</td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">10-10-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'metrics':
        return (
          <div className="px-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Metrics</h2>
              <p className="text-gray-600 dark:text-gray-400">Advanced metrics and analytics will be implemented here</p>
            </div>
          </div>
        );
      case 'master-data':
        return (
          <div className="px-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Master Data</h2>
              <p className="text-gray-600 dark:text-gray-400">Master data management functionality will be implemented here</p>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Performance</h2>
              <p className="text-gray-600 dark:text-gray-400">Performance analytics and reports will be implemented here</p>
            </div>
          </div>
        );
      case 'user-management':
        return (
          <div className="px-6 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Management</h2>
              <p className="text-gray-600 dark:text-gray-400">User management and permissions will be implemented here</p>
            </div>
          </div>
        );
      default:
        return renderTeamSection();
    }
  };

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <>
            <AdminProfileHeader profile={adminProfile} onProfileUpdate={setAdminProfile} />
            <AdminTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="pb-6">
              {renderTabContent()}
            </div>
          </>
        );
      case 'job-board':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Board</h2>
              <p className="text-gray-600 dark:text-gray-400">Admin job board functionality will be implemented here</p>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Report</h2>
              <p className="text-gray-600 dark:text-gray-400">Generate and view comprehensive reports and analytics</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Admin settings and system configuration</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <AdminProfileHeader profile={adminProfile} onProfileUpdate={setAdminProfile} />
            <AdminTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="pb-6">
              {renderTabContent()}
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      <div className="flex-1 ml-64 overflow-auto">
        {renderSidebarContent()}
      </div>
    </div>
  );
}