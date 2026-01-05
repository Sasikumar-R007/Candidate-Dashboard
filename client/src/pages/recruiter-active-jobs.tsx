import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Briefcase, Edit, Trash2, CheckCircle, AlertCircle, Loader2, Building, XCircle, X, Plus, Image } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecruiterJob } from "@shared/schema";

export default function RecruiterActiveJobs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingJob, setEditingJob] = useState<RecruiterJob | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [primarySkills, setPrimarySkills] = useState<string[]>(['']);
  const [secondarySkills, setSecondarySkills] = useState<string[]>(['']);
  const [knowledgeOnly, setKnowledgeOnly] = useState<string[]>(['']);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const jobsPerPage = 6;

  const { data: jobs = [], isLoading, error } = useQuery<RecruiterJob[]>({
    queryKey: ['/api/recruiter/jobs'],
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecruiterJob> }) => {
      const response = await apiRequest('PUT', `/api/recruiter/jobs/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
      toast({
        title: "Job updated",
        description: "The job has been updated successfully.",
      });
      setShowEditModal(false);
      setEditingJob(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      // Instead of deleting, update status to "Closed"
      const response = await apiRequest('PUT', `/api/recruiter/jobs/${id}`, { status: 'Closed' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
      toast({
        title: "Job closed",
        description: "The job has been moved to Closed status.",
      });
      setShowDeleteConfirm(false);
      setSelectedJobId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close job",
        variant: "destructive",
      });
    }
  });


  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Closed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle size={14} className="text-green-600 dark:text-green-400" />;
      case 'Closed': return <XCircle size={14} className="text-red-600 dark:text-red-400" />;
      case 'Draft': return <AlertCircle size={14} className="text-yellow-600 dark:text-yellow-400" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if it's the same day
    const isSameDay = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
    
    if (isSameDay || diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const parseSkills = (skillsString: string | null): string[] => {
    if (!skillsString) return [];
    try {
      const parsed = JSON.parse(skillsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return skillsString.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  // Skills management functions
  const addPrimarySkill = () => {
    if (primarySkills.length < 5) {
      setPrimarySkills([...primarySkills, '']);
    }
  };

  const removePrimarySkill = (index: number) => {
    if (primarySkills.length > 1) {
      setPrimarySkills(primarySkills.filter((_, i) => i !== index));
    }
  };

  const updatePrimarySkill = (index: number, value: string) => {
    const newSkills = [...primarySkills];
    newSkills[index] = value;
    setPrimarySkills(newSkills);
  };

  const addSecondarySkill = () => {
    if (secondarySkills.length < 5) {
      setSecondarySkills([...secondarySkills, '']);
    }
  };

  const removeSecondarySkill = (index: number) => {
    if (secondarySkills.length > 1) {
      setSecondarySkills(secondarySkills.filter((_, i) => i !== index));
    }
  };

  const updateSecondarySkill = (index: number, value: string) => {
    const newSkills = [...secondarySkills];
    newSkills[index] = value;
    setSecondarySkills(newSkills);
  };

  const addKnowledgeSkill = () => {
    if (knowledgeOnly.length < 5) {
      setKnowledgeOnly([...knowledgeOnly, '']);
    }
  };

  const removeKnowledgeSkill = (index: number) => {
    if (knowledgeOnly.length > 1) {
      setKnowledgeOnly(knowledgeOnly.filter((_, i) => i !== index));
    }
  };

  const updateKnowledgeSkill = (index: number, value: string) => {
    const newSkills = [...knowledgeOnly];
    newSkills[index] = value;
    setKnowledgeOnly(newSkills);
  };

  // Logo management functions
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 500KB',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleEdit = (job: RecruiterJob) => {
    setEditingJob(job);
    // Initialize skills arrays
    const primary = parseSkills(job.primarySkills || null);
    const secondary = parseSkills(job.secondarySkills || null);
    const knowledge = parseSkills(job.knowledgeOnly || null);
    setPrimarySkills(primary.length > 0 ? primary : ['']);
    setSecondarySkills(secondary.length > 0 ? secondary : ['']);
    setKnowledgeOnly(knowledge.length > 0 ? knowledge : ['']);
    // Initialize logo preview
    setLogoPreview(job.companyLogo || null);
    setShowEditModal(true);
  };

  const handleDelete = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowDeleteConfirm(true);
  };


  const handleSaveEdit = () => {
    if (!editingJob) return;
    
    // Filter out empty skills
    const filteredPrimary = primarySkills.filter(s => s.trim() !== '');
    const filteredSecondary = secondarySkills.filter(s => s.trim() !== '');
    const filteredKnowledge = knowledgeOnly.filter(s => s.trim() !== '');
    
    updateJobMutation.mutate({
      id: editingJob.id,
      updates: {
        role: editingJob.role,
        companyName: editingJob.companyName,
        location: editingJob.location,
        experience: editingJob.experience,
        salaryPackage: editingJob.salaryPackage,
        workMode: editingJob.workMode,
        aboutCompany: editingJob.aboutCompany,
        roleDefinitions: editingJob.roleDefinitions,
        keyResponsibility: editingJob.keyResponsibility,
        primarySkills: filteredPrimary.length > 0 ? JSON.stringify(filteredPrimary) : null,
        secondarySkills: filteredSecondary.length > 0 ? JSON.stringify(filteredSecondary) : null,
        knowledgeOnly: filteredKnowledge.length > 0 ? JSON.stringify(filteredKnowledge) : null,
        companyLogo: logoPreview || editingJob.companyLogo,
        status: editingJob.status,
        market: editingJob.market,
        field: editingJob.field,
        noOfPositions: editingJob.noOfPositions,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Failed to load jobs. Please try again.
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-page-title">Total Jobs</h1>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium" data-testid="text-job-count">
            {filteredJobs.length} Jobs
          </span>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search-jobs"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setStatusFilter('all')}
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-all"
            >
              All Jobs
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-active"
            >
              Active
            </Button>
            <Button
              onClick={() => setStatusFilter('closed')}
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-closed"
            >
              Closed
            </Button>
            <Button
              onClick={() => setStatusFilter('draft')}
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-filter-draft"
            >
              Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {currentJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentJobs.map((job, index) => {
              const getBackgroundColor = () => {
                const colors = ['bg-green-100', 'bg-pink-100', 'bg-purple-100', 'bg-blue-100', 'bg-yellow-100'];
                return colors[index % colors.length];
              };
              
              const allSkills = [
                ...parseSkills(job.primarySkills),
                ...parseSkills(job.secondarySkills),
                ...parseSkills(job.knowledgeOnly)
              ].filter(Boolean);

              return (
                <div 
                  key={job.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex"
                  data-testid={`card-job-${job.id}`}
                >
                  {/* Company Logo Section - Left Side */}
                  <div className={`${getBackgroundColor()} dark:bg-gray-700 w-32 flex-shrink-0 flex items-center justify-center p-4`}>
                    <div className="text-center">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.companyName} logo`}
                          className="w-12 h-12 rounded object-cover mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center mx-auto mb-2">
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {job.companyName ? job.companyName.split(' ')[0] : 'Company'}
                      </div>
                    </div>
                  </div>

                  {/* Job Details Section - Right Side */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-job-title-${job.id}`}>
                            {job.role}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.status || 'Active')}`}>
                            {getStatusIcon(job.status || 'Active')}
                            {job.status || 'Active'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.companyName}</div>
                        {job.companyTagline && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">{job.companyTagline}</div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job.location}
                            </span>
                          )}
                          {job.experience && (
                            <span className="flex items-center gap-1">
                              <Briefcase size={14} />
                              {job.experience}
                            </span>
                          )}
                          {job.salaryPackage && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {job.salaryPackage}
                            </span>
                          )}
                          {job.workMode && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {job.workMode}
                            </span>
                          )}
                          {(job as any).employmentType && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {(job as any).employmentType}
                            </span>
                          )}
                          {job.noOfPositions && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {job.noOfPositions} Position{job.noOfPositions > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {(job.market || job.field) && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                            {job.market && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                Market: {job.market}
                              </span>
                            )}
                            {job.field && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                Field: {job.field}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          onClick={() => handleEdit(job)}
                          data-testid={`button-edit-job-${job.id}`}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={() => handleDelete(job.id)}
                          data-testid={`button-delete-job-${job.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    {job.aboutCompany && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm line-clamp-2">{job.aboutCompany}</p>
                    )}
                    
                    {allSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {allSkills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {allSkills.length > 5 && (
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            +{allSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{job.applicationCount || 0}</span> applications
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          Posted {formatDate(job.postedDate)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            sessionStorage.setItem('recruiterDashboardSidebarTab', 'dashboard');
                            setLocation(`/recruiter-applicants?jobId=${job.id}`);
                          }}
                          data-testid={`button-view-applications-${job.id}`}
                        >
                          View Applications
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Make changes to the job posting below.
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title / Role</Label>
                  <Input
                    id="role"
                    value={editingJob.role || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, role: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-role"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={editingJob.companyName || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, companyName: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-company"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingJob.location || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={editingJob.experience || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-experience"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Package</Label>
                  <Input
                    id="salary"
                    value={editingJob.salaryPackage || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryPackage: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select 
                    value={editingJob.workMode || 'On-site'} 
                    onValueChange={(value) => setEditingJob({ ...editingJob, workMode: value })}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700" data-testid="select-edit-workmode">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="market">Market</Label>
                  <Input
                    id="market"
                    value={editingJob.market || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, market: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-market"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Field</Label>
                  <Input
                    id="field"
                    value={editingJob.field || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, field: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noOfPositions">No. of Positions</Label>
                  <Input
                    id="noOfPositions"
                    type="number"
                    min="1"
                    value={editingJob.noOfPositions || 1}
                    onChange={(e) => setEditingJob({ ...editingJob, noOfPositions: parseInt(e.target.value) || 1 })}
                    className="bg-gray-50 dark:bg-gray-700"
                    data-testid="input-edit-no-of-positions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select 
                    value={(editingJob as any).employmentType || 'Full-time'} 
                    onValueChange={(value) => setEditingJob({ ...editingJob, employmentType: value } as any)}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700" data-testid="select-edit-employment-type">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editingJob.status || 'Active'} 
                  onValueChange={(value) => setEditingJob({ ...editingJob, status: value })}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-700" data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <Textarea
                  id="about"
                  value={editingJob.aboutCompany || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, aboutCompany: e.target.value })}
                  rows={3}
                  className="bg-gray-50 dark:bg-gray-700"
                  data-testid="input-edit-about"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDefinitions">Role Description</Label>
                <Textarea
                  id="roleDefinitions"
                  value={editingJob.roleDefinitions || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, roleDefinitions: e.target.value })}
                  rows={3}
                  className="bg-gray-50 dark:bg-gray-700"
                  data-testid="input-edit-role-desc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyResponsibility">Key Responsibility</Label>
                <Textarea
                  id="keyResponsibility"
                  value={editingJob.keyResponsibility || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, keyResponsibility: e.target.value })}
                  rows={3}
                  className="bg-gray-50 dark:bg-gray-700"
                  data-testid="input-edit-key-responsibility"
                />
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Skills</Label>
                
                {/* Primary Skills */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Primary Skills</Label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {primarySkills.map((skill, index) => (
                      <div key={`primary-${index}`} className="flex items-center gap-1">
                        <Input
                          value={skill}
                          onChange={(e) => updatePrimarySkill(index, e.target.value)}
                          className="w-28 bg-gray-50 dark:bg-gray-700 text-sm"
                          placeholder="Skill"
                          data-testid={`input-edit-primary-skill-${index}`}
                        />
                        {primarySkills.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removePrimarySkill(index)}
                            className="text-gray-400 h-8 w-8"
                            data-testid={`button-remove-primary-skill-${index}`}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                    {primarySkills.length < 5 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addPrimarySkill}
                        className="text-blue-500 border-blue-200 h-8 w-8"
                        data-testid="button-add-primary-skill"
                      >
                        <Plus size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Secondary Skills */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Secondary Skills</Label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {secondarySkills.map((skill, index) => (
                      <div key={`secondary-${index}`} className="flex items-center gap-1">
                        <Input
                          value={skill}
                          onChange={(e) => updateSecondarySkill(index, e.target.value)}
                          className="w-28 bg-gray-50 dark:bg-gray-700 text-sm"
                          placeholder="Skill"
                          data-testid={`input-edit-secondary-skill-${index}`}
                        />
                        {secondarySkills.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeSecondarySkill(index)}
                            className="text-gray-400 h-8 w-8"
                            data-testid={`button-remove-secondary-skill-${index}`}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                    {secondarySkills.length < 5 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addSecondarySkill}
                        className="text-blue-500 border-blue-200 h-8 w-8"
                        data-testid="button-add-secondary-skill"
                      >
                        <Plus size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Knowledge Only */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Knowledge Only</Label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {knowledgeOnly.map((skill, index) => (
                      <div key={`knowledge-${index}`} className="flex items-center gap-1">
                        <Input
                          value={skill}
                          onChange={(e) => updateKnowledgeSkill(index, e.target.value)}
                          className="w-28 bg-gray-50 dark:bg-gray-700 text-sm"
                          placeholder="Skill"
                          data-testid={`input-edit-knowledge-skill-${index}`}
                        />
                        {knowledgeOnly.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeKnowledgeSkill(index)}
                            className="text-gray-400 h-8 w-8"
                            data-testid={`button-remove-knowledge-skill-${index}`}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                    {knowledgeOnly.length < 5 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addKnowledgeSkill}
                        className="text-blue-500 border-blue-200 h-8 w-8"
                        data-testid="button-add-knowledge-skill"
                      >
                        <Plus size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Logo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Image size={16} className="text-blue-500" />
                  Company Logo <span className="text-gray-400 text-xs font-normal">(Optional - Max 500KB)</span>
                </Label>
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={removeLogo}
                      className="text-red-500 border-red-200"
                      data-testid="button-remove-logo"
                    >
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => logoFileInputRef.current?.click()}
                    data-testid="dropzone-logo"
                  >
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      data-testid="input-logo-upload"
                    />
                    <Image size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload logo</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateJobMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateJobMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this job? It will be moved to the Closed tab. This action can be reversed by editing the job status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedJobId && deleteJobMutation.mutate(selectedJobId)}
              disabled={deleteJobMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteJobMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Closing...
                </>
              ) : (
                'Close Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
