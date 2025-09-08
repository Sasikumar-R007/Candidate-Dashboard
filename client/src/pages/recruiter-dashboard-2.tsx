import { useState } from 'react';
import TeamLeaderMainSidebar from '@/components/dashboard/team-leader-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamLeaderTeamBoxes from '@/components/dashboard/team-leader-team-boxes';
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

export default function RecruiterDashboard2() {
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
    { id: 1, sender: "Kumaravel R", message: "Good morning! Please review today's recruitment targets", time: "9:00 AM", isOwn: true },
    { id: 2, sender: "Priya", message: "Good morning sir. I've shortlisted 5 candidates for the Frontend role.", time: "9:05 AM", isOwn: false },
    { id: 3, sender: "Amit", message: "Working on the Backend Developer interviews. Will update shortly.", time: "9:10 AM", isOwn: false },
    { id: 4, sender: "Sowmiya", message: "UI/UX Designer position - 2 candidates cleared initial screening", time: "9:15 AM", isOwn: false },
    { id: 5, sender: "Kumaravel R", message: "Excellent! Please schedule final rounds by EOD", time: "9:20 AM", isOwn: true },
    { id: 6, sender: "Rajesh", message: "QA Tester interviews completed - sharing feedback shortly", time: "9:25 AM", isOwn: false },
    { id: 7, sender: "Kavitha", message: "Mobile App Developer candidate wants to negotiate salary", time: "9:30 AM", isOwn: false }
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

  // Sample requirements data for recruiter context
  const [requirementsData, setRequirementsData] = useState([
    { id: 'frontend-dev', position: 'Frontend Developer', criticality: 'HIGH', company: 'TechCorp', contact: 'David Wilson', status: 'Active', candidates: 8 },
    { id: 'ui-ux-designer', position: 'UI/UX Designer', criticality: 'MEDIUM', company: 'Designify', contact: 'Tom Anderson', status: 'Interview', candidates: 5 },
    { id: 'backend-dev', position: 'Backend Developer', criticality: 'LOW', company: 'CodeLabs', contact: 'Robert Kim', status: 'Screening', candidates: 12 },
    { id: 'qa-tester', position: 'QA Tester', criticality: 'MEDIUM', company: 'AppLogic', contact: 'Kevin Brown', status: 'Offer', candidates: 3 },
    { id: 'mobile-app-dev', position: 'Mobile App Developer', criticality: 'HIGH', company: 'Tesco', contact: 'Mel Gibson', status: 'Active', candidates: 15 },
    { id: 'data-scientist', position: 'Data Scientist', criticality: 'HIGH', company: 'DataTech', contact: 'Sarah Wilson', status: 'Interview', candidates: 7 },
    { id: 'devops-engineer', position: 'DevOps Engineer', criticality: 'MEDIUM', company: 'CloudSoft', contact: 'Michael Chen', status: 'Screening', candidates: 9 },
    { id: 'product-manager', position: 'Product Manager', criticality: 'LOW', company: 'InnovateHub', contact: 'Lisa Rodriguez', status: 'Active', candidates: 6 },
    { id: 'fullstack-dev', position: 'Full Stack Developer', criticality: 'HIGH', company: 'WebSolutions', contact: 'James Martinez', status: 'Interview', candidates: 11 },
    { id: 'security-analyst', position: 'Security Analyst', criticality: 'HIGH', company: 'SecureNet', contact: 'Emma Thompson', status: 'Offer', candidates: 4 }
  ]);

  // Available recruiting team members
  const recruitingTeam = ['Priya', 'Amit', 'Sowmiya', 'Rajesh', 'Kavitha', 'Vinay'];

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

  const handleConfirmAssignment = (recruiter: string) => {
    if (selectedRequirement) {
      const updatedRequirements = requirementsData.map(req => 
        req.id === selectedRequirement.id 
          ? { ...req, recruiter: recruiter }
          : req
      );
      setRequirementsData(updatedRequirements);
      setAssignments(prev => ({ ...prev, [selectedRequirement.id]: recruiter }));
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

  // Use API data for recruiter context
  const { data: recruiterProfile } = useQuery({
    queryKey: ['/api/recruiter/profile'],
  }) as { data: any };

  const { data: teamMembers } = useQuery({
    queryKey: ['/api/recruiter/team-members'],
  }) as { data: any[] };

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

  if (!recruiterProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading Recruiter Dashboard 2...</div>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return renderRecruiterContent();
      case 'requirements':
        return renderRequirementsContent();
      case 'pipeline':
        return renderPipelineContent();
      case 'performance':
        return renderPerformanceContent();
      case 'chat':
        return renderChatContent();
      default:
        return renderRecruiterContent();
    }
  };

  const renderRecruiterContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R - Recruiter 2" companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto h-full">

              <TeamLeaderTeamBoxes />

              {/* Target Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Recruitment Targets</CardTitle>
                  <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="text-sm px-4 py-2 border-gray-300 hover:bg-gray-50"
                        data-testid="button-view-all-targets"
                      >
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">All Quarters Recruitment Targets</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Quarter</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Hiring Target</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Hires Achieved</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Bonus Earned</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 px-4 py-3">ASO-2025</td>
                                <td className="border border-gray-300 px-4 py-3">25 Hires</td>
                                <td className="border border-gray-300 px-4 py-3">18 Hires</td>
                                <td className="border border-gray-300 px-4 py-3">₹45,000</td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">In Progress</span>
                                </td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">JSO-2024</td>
                                <td className="border border-gray-300 px-4 py-3">22 Hires</td>
                                <td className="border border-gray-300 px-4 py-3">26 Hires</td>
                                <td className="border border-gray-300 px-4 py-3">₹65,000</td>
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
                  <div className="grid grid-cols-4 gap-0 bg-orange-50 rounded-lg overflow-hidden">
                    <div className="text-center py-6 px-4 border-r border-orange-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2" data-testid="text-current-quarter">Current Quarter</p>
                      <p className="text-xl font-bold text-gray-900">ASO-2025</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-orange-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2" data-testid="text-hiring-target">Hiring Target</p>
                      <p className="text-xl font-bold text-gray-900">25</p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-orange-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2" data-testid="text-hires-achieved">Hires Achieved</p>
                      <p className="text-xl font-bold text-gray-900">18</p>
                    </div>
                    <div className="text-center py-6 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2" data-testid="text-bonus-earned">Bonus Earned</p>
                      <p className="text-xl font-bold text-gray-900">₹45,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daily Recruitment Metrics</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="personal">
                      <SelectTrigger className="w-24 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 h-8 px-3" data-testid="button-date-picker">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">06-Sep-2025</span>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          className="rounded-md border"
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
                        <span className="text-sm font-medium text-gray-700">Active Job Openings</span>
                        <span className="text-2xl font-bold text-blue-600" data-testid="text-active-jobs">28</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Candidates Sourced</span>
                        <span className="text-2xl font-bold text-blue-600" data-testid="text-candidates-sourced">45</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Interviews Scheduled</span>
                        <span className="text-2xl font-bold text-blue-600" data-testid="text-interviews-scheduled">12</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-gray-700">Offers Extended</span>
                        <span className="text-2xl font-bold text-blue-600" data-testid="text-offers-extended">06</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h3>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-600 mb-2" data-testid="text-performance-score">92%</div>
                          <div className="text-sm text-gray-600">Performance Score</div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target Achievement</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Quick Stats */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Response Rate</span>
                          <span className="text-lg font-bold text-blue-600" data-testid="text-response-rate">89%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Interview-to-Hire</span>
                          <span className="text-lg font-bold text-green-600" data-testid="text-interview-hire-ratio">1:3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg. Time to Fill</span>
                          <span className="text-lg font-bold text-orange-600" data-testid="text-time-to-fill">12 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CEO Comments Section */}
              {ceoComments && ceoComments.length > 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Management Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ceoComments.map((comment: any) => (
                        <div key={comment.id} className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded border-l-4 border-pink-400" data-testid={`comment-${comment.id}`}>
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
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {meetings.map((meeting: any) => (
                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded" data-testid={`meeting-${meeting.id}`}>
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

            {/* Right Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto h-full">
              <TeamLeaderSidebar />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequirementsContent = () => {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recruitment Requirements</h2>
        <div className="grid gap-4">
          {requirementsData.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{req.position}</h3>
                  <p className="text-sm text-gray-600">{req.company} - {req.candidates} candidates</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    req.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                    req.criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {req.criticality}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {req.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPipelineContent = () => {
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
  };

  const renderPerformanceContent = () => {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Performance Analytics</h2>
        <p className="text-gray-600">Performance metrics and analytics would go here...</p>
      </div>
    );
  };

  const renderChatContent = () => {
    return (
      <div className="flex h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R - Recruiter 2" companyName="Gumlat Marketing Private Limited" />
          <div className="flex flex-col h-full p-6">
            <h2 className="text-2xl font-bold mb-4">Team Chat</h2>
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 mb-4 overflow-y-auto">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm font-medium">{msg.sender}</p>
                      <p className="text-sm mt-1">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-75">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button onClick={handleSendMessage} data-testid="button-send-message">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <TeamLeaderMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      {renderMainContent()}
    </div>
  );
}