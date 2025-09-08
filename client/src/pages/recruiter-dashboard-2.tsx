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
    const applicantData = [
      { appliedOn: '06-06-2025', candidateName: 'Aarav', company: 'TechCorp', roleApplied: 'Frontend Developer', submission: 'Inbound', currentStatus: 'In-Process' },
      { appliedOn: '08-06-2025', candidateName: 'Arjun', company: 'Designify', roleApplied: 'UI/UX Designer', submission: 'Uploaded', currentStatus: 'In-Process' },
      { appliedOn: '20-06-2025', candidateName: 'Shaurya', company: 'CodeLabs', roleApplied: 'Backend Developer', submission: 'Uploaded', currentStatus: 'In-Process' },
      { appliedOn: '01-07-2025', candidateName: 'Vihaan', company: 'AppLogic', roleApplied: 'QA Tester', submission: 'Inbound', currentStatus: 'In-Process' },
      { appliedOn: '23-07-2025', candidateName: 'Aditya', company: 'Bug Catchers', roleApplied: 'Mobile App Developer', submission: 'Inbound', currentStatus: 'In-Process' },
    ];

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R - Recruiter 2" companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto h-full">

              {/* Applicant Overview Table */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Applicant Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Applied on</th>
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Candidate Name</th>
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Company</th>
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Role Applied</th>
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Submission</th>
                          <th className="text-left py-3 px-6 font-medium text-gray-700">Current Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicantData.map((applicant, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-6 text-gray-900">{applicant.appliedOn}</td>
                            <td className="py-3 px-6 text-gray-900 font-medium">{applicant.candidateName}</td>
                            <td className="py-3 px-6 text-gray-900">{applicant.company}</td>
                            <td className="py-3 px-6 text-gray-900">{applicant.roleApplied}</td>
                            <td className="py-3 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                applicant.submission === 'Inbound' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {applicant.submission}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <select className="border border-gray-300 rounded px-3 py-1 text-sm" defaultValue={applicant.currentStatus}>
                                <option value="In-Process">In-Process</option>
                                <option value="Completed">Completed</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Target Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Target</CardTitle>
                  <div className="text-right">
                    <Button 
                      variant="link"
                      className="text-sm text-blue-600 hover:text-blue-800 p-0"
                      data-testid="button-view-all-targets"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-4 gap-0 bg-blue-50 rounded-lg overflow-hidden">
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-current-quarter">Current Quarter</p>
                      <p className="text-2xl font-bold text-gray-900">ASO-2025</p>
                    </div>
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-minimum-target">Minimum Target</p>
                      <p className="text-2xl font-bold text-gray-900">15,00,000</p>
                    </div>
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-target-achieved">Target Achieved</p>
                      <p className="text-2xl font-bold text-gray-900">10,00,000</p>
                    </div>
                    <div className="text-center py-8 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-incentive-earned">Incentive Earned</p>
                      <p className="text-2xl font-bold text-gray-900">50,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daily Metrics</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="overall">
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 h-8 px-3" data-testid="button-date-picker">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">12-Aug-2025</span>
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
                
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left side - Metrics */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Total Requirements</span>
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-total-requirements">20</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Avg. Resumes per Requirement</span>
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-avg-resumes">02</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Requirements per Recruiter</span>
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-requirements-recruiter">03</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Completed Requirements</span>
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-completed-requirements">12</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-slate-800 text-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-6">Daily Delivery</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-300 mb-2">Delivered</div>
                          <div className="text-4xl font-bold text-white mb-3">3</div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" data-testid="button-view-delivered">
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-300 mb-2">Defaulted</div>
                          <div className="text-4xl font-bold text-white mb-3">1</div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" data-testid="button-view-defaulted">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Overall Performance */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">G</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="link" className="text-blue-600 p-0" data-testid="button-view-more-performance">
                          View More
                        </Button>
                      </div>
                      <div className="h-24 flex items-center justify-center">
                        {/* Simple line chart placeholder */}
                        <div className="w-full h-16 bg-gray-100 rounded flex items-end justify-around px-4">
                          <div className="w-1 bg-orange-400 rounded" style={{height: '30%'}}></div>
                          <div className="w-1 bg-orange-400 rounded" style={{height: '45%'}}></div>
                          <div className="w-1 bg-orange-400 rounded" style={{height: '60%'}}></div>
                          <div className="w-1 bg-orange-400 rounded" style={{height: '55%'}}></div>
                          <div className="w-1 bg-orange-400 rounded" style={{height: '70%'}}></div>
                          <div className="w-1 bg-orange-400 rounded" style={{height: '40%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Row - Pending Meetings and CEO Commands */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pending Meetings */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Meetings</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-medium text-gray-700">Meeting</th>
                            <th className="text-left py-3 font-medium text-gray-700">Date</th>
                            <th className="text-left py-3 font-medium text-gray-700">Person</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">TL</td>
                            <td className="py-3 text-gray-900">25-05-2025</td>
                            <td className="py-3 text-gray-900">Arun</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">CEO</td>
                            <td className="py-3 text-gray-900">01-05-2025</td>
                            <td className="py-3 text-gray-900">Vikna Prakash</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Commands */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">CEO Commands</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="bg-slate-800 text-white rounded-lg p-6 space-y-4">
                      <div className="text-sm text-gray-300">
                        <p>Discuss with Shri Ragavi on her production</p>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>Discuss with Kavya about her leaves</p>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>Discuss with Umar for data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto h-full space-y-6">
              {/* Active Jobs */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Jobs</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">12</div>
              </div>
              
              {/* Total Jobs */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Jobs</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">20</div>
              </div>
              
              {/* New Applications */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">New Applications</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">10</div>
              </div>
              
              {/* Total Applications */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Applications</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">20</div>
                <div className="text-right">
                  <Button size="sm" variant="link" className="text-blue-600 p-0 text-xs">
                    See All
                  </Button>
                </div>
              </div>
              
              {/* Interview Tracker */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Interview Tracker</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today's Schedule</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">4</span>
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 text-xs">
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending cases</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">10</span>
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 text-xs">
                        View
                      </Button>
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

  const renderRequirementsContent = () => {
    // Updated requirements data with SPOC Email field matching the image
    const requirementsTableData = [
      { position: 'Frontend Developer', criticality: 'HIGH', company: 'TechCorp', spoc: 'David Wilson', spocEmail: 'david@techcorp.com', count: 'Set' },
      { position: 'UI/UX Designer', criticality: 'MEDIUM', company: 'Designify', spoc: 'Tom Anderson', spocEmail: 'tom@designify.com', count: 'Set' },
      { position: 'Backend Developer', criticality: 'LOW', company: 'CodeLabs', spoc: 'Robert Kim', spocEmail: 'robert@codelabs.com', count: 'Set' },
      { position: 'QA Tester', criticality: 'MEDIUM', company: 'AppLogic', spoc: 'Kevin Brown', spocEmail: 'kevin@applogic.com', count: 'Set' },
      { position: 'Mobile App Developer', criticality: 'HIGH', company: 'Tesco', spoc: 'Mel Gibson', spocEmail: 'mel@tesco.com', count: 'Set' },
    ];

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName="Kumaravel R - Recruiter 2" companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content Area */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Deliverables</h2>
              
              {/* Requirements Table */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Positions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Criticality</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">SPOC</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">SPOC Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirementsTableData.map((req, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{req.position}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                req.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                                req.criticality === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                • {req.criticality}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{req.company}</td>
                            <td className="py-3 px-4 text-gray-900">{req.spoc}</td>
                            <td className="py-3 px-4 text-gray-900">{req.spocEmail}</td>
                            <td className="py-3 px-4">
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded">
                                {req.count}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 p-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      className="bg-red-500 hover:bg-red-600 text-white hover:text-white border-red-500 hover:border-red-600 rounded px-6"
                      data-testid="button-req-archives"
                    >
                      Req-Archives
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white border-blue-500 hover:border-blue-600 rounded px-6"
                      data-testid="button-view-more"
                    >
                      View More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Priority Distribution Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 px-6 py-6">
              <div className="space-y-6">
                {/* Priority Distribution */}
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Priority Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Idle Requirement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold text-blue-500">9</div>
                        <span className="text-gray-700 font-medium">Idle Requirement</span>
                      </div>
                    </div>

                    {/* Delivery Pending */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold text-red-400">3</div>
                        <span className="text-gray-700 font-medium">Delivery Pending</span>
                      </div>
                    </div>

                    {/* Robust Requirement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold text-green-500">7</div>
                        <span className="text-gray-700 font-medium">Robust Requirement</span>
                      </div>
                    </div>

                    {/* Easy Requirement */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold text-green-600">2</div>
                        <span className="text-gray-700 font-medium">Easy Requirement</span>
                      </div>
                    </div>

                    {/* High Priority */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl font-bold text-orange-500">6</div>
                        <span className="text-gray-700 font-medium">High Priority</span>
                      </div>
                    </div>

                    {/* Total Requirement */}
                    <div className="flex items-center justify-between border-t border-gray-300 pt-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm text-gray-600 font-medium">Total Requirement</div>
                          <div className="text-3xl font-bold text-gray-900">20</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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
    <div className="min-h-screen">
      <TeamLeaderMainSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      {renderMainContent()}
    </div>
  );
}