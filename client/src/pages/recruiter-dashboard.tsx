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
import { CalendarIcon, EditIcon, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import { ChatDock } from '@/components/chat/chat-dock';

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

interface Candidate {
  id: string;
  name: string;
  jobId: string;
  job: string;
  company: string;
  status: string;
}

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  client: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  interviewRound: string;
  recruiterId?: string;
}

export default function RecruiterDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('updates');
  const [, setLocation] = useLocation();
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
  
  // Requirements data
  const [activeRequirements] = useState([
    { id: 1, position: 'Frontend Dev', criticality: 'High', company: 'TechCorp', contactPerson: 'John', contactPersonEmail: 'john@corp.com' },
    { id: 2, position: 'Backend Dev', criticality: 'Medium', company: 'SoftInc', contactPerson: 'Jane', contactPersonEmail: 'jane@corp.com' },
    { id: 3, position: 'Full Stack Dev', criticality: 'Low', company: 'WebWorks', contactPerson: 'Sam', contactPersonEmail: 'sam@corp.com' },
    { id: 4, position: 'UI/UX Designer', criticality: 'High', company: 'Designify', contactPerson: 'Alice', contactPersonEmail: 'alice@corp.com' },
    { id: 5, position: 'Project Manager', criticality: 'Medium', company: 'ManageIt', contactPerson: 'Bob', contactPersonEmail: 'bob@corp.com' },
    { id: 6, position: 'DevOps Engineer', criticality: 'Low', company: 'CloudBase', contactPerson: 'Eve', contactPersonEmail: 'eve@corp.com' },
    { id: 7, position: 'QA Tester', criticality: 'High', company: 'BugCatchers', contactPerson: 'Tom', contactPersonEmail: 'tom@corp.com' },
    { id: 8, position: 'Data Analyst', criticality: 'Medium', company: 'InsightSoft', contactPerson: 'Mia', contactPersonEmail: 'mia@corp.com' }
  ]);
  
  // Performance data
  const [performanceData] = useState([
    {
      candidate: "Aarav",
      position: "Frontend Developer",
      client: "TechCorp",
      offeredOn: "06-06-2025",
      joinedOn: "06-06-2025",
      quarter: "FMA",
      closureValue: "1,52,500",
      incentive: "3000",
    },
    {
      candidate: "Arjun",
      position: "UI/UX Designer",
      client: "Designify",
      offeredOn: "08-06-2025",
      joinedOn: "08-06-2025",
      quarter: "MJJ",
      closureValue: "4,50,000",
      incentive: "6000",
    },
    {
      candidate: "Shaurya",
      position: "Backend Developer",
      client: "CodeLabs",
      offeredOn: "20-06-2025",
      joinedOn: "20-06-2025",
      quarter: "ASO",
      closureValue: "3,50,000",
      incentive: "3000",
    },
    {
      candidate: "Vihaan",
      position: "QA Tester",
      client: "AppLogic",
      offeredOn: "01-07-2025",
      joinedOn: "01-07-2025",
      quarter: "NDJ",
      closureValue: "2,00,000",
      incentive: "3000",
    },
    {
      candidate: "Aditya",
      position: "Mobile App Developer",
      client: "Bug Catchers",
      offeredOn: "23-07-2025",
      joinedOn: "23-07-2025",
      quarter: "NDJ",
      closureValue: "1,75,000",
      incentive: "3000",
    },
  ]);
  
  // Active Candidates Management
  const [activeCandidates, setActiveCandidates] = useState<Candidate[]>([
    { id: 'cand001', name: 'John Doe', jobId: 'job001', job: 'Frontend Developer', company: 'TechCorp', status: 'Shortlisted' },
    { id: 'cand002', name: 'Jane Smith', jobId: 'job002', job: 'UI/UX Designer', company: 'Designify', status: 'In-Process' },
    { id: 'cand003', name: 'Ravi Kumar', jobId: 'job003', job: 'Backend Developer', company: 'CodeLabs', status: 'Interview Scheduled' },
    { id: 'cand004', name: 'Aisha Ali', jobId: 'job004', job: 'Full Stack Dev', company: 'WebFusion', status: 'Interview On-Going' },
    { id: 'cand005', name: 'David Lee', jobId: 'job005', job: 'Project Manager', company: 'AgileWorks', status: 'Final Round' }
  ]);
  
  // Interview Tracking
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showTodayInterviewsModal, setShowTodayInterviewsModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidateName: '',
    position: '',
    client: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'Video Call',
    interviewRound: 'Technical'
  });
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  
  // Candidate Status Management
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  
  // Requirements modal states
  const [showModal, setShowModal] = useState(false);
  const [requirementCounts, setRequirementCounts] = useState<{[reqId: string]: {[date: string]: string}}>({});
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const [selectedDateString, setSelectedDateString] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [inputCount, setInputCount] = useState('');
  
  // Chat functionality states
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState<'team' | 'private'>('team');
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  
  // Team members for team chat (5 members)
  const teamMembers = [
    { id: 'kavitha', name: 'Kavitha', role: 'Senior Recruiter', status: 'online' },
    { id: 'rajesh', name: 'Rajesh', role: 'Technical Recruiter', status: 'online' },
    { id: 'sowmiya', name: 'Sowmiya', role: 'Senior Recruiter', status: 'online' },
    { id: 'kalaiselvi', name: 'Kalaiselvi', role: 'Recruiter', status: 'away' },
    { id: 'malathi', name: 'Malathi', role: 'Junior Recruiter', status: 'online' }
  ];

  // Individual contacts for private chat (4 contacts)
  const individualContacts = [
    { id: 'john-tl', name: 'John Mathew', role: 'Team Leader', status: 'online' },
    { id: 'priya-client', name: 'Priya Singh', role: 'Client Manager', status: 'online' },
    { id: 'david-ceo', name: 'David Johnson', role: 'CEO', status: 'away' },
    { id: 'sarah-ops', name: 'Sarah Williams', role: 'Operations Head', status: 'online' }
  ];

  const [teamChatMessages, setTeamChatMessages] = useState([
    { id: 1, sender: "Kavitha", message: "Good morning team! I have a new requirement from TechCorp", time: "9:00 AM", isOwn: false },
    { id: 2, sender: "Current User", message: "Good morning! Please share the details", time: "9:05 AM", isOwn: true },
    { id: 3, sender: "Rajesh", message: "I can help with technical screening if needed", time: "9:10 AM", isOwn: false },
    { id: 4, sender: "Sowmiya", message: "I have some good candidates for backend roles", time: "9:15 AM", isOwn: false },
    { id: 5, sender: "Kalaiselvi", message: "Let me know if you need help with scheduling interviews", time: "9:20 AM", isOwn: false },
    { id: 6, sender: "Malathi", message: "I'm working on the frontend developer requirements", time: "9:25 AM", isOwn: false }
  ]);

  const [privateChatMessages, setPrivateChatMessages] = useState<{[key: string]: any[]}>({
    'john-tl': [
      { id: 1, sender: "John Mathew", message: "How is the progress on the current requirements?", time: "10:30 AM", isOwn: false },
      { id: 2, sender: "Current User", message: "Going well! I have 3 candidates in the pipeline", time: "10:35 AM", isOwn: true }
    ],
    'priya-client': [
      { id: 1, sender: "Priya Singh", message: "The client wants to expedite the hiring process", time: "11:00 AM", isOwn: false },
      { id: 2, sender: "Current User", message: "I'll prioritize the top candidates for this week", time: "11:05 AM", isOwn: true }
    ],
    'david-ceo': [
      { id: 1, sender: "David Johnson", message: "Great job on meeting this month's targets!", time: "2:00 PM", isOwn: false },
      { id: 2, sender: "Current User", message: "Thank you sir! The team has been very supportive", time: "2:05 PM", isOwn: true }
    ],
    'sarah-ops': [
      { id: 1, sender: "Sarah Williams", message: "Do you need any additional resources for the new client?", time: "3:30 PM", isOwn: false },
      { id: 2, sender: "Current User", message: "Yes, I could use help with candidate sourcing", time: "3:35 PM", isOwn: true }
    ]
  });
  const [calendarStep, setCalendarStep] = useState<'calendar' | 'input'>('calendar');
  
  // Chat open state
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat helper functions
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        sender: "Current User",
        message: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      
      if (chatType === 'team') {
        setTeamChatMessages([...teamChatMessages, newMsg]);
      } else if (activeChatUser && chatType === 'private') {
        setPrivateChatMessages(prev => ({
          ...prev,
          [activeChatUser]: [...(prev[activeChatUser] || []), newMsg]
        }));
      }
      setNewMessage("");
    }
  };

  const handleStartPrivateChat = (userId: string) => {
    setChatType('private');
    setActiveChatUser(userId);
  };

  const handleSwitchToTeamChat = () => {
    setChatType('team');
    setActiveChatUser(null);
  };

  const getCurrentChatMessages = () => {
    if (chatType === 'team') {
      return teamChatMessages;
    } else if (activeChatUser && chatType === 'private') {
      return privateChatMessages[activeChatUser] || [];
    }
    return [];
  };

  const getCurrentChatTitle = () => {
    if (chatType === 'team') {
      return 'Team Chat - Requirements Discussion';
    } else if (activeChatUser) {
      const contact = [...teamMembers, ...individualContacts].find(c => c.id === activeChatUser);
      return `Private Chat - ${contact?.name || 'Unknown'}`;
    }
    return 'Chat';
  };
  
  const getTotalCountForReq = (reqId: string) => {
    const counts = requirementCounts[reqId] || {};
    return Object.values(counts).reduce((total, count) => total + parseInt(count || '0'), 0);
  };
  
  const getMostRecentDateForReq = (reqId: string) => {
    const counts = requirementCounts[reqId] || {};
    const dates = Object.keys(counts).sort().reverse();
    return dates[0] || null;
  };
  
  const statuses = ['Shortlisted', 'In-Process', 'Interview Scheduled', 'Interview On-Going', 'Final Round', 'HR Round', 'Selected', 'Screened Out'];
  const rejectionReasons = ['Skill mismatch', 'Lack of communication', 'Inadequate experience', 'Unprofessional behavior', 'Other'];

  // Use API data for recruiter profile and metrics
  const { data: recruiterProfile } = useQuery<RecruiterProfile>({
    queryKey: ['/api/recruiter/profile'],
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
  
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const todayStr = getToday();
  const todaysInterviews = allInterviews.filter((i: Interview) => i.interviewDate === todayStr);
  
  const handleInterviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInterviewForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview = {
      id: Date.now().toString(),
      ...interviewForm,
      recruiterId: recruiterProfile?.id
    };
    setAllInterviews(prev => [...prev, newInterview]);
    setInterviewForm({
      candidateName: '',
      position: '',
      client: '',
      interviewDate: '',
      interviewTime: '',
      interviewType: 'Video Call',
      interviewRound: 'Technical'
    });
    setShowInterviewModal(false);
  };
  
  const handleStatusChange = (candidate: Candidate, newStatus: string) => {
    if (newStatus === 'Screened Out') {
      setSelectedCandidate({ ...candidate, status: newStatus });
      setShowReasonModal(true);
    } else {
      setActiveCandidates(prev => 
        prev.map(c => c.id === candidate.id ? { ...c, status: newStatus } : c)
      );
    }
  };
  
  const archiveCandidate = () => {
    if (selectedCandidate) {
      setActiveCandidates(prev => prev.filter(c => c.id !== selectedCandidate.id));
      setShowReasonModal(false);
      setSelectedCandidate(null);
      setReason('');
    }
  };

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

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'updates':
        return (
          <div className="p-6">
            {/* Header with action buttons */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Updates</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPostJobModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                  Post Jobs
                </button>
                <button 
                  onClick={() => setIsUploadResumeModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                  Upload Resume
                </button>
                <button 
                  onClick={() => setLocation('/source-resume')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                  Source Resume
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Jobs Card */}
              <button 
                onClick={() => setLocation('/recruiter-active-jobs')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300 text-left w-full">
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

              {/* New Applications Card */}
              <button 
                onClick={() => setLocation('/recruiter-new-applications')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300 text-left w-full">
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

              {/* Interview Tracker Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Tracker</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Schedule</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{todaysInterviews.length}</div>
                    <button 
                      onClick={() => setShowInterviewModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex items-center px-4">
                    <div className="h-20 w-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending cases</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">9</div>
                    <button 
                      onClick={() => setShowTodayInterviewsModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Active Candidates Table */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Candidates</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{activeCandidates.length} candidates</span>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activeCandidates.slice(0, 10).map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {candidate.job}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {candidate.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              candidate.status === 'Selected' ? 'bg-green-100 text-green-700' :
                              candidate.status === 'Screened Out' ? 'bg-red-100 text-red-700' :
                              candidate.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Select value={candidate.status} onValueChange={(value) => handleStatusChange(candidate, value)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Archives and View More Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" className="bg-red-500 hover:bg-red-700 text-white hover:text-white border-red-500 hover:border-red-700 rounded">
                Archives
              </Button>
              <Button variant="outline" className="bg-blue-500 hover:bg-blue-700 text-white hover:text-white border-blue-500 hover:border-blue-700 rounded">
                View More
              </Button>
            </div>

            {/* Target Metrics Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target</h3>
              <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Quarter</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.currentQuarter || "ASO-2025"}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Target</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.minimumTarget || "15,00,000"}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Achieved</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.targetAchieved || "10,00,000"}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incentive Earned</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.incentiveEarned || "50,000"}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Metrics Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Metrics</h3>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="text-sm text-gray-500 dark:text-gray-400 border-none p-2">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{format(selectedDate, "dd-MMM-yyyy")}</span>
                        <EditIcon className="h-4 w-4 ml-2" />
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
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Left side - 2x2 Grid */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Requirements</p>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {dailyMetrics?.totalRequirements || "20"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Resumes per Requirement</p>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {dailyMetrics?.avgResumesPerRequirement || "02"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Performance</p>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center ml-auto">
                        <span className="text-white font-bold text-lg">G</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Requirements per Month</p>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">22</span>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Daily Delivery */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm p-4 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">Daily Delivery</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Delivered</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {dailyMetrics?.dailyDeliveryDelivered || "3"}
                      </p>
                      <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded">
                        View
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Defaulted</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {dailyMetrics?.dailyDeliveryDefaulted || "1"}
                      </p>
                      <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded">
                        View
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded">
                    View More
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Section - CEO Comments and Pending Meetings */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              {/* CEO Comments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CEO Comments</h3>
                </div>
                <div className="p-4">
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {ceoComments?.map((commentObj: any, index: number) => (
                        <li key={index}>
                          {commentObj.comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pending Meetings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Meetings</h3>
                </div>
                <div className="p-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 overflow-hidden">
                    <div className="grid grid-cols-3 bg-yellow-200 dark:bg-yellow-800/40 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="p-2 text-center border-r border-yellow-300 dark:border-yellow-700">Meeting</div>
                      <div className="p-2 text-center border-r border-yellow-300 dark:border-yellow-700">Date</div>
                      <div className="p-2 text-center">Person</div>
                    </div>
                    <div className="divide-y divide-yellow-200 dark:divide-yellow-700">
                      <div className="grid grid-cols-3 text-sm">
                        <div className="p-2 text-center border-r border-yellow-200 dark:border-yellow-700">TL</div>
                        <div className="p-2 text-center border-r border-yellow-200 dark:border-yellow-700">25-05-2025</div>
                        <div className="p-2 text-center">Arun</div>
                      </div>
                      <div className="grid grid-cols-3 text-sm">
                        <div className="p-2 text-center border-r border-yellow-200 dark:border-yellow-700">CEO</div>
                        <div className="p-2 text-center border-r border-yellow-200 dark:border-yellow-700">01-05-2025</div>
                        <div className="p-2 text-center">Vikna Prakash</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>
            
            {/* Requirements Boxes */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { title: "Total Requirements", count: 10 },
                { title: "High Priority", count: 3 },
                { title: "Robust Requirements", count: 4 },
                { title: "Idle Requirements", count: 2 },
                { title: "Delivery Pending", count: 3 },
                { title: "Easy Requirements", count: 2 },
              ].map((box, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-24 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {box.title}
                  </h3>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400 self-end">
                    {box.count}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Deliverables Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Deliverables</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th className="p-3 text-gray-900 dark:text-gray-200">Positions</th>
                      <th className="p-3 text-gray-900 dark:text-gray-200">Criticality</th>
                      <th className="p-3 text-gray-900 dark:text-gray-200">Company</th>
                      <th className="p-3 text-gray-900 dark:text-gray-200">SPOC</th>
                      <th className="p-3 text-gray-900 dark:text-gray-200">SPOC Email</th>
                      <th className="p-3 text-gray-900 dark:text-gray-200">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRequirements.slice(0, 5).map((req) => (
                      <tr key={req.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-3 text-blue-600 dark:text-blue-400 font-medium">{req.position}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            req.criticality === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            req.criticality === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {req.criticality}
                          </span>
                        </td>
                        <td className="p-3 text-gray-900 dark:text-gray-200">{req.company}</td>
                        <td className="p-3 text-gray-900 dark:text-gray-200">{req.contactPerson}</td>
                        <td className="p-3 text-gray-900 dark:text-gray-200">{req.contactPersonEmail}</td>
                        <td className="p-3">
                          <button 
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            onClick={() => {
                              setOpenCalendarId(req.id.toString());
                              const mostRecentDate = getMostRecentDateForReq(req.id.toString());
                              setSelectedDate(mostRecentDate || getToday());
                              setInputCount('');
                              setCalendarStep('calendar');
                              setShowModal(true);
                            }}
                          >
                            {getTotalCountForReq(req.id.toString()) === 0 ? 'Set' : getTotalCountForReq(req.id.toString())}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* View More/Less and Archive Buttons */}
              <div className="flex justify-end gap-4 mt-4">
                {activeRequirements.length > 5 && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    View More
                  </button>
                )}
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Req-Archives
                </button>
              </div>
            </div>
            
            {/* Count Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                      Set Requirements Count
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                  
                  {calendarStep === 'calendar' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">
                        Select Date
                      </h3>
                      <div className="mb-4">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                      </div>
                      <div className="flex gap-4 justify-end">
                        <button
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={() => setCalendarStep('input')}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {calendarStep === 'input' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-200">
                        Add Count for {selectedDate}
                      </h3>
                      <div className="mb-4">
                        <input
                          type="number"
                          value={inputCount}
                          onChange={(e) => setInputCount(e.target.value)}
                          placeholder="Enter count to add"
                          className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          min="0"
                          autoFocus
                        />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        This will be added to the existing count for this date.
                      </div>
                      <div className="flex gap-4 justify-end">
                        <button
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                          onClick={() => setCalendarStep('calendar')}
                        >
                          Back
                        </button>
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          onClick={() => {
                            if (openCalendarId && inputCount) {
                              const currentCount = parseInt(requirementCounts[openCalendarId]?.[selectedDate] || '0');
                              const newCount = parseInt(inputCount) || 0;
                              const totalCount = currentCount + newCount;

                              setRequirementCounts(prev => ({
                                ...prev,
                                [openCalendarId]: {
                                  ...(prev[openCalendarId] || {}),
                                  [selectedDate]: totalCount.toString()
                                }
                              }));
                              setShowModal(false);
                              setOpenCalendarId(null);
                              setCalendarStep('calendar');
                              setInputCount('');
                            }
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'pipeline':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pipeline</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Resume processed</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">20</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Recruitment worked</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">12</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Feedback pending</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">8</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Assignment cleared</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">10</div>
              </div>
            </div>

            {/* Pipeline Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-7 gap-4 text-center font-semibold mb-4 text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div>Level 1</div>
                <div>Level 2</div>
                <div>Level 3</div>
                <div>Final Round</div>
                <div>HR Round</div>
                <div>Offer Stage</div>
                <div>Closure</div>
              </div>

              <div className="grid grid-cols-7 gap-4 space-y-4">
                {/* Keerthana */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-green-100 text-green-800 rounded shadow-sm text-sm text-center">Keerthana</div>
                <div className="p-2 bg-green-100 text-green-800 rounded shadow-sm text-sm text-center">Keerthana</div>

                {/* Vishnu */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-green-100 text-green-800 rounded shadow-sm text-sm text-center">Vishnu</div>
                <div className="p-2 bg-green-100 text-green-800 rounded shadow-sm text-sm text-center">Vishnu</div>

                {/* Chanakya */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Chanakya</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Chanakya</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Chanakya</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Chanakya</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Chanakya</div>
                <div className="p-2"></div>
                <div className="p-2"></div>

                {/* Adhya */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Adhya</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Adhya</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Adhya</div>
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm text-sm text-center">Adhya</div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>

                {/* Vanshika */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vanshika</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vanshika</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vanshika</div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>

                {/* Reyansh */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Reyansh</div>
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Reyansh</div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>

                {/* Shaurya */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Shaurya</div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>

                {/* Vihana */}
                <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm text-sm text-center">Vihana</div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
                <div className="p-2"></div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg cursor-pointer">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">Tenure</div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white">4</div>
                <div className="text-red-500 text-lg font-medium">Quarters</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg cursor-pointer">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">Total Closures</div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mt-2">12</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg cursor-pointer">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">Recent Closure</div>
                <div className="text-lg font-bold text-gray-500 dark:text-gray-300">Adhitya</div>
                <div className="text-red-500 text-lg font-medium">Tracx</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg cursor-pointer">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">Last Closure</div>
                <div className="text-lg font-bold text-gray-500 dark:text-gray-300 mt-3">1 Month 15 Days</div>
              </div>
            </div>
            
            {/* Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Closure Performance</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Offered On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quarter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Closure Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Incentive</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {performanceData.map((row, index) => (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : ''
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {row.candidate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {row.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {row.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {row.offeredOn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {row.joinedOn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {row.quarter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          ₹{row.closureValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          ₹{row.incentive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          </div>
        );
    }
  };

  const renderChatContent = () => {
    const currentMessages = getCurrentChatMessages();

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-6 h-full flex flex-col">
            
            {/* Chat Header */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-comments mr-2 text-blue-600"></i>
                  <h2 className="text-lg font-semibold text-gray-900">{getCurrentChatTitle()}</h2>
                </div>
                {chatType === 'private' && (
                  <button 
                    onClick={handleSwitchToTeamChat}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    data-testid="button-back-to-team-chat"
                  >
                    Back to Team Chat
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {chatType === 'team' ? '5 members online' : 'Private conversation'}
              </p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {currentMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {!message.isOwn && (
                        <div className="text-xs font-semibold text-blue-600 mb-1">
                          {message.sender}
                        </div>
                      )}
                      <div className="text-sm">{message.message}</div>
                      <div className={`text-xs mt-1 ${message.isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    data-testid="input-chat-message"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    data-testid="button-send-message"
                  >
                    Send
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center space-x-4 mt-3">
                  <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                    <i className="fas fa-paperclip mr-2"></i>
                    Attach File
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                    <i className="fas fa-file-alt mr-2"></i>
                    Share Resume
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                    <i className="fas fa-calendar mr-2"></i>
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat Participants */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chat Participants</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Team Chat Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Team Chat (5 members)</h4>
                <button 
                  onClick={handleSwitchToTeamChat}
                  className={`text-xs px-2 py-1 rounded ${
                    chatType === 'team' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  data-testid="button-switch-team-chat"
                >
                  Join
                </button>
              </div>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      chatType === 'team' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                    onClick={() => handleStartPrivateChat(member.id)}
                    data-testid={`contact-team-${member.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPrivateChat(member.id);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Contacts Section */}
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Private Contacts (4 contacts)</h4>
              <div className="space-y-2">
                {individualContacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      chatType === 'private' && activeChatUser === contact.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                    onClick={() => handleStartPrivateChat(contact.id)}
                    data-testid={`contact-private-${contact.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        contact.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      </div>
                    </div>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPrivateChat(contact.id);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <>
            <RecruiterProfileHeader profile={recruiterProfile} />
            <RecruiterTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto">
              {renderDashboardTabContent()}
            </div>
          </>
        );
      case 'job-board':
        return <JobBoardTab />;
      case 'chat':
        return renderChatContent();
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your recruiter preferences and settings</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar 
        activeTab={sidebarTab} 
        onTabChange={setSidebarTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        {renderSidebarContent()}
      </div>
      
      {/* Interview Scheduling Modal */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInterviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                name="candidateName"
                value={interviewForm.candidateName}
                onChange={handleInterviewChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={interviewForm.position}
                onChange={handleInterviewChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                name="client"
                value={interviewForm.client}
                onChange={handleInterviewChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input
                id="interviewDate"
                name="interviewDate"
                type="date"
                value={interviewForm.interviewDate}
                onChange={handleInterviewChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewTime">Interview Time</Label>
              <Input
                id="interviewTime"
                name="interviewTime"
                type="time"
                value={interviewForm.interviewTime}
                onChange={handleInterviewChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewType">Interview Type</Label>
              <Select name="interviewType" value={interviewForm.interviewType} onValueChange={(value) => setInterviewForm(prev => ({...prev, interviewType: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interviewRound">Interview Round</Label>
              <Select name="interviewRound" value={interviewForm.interviewRound} onValueChange={(value) => setInterviewForm(prev => ({...prev, interviewRound: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Cultural Fit">Cultural Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)} className="px-3 py-1 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="px-3 py-1 text-xs">Schedule Interview</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Today's Interviews Modal */}
      <Dialog open={showTodayInterviewsModal} onOpenChange={setShowTodayInterviewsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Today's Interview Schedule</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {todaysInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No interviews scheduled for today
              </div>
            ) : (
              <div className="space-y-3">
                {todaysInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600">{interview.position} - {interview.client}</p>
                        <p className="text-sm text-gray-500">{interview.interviewTime} | {interview.interviewType}</p>
                        <p className="text-xs text-gray-400">{interview.interviewRound} Round</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowTodayInterviewsModal(false)} className="px-3 py-1 text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Candidate Archiving Modal */}
      <Dialog open={showReasonModal} onOpenChange={setShowReasonModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to mark <strong>{selectedCandidate?.name}</strong> as "Screened Out"?</p>
            <div>
              <Label htmlFor="reason">Reason for rejection</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedCandidate(null);
                  setReason('');
                }}
                className="px-3 py-1 text-xs"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={archiveCandidate}
                disabled={!reason}
                className="px-3 py-1 text-xs"
              >
                Archive Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Job Modal */}
      <Dialog open={isPostJobModalOpen} onOpenChange={setIsPostJobModalOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Post the job</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
            
            <div className="space-y-4">
              {/* Required fields notice */}
              <div className="text-sm text-red-500 mb-4">* All fields are required</div>
              
              {/* Error message */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {formError}
                </div>
              )}
              
              {/* Company Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Building size={16} />
                </div>
                <Input
                  value={jobFormData.companyName}
                  onChange={(e) => setJobFormData({...jobFormData, companyName: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Name"
                />
              </div>

              {/* Company Tagline */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Tag size={16} />
                </div>
                <Input
                  value={jobFormData.companyTagline}
                  onChange={(e) => setJobFormData({...jobFormData, companyTagline: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border pr-16 focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Tagline"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">0/100</span>
              </div>

              {/* Row 1: Company Type, Market */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <BarChart3 size={16} />
                  </div>
                  <Select value={jobFormData.companyType} onValueChange={(value) => setJobFormData({...jobFormData, companyType: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Company Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Target size={16} />
                  </div>
                  <Select value={jobFormData.market} onValueChange={(value) => setJobFormData({...jobFormData, market: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Field, No of Positions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <FolderOpen size={16} />
                  </div>
                  <Select value={jobFormData.field} onValueChange={(value) => setJobFormData({...jobFormData, field: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Use 25-26 Without Background" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-development">Software Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Hash size={16} />
                  </div>
                  <Select value={jobFormData.noOfPositions} onValueChange={(value) => setJobFormData({...jobFormData, noOfPositions: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="No of Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Role, Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <User size={16} />
                  </div>
                  <Select value={jobFormData.role} onValueChange={(value) => setJobFormData({...jobFormData, role: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <TrendingUp size={16} />
                  </div>
                  <Select value={jobFormData.experience} onValueChange={(value) => setJobFormData({...jobFormData, experience: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Location, Work Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <MapPin size={16} />
                  </div>
                  <Select value={jobFormData.location} onValueChange={(value) => setJobFormData({...jobFormData, location: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Laptop size={16} />
                  </div>
                  <Select value={jobFormData.workMode} onValueChange={(value) => setJobFormData({...jobFormData, workMode: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Work Mode, Salary Package */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Briefcase size={16} />
                  </div>
                  <Select value={jobFormData.workMode} onValueChange={(value) => setJobFormData({...jobFormData, workMode: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <DollarSign size={16} />
                  </div>
                  <Select value={jobFormData.salaryPackage} onValueChange={(value) => setJobFormData({...jobFormData, salaryPackage: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Salary Package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0-5 LPA</SelectItem>
                      <SelectItem value="5-10">5-10 LPA</SelectItem>
                      <SelectItem value="10+">10+ LPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* About Company */}
              <div className="relative">
                <textarea
                  value={jobFormData.aboutCompany}
                  onChange={(e) => setJobFormData({...jobFormData, aboutCompany: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-16"
                  placeholder="About Company"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0/1000</span>
              </div>

              {/* Role Definitions */}
              <div className="relative">
                <textarea
                  value={jobFormData.roleDefinitions}
                  onChange={(e) => setJobFormData({...jobFormData, roleDefinitions: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-16"
                  placeholder="Role Definitions"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0/1500</span>
              </div>

              {/* Key Responsibility */}
              <div className="relative">
                <textarea
                  value={jobFormData.keyResponsibility}
                  onChange={(e) => setJobFormData({...jobFormData, keyResponsibility: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-20"
                  placeholder="Key Responsibility"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0-20 points</span>
              </div>

              {/* Add up to 15 skills */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Add up to 15 skills</Label>
                
                {/* Primary Skills */}
                <div className="mb-3">
                  <Label className="text-xs text-gray-600 mb-2 block">Primary Skills</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {jobFormData.primarySkills.map((skill, index) => (
                      <Select key={`primary-${index}`} value={skill} onValueChange={(value) => {
                        const newSkills = [...jobFormData.primarySkills];
                        newSkills[index] = value;
                        setJobFormData({...jobFormData, primarySkills: newSkills});
                      }}>
                        <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                          <SelectValue placeholder="Data Analyst" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-analyst">Data Analyst</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                {/* Secondary Skills */}
                <div className="mb-3">
                  <Label className="text-xs text-gray-600 mb-2 block">Secondary Skills</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {jobFormData.secondarySkills.map((skill, index) => (
                      <Select key={`secondary-${index}`} value={skill} onValueChange={(value) => {
                        const newSkills = [...jobFormData.secondarySkills];
                        newSkills[index] = value;
                        setJobFormData({...jobFormData, secondarySkills: newSkills});
                      }}>
                        <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                          <SelectValue placeholder="SEO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seo">SEO</SelectItem>
                          <SelectItem value="content-creation">Content Creation</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                {/* Knowledge Only */}
                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Knowledge only</Label>
                  <Select value={jobFormData.knowledgeOnly[0]} onValueChange={(value) => {
                    setJobFormData({...jobFormData, knowledgeOnly: [value]});
                  }}>
                    <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-ml">AI/ML</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="cloud">Cloud Computing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Company Logo */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Upload size={16} />
                </div>
                <Input
                  value={jobFormData.companyLogo}
                  onChange={(e) => setJobFormData({...jobFormData, companyLogo: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Logo (Image/Link)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 rounded-sm"
                  onClick={() => setIsPreviewModalOpen(true)}
                >
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
                  onClick={handlePostJob}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ml-32">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Job Preview</DialogTitle>
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              type="button"
            >
              <X size={20} />
            </button>
          </DialogHeader>
          
          {/* Job Card Preview - Matching Candidate Dashboard Design */}
          <div className="bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="flex">
              {/* Company Logo Section - Left Side */}
              <div className="w-52 flex flex-col items-center justify-center relative">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 flex flex-col items-center justify-center mx-2 my-4 h-full min-h-[200px]" style={{width: '80%'}}>
                  {jobFormData.companyLogo ? (
                    <img
                      src={jobFormData.companyLogo}
                      alt={`${jobFormData.companyName} logo`}
                      className="w-16 h-16 rounded object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center mb-2">
                      <Building size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700">
                      {jobFormData.companyName ? jobFormData.companyName.split(' ')[0] : 'Company'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details - Right Side */}
              <div className="flex-1 p-6 relative">
                {/* Save Job Button - Top Right */}
                <button className="absolute top-6 right-6 p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200">
                  <i className="far fa-bookmark text-white"></i>
                </button>

                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  {jobFormData.companyName || 'Company Name'}
                </h3>
                <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {jobFormData.role || 'Job Title'}
                  <i className="fas fa-fire text-red-500 text-lg"></i>
                </h4>
                <p className="text-gray-600 mb-4">
                  {jobFormData.companyTagline || 'Technology Product based hyper growth, Innovative company.'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-briefcase"></i>
                    {jobFormData.experience || 'Experience'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">₹</span>
                    {jobFormData.salaryPackage || 'Salary'} LPA
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-map-marker-alt"></i>
                    {jobFormData.location || 'Location'}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    {jobFormData.workMode || 'Work from office'}
                  </span>
                  <span className="font-medium">{jobFormData.type || 'Permanent'}</span>
                </div>

                {/* Job Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    Open Positions ~ {jobFormData.noOfPositions || '2'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {jobFormData.companyType || 'Product'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {jobFormData.market || 'B2B'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {jobFormData.type || 'Full Time'}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex items-center gap-2 mb-4">
                  {jobFormData.primarySkills.filter(skill => skill).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {jobFormData.secondarySkills.filter(skill => skill).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Posted: 3 days ago</span>
                  <div className="flex gap-2">
                    <Button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-medium" size="sm">
                      View More
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium" size="sm">
                      Apply
                    </Button>
                  </div>
                </div>
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {resumeFormError}
                </div>
              )}
              
              {/* Row 1: First Name, Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.firstName}
                  onChange={(e) => setResumeFormData({...resumeFormData, firstName: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="First Name *"
                />
                <Input
                  value={resumeFormData.lastName}
                  onChange={(e) => setResumeFormData({...resumeFormData, lastName: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Last Name *"
                />
              </div>

              {/* Row 2: Mobile Number, WhatsApp Number */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.mobileNumber}
                  onChange={(e) => setResumeFormData({...resumeFormData, mobileNumber: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Mobile Number *"
                />
                <Input
                  value={resumeFormData.whatsappNumber}
                  onChange={(e) => setResumeFormData({...resumeFormData, whatsappNumber: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="WhatsApp Number"
                />
              </div>

              {/* Row 3: Primary Email, Secondary Email */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  value={resumeFormData.primaryEmail}
                  onChange={(e) => setResumeFormData({...resumeFormData, primaryEmail: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Primary Email *"
                />
                <Input
                  type="email"
                  value={resumeFormData.secondaryEmail}
                  onChange={(e) => setResumeFormData({...resumeFormData, secondaryEmail: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Secondary Email"
                />
              </div>

              {/* Row 4: Highest Qualification, College Name */}
              <div className="grid grid-cols-2 gap-4">
                <Select value={resumeFormData.highestQualification} onValueChange={(value) => setResumeFormData({...resumeFormData, highestQualification: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Highest Qualification *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="12th">12th Standard</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={resumeFormData.collegeName}
                  onChange={(e) => setResumeFormData({...resumeFormData, collegeName: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="College Name *"
                />
              </div>

              {/* Row 5: LinkedIn, Pedigree Level */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.linkedin}
                  onChange={(e) => setResumeFormData({...resumeFormData, linkedin: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="LinkedIn Profile"
                />
                <Select value={resumeFormData.pedigreeLevel} onValueChange={(value) => setResumeFormData({...resumeFormData, pedigreeLevel: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Pedigree Level *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier1">Tier 1</SelectItem>
                    <SelectItem value="tier2">Tier 2</SelectItem>
                    <SelectItem value="tier3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 6: Current Location, Notice Period */}
              <div className="grid grid-cols-2 gap-4">
                <Select value={resumeFormData.currentLocation} onValueChange={(value) => setResumeFormData({...resumeFormData, currentLocation: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Current Location *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resumeFormData.noticePeriod} onValueChange={(value) => setResumeFormData({...resumeFormData, noticePeriod: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Notice Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="15days">15 Days</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="2months">2 Months</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 7: Website, Portfolio 1 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.website}
                  onChange={(e) => setResumeFormData({...resumeFormData, website: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Website URL"
                />
                <Input
                  value={resumeFormData.portfolio1}
                  onChange={(e) => setResumeFormData({...resumeFormData, portfolio1: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Portfolio 1 URL"
                />
              </div>

              {/* Row 8: Current Company, Portfolio 2 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.currentCompany}
                  onChange={(e) => setResumeFormData({...resumeFormData, currentCompany: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Current Company *"
                />
                <Input
                  value={resumeFormData.portfolio2}
                  onChange={(e) => setResumeFormData({...resumeFormData, portfolio2: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Portfolio 2 URL"
                />
              </div>

              {/* Row 9: Current Role, Portfolio 3 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={resumeFormData.currentRole}
                  onChange={(e) => setResumeFormData({...resumeFormData, currentRole: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Current Role *"
                />
                <Input
                  value={resumeFormData.portfolio3}
                  onChange={(e) => setResumeFormData({...resumeFormData, portfolio3: e.target.value})}
                  className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Portfolio 3 URL"
                />
              </div>

              {/* Row 10: Company Domain, Company Level */}
              <div className="grid grid-cols-2 gap-4">
                <Select value={resumeFormData.companyDomain} onValueChange={(value) => setResumeFormData({...resumeFormData, companyDomain: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Company Domain *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resumeFormData.companyLevel} onValueChange={(value) => setResumeFormData({...resumeFormData, companyLevel: value})}>
                  <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Company Level *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="midsize">Mid-size</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="mnc">MNC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Section */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Skills *</p>
                <p className="text-xs text-gray-500 mb-3">Add up to 15 skills</p>
                <div className="flex flex-wrap gap-2">
                  {resumeFormData.skills.map((skill, index) => (
                    <Input
                      key={index}
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...resumeFormData.skills];
                        newSkills[index] = e.target.value;
                        setResumeFormData({...resumeFormData, skills: newSkills});
                      }}
                      className="bg-gray-50 rounded w-32 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
                      placeholder={`Skill ${index + 1}`}
                    />
                  ))}
                  {resumeFormData.skills.length < 15 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setResumeFormData({...resumeFormData, skills: [...resumeFormData.skills, '']})}
                      className="text-xs px-2 py-1"
                    >
                      + Add Skill
                    </Button>
                  )}
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
                      <p className="text-xs text-green-600">Selected: {resumeFile.name}</p>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs text-gray-600 mt-2"
                    >
                      Browse Files
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => {
                    // Basic validation
                    const required = ['firstName', 'lastName', 'mobileNumber', 'primaryEmail', 'highestQualification', 'collegeName', 'pedigreeLevel', 'currentLocation', 'currentCompany', 'currentRole', 'companyDomain', 'companyLevel'];
                    const hasEmptyRequired = required.some(field => !resumeFormData[field].trim());
                    const hasSkills = resumeFormData.skills.some(skill => skill.trim());
                    
                    if (hasEmptyRequired || !hasSkills) {
                      setResumeFormError('Please fill out all required fields and add at least one skill');
                      return;
                    }
                    
                    setIsUploadResumeModalOpen(false);
                    // Reset form
                    setResumeFormData({
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
                    setResumeFile(null);
                    setResumeFormError('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-medium"
                >
                  Submit Resume
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
          Job posted successfully!
        </div>
      )}

      {/* Floating Help Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
        data-testid="button-help"
        aria-label="Help"
        title="Need help? Chat with us!"
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