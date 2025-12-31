import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, User, Download, Star, CheckCircle, XCircle, UserPlus, Loader2, Building } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  appliedDate: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'In Process';
  skills: string[];
  currentCompany: string;
  education: string;
  resumeUrl: string;
  profilePicture?: string;
  rating: number;
  source: string;
}

export default function RecruiterAllCandidates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'shortlisted' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 6;

  const { data: allApplications = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications']
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest('PATCH', `/api/recruiter/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
    }
  });

  const candidates: Candidate[] = useMemo(() => {
    if (!allApplications || allApplications.length === 0) {
      return [];
    }
    // Show ALL applications (both self-applied and tagged)
    return allApplications.map((app: any) => {
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

      const statusMap: Record<string, 'New' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'In Process'> = {
        'In Process': 'New',
        'In-Process': 'New',
        'Shortlisted': 'Shortlisted',
        'Rejected': 'Rejected',
        'Reviewed': 'Reviewed',
        'Screened Out': 'Rejected',
        'L1': 'Reviewed',
        'L2': 'Reviewed',
        'L3': 'Reviewed',
        'Final Round': 'Reviewed',
        'HR Round': 'Reviewed',
        'Selected': 'Shortlisted',
        'Interview Scheduled': 'Reviewed',
        'Applied': 'New'
      };

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
        jobTitle: app.jobTitle || 'N/A',
        company: app.company || 'N/A',
        location: app.location || 'N/A',
        experience: app.experience || 'N/A',
        appliedDate: appliedDateStr,
        status: statusMap[app.status] || 'New',
        skills: skills,
        currentCompany: app.company || 'N/A',
        education: 'N/A',
        resumeUrl: '#',
        rating: 4.0,
        source: app.source || 'job_board'
      };
    });
  }, [allApplications]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Reviewed': 'bg-yellow-100 text-yellow-800',
      'Shortlisted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'In Process': 'bg-blue-100 text-blue-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const updateCandidateStatus = (candidateId: string, newStatus: 'Reviewed' | 'Shortlisted' | 'Rejected') => {
    updateStatusMutation.mutate({ id: candidateId, status: newStatus });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation('/recruiter-login-2');
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Total Candidates</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium" data-testid="text-candidate-count">
            {filteredCandidates.length} Candidates
          </span>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              onClick={() => setStatusFilter('new')}
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-new"
            >
              New
            </Button>
            <Button
              onClick={() => setStatusFilter('reviewed')}
              variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-reviewed"
            >
              Reviewed
            </Button>
            <Button
              onClick={() => setStatusFilter('shortlisted')}
              variant={statusFilter === 'shortlisted' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-shortlisted"
            >
              Shortlisted
            </Button>
          </div>
        </div>
      </div>

      {/* Candidate Cards or Empty State */}
      <div className="p-6">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" data-testid="empty-candidates">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Yet</h2>
            <p className="text-gray-500 text-center max-w-md">
              When candidates apply to your job postings or you tag candidates to requirements, they will appear here.
            </p>
          </div>
        ) : currentCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" data-testid="no-matching-candidates">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Candidates</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              No candidates match your current search or filter criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid={`card-candidate-${candidate.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {candidate.profilePicture ? (
                      <img
                        src={candidate.profilePicture}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-name-${candidate.id}`}>{candidate.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(candidate.rating)}
                        </div>
                        <span className="text-sm text-gray-500">({candidate.rating})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {candidate.source === 'recruiter_tagged' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Tagged
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`} data-testid={`badge-status-${candidate.id}`}>
                      {candidate.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} />
                    <span>Applied for: <span className="font-medium">{candidate.jobTitle}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building size={14} />
                    <span>Current: <span className="font-medium">{candidate.currentCompany}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>Applied {candidate.appliedDate}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="font-medium">Experience:</span> {candidate.experience}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="font-medium">Education:</span> {candidate.education}
                  </div>
                  
                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-1" data-testid={`button-email-${candidate.id}`}>
                    <Mail size={14} />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" data-testid={`button-call-${candidate.id}`}>
                    <Phone size={14} />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" data-testid={`button-resume-${candidate.id}`}>
                    <Download size={14} />
                    Resume
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateCandidateStatus(candidate.id, 'Shortlisted')}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-shortlist-${candidate.id}`}
                    >
                      <CheckCircle size={14} />
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCandidateStatus(candidate.id, 'Rejected')}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 flex items-center gap-1"
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-reject-${candidate.id}`}
                    >
                      <XCircle size={14} />
                      Reject
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCandidateStatus(candidate.id, 'Reviewed')}
                    disabled={candidate.status === 'Reviewed' || updateStatusMutation.isPending}
                    data-testid={`button-review-${candidate.id}`}
                  >
                    {candidate.status === 'Reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              data-testid="button-previous"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600" data-testid="text-pagination">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              data-testid="button-next"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

