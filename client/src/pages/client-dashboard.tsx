import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Pause, User, MapPin, HandHeart, Upload, Edit3, MessageSquare, Minus, Users, Play, Trophy, ArrowLeft, Send, Calendar as CalendarIcon, MoreVertical, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import SimpleClientHeader from '@/components/dashboard/simple-client-header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChatDock } from '@/components/chat/chat-dock';
import { useQuery } from '@tanstack/react-query';

interface ChatUser {
  id: number;
  name: string;
  requirements: number;
  closures: number;
  avatar: string;
  status: string;
}

export default function ClientDashboard() {
  const { toast } = useToast();
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [tempJdText, setTempJdText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCandidate, setSelectedCandidate] = useState<{name: string, stage: string} | null>(null);
  const [candidatePopupPosition, setCandidatePopupPosition] = useState<{x: number, y: number} | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);

  // Fetch metrics data from API - hooks must be at top level
  const { data: speedMetricsData } = useQuery({
    queryKey: ['/api/client/speed-metrics'],
    initialData: {
      timeToFirstSubmission: 0,
      timeToInterview: 0,
      timeToOffer: 0,
      timeToFill: 0
    }
  });

  const { data: qualityMetricsData } = useQuery({
    queryKey: ['/api/client/quality-metrics'],
    initialData: {
      submissionToShortList: 0,
      interviewToOffer: 0,
      offerAcceptance: 0,
      earlyAttrition: 0
    }
  });

  const { data: impactMetrics } = useQuery({
    queryKey: ['/api/admin/impact-metrics'],
    initialData: [{
      speedToHire: 0,
      revenueImpactOfDelay: 0,
      clientNps: 0,
      candidateNps: 0,
      feedbackTurnAround: 0,
      firstYearRetentionRate: 0,
      fulfillmentRate: 0,
      revenueRecovered: 0
    }]
  });

  const { data: speedChartData } = useQuery({
    queryKey: ['/api/client/speed-metrics-chart'],
    initialData: [
      { month: 'Jan', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Feb', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Mar', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Apr', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'May', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Jun', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 }
    ]
  });

  const { data: qualityChartData } = useQuery({
    queryKey: ['/api/client/quality-metrics-chart'],
    initialData: [
      { month: 'Jan', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Feb', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Mar', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Apr', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'May', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Jun', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 }
    ]
  });

  const firstImpactMetrics = impactMetrics[0] || impactMetrics;

  // Sample data for the dashboard
  const dashboardStats = {
    rolesAssigned: 15,
    totalPositions: 6,
    activeRoles: 5,
    successfulHires: 3,
    pausedRoles: 1,
    withdrawnRoles: 1
  };

  // Recent chats data
  const recentChats: ChatUser[] = [
    {
      id: 1,
      name: 'Deepika',
      requirements: 5,
      closures: 6,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    },
    {
      id: 2,
      name: 'Priyanka',
      requirements: 7,
      closures: 12,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    },
    {
      id: 3,
      name: 'Thamarai Selvi',
      requirements: 3,
      closures: 7,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    }
  ];

  const allRolesData = [
    {
      roleId: 'STCL12JD13',
      role: 'Full Stack Engineer',
      team: 'Arun',
      recruiter: 'Umar',
      sharedOn: '12-10-2025',
      status: 'Active',
      profilesShared: 6,
      lastActive: '12-09-2025'
    },
    {
      roleId: 'STCL12JD14',
      role: 'Data Scientist',
      team: 'Anusha',
      recruiter: 'Keerthana',
      sharedOn: '18-11-2025',
      status: 'Paused',
      profilesShared: 3,
      lastActive: '14-10-2025'
    },
    {
      roleId: 'STCL12JD15',
      role: 'Frontend Developer',
      team: 'Arun',
      recruiter: 'Priya',
      sharedOn: '15-11-2025',
      status: 'Active',
      profilesShared: 8,
      lastActive: '16-11-2025'
    },
    {
      roleId: 'STCL12JD16',
      role: 'DevOps Engineer',
      team: 'Anusha',
      recruiter: 'Raj',
      sharedOn: '20-11-2025',
      status: 'Withdrawn',
      profilesShared: 2,
      lastActive: '21-11-2025'
    },
    {
      roleId: 'STCL12JD17',
      role: 'UI/UX Designer',
      team: 'Arun',
      recruiter: 'Maya',
      sharedOn: '22-11-2025',
      status: 'Active',
      profilesShared: 4,
      lastActive: '23-11-2025'
    },
    {
      roleId: 'STCL12JD18',
      role: 'Backend Developer',
      team: 'Anusha',
      recruiter: 'Kiran',
      sharedOn: '25-11-2025',
      status: 'Paused',
      profilesShared: 5,
      lastActive: '26-11-2025'
    }
  ];

  // Only show top 2 roles in dashboard
  const rolesData = allRolesData.slice(0, 2);

  // Extended closure reports data for modal
  const allClosureReports = [
    { candidate: 'David Wilson', position: 'Frontend Developer', advisor: 'Kavitha', offered: '11-05-2023', joined: '10-10-2023' },
    { candidate: 'Tom Anderson', position: 'UI/UX Designer', advisor: 'Rajesh', offered: '18-05-2023', joined: '12-10-2023' },
    { candidate: 'Robert Kim', position: 'Backend Developer', advisor: 'Sowmiya', offered: '04-06-2023', joined: '25-10-2023' },
    { candidate: 'Kevin Brown', position: 'QA Tester', advisor: 'Kalaiselvi', offered: '16-06-2023', joined: '30-10-2023' },
    { candidate: 'Mel Gibson', position: 'Mobile App Developer', advisor: 'Malathi', offered: '08-07-2023', joined: '05-11-2023' },
    { candidate: 'Sarah Johnson', position: 'DevOps Engineer', advisor: 'Priya', offered: '15-07-2023', joined: '10-11-2023' },
    { candidate: 'Michael Chen', position: 'Data Analyst', advisor: 'Arun', offered: '22-07-2023', joined: '15-11-2023' },
    { candidate: 'Emma Davis', position: 'Product Manager', advisor: 'Suresh', offered: '28-07-2023', joined: '20-11-2023' },
    { candidate: 'James Thompson', position: 'Tech Lead', advisor: 'Deepa', offered: '05-08-2023', joined: '25-11-2023' },
    { candidate: 'Lisa Wong', position: 'Security Engineer', advisor: 'Kumar', offered: '12-08-2023', joined: '30-11-2023' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'Withdrawn':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderMainContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <div className="h-full overflow-y-auto">
            {/* Simple Client Header */}
            <SimpleClientHeader 
              companyName="Gumlet Marketing Private Limited"
              onHelpClick={() => setIsHelpChatOpen(true)}
            />
            
            <div className="px-6 py-6 space-y-6">
              {/* Stats Cards - Dark Blue Theme */}
              <div className="bg-slate-700 rounded-lg p-6">
                <div className="grid grid-cols-6 gap-6 text-white">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Briefcase className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Roles Assigned</div>
                    <div className="text-2xl font-bold">{dashboardStats.rolesAssigned}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Total Positions</div>
                    <div className="text-2xl font-bold">{dashboardStats.totalPositions}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Play className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Active Roles</div>
                    <div className="text-2xl font-bold">{dashboardStats.activeRoles}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-green-300" />
                    </div>
                    <div className="text-sm font-medium mb-1 text-green-300">Successful Hires</div>
                    <div className="text-2xl font-bold text-green-300">{dashboardStats.successfulHires}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Pause className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Paused Roles</div>
                    <div className="text-2xl font-bold">{dashboardStats.pausedRoles}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Minus className="h-8 w-8 text-orange-300" />
                    </div>
                    <div className="text-sm font-medium mb-1 text-orange-300">Withdrawn Roles</div>
                    <div className="text-2xl font-bold text-orange-300">{dashboardStats.withdrawnRoles}</div>
                  </div>
                </div>
              </div>

              {/* Roles & Status Table */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Roles & Status</h3>
                  <button 
                    onClick={() => setIsRolesModalOpen(true)}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shared on</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles Shared</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rolesData.map((role, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.team}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.recruiter}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.sharedOn}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                              {role.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{role.profilesShared}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JD Upload Section */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">JD Upload</h3>
                  <span className="text-red-500 text-sm">●</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Drag & Drop Upload - Minimized */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32 flex flex-col justify-center">
                        {uploadedFile ? (
                          <>
                            <div className="mb-2">
                              <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <p className="text-green-600 text-sm font-medium mb-1">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">File uploaded successfully</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedFile(null);
                              }}
                              className="text-xs text-red-500 hover:underline mt-1"
                            >
                              Remove file
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="mb-2">
                              <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Upload className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Drag & Drop A file here or Click to Browse</p>
                            <p className="text-xs text-gray-500 mb-1">Supported PDF,Docx</p>
                            <p className="text-xs text-gray-500">Max File Size 5MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Copy & Paste - Minimized */}
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setTempJdText(jdText);
                          setIsJdModalOpen(true);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded p-4 text-center h-32 flex flex-col justify-center hover:border-gray-400 transition-colors cursor-pointer"
                      >
                        {jdText ? (
                          <>
                            <div className="mb-2">
                              <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Edit3 className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <p className="text-green-600 text-sm font-medium mb-1">JD Content Added</p>
                            <p className="text-xs text-gray-500">Click to edit content</p>
                          </>
                        ) : (
                          <>
                            <div className="mb-2">
                              <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Edit3 className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Copy & Paste Or Write Your Own JD</p>
                            <p className="text-xs text-gray-500 mt-1">Click to open editor</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skills</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Skills</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Only</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <Input 
                      placeholder="" 
                      className="bg-white border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Preview & Submit Button */}
                  <div className="flex justify-end">
                    <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-8 py-2 rounded">
                      Preview & Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'requirements':
        return (
          <div className="flex flex-col h-full">
            {/* Simple Client Header */}
            <SimpleClientHeader 
              companyName="Gumlet Marketing Private Limited"
              onHelpClick={() => setIsHelpChatOpen(true)}
            />
            <div className="flex flex-1 overflow-hidden">
            {/* Main Pipeline Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 space-y-6">
                {/* Pipeline Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Pipeline</h2>
                  <div className="flex items-center gap-4">
                    <Select>
                      <SelectTrigger className="w-48 rounded">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="active">Active Roles</SelectItem>
                        <SelectItem value="paused">Paused Roles</SelectItem>
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="rounded">
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
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Level 1</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Level 2</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Level 3</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Final Round</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">HR Round</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Offer Stage</th>
                            <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[140px]">Closure</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana', 'Chanakya', 'Adhya', 'Vanshika', 'Reyansh', 'Shaurya', 'Vihana'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Level 1')}
                                    className="px-3 py-2 bg-green-200 rounded text-center text-sm font-medium text-gray-800 cursor-pointer hover:bg-green-300 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-50" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana', 'Chanakya', 'Adhya', 'Vanshika'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Level 2')}
                                    className="px-3 py-2 bg-green-300 rounded text-center text-sm font-medium text-gray-800 cursor-pointer hover:bg-green-400 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-50" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana', 'Chanakya', 'Adhya', 'Vanshika'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Level 3')}
                                    className="px-3 py-2 bg-green-400 rounded text-center text-sm font-medium text-gray-800 cursor-pointer hover:bg-green-500 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-50" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana', 'Chanakya', 'Adhya'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Final Round')}
                                    className="px-3 py-2 bg-green-500 rounded text-center text-sm font-medium text-white cursor-pointer hover:bg-green-600 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-70" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana', 'Chanakya'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'HR Round')}
                                    className="px-3 py-2 bg-green-600 rounded text-center text-sm font-medium text-white cursor-pointer hover:bg-green-700 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-70" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Offer Stage')}
                                    className="px-3 py-2 bg-green-700 rounded text-center text-sm font-medium text-white cursor-pointer hover:bg-green-800 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-70" />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                {['Keerthana', 'Vishnu Purana'].map((name, index) => (
                                  <div 
                                    key={index}
                                    onClick={(e) => handleCandidateClick(e, name, 'Closure')}
                                    className="px-3 py-2 bg-green-800 rounded text-center text-sm font-medium text-white cursor-pointer hover:bg-green-900 transition-colors relative"
                                  >
                                    {name}
                                    <MoreVertical className="h-3 w-3 absolute top-1 right-1 opacity-70" />
                                  </div>
                                ))}
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
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-gray-900">Closure report</CardTitle>
                      <button 
                        onClick={() => setIsClosureModalOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="text-left p-3 font-medium text-gray-700 text-sm">Candidate</th>
                            <th className="text-left p-3 font-medium text-gray-700 text-sm">Positions</th>
                            <th className="text-left p-3 font-medium text-gray-700 text-sm">Talent Advisor</th>
                            <th className="text-left p-3 font-medium text-gray-700 text-sm">Offered Date</th>
                            <th className="text-left p-3 font-medium text-gray-700 text-sm">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allClosureReports.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3 text-gray-900">{row.candidate}</td>
                              <td className="p-3 text-gray-600">{row.position}</td>
                              <td className="p-3 text-gray-600">{row.advisor}</td>
                              <td className="p-3 text-gray-600">{row.offered}</td>
                              <td className="p-3 text-gray-600">{row.joined}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Sidebar with Stats */}
            <div className="w-64 bg-white border-l border-gray-200">
              <div className="p-4 space-y-1">
                {[
                  { label: 'SOURCED', count: 15, color: 'bg-green-100' },
                  { label: 'SHORTLISTED', count: 9, color: 'bg-green-200' },
                  { label: 'INTRO CALL', count: 7, color: 'bg-green-300' },
                  { label: 'ASSIGNMENT', count: 9, color: 'bg-green-400' },
                  { label: 'L1', count: 15, color: 'bg-green-500 text-white' },
                  { label: 'L2', count: 9, color: 'bg-green-600 text-white' },
                  { label: 'L3', count: 3, color: 'bg-green-700 text-white' },
                  { label: 'FINAL ROUND', count: 9, color: 'bg-green-800 text-white' },
                  { label: 'HR ROUND', count: 9, color: 'bg-green-900 text-white' },
                  { label: 'OFFER STAGE', count: 9, color: 'bg-green-900 text-white' },
                  { label: 'CLOSURE', count: 3, color: 'bg-green-950 text-white' }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center py-3 px-4 rounded ${item.color}`}>
                    <span className={`text-sm font-medium ${item.color.includes('text-white') ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
                    <span className={`text-lg font-bold ${item.color.includes('text-white') ? 'text-white' : 'text-gray-900'}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="flex flex-col h-full">
            {/* Simple Client Header */}
            <SimpleClientHeader 
              companyName="Gumlet Marketing Private Limited"
              onHelpClick={() => setIsHelpChatOpen(true)}
            />
            <div className="flex flex-1 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
              {/* Header with controls */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Speed Metrics</h2>
                <div className="flex items-center space-x-4">
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue defaultValue="All Roles" placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="active">Active Roles</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">12-Aug-2025</span>
                    <Edit3 className="h-4 w-4 text-gray-500" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-24">
                      <SelectValue defaultValue="Monthly" placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Speed Metrics Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Time to 1st Submission</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToFirstSubmission}</span>
                    <span className="text-sm text-blue-700 mb-1">days</span>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Interview</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToInterview}</span>
                    <span className="text-sm text-blue-700 mb-1">days</span>
                    <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Offer</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToOffer}</span>
                    <span className="text-sm text-blue-700 mb-1">days</span>
                    <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Fill</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToFill}</span>
                    <span className="text-sm text-blue-700 mb-1">days</span>
                    <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Metrics</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Submission to Short List %</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-green-800">{qualityMetricsData.submissionToShortList}</span>
                      <span className="text-sm text-green-700 mb-1">%</span>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Interview to Offer %</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-green-800">{qualityMetricsData.interviewToOffer}</span>
                      <span className="text-sm text-green-700 mb-1">%</span>
                      <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Offer Acceptance %</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-green-800">{qualityMetricsData.offerAcceptance}</span>
                      <span className="text-sm text-green-700 mb-1">%</span>
                      <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Early Attrition %</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-green-800">{qualityMetricsData.earlyAttrition}</span>
                      <span className="text-sm text-green-700 mb-1">%</span>
                      <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Metrics</h2>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="text-sm font-medium text-red-700 mb-2">Speed to Hire value</h3>
                    <div className="text-3xl font-bold text-red-600">{firstImpactMetrics.speedToHire}</div>
                    <div className="text-sm text-gray-600 mt-1">Days faster*</div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="text-sm font-medium text-red-700 mb-2">Revenue Impact Of Delay</h3>
                    <div className="text-3xl font-bold text-red-600">{firstImpactMetrics.revenueImpactOfDelay}</div>
                    <div className="text-sm text-gray-600 mt-1">Lost per Role*</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Client NPS</h3>
                    <div className="text-3xl font-bold text-purple-600">+{firstImpactMetrics.clientNps}</div>
                    <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Candidate NPS</h3>
                    <div className="text-3xl font-bold text-purple-600">+{firstImpactMetrics.candidateNps}</div>
                    <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="text-sm font-medium text-yellow-700 mb-2">Feedback Turn Around</h3>
                    <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.feedbackTurnAround}</div>
                    <div className="text-sm text-gray-600 mt-1">days</div>
                    <div className="text-xs text-gray-500 mt-1">Industry Avg. 5 days*</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="text-sm font-medium text-yellow-700 mb-2">First Year Retention Rate</h3>
                    <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.firstYearRetentionRate}</div>
                    <div className="text-sm text-gray-600 mt-1">%</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="text-sm font-medium text-yellow-700 mb-2">Fulfillment Rate</h3>
                    <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.fulfillmentRate}</div>
                    <div className="text-sm text-gray-600 mt-1">%</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="text-sm font-medium text-yellow-700 mb-2">Revenue Recovered</h3>
                    <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.revenueRecovered} <span className="text-2xl">L</span></div>
                    <div className="text-sm text-gray-600 mt-1">Gained per hire*</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar with Charts */}
            <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
              {/* Speed Metrics Chart - 4 Lines */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Speed Metrics Trend</h3>
                <div className="h-56 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={speedChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11, fill: '#6B7280' }} 
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#6B7280' }} 
                          stroke="#9CA3AF"
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: 10 }}
                          iconType="line"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="timeToFirstSubmission" 
                          stroke="#06B6D4" 
                          strokeWidth={2} 
                          dot={false}
                          name="1st Submission"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="timeToInterview" 
                          stroke="#EF4444" 
                          strokeWidth={2} 
                          dot={false}
                          name="Interview"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="timeToOffer" 
                          stroke="#A855F7" 
                          strokeWidth={2} 
                          dot={false}
                          name="Offer"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="timeToFill" 
                          stroke="#D97706" 
                          strokeWidth={2} 
                          dot={false}
                          name="Fill"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quality Metrics Chart - 4 Lines */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Quality Metrics Trend</h3>
                <div className="h-56 bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={qualityChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11, fill: '#6B7280' }} 
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#6B7280' }} 
                          stroke="#9CA3AF"
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: 10 }}
                          iconType="line"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="submissionToShortList" 
                          stroke="#06B6D4" 
                          strokeWidth={2} 
                          dot={false}
                          name="Submission Rate"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interviewToOffer" 
                          stroke="#EF4444" 
                          strokeWidth={2} 
                          dot={false}
                          name="Interview Rate"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="offerAcceptance" 
                          stroke="#A855F7" 
                          strokeWidth={2} 
                          dot={false}
                          name="Offer Rate"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="earlyAttrition" 
                          stroke="#D97706" 
                          strokeWidth={2} 
                          dot={false}
                          name="Attrition"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Drop Rates Section */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Interview Drop of Rate</div>
                  <div className="text-2xl font-bold text-gray-900">25%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Offer Drop of Rate</div>
                  <div className="text-2xl font-bold text-gray-900">20%</div>
                </div>
              </div>
            </div>
            
            {/* Fixed Download Button - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50">
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded shadow-lg">
                Download
              </Button>
            </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleCandidateClick = (e: React.MouseEvent, name: string, stage: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setCandidatePopupPosition({
      x: rect.left + rect.width + 10,
      y: rect.top
    });
    setSelectedCandidate({ name, stage });
  };

  const closeCandidatePopup = () => {
    setSelectedCandidate(null);
    setCandidatePopupPosition(null);
    setRejectReason('');
  };

  const handleReject = () => {
    // Handle reject logic here
    console.log('Rejecting candidate:', selectedCandidate, 'Reason:', rejectReason);
    
    // Show success toast notification
    toast({
      title: "Candidate Rejected",
      description: `${selectedCandidate?.name} has been rejected successfully.`,
      className: "bg-green-50 border-green-200 text-green-800",
    });
    
    closeCandidatePopup();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Dark Blue Theme */}
      <div className="w-16 bg-slate-700 flex flex-col items-center py-6 space-y-6">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-slate-700 font-bold text-lg">X</span>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => setSidebarTab('dashboard')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'dashboard' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <User className="h-6 w-6 text-white" />
          </button>
          
          <button 
            onClick={() => setSidebarTab('requirements')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'requirements' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <MapPin className="h-6 w-6 text-white" />
          </button>
          
          <button 
            onClick={() => setSidebarTab('reports')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'reports' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <HandHeart className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Middle Section */}
        <div className={`${sidebarTab === 'dashboard' ? 'flex-1' : 'w-full'} bg-white`}>
          {renderMainContent()}
        </div>
        
        {/* Right Sidebar - Chats - Only show on dashboard */}
        {sidebarTab === 'dashboard' && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Recent Chats Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Chats</h3>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {recentChats.map((chat) => (
                <Link 
                  key={chat.id}
                  href="/chat"
                  data-testid={`link-chat-${chat.id}`}
                >
                  <div 
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    data-testid={`chat-preview-${chat.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10" data-testid={`avatar-chat-${chat.id}`}>
                          <AvatarImage src={chat.avatar} alt={chat.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {chat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.status === 'online' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" data-testid={`status-online-${chat.id}`}></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900" data-testid={`text-chat-name-${chat.id}`}>{chat.name}</h4>
                          <span className="text-lg font-bold text-gray-900" data-testid={`text-closures-${chat.id}`}>{chat.closures}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500" data-testid={`text-requirements-${chat.id}`}>{chat.requirements} Requirements</p>
                          <span className="text-xs text-gray-400">Closures</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Chat Box Button */}
            <div className="p-4 border-t border-gray-200">
              <Link href="/chat" data-testid="link-open-chat">
                <Button 
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-3 rounded"
                  data-testid="button-open-chat"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Roles Modal */}
      <Dialog open={isRolesModalOpen} onOpenChange={setIsRolesModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Roles & Status</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shared on</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles Shared</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allRolesData.map((role, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.recruiter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.sharedOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                        {role.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{role.profilesShared}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* JD Text Modal */}
      <Dialog open={isJdModalOpen} onOpenChange={setIsJdModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write Job Description</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description Content</label>
              <textarea
                value={tempJdText}
                onChange={(e) => setTempJdText(e.target.value)}
                placeholder="Enter your job description here..."
                className="w-full h-64 border border-gray-300 rounded p-3 resize-none text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setTempJdText(jdText);
                  setIsJdModalOpen(false);
                }}
                className="rounded"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setJdText(tempJdText);
                  setIsJdModalOpen(false);
                }}
                className="bg-cyan-400 hover:bg-cyan-500 text-black rounded"
              >
                Save JD Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Closure Reports Modal */}
      <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Closure Reports</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Talent Advisor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Offered Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allClosureReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.candidate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.advisor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.offered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Candidate Action Popup */}
      {selectedCandidate && candidatePopupPosition && (
        <>
          {/* Backdrop to close popup */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeCandidatePopup}
          />
          
          {/* Popup */}
          <div 
            className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-4 w-64"
            style={{
              left: candidatePopupPosition.x,
              top: candidatePopupPosition.y
            }}
          >
            <div className="mb-3">
              <h4 className="font-medium text-gray-900">{selectedCandidate.name}</h4>
              <p className="text-sm text-gray-500">{selectedCandidate.stage}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="radio" id="reject" name="action" className="text-red-500" />
                <label htmlFor="reject" className="text-sm text-red-600 font-medium">Reject</label>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Detailed Final Verdict</label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full h-16 text-xs border border-gray-300 rounded p-2 resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 text-sm rounded"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
        data-testid="button-help"
        aria-label="Help"
        title="Need help? Chat with us!"
      >
        <HelpCircle size={24} />
      </button>

      {/* Chat Support */}
      <ChatDock 
        open={isHelpChatOpen} 
        onClose={() => setIsHelpChatOpen(false)} 
        userName="Support Team"
      />
    </div>
  );
}