import { useState, useMemo } from 'react';
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
import { CalendarIcon, EditIcon, MoreVertical, Mail, UserRound, Plus, Upload, X, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChatDock } from '@/components/chat/chat-dock';
import { HelpCircle } from 'lucide-react';

export default function RecruiterDashboard2() {
  const [, navigate] = useLocation();
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isDefaultedModalOpen, setIsDefaultedModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isTodayInterviewsModalOpen, setIsTodayInterviewsModalOpen] = useState(false);
  const [isPendingCasesModalOpen, setIsPendingCasesModalOpen] = useState(false);
  
  // Interview tracker state with initial empty interviews array
  const [interviewTrackerData, setInterviewTrackerData] = useState({
    interviews: [] as Array<{
      id: string;
      candidateName: string;
      position: string;
      client: string;
      interviewDate: string;
      interviewTime: string;
      interviewType: string;
      interviewRound: string;
      status: string;
    }>
  });
  
  // Interview form state
  const [interviewForm, setInterviewForm] = useState({
    candidateName: '',
    position: '',
    client: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'Video Call',
    interviewRound: 'L1'
  });
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [requirementCountModal, setRequirementCountModal] = useState<{isOpen: boolean, requirement: any}>({isOpen: false, requirement: null});
  
  // New state variables for Post Jobs and Upload Resume functionality
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [formError, setFormError] = useState('');
  const [resumeFormData, setResumeFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    whatsappNumber: '',
    primaryEmail: '',
    secondaryEmail: '',
    highestQualification: '',
    collegeName: '',
    linkedin: '',
    pedigreeLevel: '',
    currentLocation: '',
    noticePeriod: '',
    website: '',
    portfolio1: '',
    currentCompany: '',
    portfolio2: '',
    currentRole: '',
    portfolio3: '',
    companyDomain: '',
    companyLevel: '',
    skills: ['', '', '', '', '']
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFormError, setResumeFormError] = useState('');
  const [jobFormData, setJobFormData] = useState({
    companyName: '',
    companyTagline: '',
    companyType: '',
    market: '',
    field: '',
    noOfPositions: '',
    role: '',
    experience: '',
    location: '',
    workMode: '',
    salaryPackage: '',
    aboutCompany: '',
    roleDefinitions: '',
    keyResponsibility: '',
    primarySkills: ['', '', ''],
    secondarySkills: ['', ''],
    knowledgeOnly: [''],
    companyLogo: ''
  });
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

  // Form validation and handling functions for Post Jobs and Upload Resume
  const validateForm = () => {
    const required = ['companyName', 'experience', 'salaryPackage', 'aboutCompany', 'roleDefinitions', 'keyResponsibility'];
    return required.every(field => jobFormData[field].trim() !== '');
  };

  const handlePostJob = () => {
    if (!validateForm()) {
      // Show inline error message instead of alert
      setFormError('Please fill out all required fields');
      return;
    }
    
    setIsPostJobModalOpen(false);
    setShowSuccessAlert(true);
    setFormError(''); // Clear any form errors
    setTimeout(() => setShowSuccessAlert(false), 3000);
    
    // Reset form
    setJobFormData({
      companyName: '',
      companyTagline: '',
      companyType: '',
      market: '',
      field: '',
      noOfPositions: '',
      role: '',
      experience: '',
      location: '',
      workMode: '',
      salaryPackage: '',
      aboutCompany: '',
      roleDefinitions: '',
      keyResponsibility: '',
      primarySkills: ['', '', ''],
      secondarySkills: ['', ''],
      knowledgeOnly: [''],
      companyLogo: ''
    });
  };

  // Derived values using useMemo to prevent state drift
  const getTodaysInterviews = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return interviewTrackerData.interviews.filter(interview => interview.interviewDate === today);
  }, [interviewTrackerData.interviews]);

  const getPendingInterviews = useMemo(() => {
    return interviewTrackerData.interviews.filter(interview => 
      interview.status === 'scheduled' || interview.status === 'pending'
    );
  }, [interviewTrackerData.interviews]);

  // Interview tracker functions
  const handleAddInterview = () => {
    if (interviewForm.candidateName && interviewForm.position && interviewForm.client && 
        interviewForm.interviewDate && interviewForm.interviewTime) {
      const newInterview = {
        id: Date.now().toString(),
        ...interviewForm,
        status: 'scheduled'
      };
      
      setInterviewTrackerData(prev => ({
        ...prev,
        interviews: [...prev.interviews, newInterview]
      }));
      
      // Reset form
      setInterviewForm({
        candidateName: '',
        position: '',
        client: '',
        interviewDate: '',
        interviewTime: '',
        interviewType: 'Video Call',
        interviewRound: 'L1'
      });
      
      setIsInterviewModalOpen(false);
    }
  };

  const handleViewTodaySchedule = () => {
    setIsTodayInterviewsModalOpen(true);
  };

  const handleViewPendingCases = () => {
    setIsPendingCasesModalOpen(true);
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

  // Status options for dropdowns
  const statuses = ['In-Process', 'Shortlisted', 'Interview Scheduled', 'Interview On-Going', 'Final Round', 'HR Round', 'Selected', 'Screened Out'];
  const rejectionReasons = ['Skill mismatch', 'Lack of communication', 'Inadequate experience', 'Unprofessional behavior', 'Other'];

  // Applicant data with state management
  const [applicantData, setApplicantData] = useState([
    { id: 1, appliedOn: '06-06-2025', candidateName: 'Aarav', company: 'TechCorp', roleApplied: 'Frontend Developer', submission: 'Inbound', currentStatus: 'In-Process' },
    { id: 2, appliedOn: '08-06-2025', candidateName: 'Arjun', company: 'Designify', roleApplied: 'UI/UX Designer', submission: 'Uploaded', currentStatus: 'In-Process' },
    { id: 3, appliedOn: '20-06-2025', candidateName: 'Shaurya', company: 'CodeLabs', roleApplied: 'Backend Developer', submission: 'Uploaded', currentStatus: 'In-Process' },
    { id: 4, appliedOn: '01-07-2025', candidateName: 'Vihaan', company: 'AppLogic', roleApplied: 'QA Tester', submission: 'Inbound', currentStatus: 'In-Process' },
    { id: 5, appliedOn: '23-07-2025', candidateName: 'Aditya', company: 'Bug Catchers', roleApplied: 'Mobile App Developer', submission: 'Inbound', currentStatus: 'In-Process' },
  ]);

  // Handle status change for applicants
  const handleStatusChange = (applicant: any, newStatus: string) => {
    if (newStatus === 'Screened Out') {
      setSelectedCandidate({ ...applicant, status: newStatus });
      setIsReasonModalOpen(true);
    } else {
      setApplicantData(prev => 
        prev.map(a => a.id === applicant.id ? { ...a, currentStatus: newStatus } : a)
      );
    }
  };

  // Archive candidate when screened out
  const archiveCandidate = () => {
    if (selectedCandidate) {
      setApplicantData(prev => prev.filter(a => a.id !== selectedCandidate.id));
      setIsReasonModalOpen(false);
      setSelectedCandidate(null);
      setReason('');
    }
  };

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
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto h-full">

              {/* Success Alert */}
              {showSuccessAlert && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Job posted successfully!
                </div>
              )}

              {/* Three Buttons and Feature Boxes Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsPostJobModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      data-testid="button-post-jobs">
                      Post Jobs
                    </button>
                    <button 
                      onClick={() => setIsUploadResumeModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      data-testid="button-upload-resume">
                      Upload Resume
                    </button>
                    <button 
                      onClick={() => navigate('/source-resume')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      data-testid="button-source-resume">
                      Source Resume
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => navigate('/recruiter-active-jobs')}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300 text-left w-full"
                    data-testid="card-active-jobs">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <i className="fas fa-briefcase text-2xl text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active jobs</h3>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">12</div>
                      <div className="inline-block bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-2 py-1 rounded font-bold">
                        Total Jobs Posted: 25
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/recruiter-new-applications')}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300 text-left w-full"
                    data-testid="card-new-applications">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <i className="fas fa-user text-2xl text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New applications:</h3>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">12</div>
                      <div className="inline-block bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-2 py-1 rounded font-bold">
                        Candidates Applied: 82
                      </div>
                    </div>
                  </button>
                </div>
              </div>

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
                              <Select value={applicant.currentStatus} onValueChange={(value) => handleStatusChange(applicant, value)}>
                                <SelectTrigger className="w-32 h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                      onClick={() => setIsTargetModalOpen(true)}
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
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setIsDeliveredModalOpen(true)} data-testid="button-view-delivered">
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-300 mb-2">Defaulted</div>
                          <div className="text-4xl font-bold text-white mb-3">1</div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setIsDefaultedModalOpen(true)} data-testid="button-view-defaulted">
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
                        <Button size="sm" variant="link" className="text-blue-600 p-0" onClick={() => setIsPerformanceModalOpen(true)} data-testid="button-view-more-performance">
                          View More
                        </Button>
                      </div>
                      <div className="h-48 flex items-center justify-center bg-white rounded-lg p-4 border border-gray-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={[
                              { quarter: 'Q1', closures: 2, closureValue: 300000, incentives: 6000 },
                              { quarter: 'Q2', closures: 3, closureValue: 550000, incentives: 9000 },
                              { quarter: 'Q3', closures: 4, closureValue: 775000, incentives: 12000 },
                              { quarter: 'Q4', closures: 3, closureValue: 600000, incentives: 9000 },
                            ]}
                            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="quarter" stroke="#6b7280" style={{ fontSize: '10px' }} />
                            <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '10px' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: '10px' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '11px'
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line yAxisId="left" type="monotone" dataKey="closures" stroke="#3b82f6" strokeWidth={2} name="Closures" dot={{ fill: '#3b82f6', r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="closureValue" stroke="#10b981" strokeWidth={2} name="Value (₹)" dot={{ fill: '#10b981', r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="incentives" stroke="#f59e0b" strokeWidth={2} name="Incentives (₹)" dot={{ fill: '#f59e0b', r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
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
                  <Button size="sm" variant="link" className="text-blue-600 p-0 text-xs" onClick={() => window.location.href = '/master-database'} data-testid="button-see-all-applications">
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
                      <span className="text-2xl font-bold text-gray-900" data-testid="text-today-schedule-count">{getTodaysInterviews.length}</span>
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 text-xs" onClick={() => setIsInterviewModalOpen(true)} data-testid="button-add-interview">
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending cases</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900" data-testid="text-pending-cases-count">{getPendingInterviews.length}</span>
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 text-xs" onClick={handleViewPendingCases} data-testid="button-view-pending-cases">
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
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
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
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded" onClick={() => setRequirementCountModal({isOpen: true, requirement: req})}>
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
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content Area */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pipeline</h2>
                <div className="flex items-center gap-4">
                  <Select defaultValue="arun-anusha">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arun-anusha">Arun/Anusha /All</SelectItem>
                      <SelectItem value="arun">Arun</SelectItem>
                      <SelectItem value="anusha">Anusha</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">12-Aug-2025</span>
                </div>
              </div>

              {/* Pipeline Table */}
              <Card className="bg-white border border-gray-200 mb-6">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Level 1</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Level 2</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Level 3</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Final Round</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">HR Round</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Offer Stage</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Closure</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-200 px-3 py-1 rounded text-center text-sm font-medium">Keerthana</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-cyan-200 px-3 py-1 rounded text-center text-sm font-medium">Vishnu Purana</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-orange-200 px-3 py-1 rounded text-center text-sm font-medium">Chanakya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-orange-200 px-3 py-1 rounded text-center text-sm font-medium">Chanakya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-orange-200 px-3 py-1 rounded text-center text-sm font-medium">Chanakya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-orange-200 px-3 py-1 rounded text-center text-sm font-medium">Chanakya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-orange-200 px-3 py-1 rounded text-center text-sm font-medium">Chanakya</div>
                          </td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-red-200 px-3 py-1 rounded text-center text-sm font-medium">Adhya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-red-200 px-3 py-1 rounded text-center text-sm font-medium">Adhya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-red-200 px-3 py-1 rounded text-center text-sm font-medium">Adhya</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-red-200 px-3 py-1 rounded text-center text-sm font-medium">Adhya</div>
                          </td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-green-300 px-3 py-1 rounded text-center text-sm font-medium">Vanshika</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-300 px-3 py-1 rounded text-center text-sm font-medium">Vanshika</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="bg-green-300 px-3 py-1 rounded text-center text-sm font-medium">Vanshika</div>
                          </td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="bg-purple-200 px-3 py-1 rounded text-center text-sm font-medium">Reyansh</div>
                          </td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Closure Report Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Closure report</h3>
                <div className="text-sm text-gray-600 mb-4">Frame 97</div>
              </div>

              {/* Closure Report Table */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Positions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">David Wilson</td>
                          <td className="py-3 px-4 text-gray-900">Frontend Developer</td>
                          <td className="py-3 px-4 text-gray-900">TechCorp</td>
                          <td className="py-3 px-4 text-gray-900">1,12,455</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">Tom Anderson</td>
                          <td className="py-3 px-4 text-gray-900">UI/UX Designer</td>
                          <td className="py-3 px-4 text-gray-900">Designify</td>
                          <td className="py-3 px-4 text-gray-900">1,87,425</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">Robert Kim</td>
                          <td className="py-3 px-4 text-gray-900">Backend Developer</td>
                          <td className="py-3 px-4 text-gray-900">CodeLabs</td>
                          <td className="py-3 px-4 text-gray-900">1,34,946</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">Kevin Brown</td>
                          <td className="py-3 px-4 text-gray-900">QA Tester</td>
                          <td className="py-3 px-4 text-gray-900">AppLogic</td>
                          <td className="py-3 px-4 text-gray-900">2,24,910</td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">Mel Gibson</td>
                          <td className="py-3 px-4 text-gray-900">Mobile App Developer</td>
                          <td className="py-3 px-4 text-gray-900">Tesco</td>
                          <td className="py-3 px-4 text-gray-900">4,49,820</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* View All Button */}
                  <div className="flex justify-end p-4 border-t border-gray-100">
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded px-6"
                      data-testid="button-view-all-closures"
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Stages Sidebar */}
            <div className="w-64 bg-gradient-to-b from-green-100 to-orange-100 px-4 py-6">
              <div className="space-y-6">
                {/* Source */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">5</div>
                  <div className="text-lg font-semibold text-gray-800">SOURCE</div>
                </div>

                {/* Intocall */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-500 mb-2">3</div>
                  <div className="text-lg font-semibold text-gray-800">INTOCALL</div>
                </div>

                {/* Assignment */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-400 mb-2">9</div>
                  <div className="text-lg font-semibold text-gray-800">ASSIGNMENT</div>
                  <div className="text-4xl font-bold text-gray-700">15</div>
                </div>

                {/* L1 */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-300 mb-2">9</div>
                  <div className="text-lg font-semibold text-gray-800">L1</div>
                </div>

                {/* L2 */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-200 mb-2">3</div>
                  <div className="text-lg font-semibold text-gray-800">L2</div>
                </div>

                {/* L3 */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-100 mb-2">9</div>
                  <div className="text-lg font-semibold text-gray-800">L3</div>
                </div>

                {/* Final Round */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-yellow-300 mb-2">9</div>
                  <div className="text-lg font-semibold text-gray-800">FINAL ROUND</div>
                </div>

                {/* HR Round */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-yellow-400 mb-2">9</div>
                  <div className="text-lg font-semibold text-gray-800">HR ROUND</div>
                </div>

                {/* Offer Stage */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-300 mb-2">3</div>
                  <div className="text-lg font-semibold text-gray-800">OFFER STAGE</div>
                </div>

                {/* Closure */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-400 mb-2">3</div>
                  <div className="text-lg font-semibold text-gray-800">CLOSURE</div>
                </div>

                {/* Offer Drop */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-500 mb-2">3</div>
                  <div className="text-lg font-semibold text-gray-800">OFFER DROP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    return (
      <div className="flex flex-1 gap-4 p-6 pt-8 ml-16 mt-12">
        {/* Left side - Main Table */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance</h3>
            </div>
            
            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offered On</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined On</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quarter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Closure Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Incentive</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Aarav</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Frontend Developer</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">TechCorp</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">06-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">06-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">FMA</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">1,52,500</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">3000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Arjun</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">UI/UX Designer</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Designify</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">08-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">08-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">MJJ</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">4,50,000</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">6000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Shaurya</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Backend Developer</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">CodeLabs</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">20-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">20-06-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">ASO</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">3,50,000</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">3000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Vihaan</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">QA Tester</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">AppLogic</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">01-07-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">01-07-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">NDJ</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">2,00,000</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">3000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Aditya</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Mobile App Developer</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Bug Catchers</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">23-07-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">23-07-2025</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">NDJ</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">1,75,000</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">3000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Tenure Card */}
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Tenure</h4>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-1">4</div>
              <div className="text-sm text-blue-700 dark:text-blue-200">Quarters</div>
            </div>
          </div>

          {/* Total Closures Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Closures</h4>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-1">12</div>
            </div>
          </div>

          {/* Recent Closure Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Recent Closure</h4>
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">Adhitya</div>
            </div>
          </div>

          {/* Last Closure Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Last Closure</h4>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Month 15 days</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChatContent = () => {
    return (
      <div className="flex h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
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

      {/* Target Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Target Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                  <span className="font-medium">Q1 Target</span>
                  <span className="text-lg font-bold">15,00,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                  <span className="font-medium">Q1 Achieved</span>
                  <span className="text-lg font-bold">10,00,000</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded">
                  <span className="font-medium">Q2 Target</span>
                  <span className="text-lg font-bold">18,00,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded">
                  <span className="font-medium">Total Incentive</span>
                  <span className="text-lg font-bold">75,000</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivered Modal */}
      <Dialog open={isDeliveredModalOpen} onOpenChange={setIsDeliveredModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Delivered Candidates</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Candidate</th>
                  <th className="text-left py-2 px-4">Position</th>
                  <th className="text-left py-2 px-4">Client</th>
                  <th className="text-left py-2 px-4">Delivered Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">Aarav</td>
                  <td className="py-2 px-4">Frontend Developer</td>
                  <td className="py-2 px-4">TechCorp</td>
                  <td className="py-2 px-4">12-Aug-2025</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Arjun</td>
                  <td className="py-2 px-4">UI/UX Designer</td>
                  <td className="py-2 px-4">Designify</td>
                  <td className="py-2 px-4">11-Aug-2025</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Shaurya</td>
                  <td className="py-2 px-4">Backend Developer</td>
                  <td className="py-2 px-4">CodeLabs</td>
                  <td className="py-2 px-4">10-Aug-2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Defaulted Modal */}
      <Dialog open={isDefaultedModalOpen} onOpenChange={setIsDefaultedModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Defaulted Candidates</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Candidate</th>
                  <th className="text-left py-2 px-4">Position</th>
                  <th className="text-left py-2 px-4">Client</th>
                  <th className="text-left py-2 px-4">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">Vihaan</td>
                  <td className="py-2 px-4">QA Tester</td>
                  <td className="py-2 px-4">AppLogic</td>
                  <td className="py-2 px-4">No response</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Modal */}
      <Dialog open={isPerformanceModalOpen} onOpenChange={setIsPerformanceModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Overall Performance Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Total Closures</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">45,000</div>
                <div className="text-sm text-gray-600">Total Incentives</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interview Modal */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input 
                  id="candidateName" 
                  value={interviewForm.candidateName}
                  onChange={(e) => setInterviewForm(prev => ({...prev, candidateName: e.target.value}))}
                  placeholder="Enter candidate name" 
                  data-testid="input-candidate-name"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  value={interviewForm.position}
                  onChange={(e) => setInterviewForm(prev => ({...prev, position: e.target.value}))}
                  placeholder="Enter position" 
                  data-testid="input-position"
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Input 
                  id="client" 
                  value={interviewForm.client}
                  onChange={(e) => setInterviewForm(prev => ({...prev, client: e.target.value}))}
                  placeholder="Enter client name" 
                  data-testid="input-client"
                />
              </div>
              <div>
                <Label htmlFor="interviewDate">Interview Date</Label>
                <Input 
                  id="interviewDate" 
                  type="date" 
                  value={interviewForm.interviewDate}
                  onChange={(e) => setInterviewForm(prev => ({...prev, interviewDate: e.target.value}))}
                  data-testid="input-interview-date"
                />
              </div>
              <div>
                <Label htmlFor="interviewTime">Interview Time</Label>
                <Input 
                  id="interviewTime" 
                  type="time" 
                  value={interviewForm.interviewTime}
                  onChange={(e) => setInterviewForm(prev => ({...prev, interviewTime: e.target.value}))}
                  data-testid="input-interview-time"
                />
              </div>
              <div>
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select value={interviewForm.interviewType} onValueChange={(value) => setInterviewForm(prev => ({...prev, interviewType: value}))}>
                  <SelectTrigger data-testid="select-interview-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsInterviewModalOpen(false)} data-testid="button-cancel-interview">
                Cancel
              </Button>
              <Button onClick={handleAddInterview} data-testid="button-schedule-interview">
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's Interviews Modal */}
      <Dialog open={isTodayInterviewsModalOpen} onOpenChange={setIsTodayInterviewsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Today's Scheduled Interviews</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            {getTodaysInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No interviews scheduled for today
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Candidate</th>
                    <th className="text-left py-2 px-4">Position</th>
                    <th className="text-left py-2 px-4">Client</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Round</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getTodaysInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b" data-testid={`row-interview-${interview.id}`}>
                      <td className="py-2 px-4" data-testid={`text-time-${interview.id}`}>{interview.interviewTime}</td>
                      <td className="py-2 px-4" data-testid={`text-candidate-${interview.id}`}>{interview.candidateName}</td>
                      <td className="py-2 px-4" data-testid={`text-position-${interview.id}`}>{interview.position}</td>
                      <td className="py-2 px-4" data-testid={`text-client-${interview.id}`}>{interview.client}</td>
                      <td className="py-2 px-4" data-testid={`text-type-${interview.id}`}>{interview.interviewType}</td>
                      <td className="py-2 px-4" data-testid={`text-round-${interview.id}`}>{interview.interviewRound}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          interview.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          interview.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`} data-testid={`status-${interview.id}`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => window.location.href = '/master-database'} data-testid="button-view-all-interviews">
              View All Interviews
            </Button>
            <Button onClick={() => setIsTodayInterviewsModalOpen(false)} data-testid="button-close-today-interviews">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Cases Modal */}
      <Dialog open={isPendingCasesModalOpen} onOpenChange={setIsPendingCasesModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pending Interview Cases</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            {getPendingInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending interview cases
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Candidate</th>
                    <th className="text-left py-2 px-4">Position</th>
                    <th className="text-left py-2 px-4">Client</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Round</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getPendingInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b" data-testid={`row-pending-${interview.id}`}>
                      <td className="py-2 px-4" data-testid={`text-date-${interview.id}`}>{interview.interviewDate}</td>
                      <td className="py-2 px-4" data-testid={`text-time-${interview.id}`}>{interview.interviewTime}</td>
                      <td className="py-2 px-4" data-testid={`text-candidate-${interview.id}`}>{interview.candidateName}</td>
                      <td className="py-2 px-4" data-testid={`text-position-${interview.id}`}>{interview.position}</td>
                      <td className="py-2 px-4" data-testid={`text-client-${interview.id}`}>{interview.client}</td>
                      <td className="py-2 px-4" data-testid={`text-type-${interview.id}`}>{interview.interviewType}</td>
                      <td className="py-2 px-4" data-testid={`text-round-${interview.id}`}>{interview.interviewRound}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          interview.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`} data-testid={`status-${interview.id}`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => window.location.href = '/master-database'} data-testid="button-view-all-pending">
              View All Cases
            </Button>
            <Button onClick={() => setIsPendingCasesModalOpen(false)} data-testid="button-close-pending-cases">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Requirement Count Modal */}
      <Dialog open={requirementCountModal.isOpen} onOpenChange={(open) => setRequirementCountModal({isOpen: open, requirement: null})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Requirement Count</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="position">Position: {requirementCountModal.requirement?.position}</Label>
            </div>
            <div>
              <Label htmlFor="count">Required Count</Label>
              <Input id="count" type="number" placeholder="Enter count" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRequirementCountModal({isOpen: false, requirement: null})}>Cancel</Button>
              <Button onClick={() => setRequirementCountModal({isOpen: false, requirement: null})}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reason Modal for Screened Out */}
      <Dialog open={isReasonModalOpen} onOpenChange={setIsReasonModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Screening Out</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="candidate">Candidate: {selectedCandidate?.candidateName}</Label>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReasonModalOpen(false)}>Cancel</Button>
              <Button onClick={archiveCandidate} className="bg-red-600 hover:bg-red-700">Archive Candidate</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Job Modal */}
      <Dialog open={isPostJobModalOpen} onOpenChange={setIsPostJobModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(95vh - 4rem)' }}>
            <DialogHeader>
              <DialogTitle>Post Job</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Error message */}
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}

              {/* Company Name */}
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={jobFormData.companyName}
                  onChange={(e) => setJobFormData({...jobFormData, companyName: e.target.value})}
                  className="mt-1"
                  data-testid="input-company-name"
                />
              </div>

              {/* Company Tagline */}
              <div>
                <Label htmlFor="companyTagline" className="text-sm font-medium text-gray-700">Company Tagline</Label>
                <Input
                  id="companyTagline"
                  placeholder="Enter company tagline"
                  value={jobFormData.companyTagline}
                  onChange={(e) => setJobFormData({...jobFormData, companyTagline: e.target.value})}
                  className="mt-1"
                  data-testid="input-company-tagline"
                />
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience *</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 3-5 years"
                  value={jobFormData.experience}
                  onChange={(e) => setJobFormData({...jobFormData, experience: e.target.value})}
                  className="mt-1"
                  data-testid="input-experience"
                />
              </div>

              {/* Salary Package */}
              <div>
                <Label htmlFor="salaryPackage" className="text-sm font-medium text-gray-700">Salary Package *</Label>
                <Input
                  id="salaryPackage"
                  placeholder="e.g., 10-15 LPA"
                  value={jobFormData.salaryPackage}
                  onChange={(e) => setJobFormData({...jobFormData, salaryPackage: e.target.value})}
                  className="mt-1"
                  data-testid="input-salary-package"
                />
              </div>

              {/* About Company */}
              <div>
                <Label htmlFor="aboutCompany" className="text-sm font-medium text-gray-700">About Company *</Label>
                <textarea
                  id="aboutCompany"
                  placeholder="Describe the company..."
                  value={jobFormData.aboutCompany}
                  onChange={(e) => setJobFormData({...jobFormData, aboutCompany: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  data-testid="textarea-about-company"
                />
              </div>

              {/* Role Definitions */}
              <div>
                <Label htmlFor="roleDefinitions" className="text-sm font-medium text-gray-700">Role Definitions *</Label>
                <textarea
                  id="roleDefinitions"
                  placeholder="Define the role responsibilities..."
                  value={jobFormData.roleDefinitions}
                  onChange={(e) => setJobFormData({...jobFormData, roleDefinitions: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  data-testid="textarea-role-definitions"
                />
              </div>

              {/* Key Responsibility */}
              <div>
                <Label htmlFor="keyResponsibility" className="text-sm font-medium text-gray-700">Key Responsibility *</Label>
                <textarea
                  id="keyResponsibility"
                  placeholder="List key responsibilities..."
                  value={jobFormData.keyResponsibility}
                  onChange={(e) => setJobFormData({...jobFormData, keyResponsibility: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  data-testid="textarea-key-responsibility"
                />
              </div>

              {/* Primary Skills */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Primary Skills</Label>
                <div className="space-y-2">
                  {jobFormData.primarySkills.map((skill, index) => (
                    <Input
                      key={index}
                      placeholder={`Primary skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...jobFormData.primarySkills];
                        newSkills[index] = e.target.value;
                        setJobFormData({...jobFormData, primarySkills: newSkills});
                      }}
                      className="mt-1"
                      data-testid={`input-primary-skill-${index}`}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePostJob}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-submit-job"
                >
                  Post Job
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPostJobModalOpen(false)}
                  data-testid="button-cancel-job"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Resume Modal */}
      <Dialog open={isUploadResumeModalOpen} onOpenChange={setIsUploadResumeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(95vh - 4rem)' }}>
            <DialogHeader>
              <DialogTitle>Upload Resume</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {/* Error message */}
              {resumeFormError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {resumeFormError}
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={resumeFormData.firstName}
                    onChange={(e) => setResumeFormData({...resumeFormData, firstName: e.target.value})}
                    className="mt-1"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={resumeFormData.lastName}
                    onChange={(e) => setResumeFormData({...resumeFormData, lastName: e.target.value})}
                    className="mt-1"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="Enter mobile number"
                    value={resumeFormData.mobileNumber}
                    onChange={(e) => setResumeFormData({...resumeFormData, mobileNumber: e.target.value})}
                    className="mt-1"
                    data-testid="input-mobile-number"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryEmail" className="text-sm font-medium text-gray-700">Primary Email</Label>
                  <Input
                    id="primaryEmail"
                    type="email"
                    placeholder="Enter primary email"
                    value={resumeFormData.primaryEmail}
                    onChange={(e) => setResumeFormData({...resumeFormData, primaryEmail: e.target.value})}
                    className="mt-1"
                    data-testid="input-primary-email"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF/Image)</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Choose File Drag File</p>
                    {resumeFile && (
                      <p className="text-sm text-green-600">{resumeFile.name}</p>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="resume-upload"
                      data-testid="input-resume-file"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm cursor-pointer hover:bg-blue-700"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Skills</Label>
                <div className="space-y-2">
                  {resumeFormData.skills.map((skill, index) => (
                    <Input
                      key={index}
                      placeholder={`Skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...resumeFormData.skills];
                        newSkills[index] = e.target.value;
                        setResumeFormData({...resumeFormData, skills: newSkills});
                      }}
                      className="mt-1"
                      data-testid={`input-skill-${index}`}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setIsUploadResumeModalOpen(false);
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 3000);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-submit-resume"
                >
                  Upload Resume
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadResumeModalOpen(false)}
                  data-testid="button-cancel-resume"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Help Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
        data-testid="button-floating-help"
        aria-label="Open Chat"
      >
        <HelpCircle size={24} />
      </button>

      {/* Chat Support Modal */}
      <ChatDock 
        open={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userName="Support Team"
      />
    </div>
  );
}