import { useState, useEffect, useMemo } from 'react';
import { useIsBelowLg } from '@/hooks/use-mobile';
import JobDescriptionDetailsModal, {
  type JobDescriptionDetailsData,
} from '@/components/dashboard/modals/job-description-details-modal';
import { candidateNudgeCooldownHours } from '@shared/nudge-timing';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin, Flame, Eye, Archive, Zap, Clock, ChevronDown, ChevronUp, Ban, Send, MessageCircle, AlertCircle, CheckCircle2, Info, Briefcase, Building2, Search } from 'lucide-react';
import { useSavedJobs, useSaveJob, useRemoveSavedJob } from "@/hooks/use-saved-jobs";
import { useJobApplications, useApplyJob } from "@/hooks/use-job-applications";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useJobPreferences } from "@/hooks/use-profile";
import type { JobApplication } from '@shared/schema';
import { isStaffOsTaggedApplication } from '@/lib/staffos-application';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CandidateMetrics from '@/components/dashboard/candidate-metrics';
import ProfileStrength from '@/components/dashboard/profile-strength';
import ProfileCompletionSession from '@/components/dashboard/profile-completion-session';
import { formatJobAppliedDate, PIPELINE_COLUMN_STYLES, getArchiveStatusLabel, getArchiveTerminalMeta, mapCandidateApplicationStage, getApplicationNudgeDisplayState } from '@/lib/candidate-pipeline-utils';
import ProfileMenu from '@/components/dashboard/profile-menu';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import CandidateApplicationConsentModal from "@/components/candidate-dashboard/candidate-application-consent-modal";
import { logConsent } from "@/lib/consent-log";
import {
  CANDIDATE_DESKTOP_DIALOG_CLASSES,
  CANDIDATE_MOBILE_CENTERED_DIALOG_CLASSES,
  CANDIDATE_MOBILE_DIALOG_CLASSES,
} from "@/lib/candidate-ui-preferences";
import { cn } from "@/lib/utils";

// Helper function to format date
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper function to safely parse skills from JSON string
function parseSkills(skills: string | null | undefined): string[] {
  if (!skills) return [];
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface MyJobsTabProps {
  className?: string;
  onNavigateToJobBoard?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onOpenSupport?: () => void;
}

const PIPELINE_STAGES = [
  'Applied',
  'In-Review',
  'Interview Stage',
  'HR Round',
  'Offer',
  'Screened Out'
];

const mapStatusToStage = mapCandidateApplicationStage;

function NudgeSendingDots() {
  return (
    <span className="inline-flex items-center justify-center gap-0.5" aria-label="Sending nudge">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-white animate-bounce"
          style={{ animationDelay: `${i * 0.12}s`, animationDuration: "0.6s" }}
        />
      ))}
    </span>
  );
}

