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
  
  const statuses = ['Shortlisted', 'In-Process', 'Interview Scheduled', 'Interview On-Going', 'Final Round', 'HR Round', 'Selected', 'Screened Out'];
  const rejectionReasons = ['Skill mismatch', 'Lack of communication', 'Inadequate experience', 'Unprofessional behavior', 'Other'];

  // Use API data for recruiter profile
  const { data: recruiterProfile } = useQuery<RecruiterProfile>({
    queryKey: ['/api/recruiter/profile'],
  });
  
  // Helper functions
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
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                  Post Jobs
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                  Upload Resume
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Jobs Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              </div>

              {/* New Applications Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              </div>

              {/* Interview Tracker Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interview Tracker</h3>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Schedule</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{todaysInterviews.length}</div>
                    <button 
                      onClick={() => setShowInterviewModal(true)}
                      className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex items-center px-2">
                    <div className="h-16 w-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending cases</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">9</div>
                    <button 
                      onClick={() => setShowTodayInterviewsModal(true)}
                      className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
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
          </div>
        );
      case 'requirements':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>
            
            {/* Priority Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center">
                  <div className="text-red-600 text-3xl font-bold mb-2">
                    {activeRequirements.filter(r => r.criticality === 'High').length}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">HIGH PRIORITY</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center">
                  <div className="text-blue-600 text-3xl font-bold mb-2">
                    {activeRequirements.filter(r => r.criticality === 'Medium').length}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">MEDIUM PRIORITY</h3>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center">
                  <div className="text-gray-600 text-3xl font-bold mb-2">
                    {activeRequirements.filter(r => r.criticality === 'Low').length}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">LOW PRIORITY</h3>
                </div>
              </div>
            </div>
            
            {/* Requirements Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Requirements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact Person</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Criticality</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {activeRequirements.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {req.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {req.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {req.contactPerson}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                          <a href={`mailto:${req.contactPersonEmail}`}>{req.contactPersonEmail}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            req.criticality === 'High' ? 'bg-red-100 text-red-700' :
                            req.criticality === 'Medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {req.criticality.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pipeline</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Pipeline content will be implemented here
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Performance content will be implemented here
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
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Board</h2>
              <p className="text-gray-600 dark:text-gray-400">Recruiter job board functionality will be implemented here</p>
            </div>
          </div>
        );
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
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
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
              <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Interview</Button>
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
            <Button onClick={() => setShowTodayInterviewsModal(false)}>
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
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={archiveCandidate}
                disabled={!reason}
              >
                Archive Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}