import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import RecruiterProfileHeader from '@/components/dashboard/recruiter-profile-header';
import RecruiterTabNavigation from '@/components/dashboard/recruiter-tab-navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, EditIcon, MoreVertical, BriefcaseIcon, UserCheckIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function RecruiterDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Interview form state
  const [interviewForm, setInterviewForm] = useState({
    candidateName: '',
    position: '',
    client: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'Phone',
    interviewRound: 'Technical'
  });

  // Mock data for recruiter profile
  const recruiterProfile = {
    id: "rec-001",
    name: "Sarah Johnson",
    role: "Senior Recruiter",
    employeeId: "REC01",
    phone: "90347 59088",
    email: "sarah@scalingtheory.com",
    joiningDate: "15-Jan-2022",
    department: "Talent Acquisition",
    reportingTo: "John Mathew",
    totalContribution: "1,80,000",
    bannerImage: null,
    profilePicture: null
  };

  // Mock data for active candidates
  const [activeCandidates] = useState([
    {
      id: "cand001",
      name: "John Doe",
      jobId: "job001",
      job: "Frontend Developer",
      company: "TechCorp",
      status: "Interview Scheduled",
      appliedDate: "2025-01-10"
    },
    {
      id: "cand002",
      name: "Jane Smith",
      jobId: "job002",
      job: "UI/UX Designer",
      company: "Designify",
      status: "Shortlisted",
      appliedDate: "2025-01-09"
    },
    {
      id: "cand003",
      name: "Ravi Kumar",
      jobId: "job003",
      job: "Backend Developer",
      company: "CodeLabs",
      status: "In-Process",
      appliedDate: "2025-01-08"
    },
    {
      id: "cand004",
      name: "Aisha Ali",
      jobId: "job004",
      job: "Full Stack Dev",
      company: "WebFusion",
      status: "Final Round",
      appliedDate: "2025-01-07"
    },
    {
      id: "cand005",
      name: "David Lee",
      jobId: "job005",
      job: "Project Manager",
      company: "AgileWorks",
      status: "HR Round",
      appliedDate: "2025-01-06"
    }
  ]);

  // Mock data for today's interviews
  const [todaysInterviews] = useState([
    {
      id: "int001",
      candidateName: "John Doe",
      position: "Frontend Developer",
      client: "TechCorp",
      time: "10:00 AM",
      type: "Technical",
      round: "Round 2"
    },
    {
      id: "int002",
      candidateName: "Jane Smith",
      position: "UI/UX Designer",
      client: "Designify",
      time: "2:00 PM",
      type: "Portfolio Review",
      round: "Round 1"
    }
  ]);

  const summaryCards = [
    {
      icon: <BriefcaseIcon className="h-6 w-6" />,
      title: "Active Jobs",
      count: 12,
      subtitle: "Total Jobs Posted: 25",
      color: "bg-blue-500"
    },
    {
      icon: <UserCheckIcon className="h-6 w-6" />,
      title: "New Applications",
      count: 18,
      subtitle: "Candidates Applied: 82",
      color: "bg-green-500"
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: "Today's Interviews",
      count: todaysInterviews.length,
      subtitle: `Scheduled: ${todaysInterviews.length}`,
      color: "bg-orange-500"
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: "Placements This Month",
      count: 8,
      subtitle: "Target: 15",
      color: "bg-purple-500"
    }
  ];

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Interview scheduled:', interviewForm);
    setShowInterviewModal(false);
    setInterviewForm({
      candidateName: '',
      position: '',
      client: '',
      interviewDate: '',
      interviewTime: '',
      interviewType: 'Phone',
      interviewRound: 'Technical'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In-Process':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Interview Scheduled':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Final Round':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'HR Round':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Selected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryCards.map((card, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
                      </div>
                      <div className={`p-3 rounded-full ${card.color} text-white`}>
                        {card.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Today's Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysInterviews.length > 0 ? (
                  <div className="space-y-4">
                    {todaysInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{interview.candidateName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{interview.position} - {interview.client}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{interview.type} • {interview.round}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">{interview.time}</p>
                          <Badge variant="outline">Scheduled</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No interviews scheduled for today</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'candidates':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Candidates</h2>
              <Button 
                onClick={() => setShowCandidateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Candidate
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {activeCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {candidate.company}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {candidate.job}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {candidate.appliedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <EditIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'interviews':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Schedule</h2>
              <Button 
                onClick={() => setShowInterviewModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Interview
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{interview.position} - {interview.client}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{interview.type} • {interview.round}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{interview.time}</p>
                        <Badge variant="outline">Today</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'pipeline':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recruitment Pipeline</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 dark:text-gray-400">Pipeline management features will be implemented here</p>
              </CardContent>
            </Card>
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
        userRole="recruiter"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderSidebarContent()}
      </div>

      {/* Schedule Interview Modal */}
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
                value={interviewForm.candidateName}
                onChange={(e) => setInterviewForm({...interviewForm, candidateName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={interviewForm.position}
                onChange={(e) => setInterviewForm({...interviewForm, position: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={interviewForm.client}
                onChange={(e) => setInterviewForm({...interviewForm, client: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input
                id="interviewDate"
                type="date"
                value={interviewForm.interviewDate}
                onChange={(e) => setInterviewForm({...interviewForm, interviewDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewTime">Interview Time</Label>
              <Input
                id="interviewTime"
                type="time"
                value={interviewForm.interviewTime}
                onChange={(e) => setInterviewForm({...interviewForm, interviewTime: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewType">Interview Type</Label>
              <Select value={interviewForm.interviewType} onValueChange={(value) => setInterviewForm({...interviewForm, interviewType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interviewRound">Interview Round</Label>
              <Select value={interviewForm.interviewRound} onValueChange={(value) => setInterviewForm({...interviewForm, interviewRound: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInterviewModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}