function calculateTimeRemaining(lastNudgedAt: Date | string | null, status: string): string | null {
  if (!lastNudgedAt) return null;
  const lastNudge = new Date(lastNudgedAt);
  const now = new Date();
  const diff = now.getTime() - lastNudge.getTime();

  const cooldownHours = candidateNudgeCooldownHours(status);
  if (cooldownHours == null) return null;

  const cooldown = cooldownHours * 60 * 60 * 1000;
  
  if (diff >= cooldown) return null;
  
  const remaining = cooldown - diff;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

interface JobSuggestion {
  id: string;
  company: string;
  logo: string;
  title: string;
  salary: string;
  location: string;
  workMode: string;
  skills: string[];
  secondarySkills?: string[];
  knowledgeSkills?: string[];
  bgColor: string;
  description: string;
  experience: string;
  type: string;
  background: string;
  isHot?: boolean;
}

// Removed hardcoded jobSuggestions mock data in favor of real API data

export default function MyJobsTab({ 
  className, 
  onNavigateToJobBoard, 
  onNavigateToProfile,
  onNavigateToSettings,
  onOpenSupport
}: MyJobsTabProps) {
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobSuggestion | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [withdrawApp, setWithdrawApp] = useState<JobApplication | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState<string>("");
  const [showApplicationConsent, setShowApplicationConsent] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState<JobSuggestion | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [withdrawText, setWithdrawText] = useState("");
  const [confirmChecks, setConfirmChecks] = useState<Record<string, boolean>>({});
  const jobsPerPage = 3;
  const isBelowLg = useIsBelowLg();
  
  const { data: jobApplications = [], isLoading } = useJobApplications({
    refetchInterval: 15_000,
  });
  const { data: candidateNudges = [] } = useQuery<any[]>({
    queryKey: ['/api/candidate/nudges'],
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
  const [showAllNudgesDialog, setShowAllNudgesDialog] = useState(false);
  const [nudgeLogSearch, setNudgeLogSearch] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [nudgingApplicationIds, setNudgingApplicationIds] = useState<Set<string>>(new Set());

  const nudgeMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await apiRequest('POST', `/api/applications/${applicationId}/nudge`, {});
      return res.json();
    },
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: ['/api/job-applications'] });
      const previous = queryClient.getQueryData<JobApplication[]>(['/api/job-applications']);
      const now = new Date().toISOString();
      queryClient.setQueryData<JobApplication[]>(['/api/job-applications'], (old) =>
        old?.map((app) =>
          app.id === applicationId ? { ...app, lastNudgedAt: now as unknown as Date } : app,
        ),
      );
      return { previous };
    },
    onSuccess: (_data, applicationId) => {
      toast({
        title: "Nudge sent",
        description: "Your recruiter has been notified. You can nudge again after the cooldown.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/candidate/nudges'] });
      setNudgingApplicationIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    },
    onError: (error: Error, applicationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['/api/job-applications'], context.previous);
      }
      toast({
        title: error.message.includes('wait') ? "Nudge on cooldown" : "Could not send nudge",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
      setNudgingApplicationIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ id, reason, note }: { id: string; reason: string; note?: string }) => {
      // Use the existing status update endpoint but set status to Withdrawn
      const res = await apiRequest("PATCH", `/api/job-applications/${id}/status`, { 
        status: "Withdrawn",
        statusNote: note || reason,
        rejectionReason: reason
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      setShowWithdrawSuccess(true);
      // Success state is shown in the modal now
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw application",
        variant: "destructive",
      });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/job-applications/${id}/status`, { 
        status: "Archived"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      toast({
        title: "Job archived",
        description: "Application has been moved to archive.",
      });
      setExpandedJobId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive application",
        variant: "destructive",
      });
    }
  });

  const confirmApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await apiRequest("POST", `/api/candidate/applications/${applicationId}/confirm`, {});
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to confirm application" }));
        throw new Error(errorData.message || "Failed to confirm application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      toast({
        title: "Application confirmed",
        description: "Your application has been added to your pipeline.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm application",
        variant: "destructive",
      });
    }
  });

  const confirmWithdraw = async () => {
    if (!withdrawApp || !withdrawReason) return;
    const finalReason = withdrawReason === "Others (please specify)" ? withdrawText : withdrawReason;
    await withdrawMutation.mutateAsync({ id: withdrawApp.id, reason: finalReason });
  };

  const applyJobMutation = useApplyJob();
  const { data: savedJobsData } = useSavedJobs();
  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: jobPreferences } = useJobPreferences();

  const markAsReadMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      await apiRequest('PATCH', `/api/candidate/nudges/${nudgeId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidate/nudges'] });
    }
  });

  const handleToggleExpand = (jobId: string) => {
    const isExpanding = expandedJobId !== jobId;
    setExpandedJobId(isExpanding ? jobId : null);

    if (isExpanding) {
      // Find unread nudges for this job and mark them as read
      const jobNudges = candidateNudges.filter(n => n.applicationId === jobId && (n.isResponded || n.message) && !n.isRead);
      jobNudges.forEach(n => markAsReadMutation.mutate(n.id));
    }
  };

  const { data: recruiterJobs = [] } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000); // Force re-render every minute for timers
    return () => clearInterval(interval);
  }, []);

  const timeRemainingMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    jobApplications.forEach(app => {
      map[app.id] = calculateTimeRemaining(app.lastNudgedAt, app.status);
    });
    return map;
  }, [jobApplications, tick]);

  const pendingConfirmations = useMemo(
    () =>
      jobApplications.filter(
        (app) =>
          isStaffOsTaggedApplication(app.source) &&
          (app as any).isCandidateConfirmed === false,
      ),
    [jobApplications],
  );

  const confirmedApplications = useMemo(
    () => jobApplications.filter(app => (app as any).isCandidateConfirmed !== false),
    [jobApplications]
  );

  const mobileExpandedContext = useMemo(() => {
    if (!expandedJobId || !isBelowLg) return null;
    const job = confirmedApplications.find((j) => j.id === expandedJobId);
    if (!job) return null;
    return { job, stage: mapStatusToStage(job.status) };
  }, [expandedJobId, isBelowLg, confirmedApplications]);

  const archivedApplications = useMemo(
    () =>
      jobApplications.filter(
        (app) =>
          app.status === "Withdrawn" ||
          app.status === "Archived" ||
          mapStatusToStage(app.status) === "Screened Out" ||
          (app.statusNote || "").includes("[[TERMINAL:WITHDRAW]]"),
      ),
    [jobApplications],
  );

  const filteredNudgeLogs = useMemo(() => {
    const sorted = [...candidateNudges].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const q = nudgeLogSearch.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((nudge: any) => {
      const stage = mapCandidateApplicationStage(nudge.currentStatus);
      const haystack = [
        nudge.jobTitle,
        nudge.company,
        nudge.message,
        stage,
        nudge.currentStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [candidateNudges, nudgeLogSearch]);

  // Create a Set of applied jobs for fast lookup
  const appliedJobs = new Set(
    jobApplications.map(app => `${app.jobTitle}-${app.company}`)
  );

  // STRICT JOB MATCHING LOGIC
  const candidateSkills = profile?.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
  
  const matchedSuggestions = recruiterJobs
    .filter(job => !appliedJobs.has(`${job.role}-${job.companyName}`))
    .filter(job => {
      // If candidate has no skills yet, show nothing for strict matching
      if (candidateSkills.length === 0) return false;
      
      const jobSkills = (job.primarySkills || "").toLowerCase().split(',').map((s: string) => s.trim());
      const matches = candidateSkills.filter(s => jobSkills.some(js => js.includes(s) || s.includes(js)));
      return matches.length > 0;
    });

  // Fallback to all jobs if no matches found
  const rawSuggestions = matchedSuggestions.length > 0 
    ? matchedSuggestions 
    : recruiterJobs.filter(job => !appliedJobs.has(`${job.role}-${job.companyName}`));

  const jobSuggestions: JobSuggestion[] = rawSuggestions
    .map((job, index) => {
      const backgroundColors = ['bg-blue-50', 'bg-green-50', 'bg-red-50', 'bg-purple-50', 'bg-yellow-50'];
      const borderColors = ['bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-purple-200', 'bg-yellow-200'];
      
      return {
        id: job.id,
        company: job.companyName || 'Unknown',
        logo: job.companyLogo || '/api/placeholder/60/60',
        title: job.role || 'Unknown Title',
        salary: job.salaryPackage || 'Not Specified',
        location: job.location || 'Not Specified',
        workMode: job.workMode || 'Office',
        skills: job.primarySkills ? job.primarySkills.split(',') : [],
        secondarySkills: job.secondarySkills ? job.secondarySkills.split(',') : [],
        knowledgeSkills: job.knowledgeSkills ? job.knowledgeSkills.split(',') : [],
        bgColor: borderColors[index % borderColors.length],
        description: job.aboutCompany || 'No description available',
        experience: job.experience || 'Not Specified',
        type: 'Full-time',
        background: backgroundColors[index % backgroundColors.length],
        isHot: true,
        applicationCount: job.applicationCount || 0,
        postedDate: formatJobAppliedDate(job.postedDate)
      };
    });

  // Create a Set of saved job keys for fast lookup
  const savedJobs = new Set(
    savedJobsData?.map(job => `${job.jobTitle}-${job.company}`) || []
  );

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'In Process': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Applied': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleApplyJob = async (job: JobSuggestion) => {
    // Show full details modal instead of applying directly
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleViewJob = (job: JobApplication) => {
    setSelectedApplication(job);
    setShowApplicationModal(true);
  };

  type ApplicationWithJd = JobApplication & {
    jdFile?: string | null;
    jdText?: string | null;
    primarySkills?: string | null;
    secondarySkills?: string | null;
    knowledgeOnly?: string | null;
    specialInstructions?: string | null;
  };

  const applicationJdData = useMemo((): JobDescriptionDetailsData | null => {
    if (!selectedApplication) return null;
    const app = selectedApplication as ApplicationWithJd;
    return {
      position: app.jobTitle,
      company: app.company,
      jdFile: app.jdFile ?? null,
      jdText: app.jdText ?? app.description ?? null,
      primarySkills: app.primarySkills ?? null,
      secondarySkills: app.secondarySkills ?? null,
      knowledgeOnly: app.knowledgeOnly ?? null,
      specialInstructions: app.specialInstructions ?? null,
    };
  }, [selectedApplication]);

  const handleArchiveJob = (job: JobApplication) => {
    archiveMutation.mutate(job.id);
  };

  const handleSeeAllJobs = () => {
    if (onNavigateToJobBoard) {
      onNavigateToJobBoard();
    }
  };

  const toggleSaveJob = async (job: JobSuggestion) => {
    const jobKey = `${job.title}-${job.company}`;
    const isCurrentlySaved = savedJobs.has(jobKey);

    try {
      if (isCurrentlySaved) {
        await removeSavedJobMutation.mutateAsync({
          jobTitle: job.title,
          company: job.company
        });
        toast({
          title: "Job removed",
          description: `${job.title} at ${job.company} removed from saved jobs.`,
        });
      } else {
        await saveJobMutation.mutateAsync({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          jobType: job.type,
        });
        toast({
          title: "Job saved",
          description: `${job.title} at ${job.company} saved successfully.`,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to save/remove job";
      
      if (errorMessage.includes("Authentication required")) {
        toast({
          title: "Login Required",
          description: "Please log in to save jobs. You can access the login page from the main menu.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };


  const confirmApplyAfterConsent = async () => {
    if (!pendingApplyJob || !profile?.id) {
      toast({
        title: "Missing information",
        description: "Please wait for your profile to load and try again.",
        variant: "destructive",
      });
      return;
    }
    const ok = await logConsent({
      user_id: profile.id,
      role: "candidate",
      consent_type: "job_consent",
      policy_version: "2026-05-10",
    });
    if (!ok) {
      toast({
        title: "Could not record consent",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    try {
      await applyJobMutation.mutateAsync({
        jobTitle: pendingApplyJob.title,
        company: pendingApplyJob.company,
        jobType: pendingApplyJob.type,
        description: pendingApplyJob.description,
        salary: pendingApplyJob.salary,
        location: pendingApplyJob.location,
        workMode: pendingApplyJob.workMode,
        experience: pendingApplyJob.experience,
        skills: JSON.stringify(pendingApplyJob.skills),
        logo: pendingApplyJob.logo,
        recruiterJobId: pendingApplyJob.id,
      });

      toast({
        title: "Application submitted",
        description: "Recruiters will be contacting you shortly regarding your application.",
      });
      setShowApplicationConsent(false);
      setPendingApplyJob(null);
      setShowJobModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const openApplicationConsentFromModal = () => {
    if (!selectedJob) return;
    setPendingApplyJob(selectedJob);
    setShowApplicationConsent(true);
  };

  const handleNudge = (application: JobApplication) => {
    if (candidateNudgeCooldownHours(application.status) == null) return;
    if (nudgingApplicationIds.has(application.id) || nudgeMutation.isPending) return;
    if (timeRemainingMap[application.id]) return;

    setNudgingApplicationIds((prev) => new Set(prev).add(application.id));
    nudgeMutation.mutate(application.id);
  };

  const handleWithdraw = (application: any) => {
    setWithdrawApp(application);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
    <div className={`flex flex-col lg:flex-row w-full items-start ${className || ''}`}>
      {/* Main Content Area - Applied Jobs and Job Suggestions */}
      <div className="flex-1 min-w-0 bg-gray-50 font-poppins w-full">
        <div className="p-3 lg:p-4 space-y-4 max-w-full">
          {/* Applied Jobs Section - Pipeline Layout */}
          <div className="bg-white rounded-[8px] p-4 shadow-sm relative border border-gray-100">
            <div className="flex flex-row items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-semibold text-gray-800 min-w-0 lg:text-lg">Applied Jobs</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowArchiveModal(true)}
                className="h-8 gap-1.5 px-2.5 text-xs sm:h-9 sm:gap-2 sm:px-3.5 sm:text-sm rounded-[6px] border-red-200 bg-red-50 font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 shrink-0"
                data-testid="button-applied-jobs-archive"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </div>

            {pendingConfirmations.length > 0 && (
              <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-amber-900">Pending confirmations</h3>
                    <p className="text-[12px] text-amber-800">
                      A recruiter applied you to the following role(s) on StaffOS. Confirm to show them in your Applied Jobs pipeline.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-bold bg-white/70 border border-amber-200 text-amber-900 px-2 py-1 rounded-full shrink-0">
                    {pendingConfirmations.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingConfirmations.map((app) => {
                    const checked = !!confirmChecks[app.id];
                    const canConfirm = checked && !confirmApplicationMutation.isPending;
                    return (
                      <div key={app.id} className="bg-white rounded-md border border-amber-100 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <div className="text-[13px] font-bold text-gray-900 truncate">{app.jobTitle}</div>
                              <span className="inline-flex shrink-0 items-center rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 text-[10px] font-bold">
                                Applied by StaffOS
                              </span>
                            </div>
                            <div className="text-[12px] text-gray-600 truncate">{app.company}</div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              Tagged on {formatDate(app.appliedDate)}
                            </div>
                          </div>
                          <Button
                            className="bg-[#4F00FF] hover:bg-[#3D00CC] text-white text-[11px] h-8 font-bold rounded-[6px] w-full sm:w-auto shrink-0"
                            disabled={!canConfirm}
                            onClick={() => confirmApplicationMutation.mutate(app.id)}
                          >
                            {confirmApplicationMutation.isPending ? "Confirming..." : "Confirm"}
                          </Button>
                        </div>

                        <div className="mt-3 flex items-start gap-2">
                          <Checkbox
                            id={`confirm-${app.id}`}
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = v === true;
                              setConfirmChecks(prev => ({ ...prev, [app.id]: next }));
                            }}
                          />
                          <label
                            htmlFor={`confirm-${app.id}`}
                            className="text-[12px] text-gray-700 leading-snug cursor-pointer select-none"
                          >
                            I confirm to apply for this job through StaffOS
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 overflow-x-auto pb-4 min-h-[320px] lg:min-h-[400px] custom-scrollbar max-lg:gap-2 max-lg:-mx-1 max-lg:px-1 max-lg:snap-x max-lg:snap-mandatory">
              {PIPELINE_STAGES.map((stage) => {
                const stageApplications = confirmedApplications.filter(app => mapStatusToStage(app.status) === stage);
                const columnStyle = PIPELINE_COLUMN_STYLES[stage] ?? PIPELINE_COLUMN_STYLES.Applied;
                
                return (
                  <div
                    key={stage}
                    className={`flex-shrink-0 w-[248px] max-lg:w-[min(85vw,200px)] max-lg:snap-start rounded-[8px] overflow-hidden ${columnStyle.topBorder} ${columnStyle.columnBg}`}
                  >
                    <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200/80">
                      <h3 className="font-bold text-gray-800 text-[13px]">
                        {stage}
                      </h3>
                      <span className={`min-w-[22px] text-center px-2 py-0.5 rounded-[8px] text-[11px] font-semibold ${columnStyle.countBadge}`}>
                        {stageApplications.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2 p-2 min-h-[360px]">
                      {stageApplications.map((job) => {
                        const isExpanded = !isBelowLg && expandedJobId === job.id;
                        const timeRemaining = timeRemainingMap[job.id];
                        const isSending =
                          nudgingApplicationIds.has(job.id) ||
                          (nudgeMutation.isPending && nudgeMutation.variables === job.id);
                        const isNudgeDisabled = !!timeRemaining || isSending;
                        const jobNudgeUpdates = candidateNudges.filter(
                          (n) => n.applicationId === job.id && (n.isResponded || n.message),
                        );
                        const hasUnreadNudgeUpdate = jobNudgeUpdates.some((n) => !n.isRead);
                        const nudgeDisplay = getApplicationNudgeDisplayState(
                          job.id,
                          !!timeRemaining,
                          candidateNudges,
                        );

                        return (
                          <div 
                            key={job.id} 
                            className={`relative transition-all duration-300 ${isExpanded ? 'z-10' : 'z-0'}`}
                          >
                            {isExpanded && (
                              <div 
                                className="fixed inset-0 bg-black/10 backdrop-blur-[3px] z-[-1] hidden lg:block"
                                onClick={() => setExpandedJobId(null)}
                              />
                            )}

                            <motion.div
                              layout
                              initial={false}
                              animate={{ 
                                scale: 1,
                                width: '100%',
                                x: 0,
                                boxShadow: isExpanded ? '0 25px 50px -12px rgb(0 0 0 / 0.15)' : '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                              }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className={`bg-white border cursor-pointer transition-all duration-200 ${
                                isExpanded ? 'border-indigo-400 ring-2 ring-indigo-100 z-10' : 'border-gray-200 hover:border-gray-300'
                              } rounded-[8px] p-3 shadow-sm`}
                              onClick={() => handleToggleExpand(job.id)}
                            >
                              {/* Unread recruiter response badge */}
                              {hasUnreadNudgeUpdate && (
                                <div className="absolute -top-1 -right-1 z-20">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1 min-w-0 mr-2">
                                  <h4 className="font-bold text-gray-800 text-[14px] leading-tight">{job.jobTitle}</h4>
                                  {isStaffOsTaggedApplication(job.source) && (
                                    <span className="mt-1 inline-flex items-center rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 text-[9px] font-bold">
                                      Applied by StaffOS
                                    </span>
                                  )}
                                </div>
                                {stage === 'Screened Out' && (
                                  <div className="flex-shrink-0">
                                    <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      Rejected
                                    </div>
                                  </div>
                                )}
                                {stage !== 'Screened Out' && nudgeDisplay.showIcon && (
                                  <div
                                    className="relative flex items-center justify-center shrink-0"
                                    title={
                                      nudgeDisplay.shouldPulse
                                        ? 'Awaiting recruiter response'
                                        : 'Nudge update received — cooldown active'
                                    }
                                  >
                                    {nudgeDisplay.shouldPulse && (
                                      <div className="absolute w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
                                    )}
                                    <Zap
                                      className={`w-4 h-4 text-blue-500 fill-blue-500 relative z-10 ${nudgeDisplay.shouldPulse ? 'animate-pulse' : ''}`}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                                <span className="font-semibold text-gray-600">{job.company}</span>
                                <span>{formatJobAppliedDate(job.appliedDate)}</span>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden pt-2 space-y-2"
                                  >
                                    {/* Latest Response Snippet */}
                                    {candidateNudges
                                      .filter(n => n.applicationId === job.id && (n.isResponded || n.message))
                                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                      .slice(0, 1)
                                      .map(nudge => (
                                        <div key={nudge.id} className="bg-teal-50 p-2.5 rounded-[6px] border border-teal-200 mb-2">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <MessageCircle className="w-3 h-3 text-teal-600" />
                                            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Latest Update</span>
                                          </div>
                                          <p className="text-[11px] text-teal-900 font-medium leading-relaxed">
                                            "{nudge.message || 'Responded'}"
                                          </p>
                                          <div className="text-[9px] text-gray-400 mt-1 text-right">
                                            {new Date(nudge.respondedAt || nudge.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                          </div>
                                        </div>
                                      ))}

                                    {stage !== 'Screened Out' && (
                                      <Button 
                                        className="w-full bg-[#4F00FF] hover:bg-[#3D00CC] text-white text-[11px] h-8 font-bold rounded-[5px] flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewJob(job);
                                        }}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        View Details
                                      </Button>
                                    )}
                                    
                                    {stage === 'Screened Out' && (
                                      <div className="pt-2 border-t border-blue-200 mt-2">
                                        <div className="flex items-start gap-3 mb-4">
                                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100 flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                          </div>
                                          <div>
                                            <h5 className="text-[14px] font-bold text-gray-900 leading-tight">Reason for rejection</h5>
                                            <p className="text-[11px] text-gray-500">Shared by the Recruiter</p>
                                          </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-[5px] p-3 border-l-4 border-red-500 mb-4">
                                          <h6 className="text-[12px] font-bold text-gray-900 mb-1">
                                            {job.rejectionReason?.trim() || 'Screened Out'}
                                          </h6>
                                          <p className="text-[11px] text-gray-600 leading-relaxed">
                                            {job.statusNote?.trim() &&
                                            job.statusNote.trim() !== (job.rejectionReason?.trim() || '')
                                              ? job.statusNote.trim()
                                              : job.rejectionReason?.trim()
                                                ? ''
                                                : 'Thank you for your interest. We will not be moving forward at this stage.'}
                                          </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                          <Button 
                                            className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white text-[13px] h-10 font-bold rounded-[5px] shadow-sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleArchiveJob(job);
                                            }}
                                          >
                                            Move to Archive
                                          </Button>
                                          <button 
                                            className="text-red-500 text-[13px] font-medium hover:underline px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedJobId(null);
                                            }}
                                          >
                                            Dismiss
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {stage !== 'Screened Out' && (
                                      <div className="flex gap-2">
                                        <Button 
                                          className="flex-1 bg-[#FF4D4D] hover:bg-[#E64444] text-white text-[11px] h-8 font-bold rounded-[5px] flex items-center justify-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWithdraw(job);
                                          }}
                                        >
                                          <Ban className="w-3.5 h-3.5" />
                                          Withdraw
                                        </Button>
                                        
                                        <div className="relative flex-1 group">
                                          <Button 
                                            className={`w-full text-white text-[11px] h-8 font-bold rounded-[5px] flex items-center justify-center gap-2 transition-all ${
                                              isNudgeDisabled 
                                                ? 'bg-[#00AF00]/50 cursor-not-allowed' 
                                                : 'bg-[#00AF00] hover:bg-[#009500]'
                                            }`}
                                            disabled={isNudgeDisabled}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleNudge(job);
                                            }}
                                          >
                                            {isSending ? (
                                              <NudgeSendingDots />
                                            ) : timeRemaining ? (
                                              <span className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {timeRemaining}
                                              </span>
                                            ) : (
                                              <><Zap className="w-3.5 h-3.5" /> Nudge</>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>
                        );
                      })}
                      
                      {stageApplications.length === 0 && (
                        <div className="h-24"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {confirmedApplications.length === 0 && pendingConfirmations.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Archive className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium">No job applications found.</p>
                <p className="text-sm text-gray-400">Start applying to jobs to see them here.</p>
              </div>
            )}
          </div>
          {/* Candidate Nudges Updates Section */}
          {candidateNudges.filter(n => n.isResponded || n.message).length > 0 && (
            <div className="bg-white rounded-md p-4 shadow-sm relative border border-gray-100 mb-4">
              <div className="flex flex-row items-center justify-between gap-2 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <Zap className="w-5 h-5 text-blue-500 fill-blue-500 shrink-0" /> Nudge Updates
                </h2>
                {candidateNudges.filter(n => n.isResponded || n.message).length > 5 && (
                  <Button size="sm" onClick={() => setShowAllNudgesDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-[5px] font-medium h-8 shrink-0 px-2.5 text-xs sm:px-3">
                    View More
                  </Button>
                )}
              </div>
              {/* Mobile: card list */}
              <div className="lg:hidden space-y-3">
                {candidateNudges
                  .filter(n => n.isResponded || n.message)
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((nudge: any) => (
                    <div
                      key={nudge.id}
                      className={`rounded-lg border p-3 ${!nudge.isRead ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50/50'}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!nudge.isRead && (
                              <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                            )}
                            <span className="font-semibold text-gray-900 text-sm truncate">{nudge.jobTitle}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{nudge.company}</p>
                        </div>
                        {!nudge.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(nudge.id)}
                            className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 shrink-0"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 mb-2">
                        <div>
                          <span className="font-medium text-gray-600 block">Nudged</span>
                          {new Date(nudge.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 block">Responded</span>
                          {nudge.respondedAt
                            ? new Date(nudge.respondedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                        </div>
                      </div>
                      {nudge.message ? (
                        <p className="text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-[6px] px-2.5 py-2 leading-relaxed">
                          {nudge.message}
                        </p>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-800 text-xs rounded-[6px] border border-emerald-200 font-medium">
                          Responded
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                      <th className="px-4 py-2 font-medium">Job Title</th>
                      <th className="px-4 py-2 font-medium">Company</th>
                      <th className="px-4 py-2 font-medium whitespace-nowrap">Nudged on</th>
                      <th className="px-4 py-2 font-medium whitespace-nowrap">Responded on</th>
                      <th className="px-4 py-2 font-medium">Recruiter Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateNudges
                      .filter(n => n.isResponded || n.message)
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((nudge: any) => (
                      <tr 
                        key={nudge.id} 
                        className={`border-b last:border-0 hover:bg-gray-50/50 transition-colors ${!nudge.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                          {!nudge.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                          )}
                          {nudge.jobTitle}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{nudge.company}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(nudge.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {nudge.respondedAt ? new Date(nudge.respondedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {nudge.message ? (
                            <span className="block text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-[6px] px-2 py-1.5">
                              {nudge.message}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-800 text-xs rounded-[6px] border border-emerald-200">
                              Responded
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!nudge.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsReadMutation.mutate(nudge.id)}
                              className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                            >
                              Mark as read
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile: metrics after applied jobs & nudges */}
          <div className="lg:hidden">
            <CandidateMetrics />
          </div>

          {profile && (
            <ProfileCompletionSession
              profile={profile}
              jobPreferences={jobPreferences}
              onNavigateToProfile={onNavigateToProfile}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Candidate Metrics (Collapsible) — desktop only */}
      <div className="hidden lg:block flex-shrink-0 sticky top-0 self-start relative z-20">
        <motion.div 
          animate={{ width: isMetricsExpanded ? 320 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white border-l border-gray-200 h-full overflow-hidden" 
          data-testid="candidate-metrics-column"
        >
          <div className={`p-6 ${isMetricsExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 w-[320px]`}>
            <CandidateMetrics />
          </div>
        </motion.div>

        {/* Toggle Button - Outside the overflow area with Tooltip-like label */}
        <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 flex items-center">
          <button
            onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all hover:scale-110 group relative"
          >
            {isMetricsExpanded ? <ChevronDown className="w-5 h-5 rotate-90" /> : <ChevronDown className="w-5 h-5 -rotate-90" />}
            
            {/* Tooltip Label */}
            <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isMetricsExpanded ? 'Hide Metrics' : 'Show Metrics'}
            </span>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile: centered pipeline job actions */}
    <Dialog
      open={!!mobileExpandedContext}
      onOpenChange={(open) => {
        if (!open) setExpandedJobId(null);
      }}
    >
      <DialogContent
        className={cn(
          "flex w-[calc(100vw-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 lg:hidden",
          CANDIDATE_MOBILE_CENTERED_DIALOG_CLASSES,
        )}
      >
        {mobileExpandedContext && (() => {
          const { job, stage } = mobileExpandedContext;
          const timeRemaining = timeRemainingMap[job.id];
          const isSending =
            nudgingApplicationIds.has(job.id) ||
            (nudgeMutation.isPending && nudgeMutation.variables === job.id);
          const isNudgeDisabled = !!timeRemaining || isSending;
          const latestNudge = candidateNudges
            .filter((n) => n.applicationId === job.id && (n.isResponded || n.message))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          return (
            <>
              <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12 text-left">
                <DialogTitle className="text-base font-bold text-gray-900 leading-snug pr-2">
                  {job.jobTitle}
                </DialogTitle>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{job.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Applied {formatJobAppliedDate(job.appliedDate)} · {stage}
                </p>
              </DialogHeader>

              <div className="overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
                {latestNudge && (
                  <div className="bg-teal-50 rounded-[6px] border border-teal-200 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageCircle className="w-4 h-4 text-teal-600" />
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">
                        Recruiter update
                      </span>
                    </div>
                    <p className="text-sm font-medium text-teal-900 leading-relaxed">
                      {latestNudge.message || "Responded"}
                    </p>
                    <p className="text-[10px] text-teal-700/80 mt-1.5 text-right">
                      {new Date(latestNudge.respondedAt || latestNudge.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {stage !== "Screened Out" ? (
                  <>
                    <Button
                      className="w-full bg-[#4F00FF] hover:bg-[#3D00CC] text-white text-sm h-10 font-bold rounded-[6px]"
                      onClick={() => {
                        setExpandedJobId(null);
                        handleViewJob(job);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#FF4D4D] hover:bg-[#E64444] text-white text-sm h-10 font-bold rounded-[6px]"
                        onClick={() => {
                          setExpandedJobId(null);
                          handleWithdraw(job);
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1.5" />
                        Withdraw
                      </Button>
                      <Button
                        className={`flex-1 text-white text-sm h-10 font-bold rounded-[6px] ${
                          isNudgeDisabled
                            ? "bg-[#00AF00]/50 cursor-not-allowed"
                            : "bg-[#00AF00] hover:bg-[#009500]"
                        }`}
                        disabled={isNudgeDisabled}
                        onClick={() => handleNudge(job)}
                      >
                        {isSending ? (
                          <NudgeSendingDots />
                        ) : timeRemaining ? (
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {timeRemaining}
                          </span>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-1" />
                            Nudge
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-red-500">
                      <h6 className="text-sm font-bold text-gray-900 mb-1">
                        {job.rejectionReason?.trim() || "Screened Out"}
                      </h6>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {job.statusNote?.trim() &&
                        job.statusNote.trim() !== (job.rejectionReason?.trim() || "")
                          ? job.statusNote.trim()
                          : job.rejectionReason?.trim()
                            ? ""
                            : "Thank you for your interest. We will not be moving forward at this stage."}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm h-10 font-bold rounded-[6px]"
                      onClick={() => {
                        setExpandedJobId(null);
                        handleArchiveJob(job);
                      }}
                    >
                      Move to Archive
                    </Button>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </DialogContent>
    </Dialog>

    {/* Job Details Modal - Exact copy of JobBoardTab modal */}
    {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl shadow-2xl max-w-2xl w-full mx-8 max-h-[85vh] flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
              {/* Job Card Header */}
              <div className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex">
                    {/* Company Logo Section */}
                    <div className="w-32 flex items-center justify-center">
                      <div className={`${selectedJob.background} rounded-xl p-3 flex flex-col items-center justify-center w-full h-full min-h-[100px]`}>
                        <img
                          src={selectedJob.logo}
                          alt={`${selectedJob.company} logo`}
                          className="w-12 h-12 rounded object-cover mb-1"
                        />
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedJob.company.split(' ')[0]}</div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedJob.company}</h3>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {selectedJob.title}
                            {selectedJob.isHot && <i className="fas fa-fire text-red-500 text-sm"></i>}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{selectedJob.description}</p>
                        </div>
                        <button
                          onClick={() => setShowJobModal(false)}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center ml-2 transition-colors"
                          data-testid="button-close-modal"
                        >
                          <i className="fas fa-times text-white text-xs"></i>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-briefcase"></i>
                          {selectedJob.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">₹</span>
                          {selectedJob.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt"></i>
                          {selectedJob.location}
                        </span>
                        <span className="font-medium">{selectedJob.workMode}</span>
                        <span className="font-medium">{selectedJob.type}</span>
                      </div>

                      {/* Job Tags */}
                      <div className="flex items-center gap-1 mb-2">
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          Open Positions ~ 2
                        </span>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          Product
                        </span>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          B2B
                        </span>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                          Full Time
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex items-center gap-1">
                        {selectedJob.skills.map((skill, index) => (
                          <span key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* View Less Button */}
                      <div className="flex justify-end mt-2">
                        <Button 
                          onClick={() => setShowJobModal(false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs" 
                          size="sm"
                          data-testid="button-view-less"
                        >
                          View Less
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Sections - Separate Boxes */}
                <div className=" pb-4 space-y-4">
                  {/* About Company Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About Company</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Google, now a subsidiary of Alphabet Inc., is a multinational technology company known for 
                      its Internet search engine, online advertising technologies, cloud computing, and other 
                      software services. Originally founded in 1998 by Larry Page and Sergey Brin, initially as a research project 
                      at Stanford University. Google's core mission is to organize the world's information and 
                      make it universally accessible and useful.
                    </p>
                  </div>

                  {/* Role Definition Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      We are looking for a Cloud Engineer to join our team and work with our engineering team to 
                      optimize, implement, and maintain our organization's cloud-based systems.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      A Cloud Engineer's responsibilities include deploying and debugging systems, as well as 
                      executing new cloud initiatives.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Ultimately, you will work with different IT professionals and teams to ensure our cloud 
                      computing systems meet the needs of our organization and customers.
                    </p>
                  </div>

                  {/* Key Responsibilities Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Responsibilities</h5>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Design, develop, and deploy modular cloud-based systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Develop and maintain cloud solutions in accordance with best practices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Ensure efficient functioning of data storage and process functions in accordance with 
                        company security policies and best practices in cloud security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Identify, analyse, and resolve infrastructure vulnerabilities and application deployment 
                        issues</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Regularly review existing systems and make recommendations for improvements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 text-xs">•</span>
                        <span>Interact with clients, provide cloud support, and make recommendations based on client 
                        needs</span>
                      </li>
                    </ul>
                  </div>

                  {/* Skills Required Box */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm w-full">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills Required</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded border border-green-200 dark:border-green-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Primary Skills</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {selectedJob.skills.length > 0 ? selectedJob.skills.map((s, i) => <div key={i}>{s}</div>) : <div>Not specified</div>}
                        </div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Secondary Skills</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {selectedJob.secondarySkills && selectedJob.secondarySkills.length > 0 
                            ? selectedJob.secondarySkills.map((s, i) => <div key={i}>{s}</div>) 
                            : <div>Not specified</div>}
                        </div>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded border border-yellow-200 dark:border-yellow-700">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Knowledge Only</h6>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {selectedJob.knowledgeSkills && selectedJob.knowledgeSkills.length > 0 
                            ? selectedJob.knowledgeSkills.map((s, i) => <div key={i}>{s}</div>) 
                            : <div>Not specified</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Apply and Save Buttons Footer */}
            <div className="p-4 flex justify-center gap-3">
              <Button 
                onClick={() => selectedJob && toggleSaveJob(selectedJob)}
                className={`px-6 py-2 rounded font-medium border-0 text-sm transition-all ${
                  selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                data-testid="button-save-job-modal"
              >
                <i className={`${selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'fas fa-bookmark' : 'far fa-bookmark'} mr-1`}></i>
                {selectedJob && savedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Saved' : 'Save'}
              </Button>
              <Button 
                onClick={() => selectedJob && openApplicationConsentFromModal()}
                disabled={selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)}
                className={`px-6 py-2 rounded font-medium border-0 text-sm ${
                  selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                data-testid="button-apply-job-modal"
              >
                {selectedJob && appliedJobs.has(`${selectedJob.title}-${selectedJob.company}`) ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CandidateApplicationConsentModal
        open={showApplicationConsent}
        jobTitle={pendingApplyJob?.title}
        company={pendingApplyJob?.company}
        onCancel={() => {
          setShowApplicationConsent(false);
          setPendingApplyJob(null);
        }}
        onConfirm={confirmApplyAfterConsent}
      />

      <JobDescriptionDetailsModal
        open={showApplicationModal && Boolean(selectedApplication)}
        onOpenChange={(open) => {
          setShowApplicationModal(open);
          if (!open) setSelectedApplication(null);
        }}
        data={applicationJdData}
        subtitle={
          selectedApplication
            ? `Applied ${formatJobAppliedDate(selectedApplication.appliedDate)} · Status: ${selectedApplication.status || 'In Process'}`
            : undefined
        }
        variant="delivery"
      />
      {/* Full Nudge Logs Dialog */}
      <Dialog
        open={showAllNudgesDialog}
        onOpenChange={(open) => {
          setShowAllNudgesDialog(open);
          if (!open) setNudgeLogSearch('');
        }}
      >
        <DialogContent
          className={cn(
            "flex flex-col overflow-hidden p-0",
            CANDIDATE_MOBILE_DIALOG_CLASSES,
            CANDIDATE_DESKTOP_DIALOG_CLASSES,
            "max-lg:w-[calc(100vw-1rem)]",
            "lg:max-w-[1280px] lg:max-h-[85vh] lg:w-[96vw] lg:rounded-xl",
          )}
        >
          <DialogHeader className="shrink-0 space-y-4 border-b p-6 max-lg:space-y-3 max-lg:p-4">
            <DialogTitle className="flex items-center gap-2 text-lg max-lg:pr-8 max-lg:text-base max-lg:text-left">
              <Zap className="w-5 h-5 text-blue-500 fill-blue-500 shrink-0" /> All Nudge Logs
            </DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={nudgeLogSearch}
                onChange={(e) => setNudgeLogSearch(e.target.value)}
                placeholder="Search job, company, status…"
                className="pl-9 h-10 rounded-lg border-gray-200 max-lg:h-9 max-lg:text-sm max-lg:rounded-[6px]"
              />
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            {/* Mobile: nudge log cards */}
            <div className="lg:hidden p-3 pb-4 space-y-2.5">
              {filteredNudgeLogs.length === 0 ? (
                <p className="py-12 text-center text-gray-400 text-sm">
                  {nudgeLogSearch.trim() ? 'No nudge logs match your search' : 'No nudge logs yet'}
                </p>
              ) : (
                filteredNudgeLogs.map((nudge: any) => {
                  const pipelineStage = mapCandidateApplicationStage(nudge.currentStatus);
                  return (
                    <div
                      key={nudge.id}
                      className={`rounded-xl border p-4 ${!nudge.isRead && (nudge.isResponded || nudge.message) ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-white'}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {!nudge.isRead && (nudge.isResponded || nudge.message) && (
                          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{nudge.jobTitle}</p>
                          <p className="text-xs text-gray-600">{nudge.company}</p>
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-semibold shrink-0">
                          {pipelineStage}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 mb-2">
                        <div>
                          <span className="font-medium text-gray-600 block">Nudged</span>
                          {new Date(nudge.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 block">Responded</span>
                          {nudge.respondedAt
                            ? new Date(nudge.respondedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                        </div>
                      </div>
                      {nudge.message ? (
                        <p className="text-sm font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-[6px] px-3 py-2 leading-relaxed">
                          {nudge.message}
                        </p>
                      ) : nudge.isResponded ? (
                        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-800 text-xs rounded-[6px] border border-emerald-200 font-medium">
                          Responded
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-[6px] px-2.5 py-1.5">
                          Awaiting response
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="hidden lg:block overflow-auto p-0">
            <table className="w-full table-fixed text-sm text-left border-collapse">
              <colgroup>
                <col className="w-[150px]" />
                <col className="w-[220px]" />
                <col className="w-[180px]" />
                <col className="w-[140px]" />
                <col className="w-[150px]" />
                <col />
              </colgroup>
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_rgb(229,231,235)]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Nudged On</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Job Title</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Company</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Responded on</th>
                  <th className="px-5 py-3.5 font-semibold text-sm text-gray-900 bg-gray-50">Recruiter Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredNudgeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                      {nudgeLogSearch.trim() ? 'No nudge logs match your search' : 'No nudge logs yet'}
                    </td>
                  </tr>
                ) : (
                  filteredNudgeLogs.map((nudge: any) => {
                      const pipelineStage = mapCandidateApplicationStage(nudge.currentStatus);
                      return (
                        <tr
                          key={nudge.id}
                          className={`hover:bg-gray-50/80 transition-colors ${!nudge.isRead && (nudge.isResponded || nudge.message) ? 'bg-blue-50/40' : ''}`}
                        >
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap align-top">
                            {new Date(nudge.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-900 align-top">
                            <div className="flex items-start gap-2">
                              {!nudge.isRead && (nudge.isResponded || nudge.message) && (
                                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5" />
                              )}
                              <span className="break-words">{nudge.jobTitle}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 align-top break-words">{nudge.company}</td>
                          <td className="px-5 py-3.5 align-top">
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold whitespace-nowrap">
                              {pipelineStage}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap align-top">
                            {nudge.respondedAt
                              ? new Date(nudge.respondedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                              : '—'}
                          </td>
                          <td className="px-5 py-3.5 align-top">
                            {nudge.message ? (
                              <span className="block text-sm text-gray-700 break-words leading-relaxed">
                                {nudge.message}
                              </span>
                            ) : nudge.isResponded ? (
                              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 font-medium">
                                Responded
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium">Awaiting response</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Withdrawal Modal */}
      <Dialog 
        open={!!withdrawApp} 
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawApp(null);
            setWithdrawReason("");
            setWithdrawText("");
            setShowWithdrawSuccess(false);
          }
        }}
      >
        <DialogContent
          className={cn(
            "max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl font-poppins",
            CANDIDATE_MOBILE_CENTERED_DIALOG_CLASSES,
            CANDIDATE_DESKTOP_DIALOG_CLASSES,
            "max-lg:max-h-[min(90dvh,calc(100dvh-5rem))] max-lg:overflow-y-auto max-lg:overscroll-contain",
          )}
        >
          <AnimatePresence mode="wait">
            {!showWithdrawSuccess ? (
              <motion.div 
                key="withdraw-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-5 sm:p-8 space-y-5 sm:space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">Help us improve</h2>
                  <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-200">
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                      We understand priorities change. Let us know why so we can do better.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Choose your primary reason for withdrawing</Label>
                    <Select value={withdrawReason} onValueChange={setWithdrawReason}>
                      <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 transition-all text-[14px]">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                        <SelectItem value="Accepted another offer">Accepted another offer</SelectItem>
                        <SelectItem value="Compensation not aligned">Compensation not aligned</SelectItem>
                        <SelectItem value="Role not aligned">Role not aligned</SelectItem>
                        <SelectItem value="Company / product not aligned">Company / product not aligned</SelectItem>
                        <SelectItem value="Location / work mode not suitable">Location / work mode not suitable</SelectItem>
                        <SelectItem value="Process took longer than expected">Process took longer than expected</SelectItem>
                        <SelectItem value="Didn’t receive timely updates">Didn’t receive timely updates</SelectItem>
                        <SelectItem value="Process felt too lengthy">Process felt too lengthy</SelectItem>
                        <SelectItem value="Change in career plans">Change in career plans</SelectItem>
                        <SelectItem value="Availability / notice period constraints">Availability / notice period constraints</SelectItem>
                        <SelectItem value="Others (please specify)">Others (please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {withdrawReason === "Others (please specify)" && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-2"
                    >
                      <textarea
                        value={withdrawText}
                        onChange={(e) => setWithdrawText(e.target.value)}
                        placeholder="Please tell us more..."
                        className="w-full min-h-[100px] p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white transition-all outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    onClick={() => confirmWithdraw()}
                    disabled={!withdrawReason || (withdrawReason === "Others (please specify)" && !withdrawText) || withdrawMutation.isPending}
                    className="w-full bg-[#4F8AFF] hover:bg-[#3D78FF] text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                  >
                    {withdrawMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="withdraw-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 flex flex-col items-center text-center bg-white"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-8 border-4 border-green-100"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Thank you for your time and interest.</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                  We appreciate your time and honesty in informing us. Wishing you great success in your next opportunity!
                </p>
                
                <Button 
                  onClick={() => {
                    setWithdrawApp(null);
                    setWithdrawReason("");
                    setWithdrawText("");
                    setShowWithdrawSuccess(false);
                  }}
                  className="mt-10 px-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold h-12 shadow-xl shadow-gray-200 transition-all active:scale-95"
                >
                  Close
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent
          className={cn(
            "flex flex-col overflow-hidden p-0 rounded-2xl border-none shadow-2xl",
            CANDIDATE_MOBILE_DIALOG_CLASSES,
            CANDIDATE_DESKTOP_DIALOG_CLASSES,
            "max-lg:w-[calc(100vw-1rem)]",
            "lg:max-w-[1200px] lg:w-[95vw] lg:max-h-[85vh]",
          )}
        >
          <DialogHeader className="shrink-0 border-b bg-white/50 p-6 backdrop-blur-sm max-lg:p-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-3 max-lg:text-lg">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <Archive size={20} />
              </div>
              Application Archive
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50/30 p-4 sm:p-6">
            {/* Mobile: archive cards */}
            <div className="lg:hidden space-y-3 pb-2">
              {archivedApplications.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <Archive size={32} />
                  </div>
                  <p className="font-semibold text-gray-400 tracking-tight text-xs text-center px-4">
                    No archived applications found
                  </p>
                </div>
              ) : (
                archivedApplications.map((app) => {
                  const statusDisplay = getArchiveStatusLabel(app.status, app.statusNote);
                  const terminalMeta = getArchiveTerminalMeta(app.status, app.statusNote);
                  return (
                    <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <p className="font-semibold text-gray-900 text-sm">{app.jobTitle}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{app.company}</p>
                      <p className="text-[11px] text-gray-500 mt-2">Applied {formatDate(app.appliedDate)}</p>
                      <p className={`mt-2 text-sm font-semibold ${statusDisplay.isRed ? 'text-red-600' : 'text-gray-600'}`}>
                        {statusDisplay.label}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="font-medium text-gray-600 block">Rejected / Withdrawn on</span>
                          <span className="text-gray-700">{terminalMeta.date}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 block">At stage</span>
                          <span className="text-gray-700">{terminalMeta.stage}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Role</th>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Company</th>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Applied on</th>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Rejected / Withdrawn on</th>
                    <th className="px-5 py-3.5 font-semibold text-sm text-gray-900">Rejected / Withdrawn at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {archivedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                            <Archive size={32} />
                          </div>
                          <p className="font-semibold text-gray-400 tracking-tight text-xs">
                            No archived applications found
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    archivedApplications.map((app) => {
                      const statusDisplay = getArchiveStatusLabel(app.status, app.statusNote);
                      const terminalMeta = getArchiveTerminalMeta(app.status, app.statusNote);
                      return (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-semibold text-gray-900">{app.jobTitle}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-700 font-medium">
                            {app.company}
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {formatDate(app.appliedDate)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold ${statusDisplay.isRed ? 'text-red-600' : 'text-gray-600'}`}>
                              {statusDisplay.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {terminalMeta.date}
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {terminalMeta.stage}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex shrink-0 justify-end border-t bg-white p-6 max-lg:p-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => setShowArchiveModal(false)}
              className="rounded-xl bg-gray-900 px-8 font-semibold text-white hover:bg-gray-800 max-lg:w-full"
            >
              Close Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}
