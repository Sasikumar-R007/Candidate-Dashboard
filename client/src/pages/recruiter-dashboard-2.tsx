import { useState, useMemo } from 'react';
import TeamLeaderMainSidebar from '@/components/dashboard/team-leader-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamLeaderTeamBoxes from '@/components/dashboard/team-leader-team-boxes';
import TeamLeaderSidebar from '@/components/dashboard/team-leader-sidebar';
import AddRequirementModal from '@/components/dashboard/modals/add-requirement-modal';
import PostJobModal from '@/components/dashboard/modals/PostJobModal';
import UploadResumeModal from '@/components/dashboard/modals/UploadResumeModal';
import DailyDeliveryModal from '@/components/dashboard/modals/daily-delivery-modal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, EditIcon, MoreVertical, Mail, UserRound, Plus, Upload, X, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
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
  const [isAllRequirementsModalOpen, setIsAllRequirementsModalOpen] = useState(false);
  const [requirementsSearchQuery, setRequirementsSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState("");
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isDefaultedModalOpen, setIsDefaultedModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isTodayInterviewsModalOpen, setIsTodayInterviewsModalOpen] = useState(false);
  const [isPendingCasesModalOpen, setIsPendingCasesModalOpen] = useState(false);
  const [pipelineDate, setPipelineDate] = useState<Date>(new Date());
  const [isViewAllClosuresModalOpen, setIsViewAllClosuresModalOpen] = useState(false);
  const [closureSearchQuery, setClosureSearchQuery] = useState('');
  const [isPendingMeetingsModalOpen, setIsPendingMeetingsModalOpen] = useState(false);
  const [isCeoCommandsModalOpen, setIsCeoCommandsModalOpen] = useState(false);
  const [isApplicantOverviewModalOpen, setIsApplicantOverviewModalOpen] = useState(false);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');
  const [isCandidateProfileModalOpen, setIsCandidateProfileModalOpen] = useState(false);
  const [selectedPipelineCandidate, setSelectedPipelineCandidate] = useState<any>(null);
  
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
  
  // Calendar modal state for requirements count
  const [requirementCounts, setRequirementCounts] = useState<{[key: string]: {[date: string]: string}}>({});
  const [showModal, setShowModal] = useState(false);
  const [calendarStep, setCalendarStep] = useState<'calendar' | 'input'>('calendar');
  const [selectedDateForCount, setSelectedDateForCount] = useState('');
  const [inputCount, setInputCount] = useState('');
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  
  // Helper functions for calendar modal
  const getTotalCountForReq = (reqId: string) => {
    const counts = requirementCounts[reqId];
    if (!counts) return 0;
    return Object.values(counts).reduce((sum, count) => sum + parseInt(count || '0'), 0);
  };

  const getMostRecentDateForReq = (reqId: string) => {
    const counts = requirementCounts[reqId];
    if (!counts || Object.keys(counts).length === 0) return null;
    const dates = Object.keys(counts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0];
  };

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // New state variables for Post Jobs and Upload Resume functionality
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
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
    employmentType: '',
    salaryPackage: '',
    aboutCompany: '',
    roleDefinitions: '',
    keyResponsibility: '',
    primarySkills: [''],
    secondarySkills: [''],
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

  // Query for job counts
  const { data: jobCounts } = useQuery<{total: number, active: number, closed: number, draft: number}>({
    queryKey: ['/api/recruiter/jobs/counts']
  });

  // Query for candidate counts
  const { data: candidateCounts } = useQuery<{total: number, active: number, inactive: number}>({
    queryKey: ['/api/recruiter/candidates/counts']
  });

  // Query for all job applications
  const { data: allApplications = [] } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications']
  });

  // Calculate application stats
  const applicationStats = useMemo(() => {
    const total = allApplications.length;
    const today = new Date().toISOString().split('T')[0];
    const newApps = allApplications.filter((app: any) => 
      app.appliedDate && app.appliedDate.split('T')[0] === today
    ).length;
    return { total, new: newApps };
  }, [allApplications]);

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest('PATCH', `/api/recruiter/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
    }
  });

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

  // Handle pipeline stage clicks
  const handlePipelineStageClick = (stage: string) => {
    // For demo purposes, show an alert with the action options
    // In a real application, this would open a modal with candidate list
    const stageActions = {
      'CLOSURE': 'View candidates ready for closure. You can close selected candidates.',
      'OFFER_DROP': 'View candidates who dropped offers. You can mark them as rejected.',
      'OFFER_STAGE': 'View candidates in offer stage. You can send offer letters.',
      'HR_ROUND': 'View candidates in HR round. You can schedule HR interviews.',
      'FINAL_ROUND': 'View candidates in final round. You can mark interview results.',
      'L3': 'View candidates in L3 round. You can mark interview results.',
      'L2': 'View candidates in L2 round. You can mark interview results.',
      'L1': 'View candidates in L1 round. You can mark interview results.',
      'ASSIGNMENT': 'View candidates in assignment stage. You can review assignments.',
      'INTRO_CALL': 'View candidates in intro call stage. You can schedule calls.',
      'SHORTLISTED': 'View shortlisted candidates. You can move them to next stage.',
      'SOURCED': 'View sourced candidates. You can shortlist them.'
    };
    
    alert(`${stage}\n\n${stageActions[stage] || 'Manage candidates in this stage.'}`);
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
      employmentType: '',
      salaryPackage: '',
      aboutCompany: '',
      roleDefinitions: '',
      keyResponsibility: '',
      primarySkills: [''],
      secondarySkills: [''],
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
  const statuses = ['In-Process', 'Shortlisted', 'L1', 'L2', 'L3', 'Final Round', 'HR Round', 'Selected', 'Screened Out'];
  const rejectionReasons = ['Skill mismatch', 'Lack of communication', 'Inadequate experience', 'Unprofessional behavior', 'Other'];

  // Transform API applications to applicant data format for the UI
  const applicantData = useMemo(() => {
    if (!allApplications || allApplications.length === 0) {
      // Show sample data when no real applications exist with full profile info
      return [
        { id: 1, appliedOn: '06-06-2025', candidateName: 'Aarav', company: 'TechCorp', roleApplied: 'Frontend Developer', submission: 'Inbound', currentStatus: 'L1', email: 'aarav.kumar@email.com', phone: '+91 9876543210', location: 'Bangalore, India', experience: '4 years', skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'], education: 'B.Tech Computer Science', currentCompany: 'Microsoft', rating: 4.5 },
        { id: 2, appliedOn: '08-06-2025', candidateName: 'Arjun', company: 'Designify', roleApplied: 'UI/UX Designer', submission: 'Uploaded', currentStatus: 'L2', email: 'arjun.sharma@email.com', phone: '+91 9876543211', location: 'Mumbai, India', experience: '3 years', skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'], education: 'B.Des Visual Design', currentCompany: 'Adobe', rating: 4.2 },
        { id: 3, appliedOn: '20-06-2025', candidateName: 'Shaurya', company: 'CodeLabs', roleApplied: 'Backend Developer', submission: 'Uploaded', currentStatus: 'L3', email: 'shaurya.singh@email.com', phone: '+91 9876543212', location: 'Delhi, India', experience: '5 years', skills: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS'], education: 'M.Tech Software Engineering', currentCompany: 'Google', rating: 4.8 },
        { id: 4, appliedOn: '01-07-2025', candidateName: 'Vihaan', company: 'AppLogic', roleApplied: 'QA Tester', submission: 'Inbound', currentStatus: 'HR Round', email: 'vihaan.patel@email.com', phone: '+91 9876543213', location: 'Hyderabad, India', experience: '3.5 years', skills: ['Selenium', 'JIRA', 'Python', 'API Testing'], education: 'B.Tech IT', currentCompany: 'Infosys', rating: 4.0 },
        { id: 5, appliedOn: '23-07-2025', candidateName: 'Aditya', company: 'Bug Catchers', roleApplied: 'Mobile App Developer', submission: 'Inbound', currentStatus: 'Selected', email: 'aditya.gupta@email.com', phone: '+91 9876543214', location: 'Pune, India', experience: '4 years', skills: ['React Native', 'Flutter', 'iOS', 'Android'], education: 'B.Tech Computer Science', currentCompany: 'Flipkart', rating: 4.6 },
        { id: 6, appliedOn: '25-07-2025', candidateName: 'Keerthana', company: 'TechStack', roleApplied: 'Full Stack Developer', submission: 'Inbound', currentStatus: 'L1', email: 'keerthana.r@email.com', phone: '+91 9876543215', location: 'Chennai, India', experience: '5 years', skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'], education: 'M.Tech Computer Science', currentCompany: 'Amazon', rating: 4.7 },
        { id: 7, appliedOn: '26-07-2025', candidateName: 'Vishnu Purana', company: 'DataFlow', roleApplied: 'Data Scientist', submission: 'Uploaded', currentStatus: 'L2', email: 'vishnu.p@email.com', phone: '+91 9876543216', location: 'Bangalore, India', experience: '4 years', skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'], education: 'M.Sc Data Science', currentCompany: 'IBM', rating: 4.4 },
        { id: 8, appliedOn: '27-07-2025', candidateName: 'Chanakya', company: 'CloudOps', roleApplied: 'DevOps Engineer', submission: 'Inbound', currentStatus: 'Final Round', email: 'chanakya.dev@email.com', phone: '+91 9876543217', location: 'Gurgaon, India', experience: '6 years', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'], education: 'B.Tech IT', currentCompany: 'Accenture', rating: 4.9 },
        { id: 9, appliedOn: '28-07-2025', candidateName: 'Adhya', company: 'SecureNet', roleApplied: 'Security Analyst', submission: 'Uploaded', currentStatus: 'HR Round', email: 'adhya.sharma@email.com', phone: '+91 9876543218', location: 'Mumbai, India', experience: '4 years', skills: ['Penetration Testing', 'SIEM', 'Firewall', 'Python'], education: 'M.Tech Cybersecurity', currentCompany: 'Deloitte', rating: 4.3 },
        { id: 10, appliedOn: '29-07-2025', candidateName: 'Vanshika', company: 'ProductLab', roleApplied: 'Product Designer', submission: 'Inbound', currentStatus: 'Selected', email: 'vanshika.reddy@email.com', phone: '+91 9876543219', location: 'Hyderabad, India', experience: '3 years', skills: ['Figma', 'Sketch', 'User Testing', 'Wireframing'], education: 'B.Des Product Design', currentCompany: 'Swiggy', rating: 4.5 },
        { id: 11, appliedOn: '30-07-2025', candidateName: 'Reyansh', company: 'Enterprise', roleApplied: 'Java Developer', submission: 'Inbound', currentStatus: 'L1', email: 'reyansh.kumar@email.com', phone: '+91 9876543220', location: 'Noida, India', experience: '5 years', skills: ['Java', 'Spring', 'Hibernate', 'Microservices'], education: 'B.Tech Computer Science', currentCompany: 'TCS', rating: 4.1 },
        { id: 12, appliedOn: '31-07-2025', candidateName: 'Vihana', company: 'WebTech', roleApplied: 'React Developer', submission: 'Uploaded', currentStatus: 'Shortlisted', email: 'vihana.singh@email.com', phone: '+91 9876543221', location: 'Bangalore, India', experience: '2 years', skills: ['React', 'JavaScript', 'CSS3', 'Redux'], education: 'BCA', currentCompany: 'Wipro', rating: 3.9 },
        { id: 13, appliedOn: '01-08-2025', candidateName: 'Priya', company: 'CloudOps', roleApplied: 'Cloud Architect', submission: 'Inbound', currentStatus: 'L3', email: 'priya.m@email.com', phone: '+91 9876543222', location: 'Bangalore, India', experience: '7 years', skills: ['AWS', 'Azure', 'GCP', 'Kubernetes'], education: 'M.Tech Cloud Computing', currentCompany: 'Oracle', rating: 4.8 },
      ];
    }
    return allApplications.map((app: any, index: number) => ({
      id: app.id || index + 1,
      appliedOn: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'N/A',
      candidateName: app.candidateName || 'Unknown Candidate',
      company: app.company || 'N/A',
      roleApplied: app.jobTitle || 'N/A',
      submission: app.source === 'job_board' ? 'Inbound' : 'Uploaded',
      currentStatus: app.status || 'In-Process',
      email: app.email || 'N/A',
      phone: app.phone || 'N/A',
      location: app.location || 'N/A',
      experience: app.experience || 'N/A',
      skills: app.skills || [],
      education: app.education || 'N/A',
      currentCompany: app.currentCompany || 'N/A',
      rating: app.rating || 4.0
    }));
  }, [allApplications]);

  // Track local changes to applicant statuses
  const [applicantStatusOverrides, setApplicantStatusOverrides] = useState<{[key: string]: string}>({});

  // Map applicant statuses to pipeline stages (each status maps to exactly one stage)
  const getPipelineCandidatesByStage = useMemo(() => {
    const effectiveApplicants = applicantData.map(a => ({
      ...a,
      currentStatus: applicantStatusOverrides[a.id] || a.currentStatus
    })).filter(a => 
      applicantStatusOverrides[a.id] !== 'Archived' && 
      applicantStatusOverrides[a.id] !== 'Screened Out'
    );

    // Each status maps to exactly one pipeline column to prevent duplicates
    const stageMapping: Record<string, string[]> = {
      'Level 1': ['L1'],
      'Level 2': ['L2'],
      'Level 3': ['L3'],
      'Final Round': ['Final Round'],
      'HR Round': ['HR Round'],
      'Offer Stage': ['Selected'],
      'Shortlisted': ['Shortlisted'],
      'In-Process': ['In-Process']
    };

    const getCandidatesForStage = (stage: string) => {
      const statusesToMatch = stageMapping[stage] || [];
      return effectiveApplicants.filter(a => statusesToMatch.includes(a.currentStatus));
    };

    return {
      level1: getCandidatesForStage('Level 1'),
      level2: getCandidatesForStage('Level 2'),
      level3: getCandidatesForStage('Level 3'),
      finalRound: getCandidatesForStage('Final Round'),
      hrRound: getCandidatesForStage('HR Round'),
      offerStage: getCandidatesForStage('Offer Stage'),
      shortlisted: getCandidatesForStage('Shortlisted'),
      inProcess: getCandidatesForStage('In-Process')
    };
  }, [applicantData, applicantStatusOverrides]);

  // Handle clicking on a pipeline candidate
  const handlePipelineCandidateClick = (candidate: any) => {
    setSelectedPipelineCandidate(candidate);
    setIsCandidateProfileModalOpen(true);
  };

  // Use API data for pending meetings and CEO commands
  const { data: recruiterMeetings = [] } = useQuery({
    queryKey: ['/api/recruiter/meetings'],
  }) as { data: any[] };

  const { data: recruiterCeoCommands = [] } = useQuery({
    queryKey: ['/api/recruiter/ceo-comments'],
  }) as { data: any[] };

  // Helper function to format date strings
  const formatMeetingDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    try {
      // Check if it's already in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      // Parse ISO date and format
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, 'dd-MMM-yyyy');
    } catch {
      return dateStr;
    }
  };

  // Transform API meetings data to UI format
  const pendingMeetingsData = useMemo(() => {
    if (!recruiterMeetings || recruiterMeetings.length === 0) {
      return [];
    }
    return recruiterMeetings.map((meeting: any) => ({
      id: meeting.id,
      meeting: meeting.meetingType,
      date: formatMeetingDate(meeting.meetingDate),
      person: meeting.person
    }));
  }, [recruiterMeetings]);

  // Transform API commands data to UI format
  const ceoCommandsData = useMemo(() => {
    if (!recruiterCeoCommands || recruiterCeoCommands.length === 0) {
      return [];
    }
    return recruiterCeoCommands.map((cmd: any) => ({
      id: cmd.id,
      command: cmd.command,
      date: formatMeetingDate(cmd.date)
    }));
  }, [recruiterCeoCommands]);

  // Handle status change for applicants
  const handleStatusChange = (applicant: any, newStatus: string) => {
    if (newStatus === 'Screened Out') {
      setSelectedCandidate({ ...applicant, status: newStatus });
      setIsReasonModalOpen(true);
    } else {
      // Update local override immediately for optimistic UI
      setApplicantStatusOverrides(prev => ({
        ...prev,
        [applicant.id]: newStatus
      }));
      // Persist the change to the backend
      updateStatusMutation.mutate({ id: applicant.id, status: newStatus });
    }
  };

  // Archive candidate when screened out
  const archiveCandidate = () => {
    if (selectedCandidate) {
      setApplicantStatusOverrides(prev => ({
        ...prev,
        [selectedCandidate.id]: 'Archived'
      }));
      // Persist the archived status
      updateStatusMutation.mutate({ id: selectedCandidate.id, status: 'Screened Out' });
      setIsReasonModalOpen(false);
      setSelectedCandidate(null);
      setReason('');
    }
  };

  // Get effective status (with local overrides for optimistic updates)
  const getEffectiveApplicantData = () => {
    return applicantData
      .filter(a => applicantStatusOverrides[a.id] !== 'Archived')
      .map(a => ({
        ...a,
        currentStatus: applicantStatusOverrides[a.id] || a.currentStatus
      }));
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

  const { data: aggregatedTargets } = useQuery({
    queryKey: ['/api/recruiter/aggregated-targets'],
  }) as { data: { currentQuarter: { quarter: string; year: number; minimumTarget: number; targetAchieved: number; incentiveEarned: number; closures: number; }; allQuarters: any[] } | undefined };

  const formatIndianCurrency = (value: number): string => {
    if (value === 0) return '0';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);
  };

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

              </div>

              {/* Applicant Overview Table */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Applicant Overview</CardTitle>
                  {getEffectiveApplicantData().length > 5 && (
                    <Button 
                      variant="link"
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 flex items-center gap-1"
                      onClick={() => setIsApplicantOverviewModalOpen(true)}
                      data-testid="button-view-all-applicants"
                    >
                      View All
                    </Button>
                  )}
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
                        {getEffectiveApplicantData().slice(0, 5).map((applicant, index) => (
                          <tr key={applicant.id || index} className="border-b border-gray-100 hover:bg-gray-50">
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
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Target</CardTitle>
                  <Button 
                    variant="link"
                    className="text-sm text-blue-600 hover:text-blue-800 p-0"
                    onClick={() => setIsTargetModalOpen(true)}
                    data-testid="button-view-all-targets"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-4 gap-0 bg-blue-50 rounded-lg overflow-hidden">
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-current-quarter">Current Quarter</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? `${aggregatedTargets.currentQuarter.quarter}-${aggregatedTargets.currentQuarter.year}` 
                          : `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`}
                      </p>
                    </div>
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-minimum-target">Minimum Target</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.minimumTarget) 
                          : '0'}
                      </p>
                    </div>
                    <div className="text-center py-8 px-4 border-r border-blue-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-target-achieved">Target Achieved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.targetAchieved) 
                          : '0'}
                      </p>
                    </div>
                    <div className="text-center py-8 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3" data-testid="text-incentive-earned">Incentive Earned</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.incentiveEarned) 
                          : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daily Metrics</CardTitle>
                  <div className="flex items-center space-x-2">
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
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-total-requirements">{dailyMetrics?.totalRequirements ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Total Resumes</span>
                        <span className="text-2xl font-bold" data-testid="text-total-resumes">
                          {(dailyMetrics?.totalResumesDelivered ?? 0) === (dailyMetrics?.totalResumesRequired ?? 0) ? (
                            <span className="text-green-600">
                              {dailyMetrics?.totalResumesDelivered ?? 0}/{dailyMetrics?.totalResumesRequired ?? 0}
                            </span>
                          ) : (
                            <>
                              <span className="text-red-600">{dailyMetrics?.totalResumesDelivered ?? 0}</span>
                              <span className="text-green-600">/{dailyMetrics?.totalResumesRequired ?? 0}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Completed Requirements</span>
                        <span className="text-4xl font-bold text-blue-600" data-testid="text-completed-requirements">{dailyMetrics?.completedRequirements ?? 0}</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-slate-800 text-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-6">Daily Delivery</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-300 mb-2">Delivered</div>
                          <div className="text-4xl font-bold text-white mb-3">0</div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setIsDeliveredModalOpen(true)} data-testid="button-view-delivered">
                            View
                          </Button>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-300 mb-2">Defaulted</div>
                          <div className="text-4xl font-bold text-white mb-3">0</div>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setIsDefaultedModalOpen(true)} data-testid="button-view-defaulted">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Performance */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-lg">G</span>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="link" className="text-blue-600 p-0" onClick={() => setIsPerformanceModalOpen(true)} data-testid="button-view-more-performance">
                            View More
                          </Button>
                        </div>
                      </div>
                      <div className="h-48 flex items-center justify-center bg-white rounded-lg p-4 border border-gray-200">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={(dailyMetrics?.requirements || []).map((req: any) => ({
                              criticality: req.criticality,
                              delivered: req.delivered,
                              remaining: req.required - req.delivered
                            }))}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="criticality" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Resumes', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '11px'
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="delivered" stackId="a" fill="#22c55e" name="Delivered" />
                            <Bar dataKey="remaining" stackId="a" fill="#ef4444" name="Remaining" />
                          </BarChart>
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
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Meetings</CardTitle>
                    {pendingMeetingsData.length > 2 && (
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsPendingMeetingsModalOpen(true)}
                        data-testid="button-open-pending-meetings"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </Button>
                    )}
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
                          {pendingMeetingsData.slice(0, 2).map((meeting) => (
                            <tr key={meeting.id} className="border-b border-gray-100">
                              <td className="py-3 text-gray-900">{meeting.meeting}</td>
                              <td className="py-3 text-gray-900">{meeting.date}</td>
                              <td className="py-3 text-gray-900">{meeting.person}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Commands */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">CEO Commands</CardTitle>
                    {ceoCommandsData.length > 3 && (
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsCeoCommandsModalOpen(true)}
                        data-testid="button-open-ceo-commands"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="bg-slate-800 text-white rounded-lg p-6 space-y-4">
                      {ceoCommandsData.slice(0, 3).map((command) => (
                        <div key={command.id} className="text-sm text-gray-300">
                          <p>{command.command}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto h-full space-y-6">
              {/* Jobs and Applications Stats List */}
              <div className="space-y-0">
                {/* Active Jobs */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-700">Active Jobs</span>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-active-jobs-count">{jobCounts?.active ?? 0}</span>
                </div>
                
                {/* Total Jobs - Clickable Link with External Icon */}
                <div 
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover-elevate rounded-md px-2 -mx-2"
                  onClick={() => navigate('/recruiter-active-jobs')}
                  data-testid="link-total-jobs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">Total Jobs</span>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-total-jobs-count">{jobCounts?.total ?? 0}</span>
                </div>
                
                {/* New Applications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-700">New Applications</span>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-new-applications-count">{applicationStats.new}</span>
                </div>
                
                {/* Total Candidates - Clickable Link with External Icon */}
                <div 
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover-elevate rounded-md px-2 -mx-2"
                  onClick={() => navigate('/recruiter-new-applications')}
                  data-testid="link-total-candidates"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">Total Candidates</span>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-total-candidates-count">{applicationStats.total}</span>
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
    // Updated requirements data with SPOC Email field and IDs for count tracking
    // Data structured to match Priority Distribution: HIGH(6,4,2), MED(5,3,2), LOW(4,3,2)
    const requirementsTableData = [
      // HIGH Priority - Easy: 6
      { id: 1, position: 'Frontend Developer', criticality: 'HIGH', toughness: 'Easy', company: 'TechCorp', spoc: 'David Wilson', spocEmail: 'david@techcorp.com' },
      { id: 2, position: 'React Developer', criticality: 'HIGH', toughness: 'Easy', company: 'WebTech', spoc: 'Sarah Johnson', spocEmail: 'sarah@webtech.com' },
      { id: 3, position: 'UI Developer', criticality: 'HIGH', toughness: 'Easy', company: 'DesignCo', spoc: 'Mike Smith', spocEmail: 'mike@designco.com' },
      { id: 4, position: 'HTML/CSS Specialist', criticality: 'HIGH', toughness: 'Easy', company: 'StyleHub', spoc: 'Emily Chen', spocEmail: 'emily@stylehub.com' },
      { id: 5, position: 'Web Developer', criticality: 'HIGH', toughness: 'Easy', company: 'NetSoft', spoc: 'John Davis', spocEmail: 'john@netsoft.com' },
      { id: 6, position: 'Junior Developer', criticality: 'HIGH', toughness: 'Easy', company: 'StartupX', spoc: 'Lisa Brown', spocEmail: 'lisa@startupx.com' },
      // HIGH Priority - Medium: 4
      { id: 7, position: 'Full Stack Developer', criticality: 'HIGH', toughness: 'Medium', company: 'TechStack', spoc: 'Robert Lee', spocEmail: 'robert@techstack.com' },
      { id: 8, position: 'NodeJS Developer', criticality: 'HIGH', toughness: 'Medium', company: 'BackendPro', spoc: 'Anna White', spocEmail: 'anna@backendpro.com' },
      { id: 9, position: 'Python Developer', criticality: 'HIGH', toughness: 'Medium', company: 'DataFlow', spoc: 'Chris Martin', spocEmail: 'chris@dataflow.com' },
      { id: 10, position: 'Java Developer', criticality: 'HIGH', toughness: 'Medium', company: 'Enterprise', spoc: 'Diana Ross', spocEmail: 'diana@enterprise.com' },
      // HIGH Priority - Tough: 2
      { id: 11, position: 'Solution Architect', criticality: 'HIGH', toughness: 'Tough', company: 'ArchTech', spoc: 'Tom Wilson', spocEmail: 'tom@archtech.com' },
      { id: 12, position: 'Mobile App Developer', criticality: 'HIGH', toughness: 'Tough', company: 'Tesco', spoc: 'Mel Gibson', spocEmail: 'mel@tesco.com' },
      // MEDIUM Priority - Easy: 5
      { id: 13, position: 'QA Tester', criticality: 'MEDIUM', toughness: 'Easy', company: 'AppLogic', spoc: 'Kevin Brown', spocEmail: 'kevin@applogic.com' },
      { id: 14, position: 'Manual Tester', criticality: 'MEDIUM', toughness: 'Easy', company: 'TestLab', spoc: 'Grace Taylor', spocEmail: 'grace@testlab.com' },
      { id: 15, position: 'Support Engineer', criticality: 'MEDIUM', toughness: 'Easy', company: 'HelpDesk', spoc: 'Frank Moore', spocEmail: 'frank@helpdesk.com' },
      { id: 16, position: 'Content Writer', criticality: 'MEDIUM', toughness: 'Easy', company: 'MediaCorp', spoc: 'Helen Clark', spocEmail: 'helen@mediacorp.com' },
      { id: 17, position: 'Documentation Specialist', criticality: 'MEDIUM', toughness: 'Easy', company: 'DocuPro', spoc: 'Ian Cooper', spocEmail: 'ian@docupro.com' },
      // MEDIUM Priority - Medium: 3
      { id: 18, position: 'UI/UX Designer', criticality: 'MEDIUM', toughness: 'Medium', company: 'Designify', spoc: 'Tom Anderson', spocEmail: 'tom@designify.com' },
      { id: 19, position: 'Product Designer', criticality: 'MEDIUM', toughness: 'Medium', company: 'ProductLab', spoc: 'Julia King', spocEmail: 'julia@productlab.com' },
      { id: 20, position: 'Business Analyst', criticality: 'MEDIUM', toughness: 'Medium', company: 'BizTech', spoc: 'Kevin Wright', spocEmail: 'kevin@biztech.com' },
      // MEDIUM Priority - Tough: 2
      { id: 21, position: 'DevOps Engineer', criticality: 'MEDIUM', toughness: 'Tough', company: 'CloudOps', spoc: 'Laura Green', spocEmail: 'laura@cloudops.com' },
      { id: 22, position: 'Security Engineer', criticality: 'MEDIUM', toughness: 'Tough', company: 'SecureNet', spoc: 'Mark Adams', spocEmail: 'mark@securenet.com' },
      // LOW Priority - Easy: 4
      { id: 23, position: 'Office Admin', criticality: 'LOW', toughness: 'Easy', company: 'AdminCo', spoc: 'Nancy Hill', spocEmail: 'nancy@adminco.com' },
      { id: 24, position: 'Receptionist', criticality: 'LOW', toughness: 'Easy', company: 'FrontDesk', spoc: 'Oliver Scott', spocEmail: 'oliver@frontdesk.com' },
      { id: 25, position: 'Data Entry', criticality: 'LOW', toughness: 'Easy', company: 'DataEntry', spoc: 'Paula Young', spocEmail: 'paula@dataentry.com' },
      { id: 26, position: 'HR Assistant', criticality: 'LOW', toughness: 'Easy', company: 'HRPro', spoc: 'Quinn Baker', spocEmail: 'quinn@hrpro.com' },
      // LOW Priority - Medium: 3
      { id: 27, position: 'Marketing Executive', criticality: 'LOW', toughness: 'Medium', company: 'MarketHub', spoc: 'Rachel Turner', spocEmail: 'rachel@markethub.com' },
      { id: 28, position: 'Sales Manager', criticality: 'LOW', toughness: 'Medium', company: 'SalesPro', spoc: 'Steven Hall', spocEmail: 'steven@salespro.com' },
      { id: 29, position: 'Account Manager', criticality: 'LOW', toughness: 'Medium', company: 'AccountCorp', spoc: 'Tina Lewis', spocEmail: 'tina@accountcorp.com' },
      // LOW Priority - Tough: 2
      { id: 30, position: 'Backend Developer', criticality: 'LOW', toughness: 'Tough', company: 'CodeLabs', spoc: 'Robert Kim', spocEmail: 'robert@codelabs.com' },
      { id: 31, position: 'System Architect', criticality: 'LOW', toughness: 'Tough', company: 'SysArch', spoc: 'Uma Patel', spocEmail: 'uma@sysarch.com' },
    ];

    // Calculate priority distribution from requirements data
    const calculatePriorityDistribution = () => {
      const distribution: Record<string, Record<string, number>> = {
        HIGH: { Easy: 0, Medium: 0, Tough: 0 },
        MEDIUM: { Easy: 0, Medium: 0, Tough: 0 },
        LOW: { Easy: 0, Medium: 0, Tough: 0 },
      };

      requirementsTableData.forEach((req) => {
        const criticality = req.criticality;
        const toughness = req.toughness;
        if (distribution[criticality] && distribution[criticality][toughness] !== undefined) {
          distribution[criticality][toughness]++;
        }
      });

      return distribution;
    };

    const priorityDistribution = calculatePriorityDistribution();

    // Sample delivery data - tracks resume deliveries to requirements
    // In production, this would come from the database
    const deliveryData: Record<number, number> = {
      1: 2,  // Frontend Developer - 2 delivered
      7: 1,  // Full Stack Developer - 1 delivered
      13: 3, // QA Tester - 3 delivered
    };

    // Function to get expected count based on criticality and toughness from Priority Distribution
    const getExpectedCount = (criticality: string, toughness: string): number => {
      return priorityDistribution[criticality]?.[toughness] || 0;
    };

    // Function to get delivered count for a requirement
    const getDeliveredCount = (reqId: number): number => {
      return deliveryData[reqId] || 0;
    };

    // Function to format count display as "delivered/expected"
    const getCountDisplay = (req: any): string => {
      const delivered = getDeliveredCount(req.id);
      const expected = getExpectedCount(req.criticality, req.toughness);
      return `${delivered}/${expected}`;
    };

    // Function to check if count is fully completed
    const isCountComplete = (req: any): boolean => {
      const delivered = getDeliveredCount(req.id);
      const expected = getExpectedCount(req.criticality, req.toughness);
      return delivered >= expected && expected > 0;
    };

    // Summary boxes data
    const summaryBoxes = [
      { title: 'Total', count: '20', color: 'text-gray-900' },
      { title: 'High Priority', count: '6', color: 'text-orange-500' },
      { title: 'Robust', count: '7', color: 'text-green-500' },
      { title: 'Idle', count: '9', color: 'text-blue-500' },
      { title: 'Delivery Pending', count: '3', color: 'text-red-400' },
      { title: 'Easy', count: '2', color: 'text-green-600' }
    ];

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-screen">
            {/* Main Content Area */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements</h2>
              
              {/* 6 Summary Boxes */}
              <div className="grid grid-cols-6 gap-4 mb-6">
                {summaryBoxes.map((box, index) => (
                  <Card
                    key={index}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 flex flex-col justify-between h-24 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    data-testid={`card-req-${box.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <h3 className="text-sm font-semibold text-gray-700">
                      {box.title}
                    </h3>
                    <p className={`text-4xl font-bold ${box.color} self-end`}>
                      {box.count}
                    </p>
                  </Card>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h3>
              
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
                        {requirementsTableData.slice(0, 5).map((req, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{req.position}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                req.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                                req.criticality === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                • {req.criticality}-{req.toughness}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{req.company}</td>
                            <td className="py-3 px-4 text-gray-900">{req.spoc}</td>
                            <td className="py-3 px-4 text-gray-900">{req.spocEmail}</td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${isCountComplete(req) ? 'text-green-600' : 'text-red-600'}`} data-testid={`text-count-${index}`}>
                                {getCountDisplay(req)}
                              </span>
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
                      onClick={() => setIsAllRequirementsModalOpen(true)}
                      data-testid="button-view-more"
                    >
                      View More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* All Requirements Modal */}
              {isAllRequirementsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">
                        All Requirements
                      </h2>
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={requirementsSearchQuery}
                          onChange={(e) => setRequirementsSearchQuery(e.target.value)}
                          placeholder="Search requirements..."
                          className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-900 w-64 placeholder:text-gray-400"
                          data-testid="input-search-requirements"
                        />
                        <button
                          onClick={() => {
                            setIsAllRequirementsModalOpen(false);
                            setRequirementsSearchQuery('');
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-2xl"
                          data-testid="button-close-requirements-modal"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-auto flex-1 p-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Positions</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Criticality</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">SPOC</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">SPOC Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requirementsTableData
                            .filter((req) => {
                              if (!requirementsSearchQuery) return true;
                              const query = requirementsSearchQuery.toLowerCase();
                              return (
                                req.position.toLowerCase().includes(query) ||
                                req.criticality.toLowerCase().includes(query) ||
                                req.toughness.toLowerCase().includes(query) ||
                                req.company.toLowerCase().includes(query) ||
                                req.spoc.toLowerCase().includes(query) ||
                                req.spocEmail.toLowerCase().includes(query)
                              );
                            })
                            .map((req, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-900">{req.position}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    req.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    req.criticality === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    • {req.criticality}-{req.toughness}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-900">{req.company}</td>
                                <td className="py-3 px-4 text-gray-900">{req.spoc}</td>
                                <td className="py-3 px-4 text-gray-900">{req.spocEmail}</td>
                                <td className="py-3 px-4">
                                  <span className={`font-medium ${isCountComplete(req) ? 'text-green-600' : 'text-red-600'}`}>
                                    {getCountDisplay(req)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Priority Distribution Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 px-6 py-6">
              <div className="space-y-4">
                {/* Priority Distribution Title */}
                <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                
                {/* Priority Distribution Table */}
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* HIGH Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-red-800">HIGH</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Easy</span>
                            <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Easy}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Med</span>
                            <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Medium}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Tough</span>
                            <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Tough}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* MED Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-yellow-800">MED</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Easy</span>
                            <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Easy}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Med</span>
                            <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Medium}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Tough</span>
                            <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Tough}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* LOW Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-green-800">LOW</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Easy</span>
                            <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Easy}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Med</span>
                            <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Medium}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                            <span className="text-xs text-gray-600">Tough</span>
                            <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Tough}</span>
                          </div>
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
    // Extended closure report data
    const closureReportData = [
      { id: 1, candidate: 'David Wilson', position: 'Frontend Developer', client: 'TechCorp', revenue: '1,12,455' },
      { id: 2, candidate: 'Tom Anderson', position: 'UI/UX Designer', client: 'Designify', revenue: '1,87,425' },
      { id: 3, candidate: 'Robert Kim', position: 'Backend Developer', client: 'CodeLabs', revenue: '1,34,946' },
      { id: 4, candidate: 'Kevin Brown', position: 'QA Tester', client: 'AppLogic', revenue: '2,24,910' },
      { id: 5, candidate: 'Mel Gibson', position: 'Mobile App Developer', client: 'Tesco', revenue: '4,49,820' },
      { id: 6, candidate: 'Sarah Johnson', position: 'React Developer', client: 'WebTech', revenue: '1,95,000' },
      { id: 7, candidate: 'Mike Smith', position: 'UI Developer', client: 'DesignCo', revenue: '1,75,500' },
      { id: 8, candidate: 'Emily Chen', position: 'HTML/CSS Specialist', client: 'StyleHub', revenue: '1,45,000' },
      { id: 9, candidate: 'John Davis', position: 'Web Developer', client: 'NetSoft', revenue: '2,10,000' },
      { id: 10, candidate: 'Lisa Brown', position: 'Junior Developer', client: 'StartupX', revenue: '1,25,000' },
      { id: 11, candidate: 'Robert Lee', position: 'Full Stack Developer', client: 'TechStack', revenue: '2,85,000' },
      { id: 12, candidate: 'Anna White', position: 'NodeJS Developer', client: 'BackendPro', revenue: '2,55,000' },
      { id: 13, candidate: 'Chris Martin', position: 'Python Developer', client: 'DataFlow', revenue: '2,95,000' },
      { id: 14, candidate: 'Diana Ross', position: 'Java Developer', client: 'Enterprise', revenue: '3,15,000' },
      { id: 15, candidate: 'Tom Wilson', position: 'Solution Architect', client: 'ArchTech', revenue: '4,25,000' },
    ];

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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-60 justify-start text-left font-normal"
                        data-testid="button-pipeline-date-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pipelineDate ? format(pipelineDate, "dd-MMM-yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pipelineDate}
                        onSelect={(date) => date && setPipelineDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Pipeline Layout - Table + Right Side Stats */}
              <div className="flex gap-6 mb-6">
                {/* Left Side - Pipeline Stages Table */}
                <div className="flex-1">
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-level1">Level 1</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-level2">Level 2</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-level3">Level 3</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-finalround">Final Round</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-hrround">HR Round</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-offerstage">Offer Stage</th>
                              <th className="text-center p-4 font-medium text-gray-700 bg-gray-100 min-w-[120px]" data-testid="header-pipeline-closure">Closure</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 align-top" data-testid="column-pipeline-level1">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.level1.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-black cursor-pointer transition-colors"
                                      style={{backgroundColor: '#E6F4EA'}}
                                      data-testid={`candidate-level1-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.level1.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-level2">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.level2.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-black cursor-pointer transition-colors"
                                      style={{backgroundColor: '#D9F0E1'}}
                                      data-testid={`candidate-level2-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.level2.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-level3">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.level3.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-black cursor-pointer transition-colors"
                                      style={{backgroundColor: '#C2EED0'}}
                                      data-testid={`candidate-level3-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.level3.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-finalround">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.finalRound.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-black cursor-pointer transition-colors"
                                      style={{backgroundColor: '#B5E1C1'}}
                                      data-testid={`candidate-finalround-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.finalRound.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-hrround">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.hrRound.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-white cursor-pointer transition-colors"
                                      style={{backgroundColor: '#99D9AE'}}
                                      data-testid={`candidate-hrround-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.hrRound.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-offerstage">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.offerStage.map((candidate, index) => (
                                    <button
                                      key={candidate.id}
                                      onClick={() => handlePipelineCandidateClick(candidate)}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-white cursor-pointer transition-colors"
                                      style={{backgroundColor: '#7CCBA0'}}
                                      data-testid={`candidate-offerstage-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </button>
                                  ))}
                                  {getPipelineCandidatesByStage.offerStage.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 align-top" data-testid="column-pipeline-closure">
                                <div className="flex flex-col gap-2">
                                  {getPipelineCandidatesByStage.offerStage.map((candidate, index) => (
                                    <div
                                      key={candidate.id}
                                      className="px-3 py-2 rounded text-center text-sm font-medium text-white"
                                      style={{backgroundColor: '#2F6F52'}}
                                      data-testid={`candidate-closure-${index}`}
                                    >
                                      {candidate.candidateName}
                                    </div>
                                  ))}
                                  {getPipelineCandidatesByStage.offerStage.length === 0 && (
                                    <div className="px-3 py-2 text-gray-400 text-sm text-center">-</div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side - Statistics Panel (Display Only) */}
                <div className="w-48 flex-shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#E8F5E9'}}>
                      <span className="text-sm font-medium text-gray-800">SOURCED</span>
                      <span className="font-bold text-lg text-gray-900" data-testid="count-sourced">{getPipelineCandidatesByStage.inProcess.length + getPipelineCandidatesByStage.shortlisted.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#C8E6C9'}}>
                      <span className="text-sm font-medium text-gray-800">SHORTLISTED</span>
                      <span className="font-bold text-lg text-gray-900" data-testid="count-shortlisted">{getPipelineCandidatesByStage.shortlisted.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#A5D6A7'}}>
                      <span className="text-sm font-medium text-gray-800">INTRO CALL</span>
                      <span className="font-bold text-lg text-gray-900" data-testid="count-introcall">0</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#81C784'}}>
                      <span className="text-sm font-medium text-gray-800">ASSIGNMENT</span>
                      <span className="font-bold text-lg text-gray-900" data-testid="count-assignment">0</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#66BB6A'}}>
                      <span className="text-sm font-medium text-white">L1</span>
                      <span className="font-bold text-lg text-white" data-testid="count-l1">{getPipelineCandidatesByStage.level1.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#4CAF50'}}>
                      <span className="text-sm font-medium text-white">L2</span>
                      <span className="font-bold text-lg text-white" data-testid="count-l2">{getPipelineCandidatesByStage.level2.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#43A047'}}>
                      <span className="text-sm font-medium text-white">L3</span>
                      <span className="font-bold text-lg text-white" data-testid="count-l3">{getPipelineCandidatesByStage.level3.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#388E3C'}}>
                      <span className="text-sm font-medium text-white">FINAL ROUND</span>
                      <span className="font-bold text-lg text-white" data-testid="count-finalround">{getPipelineCandidatesByStage.finalRound.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#2E7D32'}}>
                      <span className="text-sm font-medium text-white">HR ROUND</span>
                      <span className="font-bold text-lg text-white" data-testid="count-hrround">{getPipelineCandidatesByStage.hrRound.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#1B5E20'}}>
                      <span className="text-sm font-medium text-white">OFFER STAGE</span>
                      <span className="font-bold text-lg text-white" data-testid="count-offerstage">{getPipelineCandidatesByStage.offerStage.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#1B5E20'}}>
                      <span className="text-sm font-medium text-white">CLOSURE</span>
                      <span className="font-bold text-lg text-white" data-testid="count-closure">{getPipelineCandidatesByStage.offerStage.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 py-2 rounded" style={{backgroundColor: '#FFC107'}}>
                      <span className="text-sm font-medium text-gray-800">OFFER DROP</span>
                      <span className="font-bold text-lg text-gray-900" data-testid="count-offerdrop">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Profile Modal */}
              {isCandidateProfileModalOpen && selectedPipelineCandidate && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900" data-testid="modal-candidate-name">
                        {selectedPipelineCandidate.candidateName}
                      </h2>
                      <button
                        onClick={() => {
                          setIsCandidateProfileModalOpen(false);
                          setSelectedPipelineCandidate(null);
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-2xl"
                        data-testid="button-close-candidate-modal"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="overflow-auto flex-1 p-6">
                      {/* Candidate Profile Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {selectedPipelineCandidate.candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900" data-testid="text-candidate-role">{selectedPipelineCandidate.roleApplied}</h3>
                          <p className="text-gray-600" data-testid="text-candidate-company">{selectedPipelineCandidate.company}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedPipelineCandidate.currentStatus === 'Selected' ? 'bg-green-100 text-green-800' :
                              selectedPipelineCandidate.currentStatus === 'HR Round' ? 'bg-purple-100 text-purple-800' :
                              selectedPipelineCandidate.currentStatus === 'Final Round' ? 'bg-blue-100 text-blue-800' :
                              selectedPipelineCandidate.currentStatus === 'L3' ? 'bg-teal-100 text-teal-800' :
                              selectedPipelineCandidate.currentStatus === 'L2' ? 'bg-cyan-100 text-cyan-800' :
                              selectedPipelineCandidate.currentStatus === 'L1' ? 'bg-sky-100 text-sky-800' :
                              'bg-gray-100 text-gray-800'
                            }`} data-testid="badge-candidate-status">
                              {selectedPipelineCandidate.currentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700" data-testid="text-candidate-email">{selectedPipelineCandidate.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700" data-testid="text-candidate-phone">{selectedPipelineCandidate.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700" data-testid="text-candidate-location">{selectedPipelineCandidate.location || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700" data-testid="text-candidate-current-company">{selectedPipelineCandidate.currentCompany || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Professional Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Experience</span>
                            <p className="text-sm font-medium text-gray-900" data-testid="text-candidate-experience">{selectedPipelineCandidate.experience || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Education</span>
                            <p className="text-sm font-medium text-gray-900" data-testid="text-candidate-education">{selectedPipelineCandidate.education || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Applied On</span>
                            <p className="text-sm font-medium text-gray-900" data-testid="text-candidate-applied">{selectedPipelineCandidate.appliedOn || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Rating</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`text-sm ${star <= Math.round(selectedPipelineCandidate.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                              <span className="text-sm text-gray-600 ml-1" data-testid="text-candidate-rating">({selectedPipelineCandidate.rating?.toFixed(1) || 'N/A'})</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2" data-testid="container-candidate-skills">
                          {(selectedPipelineCandidate.skills || []).map((skill: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                          {(!selectedPipelineCandidate.skills || selectedPipelineCandidate.skills.length === 0) && (
                            <span className="text-gray-400 text-sm">No skills listed</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          data-testid="button-download-resume"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Download Resume
                        </Button>
                        <Button
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-contact-candidate"
                        >
                          <Mail className="h-4 w-4" />
                          Contact Candidate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                        {closureReportData.slice(0, 5).map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{item.candidate}</td>
                            <td className="py-3 px-4 text-gray-900">{item.position}</td>
                            <td className="py-3 px-4 text-gray-900">{item.client}</td>
                            <td className="py-3 px-4 text-gray-900">{item.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* View All Button */}
                  <div className="flex justify-end p-4 border-t border-gray-100">
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded px-6"
                      onClick={() => setIsViewAllClosuresModalOpen(true)}
                      data-testid="button-view-all-closures"
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* View All Closures Modal */}
              {isViewAllClosuresModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-900">
                        All Closure Reports
                      </h2>
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={closureSearchQuery}
                          onChange={(e) => setClosureSearchQuery(e.target.value)}
                          placeholder="Search closures..."
                          className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-900 w-64 placeholder:text-gray-400"
                          data-testid="input-search-closures"
                        />
                        <button
                          onClick={() => {
                            setIsViewAllClosuresModalOpen(false);
                            setClosureSearchQuery('');
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-2xl"
                          data-testid="button-close-closures-modal"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-auto flex-1 p-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closureReportData
                            .filter((item) => {
                              if (!closureSearchQuery) return true;
                              const query = closureSearchQuery.toLowerCase();
                              return (
                                item.candidate.toLowerCase().includes(query) ||
                                item.position.toLowerCase().includes(query) ||
                                item.client.toLowerCase().includes(query) ||
                                item.revenue.toLowerCase().includes(query)
                              );
                            })
                            .map((item) => (
                              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-900">{item.candidate}</td>
                                <td className="py-3 px-4 text-gray-900">{item.position}</td>
                                <td className="py-3 px-4 text-gray-900">{item.client}</td>
                                <td className="py-3 px-4 text-gray-900">{item.revenue}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline Stages Sidebar */}
            <div className="w-64 bg-white border-l border-gray-200">
              <div className="p-4 space-y-1">
                <button 
                  onClick={() => handlePipelineStageClick('SOURCED')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-100 rounded hover:bg-green-200 transition-colors cursor-pointer"
                  data-testid="button-pipeline-sourced"
                >
                  <span className="text-sm font-medium text-gray-700">SOURCED</span>
                  <span className="text-lg font-bold text-gray-900">{getPipelineCandidatesByStage.inProcess.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('SHORTLISTED')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-200 rounded hover:bg-green-300 transition-colors cursor-pointer"
                  data-testid="button-pipeline-shortlisted"
                >
                  <span className="text-sm font-medium text-gray-700">SHORTLISTED</span>
                  <span className="text-lg font-bold text-gray-900">{getPipelineCandidatesByStage.shortlisted.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('L1')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-400 rounded hover:bg-green-500 transition-colors cursor-pointer"
                  data-testid="button-pipeline-l1"
                >
                  <span className="text-sm font-medium text-gray-800">LEVEL 1</span>
                  <span className="text-lg font-bold text-gray-800">{getPipelineCandidatesByStage.level1.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('L2')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-500 rounded hover:bg-green-600 transition-colors cursor-pointer"
                  data-testid="button-pipeline-l2"
                >
                  <span className="text-sm font-medium text-white">LEVEL 2</span>
                  <span className="text-lg font-bold text-white">{getPipelineCandidatesByStage.level2.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('FINAL_ROUND')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-600 rounded hover:bg-green-700 transition-colors cursor-pointer"
                  data-testid="button-pipeline-final-round"
                >
                  <span className="text-sm font-medium text-white">FINAL ROUND</span>
                  <span className="text-lg font-bold text-white">{getPipelineCandidatesByStage.finalRound.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('HR_ROUND')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-700 rounded hover:bg-green-800 transition-colors cursor-pointer"
                  data-testid="button-pipeline-hr-round"
                >
                  <span className="text-sm font-medium text-white">HR ROUND</span>
                  <span className="text-lg font-bold text-white">{getPipelineCandidatesByStage.hrRound.length}</span>
                </button>
                <button 
                  onClick={() => handlePipelineStageClick('SELECTED')}
                  className="w-full flex justify-between items-center py-3 px-4 bg-green-800 rounded hover:bg-green-900 transition-colors cursor-pointer"
                  data-testid="button-pipeline-selected"
                >
                  <span className="text-sm font-medium text-white">SELECTED</span>
                  <span className="text-lg font-bold text-white">{getPipelineCandidatesByStage.offerStage.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    // Quarterly performance data for individual recruiter
    const quarterlyPerformanceData = [
      { quarter: 'Q1 2024', resumesDelivered: 45, closures: 3 },
      { quarter: 'Q2 2024', resumesDelivered: 62, closures: 4 },
      { quarter: 'Q3 2024', resumesDelivered: 58, closures: 2 },
      { quarter: 'Q4 2024', resumesDelivered: 71, closures: 5 },
      { quarter: 'Q1 2025', resumesDelivered: 54, closures: 3 },
      { quarter: 'Q2 2025', resumesDelivered: 48, closures: 2 },
    ];

    // Full closure details data for the modal
    const allClosureDetails = [
      { candidate: 'Aarav', position: 'Frontend Developer', client: 'TechCorp', offeredOn: '06-06-2025', joinedOn: '06-06-2025', quarter: 'FMA', closureValue: '1,52,500', incentive: '3000' },
      { candidate: 'Arjun', position: 'UI/UX Designer', client: 'Designify', offeredOn: '08-06-2025', joinedOn: '08-06-2025', quarter: 'MJJ', closureValue: '4,50,000', incentive: '6000' },
      { candidate: 'Shaurya', position: 'Backend Developer', client: 'CodeLabs', offeredOn: '20-06-2025', joinedOn: '20-06-2025', quarter: 'ASO', closureValue: '3,50,000', incentive: '3000' },
      { candidate: 'Vihaan', position: 'QA Tester', client: 'AppLogic', offeredOn: '01-07-2025', joinedOn: '01-07-2025', quarter: 'NDJ', closureValue: '2,00,000', incentive: '3000' },
      { candidate: 'Aditya', position: 'Mobile App Developer', client: 'Bug Catchers', offeredOn: '23-07-2025', joinedOn: '23-07-2025', quarter: 'NDJ', closureValue: '1,75,000', incentive: '3000' },
      { candidate: 'Priya', position: 'Data Scientist', client: 'DataTech', offeredOn: '15-08-2025', joinedOn: '01-09-2025', quarter: 'ASO', closureValue: '5,25,000', incentive: '7500' },
      { candidate: 'Rahul', position: 'DevOps Engineer', client: 'CloudSoft', offeredOn: '10-09-2025', joinedOn: '25-09-2025', quarter: 'ASO', closureValue: '4,80,000', incentive: '6000' },
      { candidate: 'Sneha', position: 'Product Manager', client: 'InnovateTech', offeredOn: '05-10-2025', joinedOn: '20-10-2025', quarter: 'NDJ', closureValue: '6,00,000', incentive: '9000' },
      { candidate: 'Kiran', position: 'Full Stack Developer', client: 'WebSolutions', offeredOn: '12-10-2025', joinedOn: '01-11-2025', quarter: 'NDJ', closureValue: '4,25,000', incentive: '5000' },
      { candidate: 'Meera', position: 'Security Analyst', client: 'SecureNet', offeredOn: '18-10-2025', joinedOn: '15-11-2025', quarter: 'NDJ', closureValue: '5,50,000', incentive: '7000' },
      { candidate: 'Amit', position: 'React Developer', client: 'TechStack', offeredOn: '22-11-2025', joinedOn: '10-12-2025', quarter: 'NDJ', closureValue: '3,75,000', incentive: '4500' },
      { candidate: 'Divya', position: 'Machine Learning Engineer', client: 'AILabs', offeredOn: '28-11-2025', joinedOn: '15-12-2025', quarter: 'NDJ', closureValue: '7,00,000', incentive: '10000' },
    ];

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50 dark:bg-gray-950">
          <AdminTopHeader userName={`${recruiterProfile?.name || 'Recruiter'} - Recruiter`} companyName="Gumlat Marketing Private Limited" />
          <div className="flex h-[calc(100vh-64px)]">
            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Performance Graph Section */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quarterly Performance</h3>
                </div>
                <div className="p-6">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quarterlyPerformanceData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis 
                          dataKey="quarter" 
                          stroke="#6b7280" 
                          style={{ fontSize: '12px' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#6b7280" 
                          style={{ fontSize: '12px' }}
                          tick={{ fill: '#6b7280' }}
                          label={{ value: 'Resumes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '11px' } }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#6b7280" 
                          style={{ fontSize: '12px' }}
                          tick={{ fill: '#6b7280' }}
                          label={{ value: 'Closures', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '11px' } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => {
                            const label = name === 'resumesDelivered' ? 'Resumes Delivered' : 'Closures Made';
                            return [value, label];
                          }}
                        />
                        <Legend 
                          formatter={(value) => {
                            if (value === 'resumesDelivered') return 'Resumes Delivered';
                            if (value === 'closures') return 'Closures Made';
                            return value;
                          }}
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="resumesDelivered" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]}
                          name="resumesDelivered"
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="closures" 
                          fill="#22c55e" 
                          radius={[4, 4, 0, 0]}
                          name="closures"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Performance Table */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Closure Details</h3>
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
                      {allClosureDetails.slice(0, 5).map((closure, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.candidate}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.position}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.client}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.offeredOn}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.joinedOn}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.quarter}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.closureValue}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.incentive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* View More Button */}
                <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white border-blue-500 hover:border-blue-600 rounded px-6"
                    onClick={() => setIsClosureDetailsModalOpen(true)}
                    data-testid="button-view-more-closures"
                  >
                    View More
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Separately Scrollable */}
            <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-6 space-y-6">
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

              {/* Performance Summary Card */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Total Revenue</h4>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">49,57,500</div>
                  <div className="text-sm text-green-700 dark:text-green-300">All time closures value</div>
                </div>
              </div>

              {/* Incentive Summary Card */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Total Incentives</h4>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">64,000</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">All time earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closure Details Modal */}
        <Dialog open={isClosureDetailsModalOpen} onOpenChange={setIsClosureDetailsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Closure Details</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
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
                  {allClosureDetails.map((closure, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.candidate}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.position}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.client}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.offeredOn}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.joinedOn}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.quarter}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.closureValue}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{closure.incentive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {allClosureDetails.length} closures
              </div>
              <Button 
                variant="outline"
                onClick={() => setIsClosureDetailsModalOpen(false)}
                data-testid="button-close-closure-details-modal"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                className="flex-1 placeholder:text-gray-400"
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
            <DialogTitle>Target Details - All Quarters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {aggregatedTargets?.allQuarters && aggregatedTargets.allQuarters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Quarter</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Year</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Minimum Target</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Target Achieved</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Incentive Earned</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedTargets.allQuarters.map((quarter: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                        <td className="border border-gray-300 px-4 py-3">{quarter.quarter}</td>
                        <td className="border border-gray-300 px-4 py-3">{quarter.year}</td>
                        <td className="border border-gray-300 px-4 py-3">{formatIndianCurrency(quarter.minimumTarget)}</td>
                        <td className="border border-gray-300 px-4 py-3">{formatIndianCurrency(quarter.targetAchieved)}</td>
                        <td className="border border-gray-300 px-4 py-3">{formatIndianCurrency(quarter.incentiveEarned)}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quarter.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            quarter.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quarter.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No target data available. Please contact your Team Lead or Admin to set up your targets.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivered Modal */}
      <DailyDeliveryModal
        open={isDeliveredModalOpen}
        onOpenChange={setIsDeliveredModalOpen}
        title="Delivered Candidates"
        rows={[]}
        columns={[
          { key: 'candidate', label: 'Candidate' },
          { key: 'position', label: 'Position' },
          { key: 'client', label: 'Client' },
          { key: 'deliveredDate', label: 'Delivered Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No delivered candidates today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}
        testIdPrefix="delivered"
      />

      {/* Defaulted Modal */}
      <DailyDeliveryModal
        open={isDefaultedModalOpen}
        onOpenChange={setIsDefaultedModalOpen}
        title="Defaulted Candidates"
        rows={[]}
        columns={[
          { key: 'candidate', label: 'Candidate' },
          { key: 'position', label: 'Position' },
          { key: 'client', label: 'Client' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No defaulted candidates today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}
        testIdPrefix="defaulted"
      />

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
                  className="placeholder:text-gray-400"
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
                  className="placeholder:text-gray-400"
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
                  className="placeholder:text-gray-400"
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
              <Input id="count" type="number" placeholder="Enter count" className="placeholder:text-gray-400" />
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
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onSuccess={() => {
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
        }}
        formData={jobFormData}
        setFormData={setJobFormData}
        formError={formError}
        setFormError={setFormError}
      />

      {/* Upload Resume Modal */}
      <UploadResumeModal
        isOpen={isUploadResumeModalOpen}
        onClose={() => setIsUploadResumeModalOpen(false)}
        onSuccess={() => {
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
        }}
        formData={resumeFormData}
        setFormData={setResumeFormData}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        formError={resumeFormError}
        setFormError={setResumeFormError}
      />

      {/* Applicant Overview Modal */}
      {isApplicantOverviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                All Applicants
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={applicantSearchQuery}
                  onChange={(e) => setApplicantSearchQuery(e.target.value)}
                  placeholder="Search applicants..."
                  className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-900 w-64 placeholder:text-gray-400"
                  data-testid="input-search-applicants"
                />
                <button
                  onClick={() => {
                    setIsApplicantOverviewModalOpen(false);
                    setApplicantSearchQuery('');
                  }}
                  className="text-red-500 hover:text-red-700 font-bold text-2xl"
                  data-testid="button-close-applicants-modal"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="overflow-auto flex-1 p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Applied on</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role Applied</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Submission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicantData
                    .filter((applicant) => {
                      if (!applicantSearchQuery) return true;
                      const query = applicantSearchQuery.toLowerCase();
                      return (
                        applicant.candidateName.toLowerCase().includes(query) ||
                        applicant.company.toLowerCase().includes(query) ||
                        applicant.roleApplied.toLowerCase().includes(query) ||
                        applicant.submission.toLowerCase().includes(query) ||
                        applicant.currentStatus.toLowerCase().includes(query)
                      );
                    })
                    .map((applicant, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{applicant.appliedOn}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{applicant.candidateName}</td>
                        <td className="py-3 px-4 text-gray-900">{applicant.company}</td>
                        <td className="py-3 px-4 text-gray-900">{applicant.roleApplied}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            applicant.submission === 'Inbound' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {applicant.submission}
                          </span>
                        </td>
                        <td className="py-3 px-4">
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
          </div>
        </div>
      )}

      {/* Pending Meetings Modal */}
      {isPendingMeetingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                All Pending Meetings
              </h2>
              <button
                onClick={() => setIsPendingMeetingsModalOpen(false)}
                className="text-red-500 hover:text-red-700 font-bold text-2xl"
                data-testid="button-close-meetings-modal"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-auto flex-1 p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Meeting</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Person</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMeetingsData.map((meeting) => (
                    <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{meeting.meeting}</td>
                      <td className="py-3 px-4 text-gray-900">{meeting.date}</td>
                      <td className="py-3 px-4 text-gray-900">{meeting.person}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CEO Commands Modal */}
      {isCeoCommandsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                All CEO Commands
              </h2>
              <button
                onClick={() => setIsCeoCommandsModalOpen(false)}
                className="text-red-500 hover:text-red-700 font-bold text-2xl"
                data-testid="button-close-commands-modal"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-auto flex-1 p-6">
              <div className="bg-slate-800 text-white rounded-lg p-6 space-y-4">
                {ceoCommandsData.map((command) => (
                  <div key={command.id} className="text-sm text-gray-300 border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <p>{command.command}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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