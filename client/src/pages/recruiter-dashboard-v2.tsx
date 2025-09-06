import { useState } from 'react';
import RecruiterMainSidebar from '@/components/dashboard/recruiter-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import RecruiterTeamBoxes from '@/components/dashboard/recruiter-team-boxes';
import TeamLeaderSidebar from '@/components/dashboard/team-leader-sidebar';
import AddRequirementModal from '@/components/dashboard/modals/add-requirement-modal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, EditIcon, MoreVertical, Mail, UserRound, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function RecruiterDashboardV2() {
  const [, navigate] = useLocation();
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('team');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isClosureDetailsModalOpen, setIsClosureDetailsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [assignments, setAssignments] = useState<{[key: string]: string}>({'mobile-app-dev': 'Arun'});
  const [isReallocating, setIsReallocating] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false);
  const [isViewMoreRequirementsModalOpen, setIsViewMoreRequirementsModalOpen] = useState(false);
  const [isViewTeamPerformanceModalOpen, setIsViewTeamPerformanceModalOpen] = useState(false);
  const [isViewClosuresModalOpen, setIsViewClosuresModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Kumaravel R", message: "Good morning! Please review the requirements for today", time: "9:00 AM", isOwn: true },
    { id: 2, sender: "Priya", message: "Good morning sir. I've reviewed the Frontend Developer position. Ready to proceed.", time: "9:05 AM", isOwn: false },
    { id: 3, sender: "Vikash", message: "Working on the UI/UX Designer requirement. Will update shortly.", time: "9:10 AM", isOwn: false },
    { id: 4, sender: "Meena", message: "Backend Developer position - I have 2 potential candidates to share", time: "9:15 AM", isOwn: false },
    { id: 5, sender: "Kumaravel R", message: "Great! Please share the profiles by EOD today", time: "9:20 AM", isOwn: true },
    { id: 6, sender: "Suresh", message: "QA Tester requirement - interviewed 3 candidates yesterday", time: "9:25 AM", isOwn: false },
    { id: 7, sender: "Priya", message: "Mobile App Developer role - client wants to schedule interviews", time: "9:30 AM", isOwn: false }
  ]);

  // Handle sending new chat messages
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: chatMessages.length + 1,
        sender: "Kumaravel R",
        message: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage("");
    }
  };

  // Sample requirements data
  const [requirementsData, setRequirementsData] = useState([
    { id: 'frontend-dev', position: 'Frontend Developer', criticality: 'HIGH', company: 'TechCorp', contact: 'David Wilson', talentAdvisor: 'Priya', recruiter: null },
    { id: 'ui-ux-designer', position: 'UI/UX Designer', criticality: 'MEDIUM', company: 'Designify', contact: 'Tom Anderson', talentAdvisor: 'Vikash', recruiter: null },
    { id: 'backend-dev', position: 'Backend Developer', criticality: 'LOW', company: 'CodeLabs', contact: 'Robert Kim', talentAdvisor: 'Meena', recruiter: null },
    { id: 'qa-tester', position: 'QA Tester', criticality: 'MEDIUM', company: 'AppLogic', contact: 'Kevin Brown', talentAdvisor: 'Suresh', recruiter: null },
    { id: 'mobile-app-dev', position: 'Mobile App Developer', criticality: 'HIGH', company: 'Tesco', contact: 'Mel Gibson', talentAdvisor: 'Priya', recruiter: 'Kumaravel' },
    { id: 'data-scientist', position: 'Data Scientist', criticality: 'HIGH', company: 'DataTech', contact: 'Sarah Wilson', talentAdvisor: 'Vikash', recruiter: null },
    { id: 'devops-engineer', position: 'DevOps Engineer', criticality: 'MEDIUM', company: 'CloudSoft', contact: 'Michael Chen', talentAdvisor: 'Meena', recruiter: null },
    { id: 'product-manager', position: 'Product Manager', criticality: 'LOW', company: 'InnovateHub', contact: 'Lisa Rodriguez', talentAdvisor: 'Suresh', recruiter: null },
    { id: 'fullstack-dev', position: 'Full Stack Developer', criticality: 'HIGH', company: 'WebSolutions', contact: 'James Martinez', talentAdvisor: 'Priya', recruiter: null },
    { id: 'security-analyst', position: 'Security Analyst', criticality: 'HIGH', company: 'SecureNet', contact: 'Emma Thompson', talentAdvisor: 'Vikash', recruiter: null }
  ]);

  // Available talent advisors
  const talentAdvisors = ['Priya', 'Vikash', 'Meena', 'Suresh', 'Kavitha', 'Rajesh'];

  const handleAssign = (requirement: any) => {
    setSelectedRequirement(requirement);
    setIsReallocating(false);
    setSelectedAssignee('');
    setIsAssignmentModalOpen(true);
  };

  const handleReallocate = (requirement: any) => {
    setSelectedRequirement(requirement);
    setIsReallocating(true);
    setSelectedAssignee(requirement.recruiter || '');
    setIsAssignmentModalOpen(true);
  };

  const handleConfirmAssignment = (advisor: string) => {
    if (selectedRequirement) {
      const updatedRequirements = requirementsData.map(req => 
        req.id === selectedRequirement.id 
          ? { ...req, recruiter: advisor }
          : req
      );
      setRequirementsData(updatedRequirements);
      setAssignments(prev => ({ ...prev, [selectedRequirement.id]: advisor }));
      setIsAssignmentModalOpen(false);
      setSelectedRequirement(null);
      setSelectedAssignee('');
    }
  };
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
  const { data: recruiterProfile } = useQuery({
    queryKey: ['/api/recruiter/profile'],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/recruiter/team-members'],
  });

  const { data: targetMetrics } = useQuery({
    queryKey: ['/api/recruiter/target-metrics'],
  });

  const { data: dailyMetrics } = useQuery({
    queryKey: ['/api/recruiter/daily-metrics'],
  });

  const { data: meetings } = useQuery({
    queryKey: ['/api/recruiter/meetings'],
  });

  const { data: ceoComments } = useQuery({
    queryKey: ['/api/recruiter/ceo-comments'],
  });

  if (!recruiterProfile) {
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
      case 'chat':
        return renderChatContent();
      default:
        return renderTeamContent();
    }
  };

  const renderTeamContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R" companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto h-full">
              <RecruiterTeamBoxes />

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
                                <td className="border border-gray-300 px-4 py-3">8,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">6,50,000</td>
                                <td className="border border-gray-300 px-4 py-3">35,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">In Progress</span>
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">JSO-2024</td>
                                <td className="border border-gray-300 px-4 py-3">7,00,000</td>
                                <td className="border border-gray-300 px-4 py-3">8,50,000</td>
                                <td className="border border-gray-300 px-4 py-3">50,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completed</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 px-4 py-3">AMJ-2024</td>
                                <td className="border border-gray-300 px-4 py-3">7,50,000</td>
                                <td className="border border-gray-300 px-4 py-3">6,75,000</td>
                                <td className="border border-gray-300 px-4 py-3">25,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Below Target</span>
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
                      <p className="text-xl font-bold text-gray-900">{targetMetrics?.currentQuarter || "ASO-2025"}</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-cyan-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Minimum Target</p>
                      <p className="text-xl font-bold text-gray-900">{targetMetrics?.minimumTarget || "8,00,000"}</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-cyan-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Target Achieved</p>
                      <p className="text-xl font-bold text-gray-900">{targetMetrics?.targetAchieved || "6,50,000"}</p>
                    </div>
                    <div className="text-center py-6 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Incentive Earned</p>
                      <p className="text-xl font-bold text-gray-900">{targetMetrics?.incentiveEarned || "35,000"}</p>
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
                          <span className="text-sm">{dailyMetrics?.date || "21-Aug-2025"}</span>
                          <EditIcon className="h-4 w-4" />
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
                
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left side - Metrics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Total Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">{dailyMetrics?.totalRequirements || "15"}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Avg. Resumes per Requirement</span>
                        <span className="text-2xl font-bold text-blue-600">{dailyMetrics?.avgResumesPerRequirement || "03"}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Requirements per Recruiter</span>
                        <span className="text-2xl font-bold text-blue-600">{dailyMetrics?.requirementsPerRecruiter || "02"}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Completed Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">{dailyMetrics?.completedRequirements || "8"}</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-slate-800 rounded-lg p-6 text-white">
                      <h4 className="text-lg font-semibold text-white mb-6 text-center">Daily Delivery</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-cyan-300 mb-3">Delivered</h5>
                          <div className="text-4xl font-bold text-white mb-4">{dailyMetrics?.dailyDeliveryDelivered || "2"}</div>
                          <Button 
                            size="sm" 
                            className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                          >
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-cyan-300 mb-3">Defaulted</h5>
                          <div className="text-4xl font-bold text-white mb-4">{dailyMetrics?.dailyDeliveryDefaulted || "1"}</div>
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
                    <div className="space-y-3">
                      {meetings?.map((meeting: any) => (
                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{meeting.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{meeting.count}</span>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              View
                            </Button>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Commands */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">CEO Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {ceoComments?.slice(0, 3).map((comment: any) => (
                        <div key={comment.id} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                          <p className="text-sm text-gray-800 mb-2">{comment.comment}</p>
                          <p className="text-xs text-gray-500">{comment.date}</p>
                        </div>
                      )) || []}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Sidebar */}
            <TeamLeaderSidebar 
              profile={recruiterProfile}
              onEditProfile={() => {}} 
            />
          </div>
        </div>
      </div>
    );
  };

  const renderRequirementsContent = () => {
    return (
      <div className="flex min-h-screen">
        <RecruiterMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R" companyName="Gumlat Marketing Private Limited" />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Requirements Management</h1>
              <Button 
                onClick={() => setIsAddRequirementModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            {/* Requirements Table */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Active Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Position</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Criticality</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Company</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Contact</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Talent Advisor</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirementsData.slice(0, 10).map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">{req.position}</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              req.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                              req.criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {req.criticality}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">{req.company}</td>
                          <td className="border border-gray-300 px-4 py-3">{req.contact}</td>
                          <td className="border border-gray-300 px-4 py-3">{req.talentAdvisor}</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              {!req.recruiter ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAssign(req)}
                                >
                                  Assign
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReallocate(req)}
                                >
                                  Reallocate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderPipelineContent = () => {
    return (
      <div className="flex min-h-screen">
        <RecruiterMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R" companyName="Gumlat Marketing Private Limited" />
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pipeline Management</h1>
            
            {/* Pipeline stages */}
            <div className="grid grid-cols-4 gap-6">
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sourced</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-600">Frontend Developer</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-gray-600">UI/UX Designer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="font-medium">Mike Johnson</p>
                      <p className="text-sm text-gray-600">Backend Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-medium">Sarah Wilson</p>
                      <p className="text-sm text-gray-600">QA Tester</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-medium">David Brown</p>
                      <p className="text-sm text-gray-600">Mobile Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium">Lisa Davis</p>
                      <p className="text-sm text-gray-600">Data Scientist</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    return (
      <div className="flex min-h-screen">
        <RecruiterMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R" companyName="Gumlat Marketing Private Limited" />
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h1>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Monthly Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Candidates Sourced</span>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interviews Scheduled</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful Placements</span>
                      <span className="font-bold">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">78%</div>
                    <p className="text-gray-600 mt-2">Interview to Offer Conversion</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChatContent = () => {
    return (
      <div className="flex min-h-screen">
        <RecruiterMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R" companyName="Gumlat Marketing Private Limited" />
          
          <div className="p-6">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle>Team Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm font-medium">{message.sender}</p>
                        <p className="mt-1">{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <RecruiterMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      {renderMainContent()}
      
      {/* Modals */}
      <AddRequirementModal 
        open={isAddRequirementModalOpen} 
        onOpenChange={setIsAddRequirementModalOpen}
      />

      {/* Assignment Modal */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isReallocating ? 'Reallocate Requirement' : 'Assign Requirement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Requirement: {selectedRequirement?.position}</Label>
            </div>
            <div>
              <Label>Select Talent Advisor</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose advisor" />
                </SelectTrigger>
                <SelectContent>
                  {talentAdvisors.map((advisor) => (
                    <SelectItem key={advisor} value={advisor}>
                      {advisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAssignmentModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleConfirmAssignment(selectedAssignee)}
                disabled={!selectedAssignee}
              >
                {isReallocating ? 'Reallocate' : 'Assign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}