import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/dashboard/admin-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamBoxes from '@/components/dashboard/team-boxes';
import TeamMembersSidebar from '@/components/dashboard/team-members-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CalendarIcon, EditIcon, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      { 
        name: "Sudharshan", 
        salary: "3,50,000 INR", 
        year: "2024-2025", 
        count: 10,
        id: "STTA001",
        role: "Recruitment Executive",
        email: "sudharshan@scaling.com",
        mobile: "9876543210",
        joined: "1/4/2023",
        closures: "3 this month"
      },
      { 
        name: "Deepika", 
        salary: "4,50,000 INR", 
        year: "2024-2025", 
        count: 5,
        id: "STTA002",
        role: "Senior Recruiter",
        email: "deepika@scaling.com",
        mobile: "9876543211",
        joined: "15/2/2023",
        closures: "2 this month"
      },
      { 
        name: "Dharshan", 
        salary: "1,00,000 INR", 
        year: "2024-2025", 
        count: 4,
        id: "STTA003",
        role: "Junior Recruiter",
        email: "dharshan@scaling.com",
        mobile: "9876543212",
        joined: "10/3/2023",
        closures: "1 this month"
      },
      { 
        name: "Kavya", 
        salary: "2,20,000 INR", 
        year: "2024-2025", 
        count: 2,
        id: "STTA004",
        role: "Recruitment Executive",
        email: "kavya@scaling.com",
        mobile: "9876543213",
        joined: "5/1/2023",
        closures: "4 this month"
      },
      { 
        name: "Thamarai Selvi", 
        salary: "7,50,000 INR", 
        year: "2024-2025", 
        count: 3,
        id: "STTA005",
        role: "Lead Recruiter",
        email: "thamarai@scaling.com",
        mobile: "9876543214",
        joined: "20/6/2022",
        closures: "5 this month"
      },
      { 
        name: "Karthikayan", 
        salary: "2,90,000 INR", 
        year: "2024-2025", 
        count: 2,
        id: "STTA006",
        role: "Recruitment Executive",
        email: "karthik@scaling.com",
        mobile: "9876543215",
        joined: "12/5/2023",
        closures: "2 this month"
      }
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
      { 
        name: "Sudharshan", 
        salary: "3,50,000 INR", 
        year: "2024-2025", 
        count: 10,
        id: "STTA007",
        role: "Recruitment Executive",
        email: "sudharshan2@scaling.com",
        mobile: "9876543216",
        joined: "1/4/2023",
        closures: "3 this month"
      },
      { 
        name: "Deepika", 
        salary: "4,50,000 INR", 
        year: "2024-2025", 
        count: 5,
        id: "STTA008",
        role: "Senior Recruiter",
        email: "deepika2@scaling.com",
        mobile: "9876543217",
        joined: "15/2/2023",
        closures: "2 this month"
      },
      { 
        name: "Dharshan", 
        salary: "1,00,000 INR", 
        year: "2024-2025", 
        count: 4,
        id: "STTA009",
        role: "Junior Recruiter",
        email: "dharshan2@scaling.com",
        mobile: "9876543218",
        joined: "10/3/2023",
        closures: "1 this month"
      },
      { 
        name: "Kavya", 
        salary: "2,20,000 INR", 
        year: "2024-2025", 
        count: 2,
        id: "STTA010",
        role: "Recruitment Executive",
        email: "kavya2@scaling.com",
        mobile: "9876543219",
        joined: "5/1/2023",
        closures: "4 this month"
      },
      { 
        name: "Thamarai Selvi", 
        salary: "7,50,000 INR", 
        year: "2024-2025", 
        count: 3,
        id: "STTA011",
        role: "Lead Recruiter",
        email: "thamarai2@scaling.com",
        mobile: "9876543220",
        joined: "20/6/2022",
        closures: "5 this month"
      },
      { 
        name: "Karthikayan", 
        salary: "2,90,000 INR", 
        year: "2024-2025", 
        count: 2,
        id: "STTA012",
        role: "Recruitment Executive",
        email: "karthik2@scaling.com",
        mobile: "9876543221",
        joined: "12/5/2023",
        closures: "2 this month"
      }
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
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

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
    <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
      {/* Use the new TeamBoxes component - this replaces all the old team display logic */}
      <TeamBoxes />

      {/* Target & Incentives Section */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardHeader className="pb-1 pt-1 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-white">Target & Incentives</CardTitle>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm text-xs px-2 py-1">
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Resource</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Target</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Target Achieved</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Closures</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Incentives</th>
                </tr>
              </thead>
              <tbody>
                {targetsData.map((target, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-white font-medium">{target.resource}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.role}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.quarter}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.minimumTarget}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.targetAchieved}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.closures}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{target.incentives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Metrics Section */}
      <Card className="bg-teal-50 dark:bg-teal-900/30">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-2">
          <CardTitle className="text-lg text-gray-900 dark:text-white">Daily Metrics</CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue="overall">
              <SelectTrigger className="w-20 h-7 text-xs">
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
                <Button variant="outline" size="sm" className="flex items-center space-x-1 h-7 px-2">
                  <CalendarIcon className="h-3 w-3" />
                  <span className="text-xs">{format(selectedDate, "dd-MMM-yyyy")}</span>
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
        
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-4">
            {/* Left side - Metrics with teal background */}
            <div className="bg-teal-100 dark:bg-teal-800/50 rounded p-3 space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Requirements</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.totalRequirements}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Resumes per Requirement</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.avgResumesPerRequirement}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements per Recruiter</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.requirementsPerRecruiter}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Requirements</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.completedRequirements}</span>
              </div>
            </div>
            
            {/* Center - Daily Delivery */}
            <div className="bg-slate-800 dark:bg-slate-900 rounded p-4 text-white">
              <h3 className="text-lg font-semibold text-center mb-4">Daily Delivery</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">Delivered</p>
                  <p className="text-4xl font-bold mb-3">
                    {dailyMetricsData.dailyDeliveryDelivered}
                  </p>
                  <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 text-xs rounded-sm">
                    View
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">Defaulted</p>
                  <p className="text-4xl font-bold mb-3">
                    {dailyMetricsData.dailyDeliveryDefaulted}
                  </p>
                  <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 text-xs rounded-sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right side - Overall Performance */}
            <div className="bg-white dark:bg-gray-900 rounded p-4">
              <div className="text-left">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Performance</h3>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 w-16 h-16 rounded-sm flex items-center justify-center">
                    {dailyMetricsData.overallPerformance}
                  </div>
                </div>
                <div className="flex justify-start space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Something</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Romania</span>
                  </div>
                </div>
                <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded mt-2 flex items-center justify-center">
                  <img src="/src/assets/sample-graph.png" alt="Performance Chart" className="h-full w-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages and Meetings Section */}
      <div className="grid grid-cols-2 gap-3 h-fit">
        {/* Message Status */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader className="pb-1 pt-2">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Message Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white dark:bg-gray-900 rounded">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="text-left py-2 px-3 text-sm font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Message</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Date</th>
                    <th className="text-left py-2 px-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messagesData.map((message, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">{message.name}</td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{message.message}</td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{message.date}</td>
                      <td className="py-2 px-3">
                        <span className={`w-3 h-3 rounded-full inline-block ${
                          message.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Meetings */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader className="pb-1 pt-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900 dark:text-white">Pending Meetings</CardTitle>
            <Button variant="link" size="sm" className="text-blue-600 text-xs rounded-sm">View More</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 text-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TL's Meeting</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">3</div>
                <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 text-xs rounded-none">
                  View
                </Button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 text-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CEO's Meeting</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">1</div>
                <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 text-xs rounded-none">
                  View
                </Button>
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
            {/* Header with Requirements title and Add Requirements button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Requirements</h2>
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-4 py-2 rounded">
                + Add Requirements
              </Button>
            </div>
            
            <div className="flex gap-6">
              {/* Left Side - Requirements Table */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Criticality</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">SPOC</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Team Lead</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">UI/UX Designer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">UI/UX Designer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
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
                  
                  <div className="flex justify-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" className="px-6 py-2 rounded bg-red-100 hover:bg-red-200 text-red-800 border-red-200">
                      Archives
                    </Button>
                    <Button className="px-6 py-2 rounded bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
                      View More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - Priority Distribution */}
              <div className="w-72">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Priority Distribution</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">H</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">IGH</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">15</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">M</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">EDIUM</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">9</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-6xl font-bold text-gray-600 dark:text-gray-400 mb-2">L</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OW</div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">3</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">T</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OTAL</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">27</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <SelectValue placeholder="Arun/Anusha /All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="arun">Arun</SelectItem>
                    <SelectItem value="anusha">Anusha</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  12-Aug-2025
                </div>
              </div>
            </div>

            {/* New Pipeline Design */}
            <div className="flex gap-6">
              {/* Left Side - Pipeline Stages */}
              <div className="flex-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Level 1</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Level 2</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Level 3</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Final Round</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">HR Round</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Offer Stage</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 w-32">Closure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row 1 */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#D9F0E1'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#C2EED0'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#B5E1C1'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#99D9AE'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#7CCBA0'}}>
                                Keerthana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#2F6F52'}}>
                                Keerthana
                              </span>
                            </td>
                          </tr>
                          
                          {/* Row 2 */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#D9F0E1'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#C2EED0'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#B5E1C1'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#99D9AE'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#7CCBA0'}}>
                                Vishnu Purana
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#2F6F52'}}>
                                Vishnu Purana
                              </span>
                            </td>
                          </tr>
                          
                          {/* Row 3 */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Chanakya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#D9F0E1'}}>
                                Chanakya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#C2EED0'}}>
                                Chanakya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#B5E1C1'}}>
                                Chanakya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-white" style={{backgroundColor: '#99D9AE'}}>
                                Chanakya
                              </span>
                            </td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                          </tr>
                          
                          {/* Row 4 */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Adhya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#D9F0E1'}}>
                                Adhya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#C2EED0'}}>
                                Adhya
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#B5E1C1'}}>
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
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Vanshika
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#D9F0E1'}}>
                                Vanshika
                              </span>
                            </td>
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#C2EED0'}}>
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
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
                                Reyansh
                              </span>
                            </td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                            <td className="p-3 w-32"></td>
                          </tr>
                          
                          {/* Row 7 */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-3 w-32">
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
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
                              <span className="inline-block w-full text-center px-3 py-2 rounded text-sm text-black" style={{backgroundColor: '#E6F4EA'}}>
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
              </div>

              {/* Right Side - Statistics Panel */}
              <div className="w-64">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* REJECTED */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#E6F4EA'}}>
                        <span className="font-semibold text-black">R</span>
                        <span className="text-sm text-black">EJECTED</span>
                        <span className="font-bold text-lg text-black">9</span>
                      </div>
                      
                      {/* SHORTLISTED */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#D9F0E1'}}>
                        <span className="font-semibold text-black">S</span>
                        <span className="text-sm text-black">HORTLISTED</span>
                        <span className="font-bold text-lg text-black">3</span>
                      </div>
                      
                      {/* INTEGRAL */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#C2EED0'}}>
                        <span className="font-semibold text-black">I</span>
                        <span className="text-sm text-black">NTEGRAL</span>
                        <span className="font-bold text-lg text-black">9</span>
                      </div>
                      
                      {/* ASSIGNMENT */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#B5E1C1'}}>
                        <span className="font-semibold text-black">A</span>
                        <span className="text-sm text-black">SSIGNMENT</span>
                        <span className="font-bold text-lg text-black">15</span>
                      </div>
                      
                      {/* L1 */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#99D9AE'}}>
                        <span className="font-semibold text-white">L1</span>
                        <span className="text-sm text-white"></span>
                        <span className="font-bold text-lg text-white">9</span>
                      </div>
                      
                      {/* L2 */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#7CCBA0'}}>
                        <span className="font-semibold text-white">L2</span>
                        <span className="text-sm text-white"></span>
                        <span className="font-bold text-lg text-white">3</span>
                      </div>
                      
                      {/* L3 */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#6BB68C'}}>
                        <span className="font-semibold text-white">L3</span>
                        <span className="text-sm text-white"></span>
                        <span className="font-bold text-lg text-white">9</span>
                      </div>
                      
                      {/* FINAL ROUND */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#56A87D'}}>
                        <span className="font-semibold text-white">F</span>
                        <span className="text-sm text-white">INAL ROUND</span>
                        <span className="font-bold text-lg text-white">9</span>
                      </div>
                      
                      {/* HR ROUND */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#479E72'}}>
                        <span className="font-semibold text-white">H</span>
                        <span className="text-sm text-white">R ROUND</span>
                        <span className="font-bold text-lg text-white">9</span>
                      </div>
                      
                      {/* OFFER STAGE */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#3F8E66'}}>
                        <span className="font-semibold text-white">O</span>
                        <span className="text-sm text-white">FFER STAGE</span>
                        <span className="font-bold text-lg text-white">3</span>
                      </div>
                      
                      {/* CLOSURE */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#2F6F52'}}>
                        <span className="font-semibold text-white">C</span>
                        <span className="text-sm text-white">LOSURE</span>
                        <span className="font-bold text-lg text-white">3</span>
                      </div>
                      
                      {/* OFFER DROP */}
                      <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#C59445'}}>
                        <span className="font-semibold text-white">O</span>
                        <span className="text-sm text-white">FFER DROP</span>
                        <span className="font-bold text-lg text-white">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Closure Reports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Closure Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
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
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">David Wilson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Frontend Developer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-06-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-04-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Tom Anderson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">UI/UX Designer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Rajesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">ASO, 2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">18-06-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">05-05-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Robert Kim</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Backend Developer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sowmya</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">MLJ, 2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">28-06-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">19-08-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Kevin Brown</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">QA Tester</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kalaiselvi</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">FMA, 2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">03-07-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">03-09-2025</td>
                      </tr>
                      
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mel Gibson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mobile App Developer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Malathi</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">NDJ, 2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">18-07-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">10-10-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="link" className="text-blue-600 hover:text-blue-700">
                    See More...
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'metrics':
        return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Metrics</h1>
          </div>
        );
      case 'master-data':
        return (
          <div className="px-6 py-6 space-y-8">
            {/* Resume Database */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resume Database</CardTitle>
                <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">View Full Database</Button>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2 font-semibold">TOTAL RESUMES</div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">50,000</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">DIRECT UPLOADS</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5,000</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">RECRUITER UPLOAD</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50,000</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resume Database Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Employee ID</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Total Applicants</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Uploads</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">500</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">1000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">220</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">850</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vignesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">600</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">1200</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Saran</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">780</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">1000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Helen</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">50</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">800</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">View More</Button>
                </div>
              </CardContent>
            </Card>

            {/* Employees Master */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employees Master</CardTitle>
                <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Employee</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Employee ID</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Father's Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Employee Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Date of Joining</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Current CTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Intern</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-08-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">10,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Permanent</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">10-07-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">15,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vignesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Probation</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">22-10-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Saran</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Probation</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">02-11-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">9,500</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Helen</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Permanent</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-12-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">14,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">View More</Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Master */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Master</CardTitle>
                <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Client</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Client Code</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Brand Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">SPOC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Website</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STCL001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Whatfix</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Bangalore</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">www.whatfix.com</td>
                        <td className="py-3 px-3">
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STCL002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kombal</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Chennai</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">www.kombal.com</td>
                        <td className="py-3 px-3">
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STCL003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vertas</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Gurgaon</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">www.vertas.com</td>
                        <td className="py-3 px-3">
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STCL004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">SuperHire</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Pune</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">www.superhire.com</td>
                        <td className="py-3 px-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">• FROZEN</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STCL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Hitchcock</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mumbai</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">www.hitchcock.com</td>
                        <td className="py-3 px-3">
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">• CHURNED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">View More</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Empty performance page as requested */}
          </div>
        );
      case 'user-management':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* User Management Header */}
            <div className="flex gap-4 mb-6">
              <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Recruiter</Button>
              <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white">+ Add Team Leader</Button>
            </div>

            {/* User Management Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Last Login</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">raj@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavi@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vignesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">vignesh@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Saran</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">saran@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Helen</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">helen@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Online Activity Section */}
            <div className="grid grid-cols-2 gap-6 max-w-md">
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Online Activity</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Online</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">3</div>
                      <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white text-sm mt-2">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 dark:bg-yellow-900/20 text-center">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Offline</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">1</div>
                      <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white text-sm mt-2">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'profile-details':
        return (
          <div className="px-6 py-6 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Details</h2>
              <p className="text-gray-600 dark:text-gray-400">Your profile details are shown in the header above.</p>
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
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Header with Requirements title and Add Requirements button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Requirements</h2>
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-4 py-2 rounded">
                + Add Requirements
              </Button>
            </div>
            
            <div className="flex gap-6">
              {/* Left Side - Requirements Table */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Criticality</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">SPOC</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Team Lead</th>
                          <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">UI/UX Designer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">UI/UX Designer</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">MEDIUM</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AppLogic</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Mobile App Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Designify</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Backend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tesco</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">Frontend Developer</td>
                          <td className="py-3 px-3">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">HIGH</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">CodeLabs</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-3">
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">QA Tester</td>
                          <td className="py-3 px-3">
                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded">LOW</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">TechCorp</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-3 text-cyan-500 dark:text-cyan-400">Unassigned</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-3">
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
                  
                  <div className="flex justify-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" className="px-6 py-2 rounded bg-red-100 hover:bg-red-200 text-red-800 border-red-200">
                      Archives
                    </Button>
                    <Button className="px-6 py-2 rounded bg-cyan-400 hover:bg-cyan-500 text-black font-medium">
                      View More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - Priority Distribution */}
              <div className="w-72">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Priority Distribution</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">H</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">IGH</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">15</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">M</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">EDIUM</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">9</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-6xl font-bold text-gray-600 dark:text-gray-400 mb-2">L</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OW</div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">3</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">T</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OTAL</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">27</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="flex h-full">
            {/* Main Pipeline Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 space-y-6">
                {/* Pipeline Header */}
                <div className="flex justify-between items-center mb-6">
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

                {/* Pipeline Stages - matching image 1 design */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
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
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
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
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm">
                          See More...
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Sidebar with Stats - matching image 2 */}
            <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto">
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
      case 'master-data':
        return (
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
              {/* Resume Database */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Resume Database</CardTitle>
                  <div className="flex gap-2">
                    <Button className="btn-rounded bg-purple-600 hover:bg-purple-700 text-white text-sm px-4">
                      View Full Database
                    </Button>
                    <Button className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white text-sm px-4">
                      + Add Client
                    </Button>
                    <Button className="btn-rounded bg-green-600 hover:bg-green-700 text-white text-sm px-4">
                      + Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Team</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Total Applicants</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Uploads</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA001</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">500</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">1000</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA002</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">kavitha</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">220</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">850</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA003</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Vignesh</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Arun</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">600</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">1200</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA004</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Saran</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">780</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">1000</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTL005</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Helen</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Anusha</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">50</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">900</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Employees Master */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Employees Master</CardTitle>
                  <Button className="btn-rounded bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-sm px-4">
                    View More
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date of Joining</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Current CTC</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA001</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Intern</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">12-05-2025</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">10,000</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA002</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">kavitha</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Permanent</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">10-07-2025</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">15,000</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA003</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Vignesh</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Probation</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">22-10-2025</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">12,000</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTA004</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Saran</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Probation</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">02-11-2025</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">9,500</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STTL005</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Helen</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Permanent</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">12-12-2025</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">14,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Client Master */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Client Master</CardTitle>
                  <Button className="btn-rounded bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-sm px-4">
                    View More
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Client Code</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">SPOC</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Website</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STCL001</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">WhatsIQ</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Bangalore</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">David Wilson</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400">www.whatsiq.com</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STCL002</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Kombat</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Chennai</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400">www.kombat.com</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STCL003</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Vertas</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Gurgaon</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Robert Kim</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400">www.vertas.com</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">• ACTIVE</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STCL004</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Superlike</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Pune</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400">www.superlike.com</td>
                          <td className="py-3 px-4">
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">• FROZEN</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">STCL005</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Hitchcock</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Mumbai</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400">www.hitchcock.com</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">• CHURNED</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Panel */}
            <div className="w-80 bg-blue-50 dark:bg-blue-900/20 border-l border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Totals</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">DIRECT UPLOADS</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">5,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RECRUITER UPLOADS</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RESUMES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">55,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">HEAD COUNT</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SALARY PAID</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">65,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OTHER EXPENSES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">65,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">TOOLS & DATABASES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">65,000</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RENT PAID</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">65,000</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-full">
            <div className="flex gap-6">
              {/* Left Side - Key Metrics and Cash Outflow */}
              <div className="flex-1 space-y-6">
                {/* Key Metrics Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</CardTitle>
                    <div className="flex gap-4 mt-4">
                      <Select>
                        <SelectTrigger className="w-48 input-styled rounded">
                          <SelectValue placeholder="Client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client1">Client 1</SelectItem>
                          <SelectItem value="client2">Client 2</SelectItem>
                          <SelectItem value="all">All Clients</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select>
                        <SelectTrigger className="w-48 input-styled rounded">
                          <SelectValue placeholder="Monthly" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: 'Jan', revenue: 45000, growth: 38000, profit: 25000, clients: 15000 },
                            { name: 'Feb', revenue: 35000, growth: 28000, profit: 18000, clients: 12000 },
                            { name: 'Mar', revenue: 55000, growth: 45000, profit: 32000, clients: 22000 },
                            { name: 'Apr', revenue: 48000, growth: 42000, profit: 28000, clients: 18000 },
                            { name: 'May', revenue: 65000, growth: 52000, profit: 38000, clients: 28000 },
                            { name: 'Jun', revenue: 58000, growth: 48000, profit: 35000, clients: 25000 },
                            { name: 'Jul', revenue: 70000, growth: 58000, profit: 42000, clients: 32000 },
                            { name: 'Aug', revenue: 75000, growth: 62000, profit: 45000, clients: 35000 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="growth" stroke="#82ca9d" strokeWidth={2} />
                          <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={2} />
                          <Line type="monotone" dataKey="clients" stroke="#ff7c7c" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded">
                        Show Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Outflow Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Cash Outflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Input Form */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                        <Input placeholder="Month" className="input-styled rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                        <Input placeholder="Year" className="input-styled rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Employees</label>
                        <Input placeholder="Number of Employees" className="input-styled rounded" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Salary</label>
                        <Input placeholder="Total Salary" className="input-styled rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incentive</label>
                        <Input placeholder="Incentive" className="input-styled rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database & Tools cost</label>
                        <Input placeholder="Database & Tools cost" className="input-styled rounded" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent</label>
                        <Input placeholder="Rent" className="input-styled rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Other Expenses</label>
                        <Input placeholder="Other Expenses" className="input-styled rounded" />
                      </div>
                      <div className="flex items-end">
                        <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded w-full">
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Month</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Year</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employees Count</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Total Salary</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Incentives</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tools Cost</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Rent</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Others Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">January</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2025</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">45</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">3,50,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">20,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">30,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">March</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2025</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">19</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2,40,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">15,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">10,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">August</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2025</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">45</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">4,00,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">30,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">30,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">September</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2025</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">39</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">4,35,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">32,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">32,500</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,500</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,500</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">November</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2025</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">37</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">5,00,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">35,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">35,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">25,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded">
                        View More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Key Aspects */}
              <div className="w-80">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Key Aspects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Growth Metrics */}
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                        <div className="text-xs text-teal-600 dark:text-teal-400 mb-1">GROWTH</div>
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">15%</div>
                      </div>
                      
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                        <div className="text-xs text-teal-600 dark:text-teal-400 mb-1">GROWTH</div>
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">9%</div>
                      </div>
                      
                      {/* Burn Rate */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">BURN <span className="text-xs">RATE</span></div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">3%</div>
                      </div>
                      
                      {/* Churn Rate */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">CHURN <span className="text-xs">RATE</span></div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">9%</div>
                      </div>
                      
                      {/* Attrition */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ATTRITION</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">3%</div>
                      </div>
                      
                      {/* Net Profit */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">NET PROFIT</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-300">2,50,000</div>
                      </div>
                      
                      {/* Revenue */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-xs text-green-600 dark:text-green-400 mb-1">REVENUE <span className="text-xs">PER EMPLOYEE</span></div>
                        <div className="text-xl font-bold text-green-900 dark:text-green-300">75,000</div>
                      </div>
                      
                      {/* Client */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">CLIENT <span className="text-xs">ACQUISITION COST</span></div>
                        <div className="text-xl font-bold text-orange-900 dark:text-orange-300">75,000</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'user-management':
        return (
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">+ Add Recruiter</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">+ Add Team Leader</Button>
              </div>

              {/* User Management Table */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Last Login</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">raj@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavi@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vignesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">vignesh@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Saran</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">saran@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Helen</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">helen@gmail.com</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Team Leader</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Active</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">N/A</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Online Activity */}
            <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Online Activity</h3>
              
              <div className="space-y-4">
                <div className="bg-cyan-400 dark:bg-cyan-500 p-6 rounded-lg text-center">
                  <div className="text-sm font-medium text-white mb-2">Online</div>
                  <div className="text-4xl font-bold text-white">3</div>
                </div>
                
                <div className="bg-pink-400 dark:bg-pink-500 p-6 rounded-lg text-center">
                  <div className="text-sm font-medium text-white mb-2">Offline</div>
                  <div className="text-4xl font-bold text-white">1</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-full">
            {/* Teams Section */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teams</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Select>
                    <SelectTrigger className="w-60 input-styled rounded">
                      <SelectValue placeholder="Target and Incentives" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="target-incentives">Target and Incentives</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="metrics">Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded input-styled px-3">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8 py-2 rounded ml-4">
                  Download
                </Button>
              </div>
              
              {/* Report Type Checkboxes */}
              <div className="grid grid-cols-4 gap-6 mb-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Requirements</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pipeline</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Closure Reports</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Team Performance</span>
                </label>
              </div>
              
              {/* Second Row of Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arun">Arun's Team</SelectItem>
                      <SelectItem value="anusha">Anusha's Team</SelectItem>
                      <SelectItem value="all">All Teams</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="non-technical">Non-Technical</SelectItem>
                      <SelectItem value="all">All Types</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded input-styled px-3">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8 py-2 rounded ml-4">
                  Download
                </Button>
              </div>
            </div>
            
            {/* General Section */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select>
                    <SelectTrigger className="w-60 input-styled rounded">
                      <SelectValue placeholder="Employee Master" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee-master">Employee Master</SelectItem>
                      <SelectItem value="client-master">Client Master</SelectItem>
                      <SelectItem value="resume-database">Resume Database</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 input-styled rounded">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded input-styled px-3">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8 py-2 rounded ml-4">
                  Download
                </Button>
              </div>
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Metrics</h1>
          </div>
        );
      default:
        return renderTeamSection();
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminTopHeader userName="Sasi Kumar" companyName="Gumlat Marketing Private Limited" />
      <div className="flex flex-1">
        <AdminSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 ml-16 flex flex-col overflow-hidden" style={{height: 'calc(100vh - 4rem)'}}>
          {renderSidebarContent()}
        </div>
        {sidebarTab === 'dashboard' && <TeamMembersSidebar />}
      </div>

      {/* Recruiter Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Recruiter Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="p-6 space-y-4">
              {/* Header with name and ID */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    R. {selectedMember.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedMember.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {selectedMember.id}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Email:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.email}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Mobile:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.mobile}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Joined:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.joined}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Closures:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{selectedMember.closures}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleEmailClick(selectedMember.email)}
                  className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1"
                >
                  <Mail size={16} />
                  Email
                </Button>
                <Button
                  onClick={() => handleCallClick(selectedMember.mobile)}
                  className="btn-rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1"
                >
                  <Phone size={16} />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}