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
import { CalendarIcon, EditIcon, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';

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
    return required.every(field => jobFormData[field as keyof typeof jobFormData].trim() !== '');
  };

  const handlePostJob = () => {
    if (!validateForm()) {
      setFormError('Please fill out all required fields');
      return;
    }
    
    setIsPostJobModalOpen(false);
    setShowSuccessAlert(true);
    setFormError('');
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
  const [calendarStep, setCalendarStep] = useState<'calendar' | 'input'>('calendar');
  
  const getTotalCountForReq = (reqId: number) => {
    const counts = requirementCounts[reqId] || {};
    return Object.values(counts).reduce((total, count) => total + parseInt(count || '0'), 0);
  };
  
  const getMostRecentDateForReq = (reqId: number) => {
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
                    {targetMetrics?.minimumTarget || "8,00,000"}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Achieved</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.targetAchieved || "6,50,000"}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incentive Earned</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {targetMetrics?.incentiveEarned || "35,000"}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Metrics Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Metrics</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Date: {dailyMetrics?.date || "21-Aug-2025"}</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Performance Indicator:</span>
                    <div className="w-16 h-8 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Left side - Metrics */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Requirements</span>
                      <span className="text-xl font-bold text-blue-600">{dailyMetrics?.totalRequirements || "15"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Requirements</span>
                      <span className="text-xl font-bold text-blue-600">{dailyMetrics?.completedRequirements || "8"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Resumes per Requirement</span>
                      <span className="text-xl font-bold text-blue-600">{dailyMetrics?.avgResumesPerRequirement || "03"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements per Recruiter</span>
                      <span className="text-xl font-bold text-blue-600">{dailyMetrics?.requirementsPerRecruiter || "02"}</span>
                    </div>
                  </div>

                  {/* Right side - Daily Delivery */}
                  <div className="bg-slate-800 rounded-lg p-4 text-white">
                    <h4 className="text-sm font-semibold text-white mb-4 text-center">Daily Delivery</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <h5 className="text-xs font-medium text-cyan-300 mb-2">Delivered</h5>
                        <div className="text-2xl font-bold text-white mb-2">{dailyMetrics?.dailyDeliveryDelivered || "2"}</div>
                        <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-3 py-1 rounded text-xs font-medium">
                          View
                        </Button>
                      </div>
                      <div className="text-center">
                        <h5 className="text-xs font-medium text-cyan-300 mb-2">Defaulted</h5>
                        <div className="text-2xl font-bold text-white mb-2">{dailyMetrics?.dailyDeliveryDefaulted || "1"}</div>
                        <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-3 py-1 rounded text-xs font-medium">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meetings and CEO Comments */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              {/* Pending Meetings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Meetings</h3>
                <div className="space-y-3">
                  {meetings?.map((meeting: any) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{meeting.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{meeting.count}</span>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                          View
                        </Button>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* CEO Comments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CEO Comments</h3>
                <div className="space-y-3">
                  {ceoComments?.slice(0, 3).map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{comment.comment}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</p>
                    </div>
                  )) || []}
                </div>
              </div>
            </div>
          </div>
        );
      case 'jobBoard':
        return <JobBoardTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <Sidebar sidebarTab={sidebarTab} setSidebarTab={setSidebarTab} />
        
        <div className="flex-1 ml-64">
          <RecruiterProfileHeader 
            profile={recruiterProfile}
            onEditProfile={() => {}} 
          />
          
          <RecruiterTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1">
            {renderDashboardTabContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Interview Modal */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInterviewSubmit}>
            <div className="space-y-4">
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reason Modal */}
      <Dialog open={showReasonModal} onOpenChange={setShowReasonModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Screen Out Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Candidate: {selectedCandidate?.name}</Label>
            </div>
            <div>
              <Label htmlFor="reason">Reason for screening out</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reasonOption) => (
                    <SelectItem key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReasonModal(false)}>
                Cancel
              </Button>
              <Button onClick={archiveCandidate} disabled={!reason}>
                Archive Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Job posted successfully!
        </div>
      )}
    </div>
  );
}