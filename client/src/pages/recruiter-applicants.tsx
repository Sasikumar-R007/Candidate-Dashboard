import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, User, Download, Star, CheckCircle, XCircle, UserPlus, Loader2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { useToast } from "@/hooks/use-toast";
import type { RecruiterJob } from "@shared/schema";

interface JobApplication {
  id: string;
  profileId: string;
  recruiterJobId: string | null;
  requirementId: string | null;
  jobTitle: string;
  company: string;
  jobType: string | null;
  status: string;
  source: string;
  appliedDate: string | Date | null;
  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;
  description: string | null;
  salary: string | null;
  location: string | null;
  workMode: string | null;
  experience: string | null;
  skills: string | null;
  logo: string | null;
}

export default function RecruiterApplicants() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 6;

  // Get jobId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, []);

  // Get all jobs for filter dropdown
  const { data: allJobs = [] } = useQuery<RecruiterJob[]>({
    queryKey: ['/api/recruiter/jobs'],
  });

  // Get applications with filters
  const { data: allApplications = [], isLoading } = useQuery<JobApplication[]>({
    queryKey: ['/api/recruiter/applications', selectedJobId, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedJobId) params.append('jobId', selectedJobId);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await apiRequest('GET', `/api/recruiter/applications?${params.toString()}`);
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest('PATCH', `/api/recruiter/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  });

  const candidates = useMemo(() => {
    if (!allApplications || allApplications.length === 0) {
      return [];
    }
    return allApplications.map((app: JobApplication) => {
      const appliedDate = app.appliedDate ? new Date(app.appliedDate) : new Date();
      const now = new Date();
      const diffMs = now.getTime() - appliedDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let appliedDateStr = '';
      if (diffHours < 1) {
        appliedDateStr = 'Just now';
      } else if (diffHours < 24) {
        appliedDateStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        appliedDateStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        appliedDateStr = appliedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }

      let skills: string[] = [];
      if (app.skills) {
        try {
          skills = typeof app.skills === 'string' ? JSON.parse(app.skills) : app.skills;
        } catch {
          skills = [];
        }
      }

      return {
        id: app.id,
        name: app.candidateName || 'Unknown Candidate',
        email: app.candidateEmail || 'N/A',
        phone: app.candidatePhone || 'N/A',
        jobTitle: app.jobTitle,
        company: app.company,
        location: app.location || 'N/A',
        experience: app.experience || 'N/A',
        appliedDate: appliedDateStr,
        status: app.status,
        skills: skills,
        appliedDateRaw: appliedDate,
        recruiterJobId: app.recruiterJobId,
      };
    });
  }, [allApplications]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [candidates, searchQuery]);

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  const handleClearFilters = () => {
    setSelectedJobId('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'In Process': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Shortlisted': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Interview Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Selected': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading applicants...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => {
              setLocation('/recruiter-login-2');
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-page-title">
            Job Applicants
          </h1>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium" data-testid="text-candidate-count">
            {filteredCandidates.length} Applicants
          </span>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
              data-testid="input-search-candidates"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <Select value={selectedJobId} onValueChange={(value) => {
            setSelectedJobId(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-64" data-testid="select-job-filter">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Jobs</SelectItem>
              {allJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.role} - {job.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Process">In Process</SelectItem>
              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
              <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="Selected">Selected</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <StandardDatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <StandardDatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="To Date"
            />
          </div>

          {(selectedJobId || statusFilter !== 'all' || dateFrom || dateTo) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Candidate Cards or Empty State */}
      <div className="p-6">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" data-testid="empty-applications">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applicants Found</h2>
            <p className="text-gray-500 text-center max-w-md">
              {selectedJobId
                ? "There are no applications for this job yet. When candidates apply to this job from the Job Board, they will appear here."
                : statusFilter !== 'all' || dateFrom || dateTo
                ? "No applicants match your current filters. Try adjusting your search criteria."
                : "No applicants have applied yet. When candidates apply to your job postings, they will appear here."}
            </p>
          </div>
        ) : currentCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" data-testid="no-matching-candidates">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Matching Candidates</h2>
            <p className="text-gray-500 text-center max-w-md">
              No candidates match your search query. Try different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                data-testid={`card-candidate-${candidate.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Applied for: <span className="font-medium">{candidate.jobTitle}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Company: <span className="font-medium">{candidate.company}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} />
                    <span>{candidate.phone}</span>
                  </div>
                  {candidate.location !== 'N/A' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={14} />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={14} />
                    <span>Applied {candidate.appliedDate}</span>
                  </div>
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Select
                    value={candidate.status}
                    onValueChange={(value) => updateStatusMutation.mutate({ id: candidate.id, status: value })}
                  >
                    <SelectTrigger className="flex-1" data-testid={`select-status-${candidate.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Process">In Process</SelectItem>
                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="Selected">Selected</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              data-testid="button-prev-page"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

