import { useState, useMemo, useEffect, useCallback } from 'react';
import TeamLeaderMainSidebar from '@/components/dashboard/team-leader-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamLeaderTeamBoxes from '@/components/dashboard/team-leader-team-boxes';
import TeamLeaderSidebar from '@/components/dashboard/team-leader-sidebar';
import AddRequirementModal from '@/components/dashboard/modals/add-requirement-modal';
import JobDescriptionDetailsModal from '@/components/dashboard/modals/job-description-details-modal';
import { JdVisibilityModal } from '@/components/dashboard/modals/jd-visibility-modal';
import UploadResumeModal from '@/components/dashboard/modals/UploadResumeModal';
import DailyDeliveryModal from '@/components/dashboard/modals/daily-delivery-modal';
import { StaffOsV2DisabledSection } from '@/components/dashboard/staffos-v2-disabled-section';
import NudgesTab from '@/components/dashboard/tabs/nudges-tab';
import ActiveNudgesTable from "@/components/dashboard/active-nudges-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from '@/components/ui/search-bar';
import { RequirementRoleCell } from '@/components/dashboard/requirement-role-cell';
import {
  buildStreqDisplayMap,
  getRequirementLookupId,
  parseRequirementJdVisibility,
  resolveRequirementDisplayId,
} from '@shared/requirement-jd-extras';
import { getRequirementResumeTarget, RESUME_TARGET_MATRIX } from '@shared/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, EditIcon, MoreVertical, Mail, UserRound, Plus, Upload, X, Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, ExternalLink, Phone, Star, Copy, FileText, Eye, Loader2, ChevronDown, Check, ChevronUp, ChevronLeft, ChevronRight, Clock, Zap, AlertTriangle, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { invalidateRevenueMappingQueries } from "@/lib/admin-performance-queries";
import { broadcastDashboardEvent, useDashboardSync } from "@/lib/dashboard-sync";
import {
  CandidateCommentsSession,
  type CandidateCommentsSessionApplicant,
} from "@/components/dashboard/candidate-comments-session";
import {
  RECRUITER_PIPELINE_STAGE_ORDER,
  buildPipelineSessionList,
  groupApplicantsByPipelineStage,
  mapRecruiterApplicantDisplayStatus,
  mapRecruiterPipelineCandidate,
  parseClosureMeta,
  parseRejectedMeta,
  parseTerminalOutcome,
  isWithinClosureGracePeriod,
  shouldAutoArchiveApplication,
  shouldExcludeFromEmployeePipeline,
  type TerminalOutcome,
} from "@/lib/pipeline-session-utils";
import { useOpenCommentSessionListener } from "@/lib/open-comment-session";
import { useIsMobile, getIsMobileViewport } from "@/hooks/use-mobile";
import { TaPipelineTab } from "@/components/dashboard/ta-pipeline-tab";
import { ClosureReportsCardList } from "@/components/dashboard/closure-reports-card-list";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { navigateToRecruiterSatellitePage } from "@/lib/recruiter-navigation";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChatDock } from '@/components/chat/chat-dock';
import { ChatModal } from '@/components/chat/admin-chat-modal';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeAuth } from '@/contexts/auth-context';
import { useStaggeredDashboardLoad } from '@/lib/use-staggered-dashboard-load';
import { PaperPlaneNudgeIcon } from '@/components/landing/paper-plane-nudge-icon';

// Helper function to calculate elapsed working hours
function getElapsedWorkingHours(startDateStr: string | Date): number {
  const startDate = new Date(startDateStr);
  const endDate = new Date();
  
  if (startDate >= endDate) return 0;

  let current = new Date(startDate);
  let elapsedMs = 0;
  
  while (current < endDate) {
    const day = current.getDay();
    // Monday = 1, Friday = 5
    if (day >= 1 && day <= 5) {
      const startOfDay = new Date(current);
      startOfDay.setHours(9, 30, 0, 0);
      
      const endOfDay = new Date(current);
      endOfDay.setHours(18, 30, 0, 0);

      const actualStart = current > startOfDay ? current : startOfDay;
      const actualEnd = endDate < endOfDay ? endDate : endOfDay;

      if (actualStart < actualEnd) {
        elapsedMs += (actualEnd.getTime() - actualStart.getTime());
      }
    }
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  
  return elapsedMs / (1000 * 60 * 60);
}

function formatRemainingWorkingTime(elapsedHours: number, maxHours = 6): string {
  if (elapsedHours >= maxHours) return "Escalated";
  const remainingHours = maxHours - elapsedHours;
  const hours = Math.floor(remainingHours);
  const mins = Math.floor((remainingHours - hours) * 60);
  if (hours === 0 && mins === 0) return "Escalated";
  return `${hours} hrs ${mins} mins`;
}

const APPLICANT_STATUS_STYLES: Record<string, { trigger: string; item: string }> = {
  'Resume Review': {
    trigger: 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300',
    item: 'focus:bg-slate-100 focus:text-slate-800',
  },
  Shortlisted: {
    trigger: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100 hover:border-green-300',
    item: 'focus:bg-green-100 focus:text-green-800',
  },
  Screening: {
    trigger: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100 hover:border-sky-300',
    item: 'focus:bg-sky-100 focus:text-sky-800',
  },
  L1: {
    trigger: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300',
    item: 'focus:bg-cyan-100 focus:text-cyan-800',
  },
  L2: {
    trigger: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
    item: 'focus:bg-blue-100 focus:text-blue-800',
  },
  L3: {
    trigger: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
    item: 'focus:bg-indigo-100 focus:text-indigo-800',
  },
  'Final Round': {
    trigger: 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100 hover:border-violet-300',
    item: 'focus:bg-violet-100 focus:text-violet-800',
  },
  'HR Round': {
    trigger: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
    item: 'focus:bg-purple-100 focus:text-purple-800',
  },
  Selected: {
    trigger: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 hover:border-teal-300',
    item: 'focus:bg-teal-100 focus:text-teal-800',
  },
  Closure: {
    trigger: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    item: 'focus:bg-emerald-100 focus:text-emerald-800',
  },
  'Screened Out': {
    trigger: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 hover:border-red-300',
    item: 'focus:bg-red-100 focus:text-red-800',
  },
};

type ApplicantOverviewRow = {
  id: string;
  currentStatus: string;
  rawStatus?: string;
  statusNote?: string | null;
  terminalOutcome?: TerminalOutcome;
  taggedByTeamLead?: boolean;
  [key: string]: unknown;
};

function getApplicantTerminal(applicant: ApplicantOverviewRow): TerminalOutcome {
  return (
    applicant.terminalOutcome ??
    parseTerminalOutcome(applicant.rawStatus ?? applicant.currentStatus, applicant.statusNote)
  );
}

function applicantOverviewRowClass(
  applicant: ApplicantOverviewRow,
  isUpdating: boolean,
): string {
  if (isUpdating) return "opacity-70 bg-blue-50";
  if (getApplicantTerminal(applicant).kind) return "bg-red-50/90 hover:bg-red-100/90";
  if (applicant.taggedByTeamLead) return "bg-sky-50/90 hover:bg-sky-100/90";
  return "hover:bg-gray-50";
}

function getApplicantStatusStyles(status: string) {
  return (
    APPLICANT_STATUS_STYLES[status] ?? {
      trigger: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
      item: 'focus:bg-gray-100 focus:text-gray-800',
    }
  );
}

export default function RecruiterDashboard2() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const employee = useEmployeeAuth(); // Must be called before any hooks that depend on it
  const { requirementsReady, pipelineReady, closuresReady } = useStaggeredDashboardLoad();
  const isMobile = useIsMobile();

  // Restore sidebarTab from sessionStorage for proper back navigation
  const initialSidebarTab = () => {
    if (getIsMobileViewport()) {
      return "pipeline";
    }
    const saved = sessionStorage.getItem("recruiterDashboardSidebarTab");
    sessionStorage.removeItem("recruiterDashboardSidebarTab");
    return saved ? saved : "dashboard";
  };

  const [sidebarTab, setSidebarTab] = useState(initialSidebarTab());

  useEffect(() => {
    const handleNotificationNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: string; storageKey?: string }>).detail;
      if (detail?.storageKey && detail.storageKey !== "recruiterDashboardSidebarTab") return;
      if (isMobile) {
        setSidebarTab("pipeline");
        return;
      }
      if (detail?.tab) setSidebarTab(detail.tab);
    };
    window.addEventListener("staffos-notification-navigate", handleNotificationNavigate);
    return () => window.removeEventListener("staffos-notification-navigate", handleNotificationNavigate);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && sidebarTab !== "pipeline") {
      setSidebarTab("pipeline");
    }
  }, [isMobile, sidebarTab]);

  const [updateModalNudge, setUpdateModalNudge] = useState<any>(null);
  const [updateDropdown1, setUpdateDropdown1] = useState("");
  const [updateDropdown2, setUpdateDropdown2] = useState("");
  const [localUpdatedNudges, setLocalUpdatedNudges] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('team');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRequirementForDelivery, setSelectedRequirementForDelivery] = useState<string>('Overall');
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isClosureDetailsModalOpen, setIsClosureDetailsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [selectedJD, setSelectedJD] = useState<any>(null);
  const [isJDDetailsModalOpen, setIsJDDetailsModalOpen] = useState(false);
  const [isJdVisibilityModalOpen, setIsJdVisibilityModalOpen] = useState(false);
  const [jdVisibilityRequirement, setJdVisibilityRequirement] = useState<any | null>(null);
  const [jdVisibilityValue, setJdVisibilityValue] = useState(true);
  const [assignments, setAssignments] = useState<{ [key: string]: string }>({ 'mobile-app-dev': 'Arun' });
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
  const [pipelineDate, setPipelineDate] = useState<Date | null>(null);
  const [isViewAllClosuresModalOpen, setIsViewAllClosuresModalOpen] = useState(false);
  const [closureSearchQuery, setClosureSearchQuery] = useState('');
  const [isPendingMeetingsModalOpen, setIsPendingMeetingsModalOpen] = useState(false);
  const [isCeoCommandsModalOpen, setIsCeoCommandsModalOpen] = useState(false);
  const [isApplicantOverviewModalOpen, setIsApplicantOverviewModalOpen] = useState(false);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');
  const [isInviteConfirmModalOpen, setIsInviteConfirmModalOpen] = useState(false);
  const [applicantToInvite, setApplicantToInvite] = useState<any>(null);
  const [invitePendingApplicationId, setInvitePendingApplicationId] = useState<string | null>(null);
  const [pipelineView, setPipelineView] = useState<"board" | "candidate-session">("board");
  const [sessionApplicationId, setSessionApplicationId] = useState<string | null>(null);
  const [sessionApplicantSnapshot, setSessionApplicantSnapshot] =
    useState<CandidateCommentsSessionApplicant | null>(null);
  const [isClosureFormModalOpen, setIsClosureFormModalOpen] = useState(false);
  const [selectedCandidateForClosure, setSelectedCandidateForClosure] = useState<any>(null);
  const [closureFormData, setClosureFormData] = useState({
    offeredOn: '',
    joinedOn: ''
  });

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
  const [otherReasonText, setOtherReasonText] = useState('');
  const [requirementCountModal, setRequirementCountModal] = useState<{ isOpen: boolean, requirement: any }>({ isOpen: false, requirement: null });

  // Calendar modal state for requirements count
  const [requirementCounts, setRequirementCounts] = useState<{ [key: string]: { [date: string]: string } }>({});
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

  // Upload Resume functionality
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
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
    expectedCtc: '',
    skills: ['', '', '', '', '']
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFormError, setResumeFormError] = useState('');
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
  const { data: jobCounts } = useQuery<{ total: number, active: number, closed: number, draft: number }>({
    queryKey: ['/api/recruiter/jobs/counts'],
  });

  // Query for candidate counts
  const { data: candidateCounts } = useQuery<{ total: number, active: number, inactive: number }>({
    queryKey: ['/api/recruiter/candidates/counts'],
  });

  // Query for all job applications
  const { data: allApplications = [], isLoading: isLoadingApplications } = useQuery<any[]>({
    queryKey: ['/api/recruiter/applications'],
    enabled: !!employee && pipelineReady,
  });

  // Refresh Applicant Overview & counts the moment another tab (e.g. the
  // "Source Resume" page) tags a candidate to a requirement.
  useDashboardSync(queryClient, {
    eventTypes: ['applications:changed', 'candidates:changed'],
    queryKeys: [
      ['/api/recruiter/applications'],
      ['/api/recruiter/jobs/counts'],
      ['/api/recruiter/candidates/counts'],
    ],
  });

  // Fetch interviews from backend - must be defined before useMemo/useEffect that use it
  const { data: fetchedInterviews = [], error: interviewsError, refetch: refetchInterviews } = useQuery<Array<{
    id: string;
    candidateName: string;
    position: string;
    client: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    interviewRound: string;
    status: string;
  }>>({
    queryKey: ['/api/recruiter/interviews'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Log errors for debugging
  useEffect(() => {
    if (interviewsError) {
      console.error('Error fetching interviews:', interviewsError);
    }
  }, [interviewsError]);

  // Calculate application stats
  const applicationStats = useMemo(() => {
    const total = allApplications.length;
    // New applications = self-applied (source: 'job_board') with status 'In Process', 'Applied', or null/undefined
    // These are applications that haven't been reviewed/processed yet
    const newApps = allApplications.filter((app: any) => {
      const isSelfApplied = app.source === 'job_board';
      const isUnreviewed = !app.status ||
        app.status === 'In Process' ||
        app.status === 'In-Process' ||
        app.status === 'Evaluating' ||
        app.status === 'Resume Review' ||
        app.status === 'Applied' ||
        app.status === '';
      return isSelfApplied && isUnreviewed;
    }).length;
    return { total, new: newApps };
  }, [allApplications]);

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      statusNote,
      rejectionReason,
      silent,
    }: {
      id: string;
      status: string;
      statusNote?: string;
      rejectionReason?: string;
      silent?: boolean;
    }) => {
      setUpdatingApplicantId(id);
      const response = await apiRequest('PATCH', `/api/recruiter/applications/${id}/status`, { status, statusNote, rejectionReason });
      const responseData = await response.json();
      return { id, status, application: responseData.application, silent: Boolean(silent) };
    },
    onSuccess: (data) => {
      const app = data.application as { status?: string; statusNote?: string | null } | undefined;
      const mappedStatus = mapRecruiterApplicantDisplayStatus(app?.status, app?.statusNote);
      setApplicantStatusOverrides((prev) => ({
        ...prev,
        [data.id]: mappedStatus,
      }));
      broadcastDashboardEvent({
        type: "applications:changed",
        source: "recruiter-status-update",
      });
      void queryClient.invalidateQueries({ queryKey: ["/api/recruiter/applications"] });
      void queryClient.refetchQueries({ queryKey: ["/api/recruiter/applications"] });
      setUpdatingApplicantId(null);
      if (!data.silent) {
        toast({
          title: "Status Updated",
          description: "Candidate status has been updated successfully.",
        });
      }
      console.log('Status updated successfully:', data);
    },
    onError: (error: any, variables) => {
      setUpdatingApplicantId(null);
      if (variables?.silent) {
        setApplicantStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[variables.id];
          return next;
        });
        setAutoArchivedIds((prev) => {
          const next = new Set(prev);
          next.delete(variables.id);
          return next;
        });
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status. Please try again.",
        variant: 'destructive',
      });
      console.error('Failed to update status:', error);
    }
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (applicant: any) => {
      const response = await apiRequest('POST', `/api/recruiter/applications/${applicant.id}/invite`, {});
      return response.json();
    },
    onMutate: (applicant) => {
      setInvitePendingApplicationId(applicant.id);
    },
    onSuccess: (data, applicant) => {
      const inviteSentAt =
        typeof data?.staffosInviteSentAt === "string"
          ? data.staffosInviteSentAt
          : new Date().toISOString();

      queryClient.setQueryData(['/api/recruiter/applications'], (previous: any[] | undefined) => {
        if (!Array.isArray(previous)) return previous;
        return previous.map((row) => {
          if (row?.id !== applicant.id) return row;
          return {
            ...row,
            staffosInviteSentAt: inviteSentAt,
            isCandidateConfirmed: false,
            canSendOnboardInvite: false,
            onboardInvitePending: true,
            awaitingCandidateAcceptance: true,
          };
        });
      });

      void queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      toast({
        title: "Invite Sent",
        description: `Welcome email with temporary login password sent to ${applicant.candidateName}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invite Failed",
        description: error?.message || "Could not send invite email. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setInvitePendingApplicationId(null);
    },
  });

  const handleInviteClick = (applicant: any) => {
    if (!applicant.canSendOnboardInvite) return;
    setApplicantToInvite(applicant);
    setIsInviteConfirmModalOpen(true);
  };

  const getOnboardTooltip = (applicant: {
    canSendOnboardInvite?: boolean;
    onboardInvitePending?: boolean;
    isUsingStaffOS?: boolean;
    awaitingCandidateAcceptance?: boolean;
    staffosInviteSentAt?: string | null;
    isCandidateConfirmed?: boolean;
  }) => {
    if (applicant.isCandidateConfirmed) {
      return "Candidate has accepted the application";
    }
    if (applicant.isUsingStaffOS && applicant.awaitingCandidateAcceptance) {
      return "Candidate is on StaffOS — waiting for them to confirm this application";
    }
    if (applicant.onboardInvitePending) {
      return "Invite sent — resend available after 3 hours if the candidate has not logged in";
    }
    if (applicant.staffosInviteSentAt && applicant.canSendOnboardInvite) {
      return "Resend StaffOS welcome email";
    }
    return "Invite to StaffOS";
  };

  const handleConfirmInvite = () => {
    if (!applicantToInvite) return;
    sendInviteMutation.mutate(applicantToInvite);
    setIsInviteConfirmModalOpen(false);
    setApplicantToInvite(null);
  };

  const handleCancelInvite = () => {
    setIsInviteConfirmModalOpen(false);
    setApplicantToInvite(null);
  };

  // Helper function to get current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    const quarter = Math.floor(currentMonth / 3) + 1; // Q1, Q2, Q3, Q4
    return `Q${quarter}-${currentYear}`;
  };

  // Mutation for creating closure
  const createClosureMutation = useMutation({
    mutationFn: async (closureData: {
      applicationId: string;
      candidateName: string;
      client: string;
      position: string;
      offeredOn: string;
      joinedOn: string;
      quarter: string;
    }) => {
      const response = await apiRequest('POST', '/api/recruiter/closures', closureData);
      return response;
    },
    onSuccess: () => {
      if (selectedCandidateForClosure) {
        const closureStamp = new Date().toISOString();
        setApplicantStatusOverrides((prev) => ({
          ...prev,
          [selectedCandidateForClosure.id]: "Closure",
        }));
        setClosureAtOverrides((prev) => ({
          ...prev,
          [selectedCandidateForClosure.id]: closureStamp,
        }));
      }
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/pipeline'] });
      invalidateRevenueMappingQueries(queryClient);

      toast({
        title: "Closure Created",
        description: "The candidate has been successfully closed and added to Closure Details.",
      });

      setIsClosureFormModalOpen(false);
      setSelectedCandidateForClosure(null);
      setClosureFormData({ offeredOn: '', joinedOn: '' });
    },
    onError: (error: any) => {
      console.error('Failed to create closure:', error);
      toast({
        title: "Error",
        description: "Failed to create closure. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle closure form submission
  const handleClosureSubmit = () => {
    if (!selectedCandidateForClosure) return;

    if (!closureFormData.offeredOn || !closureFormData.joinedOn) {
      toast({
        title: "Missing Information",
        description: "Please fill in both 'Offered On' and 'Joined On' dates.",
        variant: "destructive"
      });
      return;
    }

    const closureData = {
      applicationId: selectedCandidateForClosure.id,
      candidateName: selectedCandidateForClosure.candidateName,
      client: selectedCandidateForClosure.company,
      position: selectedCandidateForClosure.roleApplied,
      offeredOn: closureFormData.offeredOn,
      joinedOn: closureFormData.joinedOn,
      quarter: getCurrentQuarter()
    };

    createClosureMutation.mutate(closureData);
  };

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
    const stageActions: Record<string, string> = {
      'CLOSURE': 'View candidates ready for closure. You can close selected candidates.',
      'OFFER_DROP': 'View candidates who dropped offers. You can mark them as rejected.',
      'OFFER_STAGE': 'View candidates in offer stage. You can send offer letters.',
      'HR_ROUND': 'View candidates in HR round. You can schedule HR interviews.',
      'FINAL_ROUND': 'View candidates in final round. You can mark interview results.',
      'L3': 'View candidates in L3 round. You can mark interview results.',
      'L2': 'View candidates in L2 round. You can mark interview results.',
      'L1': 'View candidates in L1 round. You can mark interview results.',
      'SCREENING': 'View candidates in screening stage. You can proceed with intro call and assignment checks.',
      'SHORTLISTED': 'View shortlisted candidates. You can move them to next stage.',
      'EVALUATING': 'View candidates under evaluation before screening.'
    };

    alert(`${stage}\n\n${stageActions[stage] || 'Manage candidates in this stage.'}`);
  };

  // Sync fetched interviews to local state for compatibility
  useEffect(() => {
    if (fetchedInterviews && fetchedInterviews.length > 0) {
      setInterviewTrackerData({ interviews: fetchedInterviews });
    }
  }, [fetchedInterviews]);

  // Derived values using useMemo to prevent state drift
  const getTodaysInterviews = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    // Handle both YYYY-MM-DD (from API) and dd-mm-yyyy formats
    return (fetchedInterviews || []).filter((interview: any) => {
      const interviewDate = interview.interviewDate;
      if (interviewDate.includes('-')) {
        // Check if it's YYYY-MM-DD format
        if (interviewDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return interviewDate === today;
        }
        // Handle dd-mm-yyyy format - convert to YYYY-MM-DD for comparison
        const [day, month, year] = interviewDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate === today;
      }
      return interviewDate === today;
    });
  }, [fetchedInterviews]);

  const getPendingInterviews = useMemo(() => {
    return (fetchedInterviews || []).filter((interview: any) =>
      interview.status === 'scheduled' || interview.status === 'pending'
    );
  }, [fetchedInterviews]);

  // Helper function to generate Google Calendar URL
  const generateGoogleCalendarUrl = (formData: {
    candidateName: string;
    position: string;
    client: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
  }): string | null => {
    try {
      const { candidateName, position, client, interviewDate, interviewTime, interviewType } = formData;

      // Convert date from dd-mm-yyyy or yyyy-mm-dd to YYYYMMDD
      let year: string, month: string, day: string;
      const dateParts = interviewDate.split(/[-\/]/);

      // Handle both dd-mm-yyyy and yyyy-mm-dd formats
      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
          // yyyy-mm-dd format (from HTML date input)
          [year, month, day] = dateParts;
        } else {
          // dd-mm-yyyy format
          [day, month, year] = dateParts;
        }
      } else {
        return null; // Invalid date format
      }

      // Pad month and day with leading zeros if needed
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');

      // Parse time (HH:mm format)
      const [hours, minutes] = interviewTime.split(':');
      if (!hours || !minutes) {
        return null; // Invalid time format
      }

      // Create start datetime in Google Calendar format (YYYYMMDDTHHMMSS)
      const startDateTime = `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

      // Calculate end time (30 minutes later)
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + 30;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      const endDateTime = `${year}${month}${day}T${String(endHours).padStart(2, '0')}${String(endMins).padStart(2, '0')}00`;

      // Build event details
      const eventText = `Interview: ${candidateName} â€“ ${position}`;
      const eventDetails = `Candidate: ${candidateName}\nPosition: ${position}\nClient: ${client}\nInterview Type: ${interviewType}\nScheduled via StaffOS`;

      // Determine location based on interview type
      let location = '';
      if (interviewType === 'Video Call') {
        location = 'Google Meet';
      } else if (interviewType === 'In Person') {
        location = client;
      } else if (interviewType === 'Phone Call') {
        location = 'Phone Call';
      }

      // Construct Google Calendar URL
      const baseUrl = 'https://calendar.google.com/calendar/render';
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventText,
        dates: `${startDateTime}/${endDateTime}`,
        details: eventDetails,
        location: location
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating Google Calendar URL:', error);
      return null;
    }
  };

  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (interviewData: {
      candidateName: string;
      position: string;
      client: string;
      interviewDate: string;
      interviewTime: string;
      interviewType: string;
      interviewRound: string;
      status: string;
    }) => {
      const response = await apiRequest('POST', '/api/recruiter/interviews', interviewData);
      const json = await response.json();
      return json;
    },
    onSuccess: async () => {
      // Invalidate and refetch interviews after successful creation
      await queryClient.invalidateQueries({ queryKey: ['/api/recruiter/interviews'] });
      // Manually refetch to ensure immediate update
      refetchInterviews();
    },
  });

  // Interview tracker functions
  const handleAddInterview = () => {
    if (interviewForm.candidateName && interviewForm.position && interviewForm.client &&
      interviewForm.interviewDate && interviewForm.interviewTime) {
      // Generate and open Google Calendar URL
      const calendarUrl = generateGoogleCalendarUrl(interviewForm);
      if (calendarUrl) {
        window.open(calendarUrl, '_blank', 'noopener,noreferrer');
      }

      // Save interview to backend
      createInterviewMutation.mutate({
        candidateName: interviewForm.candidateName,
        position: interviewForm.position,
        client: interviewForm.client,
        interviewDate: interviewForm.interviewDate,
        interviewTime: interviewForm.interviewTime,
        interviewType: interviewForm.interviewType,
        interviewRound: interviewForm.interviewRound,
        status: 'scheduled'
      });

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
  const statuses = ['Resume Review', 'Shortlisted', 'Screening', 'L1', 'L2', 'L3', 'Final Round', 'HR Round', 'Selected', 'Closure', 'Screened Out'];
  const rejectionReasons = [
    'Skills not aligned',
    'Experience mismatch',
    'Interview performance below expectations',
    'Role / tech stack mismatch',
    'Cultural fit concerns',
    'Compensation not aligned',
    'Notice period / availability issue',
    'Location constraint',
    'Stronger candidate selected',
    'Role closed / on hold',
    'Other (please specify)'
  ];

  const rejectionMessages: Record<string, string> = {
    'Skills not aligned': 'Thank you for your time and interest. At this stage, we are proceeding with candidates whose skills more closely match the role requirements.',
    'Experience mismatch': 'Thank you for your interest. We are currently moving forward with candidates whose experience aligns more closely with this role.',
    'Interview performance below expectations': 'Thank you for taking the time to interview. We will not be moving forward at this stage as we are looking for a closer alignment with the role requirements.',
    'Role / tech stack mismatch': 'Thank you for your time. This role requires specific experience in certain technologies, and we are prioritizing candidates with that alignment.',
    'Cultural fit concerns': 'Thank you for your time during the process. We are proceeding with candidates who more closely align with the teamâ€™s working style and requirements.',
    'Compensation not aligned': 'Thank you for your interest. At this stage, we are unable to align on the compensation expectations for this role.',
    'Notice period / availability issue': 'Thank you for your time. The role requires a joining timeline that we are unable to align on currently.',
    'Location constraint': 'Thank you for your interest. This role requires a specific location or work setup, and we are proceeding with candidates aligned to that requirement.',
    'Stronger candidate selected': 'Thank you for your interest. We had a competitive pool of candidates and have decided to move forward with another profile at this time.',
    'Role closed / on hold': 'Thank you for your time and interest. The position has been put on hold for now. We will reach out if it reopens.',
    'Other (please specify)': 'Thank you for your time and interest. We will not be moving forward at this stage. We truly appreciate your effort and wish you the very best ahead.'
  };

  // Transform API applications to applicant data format for the UI
  const applicantData = useMemo(() => {
    if (!allApplications || allApplications.length === 0) {
      // Return empty array when no real applications exist
      return [];
    }
    return allApplications.map((app: any, index: number) => {
      // Safely parse skills from JSON string
      let parsedSkills: string[] = [];
      if (app.skills) {
        try {
          parsedSkills = typeof app.skills === 'string' ? JSON.parse(app.skills) : (Array.isArray(app.skills) ? app.skills : []);
        } catch {
          parsedSkills = [];
        }
      }

      const terminalOutcome = parseTerminalOutcome(app.status, app.statusNote);
      const displayStatus = mapRecruiterApplicantDisplayStatus(app.status, app.statusNote);

      // Get candidate name - prioritize candidateName from app, fallback to profile lookup
      let candidateName = app.candidateName;
      if (!candidateName || candidateName === 'Unknown Candidate' || candidateName.trim() === '') {
        // Try to construct from profile if available (this should be handled by backend now, but keep as fallback)
        candidateName = 'Unknown Candidate';
      }

      return {
        id: app.id || `app-${index + 1}`,
        appliedOn: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'N/A',
        candidateName: candidateName,
        company: app.company || 'N/A',
        roleApplied: app.jobTitle || 'N/A',
        submission:
          app.source === 'recruiter_tagged' || app.source === 'tl_tagged'
            ? 'Uploaded'
            : 'Inbound',
        taggedByTeamLead: Boolean(app.taggedByTeamLead || app.source === 'tl_tagged'),
        rawStatus: app.status,
        terminalOutcome,
        currentStatus: displayStatus,
        email: app.candidateEmail || null,
        phone: app.candidatePhone || null,
        location: app.location || 'N/A',
        experience: app.experience || 'N/A',
        skills: parsedSkills,
        education: 'N/A',
        currentCompany: app.company || 'N/A',
        rating: 4.0,
        resumeFile: app.resumeFile || null,
        profilePicture: app.profilePicture || null,
        profileId: app.profileId || null,
        isUsingStaffOS: app.isUsingStaffOS || false,
        canUpdateStatus: app.canUpdateStatus !== false,
        canSendOnboardInvite: Boolean(app.canSendOnboardInvite),
        onboardInvitePending: Boolean(app.onboardInvitePending),
        awaitingCandidateAcceptance: Boolean(app.awaitingCandidateAcceptance),
        staffosInviteSentAt: app.staffosInviteSentAt || null,
        isCandidateConfirmed: app.isCandidateConfirmed !== false,
        appliedDate: app.appliedDate || null,
        statusNote: app.statusNote || null,
        rejectionReason: app.rejectionReason || null,
        hasUnreadComments: Boolean(app.hasUnreadComments),
        updatedAt: app.updatedAt || app.appliedDate || null,
      };
    });
  }, [allApplications]);

  // Track local changes to applicant statuses
  const [applicantStatusOverrides, setApplicantStatusOverrides] = useState<{ [key: string]: string }>({});
  const [rejectedStageOverrides, setRejectedStageOverrides] = useState<{ [key: string]: string }>({});
  const [rejectedAtOverrides, setRejectedAtOverrides] = useState<{ [key: string]: string }>({});
  const [closureAtOverrides, setClosureAtOverrides] = useState<{ [key: string]: string }>({});
  const [autoArchivedIds, setAutoArchivedIds] = useState<Set<string>>(new Set());
  // Track which applicant is currently being updated for loading state
  const [updatingApplicantId, setUpdatingApplicantId] = useState<string | null>(null);

  const getPipelineCandidatesByStage = useMemo(() => {
    let effectiveApplicants = applicantData
      .map((a) => ({
        ...a,
        currentStatus: applicantStatusOverrides[a.id] || a.currentStatus,
      }))
      .filter((a) => {
        if (applicantStatusOverrides[a.id] === "Archived") return false;
        return !shouldExcludeFromEmployeePipeline(
          a.rawStatus || a.currentStatus,
          a.statusNote,
          a.updatedAt ?? a.appliedDate,
        );
      });

    if (pipelineDate) {
      const filterDate = format(pipelineDate, "yyyy-MM-dd");
      effectiveApplicants = effectiveApplicants.filter((a: any) => {
        let dateToCheck: string | null = null;
        if (a.appliedDate) {
          try {
            dateToCheck = format(new Date(a.appliedDate), "yyyy-MM-dd");
          } catch {
            /* fall through */
          }
        }
        if (!dateToCheck && a.appliedOn && a.appliedOn !== "N/A") {
          try {
            const [day, month, year] = a.appliedOn.split("-");
            dateToCheck = format(
              new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
              "yyyy-MM-dd",
            );
          } catch {
            return false;
          }
        }
        return dateToCheck === filterDate;
      });
    }

    return groupApplicantsByPipelineStage(effectiveApplicants);
  }, [applicantData, applicantStatusOverrides, pipelineDate]);

  useEffect(() => {
    applicantData.forEach((candidate: any) => {
      if (candidate.canUpdateStatus === false) return;
      if (autoArchivedIds.has(candidate.id)) return;

      const dueForArchive = shouldAutoArchiveApplication({
        status: candidate.rawStatus || candidate.currentStatus,
        statusNote: candidate.statusNote,
        updatedAt: candidate.updatedAt ?? candidate.appliedDate,
      });
      if (!dueForArchive) return;

      setApplicantStatusOverrides((prev) => ({ ...prev, [candidate.id]: "Archived" }));
      setAutoArchivedIds((prev) => new Set(prev).add(candidate.id));
      updateStatusMutation.mutate({
        id: candidate.id,
        status: "Archived",
        silent: true,
      });
    });
  }, [applicantData, autoArchivedIds, updateStatusMutation]);

  const pipelineSessionList = useMemo(
    () =>
      buildPipelineSessionList(
        getPipelineCandidatesByStage,
        RECRUITER_PIPELINE_STAGE_ORDER,
        (c) =>
          mapRecruiterPipelineCandidate(c, applicantStatusOverrides[c.id] || c.currentStatus),
      ),
    [getPipelineCandidatesByStage, applicantStatusOverrides],
  );

  const buildSessionApplicantSnapshot = (candidate: any): CandidateCommentsSessionApplicant =>
    mapRecruiterPipelineCandidate(candidate, applicantStatusOverrides[candidate.id] || candidate.currentStatus);

  // Open full Candidate Comments Session (replaces the small profile popup)
  const handlePipelineCandidateClick = (candidate: any) => {
    if (!candidate?.id) return;
    setSessionApplicationId(candidate.id);
    setSessionApplicantSnapshot(buildSessionApplicantSnapshot(candidate));
    setPipelineView("candidate-session");
  };

  const handleSelectSessionApplicant = (applicant: CandidateCommentsSessionApplicant) => {
    setSessionApplicationId(applicant.id);
    setSessionApplicantSnapshot(applicant);
  };

  const handleCloseCandidateSession = () => {
    setPipelineView("board");
    setSessionApplicationId(null);
    setSessionApplicantSnapshot(null);
  };

  const openCommentSessionFromNotification = useCallback((applicationId: string) => {
    setSidebarTab("pipeline");
    setSessionApplicationId(applicationId);
    setSessionApplicantSnapshot(null);
    setPipelineView("candidate-session");
  }, []);

  useOpenCommentSessionListener(openCommentSessionFromNotification);

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
    } else if (newStatus === 'Closure') {
      // Open closure form modal
      setSelectedCandidateForClosure(applicant);
      setClosureFormData({ offeredOn: '', joinedOn: '' });
      setIsClosureFormModalOpen(true);
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
      // Get the message based on the selected reason
      const message = rejectionMessages[reason] || rejectionMessages['Other (please specify)'];
      
      // If "Other" is specified, use the custom text as the status note (or append it)
      const finalNoteBase = reason === 'Other (please specify)' && otherReasonText.trim()
        ? otherReasonText.trim()
        : message;
      const finalNote = `${finalNoteBase}\n\n[[REJECT_STAGE:${selectedCandidate.currentStatus || 'Resume Review'}]] [[REJECTED_AT:${new Date().toISOString()}]]`;

      setApplicantStatusOverrides(prev => ({
        ...prev,
        [selectedCandidate.id]: 'Screened Out'
      }));
      setRejectedStageOverrides(prev => ({
        ...prev,
        [selectedCandidate.id]: selectedCandidate.currentStatus || 'Resume Review'
      }));
      setRejectedAtOverrides(prev => ({
        ...prev,
        [selectedCandidate.id]: new Date().toISOString()
      }));

      // Persist the archived status with the message/note
      updateStatusMutation.mutate({
        id: selectedCandidate.id,
        status: 'Screened Out',
        statusNote: finalNote,
        rejectionReason: reason
      });

      setIsReasonModalOpen(false);
      setSelectedCandidate(null);
      setReason('');
      setOtherReasonText('');
    }
  };

  // Get effective status (with local overrides for optimistic updates)
  const getEffectiveApplicantData = () => {
    return applicantData
      .filter((a) => {
        const effectiveStatus = applicantStatusOverrides[a.id] || a.currentStatus;
        const terminal = getApplicantTerminal({
          ...a,
          currentStatus: effectiveStatus,
        });
        if (terminal.showInApplicantOverview) return true;
        if (
          effectiveStatus === "Closure" &&
          isWithinClosureGracePeriod(
            effectiveStatus,
            a.statusNote,
            closureAtOverrides[a.id] || a.appliedDate,
          )
        ) {
          return true;
        }
        return (
          effectiveStatus !== "Archived" &&
          effectiveStatus !== "Closure" &&
          effectiveStatus !== "Screened Out" &&
          effectiveStatus !== "Removed"
        );
      })
      .map((a) => {
        const currentStatus = applicantStatusOverrides[a.id] || a.currentStatus;
        return {
          ...a,
          currentStatus,
          terminalOutcome: parseTerminalOutcome(a.rawStatus ?? currentStatus, a.statusNote),
        };
      });
  };

  const renderApplicantStatusCell = (applicant: ApplicantOverviewRow, isUpdating: boolean) => {
    const terminal = getApplicantTerminal(applicant);
    const statusLocked = applicant.canUpdateStatus === false;
    const statusLockReason =
      applicant.isUsingStaffOS && applicant.awaitingCandidateAcceptance
        ? "Waiting for the candidate to confirm this application on StaffOS"
        : applicant.onboardInvitePending || applicant.staffosInviteSentAt
          ? "Waiting for the candidate to log in to StaffOS and accept the invite"
          : "Send an onboard invite and wait for the candidate to accept before updating status";

    if (terminal.kind) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex h-8 min-w-[9rem] items-center justify-center rounded-md border px-2 text-sm font-medium ${getApplicantStatusStyles("Screened Out").trigger}`}
              >
                Screened Out
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{terminal.hoverLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (statusLocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex h-8 min-w-[9rem] cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-2 text-sm font-medium text-slate-500">
                {applicant.currentStatus}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusLockReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="relative">
        {isUpdating && (
          <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center rounded-md bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Updating...</span>
            </div>
          </div>
        )}
        <Select
          value={applicant.currentStatus}
          onValueChange={(value) => handleStatusChange(applicant, value)}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`h-8 w-36 border text-sm font-medium transition-all duration-300 ${getApplicantStatusStyles(applicant.currentStatus).trigger} ${isUpdating ? "cursor-wait opacity-50" : ""}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className={`transition-colors ${getApplicantStatusStyles(status).item}`}
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const handleAssign = (requirement: any) => {
    setSelectedRequirement(requirement);
    setIsReallocating(false);
    setSelectedAssignee('');
    setIsAssignmentModalOpen(true);
  };

  const updateJdVisibilityMutation = useMutation({
    mutationFn: async ({
      requirementId,
      showToCandidate,
    }: {
      requirementId: string;
      showToCandidate: boolean;
    }) => {
      const response = await apiRequest("PATCH", `/api/requirements/${requirementId}/jd-visibility`, {
        showToCandidate,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Failed to update JD visibility");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/requirements'] });
      setIsJdVisibilityModalOpen(false);
      toast({
        title: "JD visibility updated",
        description: "Candidate visibility preference saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not save JD visibility.",
        variant: "destructive",
      });
    },
  });

  const openJdVisibilityModal = (requirement: any) => {
    const visibility = parseRequirementJdVisibility(requirement);
    setJdVisibilityRequirement(requirement);
    setJdVisibilityValue(visibility.showToCandidate);
    setIsJdVisibilityModalOpen(true);
  };

  const handleSaveJdVisibility = () => {
    const requirementId = jdVisibilityRequirement?.id;
    if (!requirementId) return;
    updateJdVisibilityMutation.mutate({ requirementId, showToCandidate: jdVisibilityValue });
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
  const { data: recruiterProfile, isLoading: isLoadingRecruiterProfile } = useQuery({
    queryKey: ['/api/recruiter/profile'],
  }) as { data: any; isLoading: boolean };
  const userName = recruiterProfile?.name || employee?.name || "Recruiter User";
  const userRole = employee?.role || 'recruiter';

  // Recruiters don't have team members - return empty array
  const teamMembers: any[] = [];

  const { data: targetMetrics } = useQuery({
    queryKey: ['/api/recruiter/target-metrics'],
  }) as { data: any };

  const { data: aggregatedTargets } = useQuery({
    queryKey: ['/api/recruiter/aggregated-targets'],
  }) as { data: { currentQuarter: { quarter: string; year: number; minimumTarget: number; targetAchieved: number; incentiveEarned: number; closures: number; }; allQuarters: any[] } | undefined };

  // Fetch chat rooms for TA (direct messages with Admin/TL)
  const { data: chatRoomsData, isLoading: isLoadingChatRooms, refetch: refetchChatRooms } = useQuery<{ rooms: any[] }>({
    queryKey: ['/api/chat/rooms'],
    enabled: !!employee,
  });

  // Filter chat rooms to show only direct messages (Admin-TL/TA conversations)
  const taChatRooms = useMemo(() => {
    if (!chatRoomsData?.rooms) return [];
    return chatRoomsData.rooms.filter((room: any) => {
      // Only show direct messages
      if (room.type !== 'direct') return false;
      // Check if room has participants (should have Admin or TL)
      const participants = room.participants || [];
      return participants.some((p: any) => p.participantId !== employee?.id);
    });
  }, [chatRoomsData, employee?.id]);

  // Calculate total unread count - must be defined right after taChatRooms
  const totalUnreadCount = useMemo(() => {
    return taChatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
  }, [taChatRooms]);

  const formatIndianCurrency = (value: number): string => {
    if (value === 0) return '0';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const { data: dailyMetrics } = useQuery({
    queryKey: ['/api/recruiter/daily-metrics', format(selectedDate, 'yyyy-MM-dd'), selectedRequirementForDelivery],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;
      const response = await fetch(createApiUrl(`/api/recruiter/daily-metrics?date=${dateStr}&requirementId=${selectedRequirementForDelivery}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch daily metrics');
      return response.json();
    }
  }) as { data: any };

  // Extract delivered candidates from daily metrics
  const deliveredCandidates = useMemo(() => {
    return dailyMetrics?.deliveredCandidates || [];
  }, [dailyMetrics]);

  const { data: meetings } = useQuery({
    queryKey: ['/api/recruiter/meetings'],
  }) as { data: any[] };

  const { data: ceoComments } = useQuery({
    queryKey: ['/api/recruiter/ceo-comments'],
  }) as { data: any[] };

  // Fetch requirements assigned to this recruiter
  const { data: recruiterRequirements = [], isLoading: isLoadingRequirements } = useQuery<any[]>({
    queryKey: ['/api/recruiter/requirements'],
    enabled: !!employee && requirementsReady,
  });

  const requirementsTableData = recruiterRequirements;

  const streqDisplayMap = useMemo(() => {
    const byRealId = new Map<string, { id: string; createdAt?: string; sourceDetails?: string | null }>();
    for (const req of recruiterRequirements) {
      const realId = getRequirementLookupId(req);
      if (!realId || byRealId.has(realId)) continue;
      byRealId.set(realId, {
        id: realId,
        createdAt: req.createdAt,
        sourceDetails: req.sourceDetails,
      });
    }
    return buildStreqDisplayMap(Array.from(byRealId.values()));
  }, [recruiterRequirements]);

  const getRequirementDisplayId = (req: any) => {
    const fromApi = req.displayRequirementId?.trim();
    if (fromApi && /^STREQ\d+$/i.test(fromApi)) return fromApi.toUpperCase();
    return resolveRequirementDisplayId(
      req,
      streqDisplayMap.get(getRequirementLookupId(req)),
    );
  };

  const renderRequirementCriticality = (req: any) => (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded inline-flex items-center ${
        req.criticality?.toUpperCase() === 'HIGH'
          ? 'bg-red-100 text-red-800'
          : req.criticality?.toUpperCase() === 'MEDIUM' || req.criticality?.toUpperCase() === 'MED'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1 ${
          req.criticality?.toUpperCase() === 'HIGH'
            ? 'bg-red-500'
            : req.criticality?.toUpperCase() === 'MEDIUM' || req.criticality?.toUpperCase() === 'MED'
              ? 'bg-blue-500'
              : 'bg-gray-500'
        }`}
      />
      {req.criticality?.toUpperCase()}-{req.toughness || 'Medium'}
    </span>
  );

  // Fetch closure reports (revenue mappings) for this recruiter from backend
  const { data: closureReports = [], isLoading: isLoadingClosureReports } = useQuery<any[]>({
    queryKey: ['/api/recruiter/closure-reports'],
    enabled: !!employee && closuresReady,
  });

  const taClosureReportsForPipeline = useMemo(
    () =>
      (closureReports as any[]).map((report: any) => ({
        id: report.id,
        candidate: report.candidate || "N/A",
        position: report.position || "N/A",
        client: report.client || "N/A",
        talentAdvisor: report.talentAdvisor || "N/A",
        quarter: report.quarter || "N/A",
        offeredDate: report.offeredOn || report.offeredDate || "—",
        joinedDate: report.joinedOn || report.joinedDate || "—",
      })),
    [closureReports],
  );

  // Fetch quarterly performance data for the performance graph
  const { data: quarterlyPerformance = [], isLoading: isLoadingQuarterlyPerformance } = useQuery<Array<{
    quarter: string;
    resumesDelivered: number;
    closures: number;
  }>>({
    queryKey: ['/api/recruiter/quarterly-performance'],
  });

  // Fetch performance summary (tenure, total closures, recent closure, etc.)
  const { data: performanceSummary } = useQuery<{
    tenure: number;
    totalClosures: number;
    totalResumesDelivered: number;
    recentClosure: string | null;
    lastClosureMonths: number;
    lastClosureDays: number;
    lastClosureRelative?: string;
    lastClosureDate?: string | null;
    totalRevenue: number;
    totalIncentives: number;
  }>({
    queryKey: ['/api/recruiter/performance-summary'],
  });

  const { data: realNudges = [], isLoading: isLoadingNudges } = useQuery<any[]>({
    queryKey: ['/api/nudges'],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string, message: string }) => {
      const res = await apiRequest('POST', `/api/nudges/${id}/respond`, { message });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nudges'] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
      toast({
        title: "Nudge updated",
        description: "Successfully marked as contacted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update nudge.",
        variant: "destructive",
      });
    }
  });

  // Filter out reassigned requirements for counts
  const activeRequirements = useMemo(() => {
    return recruiterRequirements.filter((req: any) => req.assignmentStatus !== "reassigned");
  }, [recruiterRequirements]);

  // Calculate summary stats from real requirements data (excluding reassigned)
  const requirementsSummary = useMemo(() => {
    const total = activeRequirements.length;
    const highPriority = activeRequirements.filter((req: any) => req.criticality === 'HIGH').length;
    const mediumPriority = activeRequirements.filter((req: any) => req.criticality === 'MEDIUM').length;
    const lowPriority = activeRequirements.filter((req: any) => req.criticality === 'LOW').length;

    // Robust = requirements with at least 1 delivery
    const robust = activeRequirements.filter((req: any) => (req.deliveredCount || 0) > 0).length;
    // Idle = requirements with 0 deliveries
    const idle = activeRequirements.filter((req: any) => (req.deliveredCount || 0) === 0).length;
    // Delivery Pending = total - robust
    const deliveryPending = total - robust;
    // Easy = requirements with toughness 'Easy'
    const easy = activeRequirements.filter((req: any) => req.toughness === 'Easy').length;

    return { total, highPriority, mediumPriority, lowPriority, robust, idle, deliveryPending, easy };
  }, [activeRequirements]);

  // Per-position priority distribution (reference matrix; requirement target = value × no. of positions)
  const priorityDistribution = RESUME_TARGET_MATRIX;

  const getExpectedCount = (req: {
    criticality?: string;
    toughness?: string;
    noOfPositions?: number;
    resumeTarget?: number;
  }) => req.resumeTarget ?? getRequirementResumeTarget(req);

  // Calculate priority counts for sidebar (matching Admin design) - excluding reassigned
  const priorityCounts = useMemo(() => {
    const counts = {
      HIGH: activeRequirements.filter((req: any) => req.criticality === 'HIGH').length,
      MEDIUM: activeRequirements.filter((req: any) => req.criticality === 'MEDIUM').length,
      LOW: activeRequirements.filter((req: any) => req.criticality === 'LOW').length,
      TOTAL: activeRequirements.length
    };

    const breakdowns = {
      HIGH: {
        Easy: activeRequirements.filter((req: any) => req.criticality === 'HIGH' && req.toughness === 'Easy').length,
        Medium: activeRequirements.filter((req: any) => req.criticality === 'HIGH' && req.toughness === 'Medium').length,
        Tough: activeRequirements.filter((req: any) => req.criticality === 'HIGH' && req.toughness === 'Tough').length
      },
      MEDIUM: {
        Easy: activeRequirements.filter((req: any) => req.criticality === 'MEDIUM' && req.toughness === 'Easy').length,
        Medium: activeRequirements.filter((req: any) => req.criticality === 'MEDIUM' && req.toughness === 'Medium').length,
        Tough: activeRequirements.filter((req: any) => req.criticality === 'MEDIUM' && req.toughness === 'Tough').length
      },
      LOW: {
        Easy: activeRequirements.filter((req: any) => req.criticality === 'LOW' && req.toughness === 'Easy').length,
        Medium: activeRequirements.filter((req: any) => req.criticality === 'LOW' && req.toughness === 'Medium').length,
        Tough: activeRequirements.filter((req: any) => req.criticality === 'LOW' && req.toughness === 'Tough').length
      }
    };

    // Calculate pending and closed distribution
    const pendingDistribution = activeRequirements.filter((req: any) => (req.deliveredCount || 0) < getExpectedCount(req)).length;
    const closedDistribution = activeRequirements.filter((req: any) => (req.deliveredCount || 0) >= getExpectedCount(req) && getExpectedCount(req) > 0).length;

    return { counts, breakdowns, pendingDistribution, closedDistribution };
  }, [activeRequirements]);

  if (isLoadingRecruiterProfile && !recruiterProfile && !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading Advisory Workspace...</div>
        </div>
      </div>
    );
  }

  const renderNudgesContent = () => (
    <div className="flex min-h-screen">
      <div className="flex-1 ml-16 bg-gray-50 dark:bg-gray-950">
        <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <NudgesTab />
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isMobile) {
      return renderPipelineContent();
    }

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
      case 'nudges':
        return renderNudgesContent();
      default:
        return renderRecruiterContent();
    }
  };

  const handleUpdateNudgeConfirm = () => {
    if (!updateModalNudge || !updateDropdown1 || !updateDropdown2) {
      toast({ title: "Error", description: "Please select both options to update the candidate.", variant: "destructive" });
      return;
    }
    
    const message = `${updateDropdown1} ${updateDropdown2}`;
    
    // Fire API call
    respondMutation.mutate({ id: updateModalNudge.id, message });
    
    // Optimistic UI update
    setLocalUpdatedNudges(prev => new Set(prev).add(updateModalNudge.id));
    
    setUpdateModalNudge(null);
    setUpdateDropdown1("");
    setUpdateDropdown2("");
  };

  const renderNudgesSession = () => <ActiveNudgesTable />;


  const renderRecruiterContent = () => {

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto h-full scrollbar-hide">

              {/* Success Alert */}
              {showSuccessAlert && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {successMessage || 'Operation completed successfully!'}
                </div>
              )}

              {/* Nudges Session */}
              {renderNudgesSession()}

              {/* Applicant Overview Table */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Applicant Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUploadResumeModalOpen(true)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                      data-testid="button-upload-resume">
                      Upload Resume
                    </button>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('sourceResumeAccess', 'true');
                        window.open('/source-resume', '_blank');
                      }}
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                      data-testid="button-source-resume">
                      Source Resume
                    </button>
                    {getEffectiveApplicantData().length > 5 && (
                      <button
                        onClick={() => setIsApplicantOverviewModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                        data-testid="button-view-all-applicants"
                      >
                        View More
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {getEffectiveApplicantData().length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6" data-testid="empty-applicant-overview">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserRound className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                        Applications will appear here when candidates apply to your job postings or when you tag candidates to requirements.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsUploadResumeModalOpen(true)}
                          data-testid="button-upload-resume-empty"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Applied on</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Candidate Name</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Company</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Role Applied</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Submission</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Current Status</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Onboard</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getEffectiveApplicantData().slice(0, 5).map((applicant, index) => {
                            const isUpdating = updatingApplicantId === applicant.id;
                            const isTlTagged = Boolean(applicant.taggedByTeamLead);
                            const terminal = getApplicantTerminal(applicant);
                            return (
                              <tr
                                key={applicant.id || index}
                                title={
                                  terminal.hoverLabel ??
                                  (isTlTagged ? "Tagged by your TL" : undefined)
                                }
                                className={`border-b border-gray-100 transition-all duration-300 ${applicantOverviewRowClass(applicant, isUpdating)}`}
                              >
                                <td className="py-3 px-6 text-gray-900 transition-colors duration-200">{applicant.appliedOn}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium transition-colors duration-200">{applicant.candidateName}</td>
                                <td className="py-3 px-6 text-gray-900 transition-colors duration-200">{applicant.company}</td>
                                <td className="py-3 px-6 text-gray-900 transition-colors duration-200">{applicant.roleApplied}</td>
                                <td className="py-3 px-6">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${applicant.submission === 'Inbound'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}>
                                    {applicant.submission}
                                  </span>
                                </td>
                                <td className="py-3 px-6">
                                  {renderApplicantStatusCell(applicant, isUpdating)}
                                </td>
                                <td className="py-3 px-6">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 p-0"
                                          onClick={() => handleInviteClick(applicant)}
                                          disabled={
                                            !applicant.canSendOnboardInvite ||
                                            invitePendingApplicationId === applicant.id
                                          }
                                          data-testid={`button-onboard-${applicant.id}`}
                                        >
                                          <PaperPlaneNudgeIcon className="h-4 w-4 shrink-0" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{getOnboardTooltip(applicant)}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Target Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">Target</CardTitle>
                  <button
                    onClick={() => setIsTargetModalOpen(true)}
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                    data-testid="button-view-all-targets"
                  >
                    View More
                  </button>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-r border-gray-200">Current Quarter</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-r border-gray-200">Minimum Target</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-r border-gray-200">Target Achieved</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Incentive Earned</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200" data-testid="text-current-quarter">
                            {aggregatedTargets?.currentQuarter
                              ? `${aggregatedTargets.currentQuarter.quarter}-${aggregatedTargets.currentQuarter.year}`
                              : `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200" data-testid="text-minimum-target">
                            {aggregatedTargets?.currentQuarter
                              ? formatIndianCurrency(aggregatedTargets.currentQuarter.minimumTarget)
                              : '0'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 border-r border-gray-200" data-testid="text-target-achieved">
                            {aggregatedTargets?.currentQuarter
                              ? formatIndianCurrency(aggregatedTargets.currentQuarter.targetAchieved)
                              : '0'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900" data-testid="text-incentive-earned">
                            {aggregatedTargets?.currentQuarter
                              ? formatIndianCurrency(aggregatedTargets.currentQuarter.incentiveEarned)
                              : '0'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section - Redesigned based on image 2 */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left - Overall Performance */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${dailyMetrics?.overallPerformance === 'G'
                        ? 'bg-green-100'
                        : dailyMetrics?.overallPerformance === 'A'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                        } rounded-full flex items-center justify-center`} data-testid="indicator-performance">
                        <span className={`${dailyMetrics?.overallPerformance === 'G'
                          ? 'text-green-700'
                          : dailyMetrics?.overallPerformance === 'A'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                          } font-bold text-sm`}>{dailyMetrics?.overallPerformance ?? 'G'}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Overall Performance</CardTitle>
                      <button
                        onClick={() => setIsPerformanceModalOpen(true)}
                        className="ml-2 p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        data-testid="button-external-link-performance"
                        title="View full graph"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="h-64 flex items-center justify-center bg-white rounded-lg p-4 border border-gray-200">
                      {dailyMetrics?.requirements && dailyMetrics.requirements.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyMetrics.requirements.map((req: any, index: number) => ({
                              name: `Req ${index + 1}`,
                              value: req.delivered || 0,
                              target: req.required || 0
                            }))}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '11px'
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} name="Delivered" />
                            <Line type="monotone" dataKey="target" stroke="#ec4899" strokeWidth={2} name="Target" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-500 text-sm">
                          No performance data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Middle - Daily Metrics */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">Daily Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Total Requirements</span>
                        <span className="text-2xl font-bold text-blue-600" data-testid="text-total-requirements">
                          {String(dailyMetrics?.totalRequirements ?? 0).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Avg. Resumes per Requirement</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {String(dailyMetrics?.avgResumesPerRequirement ?? 0).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Completed Requirements</span>
                        <span className={`text-2xl font-bold ${(() => {
                          const completed = dailyMetrics?.completedRequirements ?? 0;
                          const total = dailyMetrics?.totalRequirements ?? 0;
                          return completed === total && total > 0 ? 'text-green-600' : 'text-red-600';
                        })()}`} data-testid="text-completed-requirements">
                          {String(dailyMetrics?.completedRequirements ?? 0).padStart(2, '0')}/{String(dailyMetrics?.totalRequirements ?? 0).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right - Daily Delivery */}
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    {/* Top Controls */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <Select value={selectedRequirementForDelivery} onValueChange={setSelectedRequirementForDelivery}>
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Overall">Overall</SelectItem>
                          {recruiterRequirements.map((req: any) => (
                            <SelectItem key={req.id} value={req.id}>
                              {req.position} ({req.deliveredCount || 0})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <StandardDatePicker
                        value={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                        placeholder="Select date"
                        className="h-8 w-auto text-xs"
                      />
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Delivery</h3>
                    {/* Delivery Boxes */}
                    <div className="space-y-3">
                      <div className="border-2 border-green-500 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">Delivered</span>
                          <span className="text-3xl font-bold text-green-600" data-testid="text-delivered-count">
                            {String(dailyMetrics?.dailyDeliveryDelivered ?? 0).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      <div className="border-2 border-red-500 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-600">Defaulted</span>
                          <span className="text-3xl font-bold text-red-600" data-testid="text-defaulted-count">
                            {String(dailyMetrics?.dailyDeliveryDefaulted ?? 0).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - Pending Meetings and Message Status */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pending Meetings */}
                <Card className={`bg-white border border-gray-200 transition-all duration-300 ${pendingMeetingsData.length === 0 ? 'opacity-40 grayscale pointer-events-none select-none' : ''}`}>

                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Meetings</CardTitle>
                    {pendingMeetingsData.length > 3 && (
                      <button
                        onClick={() => setIsPendingMeetingsModalOpen(true)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                        data-testid="button-open-pending-meetings"
                      >
                        View More
                      </button>
                    )}
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-3">
                      {pendingMeetingsData.slice(0, 3).map((meeting) => (
                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-900">Meeting for {meeting.person || meeting.meeting}</span>
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Message Status */}
                <Card className={`bg-white border border-gray-200 transition-all duration-300 ${ceoCommandsData.length === 0 ? 'opacity-40 grayscale pointer-events-none select-none' : ''}`}>

                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold text-gray-900">Message Status</CardTitle>
                    {ceoCommandsData.length > 2 && (
                      <button
                        onClick={() => setIsCeoCommandsModalOpen(true)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                        data-testid="button-open-ceo-commands"
                      >
                        View More
                      </button>
                    )}
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-3">
                      {ceoCommandsData.slice(0, 2).map((command, index) => (
                        <div key={command.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">{command.person || 'Admin'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{command.date || 'Today'}</span>
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{command.command || command.message || 'No message content'}</p>
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
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2 transition-colors"
                  onClick={() => navigateToRecruiterSatellitePage(navigate, '/recruiter-active-jobs', sidebarTab)}
                  data-testid="link-total-jobs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">Total Jobs</span>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-total-jobs-count">{jobCounts?.total ?? 0}</span>
                </div>

                {/* New Applications - Clickable Link with External Icon */}
                <div
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2 transition-colors"
                  onClick={() => navigate('/recruiter-new-applications')}
                  data-testid="link-new-applications"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">New Applicants</span>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900" data-testid="text-new-applications-count">{applicationStats.new}</span>
                </div>

                {/* Total Candidates - Clickable Link with External Icon */}
                <div
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2 transition-colors"
                  onClick={() => navigate('/recruiter-all-candidates')}
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
              <StaffOsV2DisabledSection className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Interview Tracker</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today's Schedule</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900" data-testid="text-today-schedule-count">{getTodaysInterviews.length}</span>
                      <button 
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors w-16" 
                        onClick={() => setIsInterviewModalOpen(true)} 
                        data-testid="button-add-interview"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Cases</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900" data-testid="text-pending-cases-count">{getPendingInterviews.length}</span>
                      <button 
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors w-16" 
                        onClick={handleViewPendingCases} 
                        data-testid="button-view-pending-cases"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </StaffOsV2DisabledSection>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequirementsContent = () => {
    // Function to format count display as "delivered/expected"
    const getCountDisplay = (req: any): string => {
      const delivered = req.deliveredCount || 0;
      const expected = getExpectedCount(req);
      return `${delivered}/${expected}`;
    };

    // Function to check if count is fully completed
    const isCountComplete = (req: any): boolean => {
      const delivered = req.deliveredCount || 0;
      const expected = getExpectedCount(req);
      return delivered >= expected && expected > 0;
    };

    // Filter requirements based on search query
    const filteredRequirements = (() => {
      if (!requirementsSearchQuery.trim()) return requirementsTableData;
      const query = requirementsSearchQuery.toLowerCase();
      return requirementsTableData.filter((req: any) =>
        (req.position || '').toLowerCase().includes(query) ||
        (req.company || '').toLowerCase().includes(query) ||
        (req.spoc || '').toLowerCase().includes(query) ||
        (req.criticality || '').toLowerCase().includes(query)
      );
    })();

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
          <div className="flex h-screen">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 py-6">
              {/* Header with Title, Search, and Buttons */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
                <div className="flex items-center gap-3">
                  <SearchBar
                    value={requirementsSearchQuery}
                    onChange={setRequirementsSearchQuery}
                    placeholder="Search here"
                    testId="input-search-requirements"
                    className="w-64"
                  />
                  <button
                    onClick={() => {
                      sessionStorage.setItem('recruiterDashboardSidebarTab', sidebarTab);
                      navigate('/archives');
                    }}
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                    data-testid="button-archives"
                  >
                    Archive
                  </button>
                  {filteredRequirements.length > 10 && (
                    <button
                      onClick={() => setIsAllRequirementsModalOpen(true)}
                      className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                      data-testid="button-view-more"
                    >
                      View More
                    </button>
                  )}
                </div>
              </div>

              {/* Requirements Table */}
              <div className="flex-1 overflow-y-auto">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm w-[88px]">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm w-[200px] max-w-[200px]">Positions</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Company</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">SPOC</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Criticality</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Resume Count</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingRequirements ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                                  <span>Loading requirements...</span>
                                </div>
                              </td>
                            </tr>
                          ) : filteredRequirements.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                {requirementsSearchQuery ? 'No requirements found matching your search.' : 'No requirements assigned to you yet. Requirements will appear here once your Team Lead assigns them.'}
                              </td>
                            </tr>
                          ) : (
                            filteredRequirements.slice(0, 10).map((req: any, index: number) => {
                              const delivered = req.deliveredCount || 0;
                              const expected = getExpectedCount(req);
                              const isComplete = delivered >= expected && expected > 0;
                              const isReassigned = req.assignmentStatus === "reassigned";
                              const isOnHold = req.managementStatus === 'hold';
                              const isRecentlyClosed = req.managementStatus === 'closed' && req.isRecentlyClosed;
                              return (
                                <tr 
                                  key={req.id || index} 
                                  className={`border-b border-gray-100 ${isReassigned ? 'opacity-50 cursor-not-allowed bg-gray-100' : isRecentlyClosed ? 'bg-red-100 hover:bg-red-200' : isOnHold ? 'bg-yellow-100/80 hover:bg-yellow-100' : 'hover:bg-gray-50'} ${index % 2 === 0 && !isReassigned && !isOnHold && !isRecentlyClosed ? 'bg-white' : isReassigned ? 'bg-gray-100' : isRecentlyClosed ? 'bg-red-100' : isOnHold ? 'bg-yellow-100/80' : 'bg-gray-50'}`}
                                  title={isReassigned ? "Reassigned to another TA" : isRecentlyClosed ? "Requirement was closed and will leave this list after 24 hours" : isOnHold ? "Requirement is on Hold" : undefined}
                                >
                                  <td className="py-3 px-4 w-[88px] text-xs font-semibold text-slate-600 whitespace-nowrap">
                                    {getRequirementDisplayId(req)}
                                  </td>
                                  <td className="py-3 px-4 w-[200px] max-w-[200px] text-sm">
                                    <RequirementRoleCell
                                      title={req.position}
                                      noOfPositions={req.noOfPositions}
                                      titleClassName="text-sm font-semibold text-gray-900 block truncate"
                                      badges={
                                        <>
                                          {isRecentlyClosed && (
                                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                                              Closed
                                            </span>
                                          )}
                                          {isOnHold && (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800">
                                              On Hold
                                            </span>
                                          )}
                                        </>
                                      }
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">{req.company}</td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">{req.spoc}</td>
                                  <td className="py-3 px-4">
                                    {renderRequirementCriticality(req)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
                                      {String(delivered).padStart(2, '0')}/{String(expected).padStart(2, '0')}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          data-testid={`button-requirement-actions-${req.id}`}
                                        >
                                          <MoreVertical className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => {
                                            setSelectedJD(req);
                                            setIsJDDetailsModalOpen(true);
                                          }}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          View JD
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => openJdVisibilityModal(req)}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          JD Visibility
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* All Requirements Modal */}
              {isAllRequirementsModalOpen && (
                <Dialog open={isAllRequirementsModalOpen} onOpenChange={setIsAllRequirementsModalOpen}>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-gray-900">All Requirements</DialogTitle>
                        <SearchBar
                          value={requirementsSearchQuery}
                          onChange={setRequirementsSearchQuery}
                          placeholder="Search here"
                          testId="input-search-requirements-modal"
                          className="w-64"
                        />
                      </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm w-[88px]">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm w-[200px] max-w-[200px]">Positions</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Company</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">SPOC</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Criticality</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Resume Count</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequirements.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                {requirementsSearchQuery ? 'No requirements found matching your search.' : 'No requirements assigned to you yet.'}
                              </td>
                            </tr>
                          ) : (
                            filteredRequirements.map((req: any, index: number) => {
                              const delivered = req.deliveredCount || 0;
                              const expected = getExpectedCount(req);
                              const isComplete = delivered >= expected && expected > 0;
                              const isOnHold = req.managementStatus === 'hold';
                              const isRecentlyClosed = req.managementStatus === 'closed' && req.isRecentlyClosed;
                              return (
                                <tr
                                  key={req.id || index}
                                  className={`border-b border-gray-100 ${isRecentlyClosed ? 'bg-red-100 hover:bg-red-200' : isOnHold ? 'bg-yellow-100/80 hover:bg-yellow-100' : `hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}`}
                                  title={isRecentlyClosed ? 'Requirement was closed and will leave this list after 24 hours' : isOnHold ? 'Requirement is on Hold' : undefined}
                                >
                                  <td className="py-3 px-4 w-[88px] text-xs font-semibold text-slate-600 whitespace-nowrap">
                                    {getRequirementDisplayId(req)}
                                  </td>
                                  <td className="py-3 px-4 w-[200px] max-w-[200px] text-sm">
                                    <RequirementRoleCell
                                      title={req.position}
                                      noOfPositions={req.noOfPositions}
                                      titleClassName="text-sm font-semibold text-gray-900 block truncate"
                                      badges={
                                        <>
                                          {isRecentlyClosed && (
                                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                                              Closed
                                            </span>
                                          )}
                                          {isOnHold && (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800">
                                              On Hold
                                            </span>
                                          )}
                                        </>
                                      }
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">{req.company}</td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">{req.spoc}</td>
                                  <td className="py-3 px-4">
                                    {renderRequirementCriticality(req)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
                                      {String(delivered).padStart(2, '0')}/{String(expected).padStart(2, '0')}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          data-testid={`button-requirement-actions-${req.id}`}
                                        >
                                          <MoreVertical className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => {
                                            setSelectedJD(req);
                                            setIsJDDetailsModalOpen(true);
                                          }}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          View JD
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => openJdVisibilityModal(req)}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          JD Visibility
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Right Section - Priority Distribution with Tabs */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
              <Tabs defaultValue="guideline" className="w-full flex flex-col h-full">
                <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
                  <TabsList className="flex w-full bg-gray-100 p-1 rounded-lg gap-1">
                    <TabsTrigger value="guideline" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all flex-shrink-0">Guideline</TabsTrigger>
                    <TabsTrigger value="priority" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all flex-1">Priority Recruitments</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`
                    .overflow-y-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {/* Guideline Tab - Static Values */}
                  <TabsContent value="guideline" className="space-y-2 mt-4">
                    {/* HIGH Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800">HIGH</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.HIGH.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Med</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.HIGH.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.HIGH.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* MED Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800">MED</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.MEDIUM.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Med</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.MEDIUM.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.MEDIUM.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* LOW Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800">LOW</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.LOW.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Med</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.LOW.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityDistribution.LOW.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Priority Recruitments Tab - Calculated Values */}
                  <TabsContent value="priority" className="space-y-3 mt-4">
                    {/* High Priority Card */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <ChevronUp className="h-5 w-5 text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-red-600">High priority</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{String(priorityCounts.counts.HIGH).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.HIGH.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Medium</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.HIGH.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.HIGH.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Medium Priority Card */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <ChevronLeft className="h-4 w-4 text-blue-600" />
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">Medium priority</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{String(priorityCounts.counts.MEDIUM).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.MEDIUM.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Medium</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.MEDIUM.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.MEDIUM.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Low Priority Card */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Low priority</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-600">{String(priorityCounts.counts.LOW).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Easy</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.LOW.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Medium</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.LOW.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Tough</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.breakdowns.LOW.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Distribution Card */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <span className="text-sm font-medium text-orange-600">Total Distribution</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">{String(priorityCounts.counts.TOTAL).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Pending Distribution</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.pendingDistribution).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600">Closed Distribution</span>
                          <span className="text-sm font-semibold text-gray-900">{String(priorityCounts.closedDistribution).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to calculate days ago from a date
  const calculateDaysAgo = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      let date: Date;
      
      if (typeof dateString === 'string') {
        // Handle ISO format
        if (dateString.includes('T') || dateString.endsWith('Z')) {
          date = new Date(dateString);
        } 
        // Handle DD-MM-YYYY or YYYY-MM-DD
        else if (dateString.includes('-')) {
          const parts = dateString.split('-');
          if (parts.length === 3) {
            if (parts[0].length === 4) { // YYYY-MM-DD
               const [year, month, day] = parts;
               date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else { // DD-MM-YYYY
               const [day, month, year] = parts;
               date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
          } else {
            date = new Date(dateString);
          }
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString as any);
      }
      
      // Validate date
      if (isNaN(date.getTime())) return 'N/A';
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      const diffTime = now.getTime() - compareDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Handle future dates or today
      if (diffDays <= 0) return '0 days ago';
      if (diffDays === 1) return '01 day ago';
      
      const paddedDays = diffDays < 10 ? `0${diffDays}` : diffDays.toString();
      return `${paddedDays} days ago`;
    } catch {
      return 'N/A';
    }
  };



  const renderPipelineContent = () => {
    const pipelineTab = (
      <TaPipelineTab
        isLoading={isLoadingApplications}
        isEmpty={!applicantData || applicantData.length === 0}
        groupedByStage={getPipelineCandidatesByStage}
        onCandidateClick={handlePipelineCandidateClick}
        pipelineDate={pipelineDate}
        onPipelineDateChange={setPipelineDate}
        getCandidateName={(c) => c.candidateName || "N/A"}
        getRoleApplied={(c) => c.roleApplied || c.jobTitle || "N/A"}
        getCompany={(c) => c.company || c.currentCompany || "N/A"}
        getProfilePicture={(c) => c.profilePicture || c.profile_picture || null}
        getAppliedTimestamp={(c) =>
          calculateDaysAgo(c.appliedDate || c.updatedAt || c.createdAt)
        }
        isRejectedCandidate={(c) => {
          const status =
            applicantStatusOverrides[c.id] || c.currentStatus || "";
          return status === "Screened Out" || status === "Rejected";
        }}
        pipelineView={pipelineView}
        candidateSession={
          sessionApplicationId ? (
            <CandidateCommentsSession
              applicationId={sessionApplicationId}
              fallbackApplicant={sessionApplicantSnapshot}
              pipelineApplicants={pipelineSessionList}
              onSelectApplicant={handleSelectSessionApplicant}
              onBack={handleCloseCandidateSession}
              commentsRailVariant="ta"
            />
          ) : null
        }
        closureReportsFooter={
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Closure Reports</h3>
              {closureReports.length > 5 && (
                <Button
                  variant="outline"
                  className="border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  style={{ borderRadius: 6 }}
                  onClick={() => setIsClosureDetailsModalOpen(true)}
                  data-testid="button-view-more-closures"
                >
                  View More
                </Button>
              )}
            </div>
            <ClosureReportsCardList
              reports={taClosureReportsForPipeline}
              isLoading={isLoadingClosureReports}
              emptyMessage="No closures yet."
              maxRows={5}
            />
          </div>
        }
      />
    );

    if (isMobile) {
      return (
        <div className="flex h-full min-h-0 overflow-hidden">
          {pipelineTab}
        </div>
      );
    }

    return (
      <div className="employee-pipeline-tab-layout flex h-screen min-h-0 flex-col overflow-hidden">
        <div className="ml-16 flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
          <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
          <div className="employee-pipeline-tab-scroll flex min-h-0 flex-1 flex-col overflow-hidden">
            {pipelineTab}
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    // Use quarterly performance data from API (no hardcoded sample data)
    const quarterlyPerformanceData = quarterlyPerformance;

    // Use closure reports from API for closure details (data is set by Admin via Revenue Mapping)
    const allClosureDetails = closureReports.map(report => ({
      candidate: report.candidate || 'N/A',
      position: report.position || 'N/A',
      client: report.client || 'N/A',
      offeredOn: report.offeredOn || 'N/A',
      joinedOn: report.joinedOn || 'N/A',
      quarter: report.quarter || 'N/A',
      closureValue: report.closureValue || '0',
      incentive: report.incentive || '0'
    }));

    // Show loading state if data is being fetched
    const isLoading = isLoadingQuarterlyPerformance || isLoadingClosureReports;

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50 dark:bg-gray-950">
          <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
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
                    {isLoadingQuarterlyPerformance ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                      </div>
                    ) : quarterlyPerformanceData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <p className="text-lg font-medium">No performance data available</p>
                          <p className="text-sm">Data will appear when closures and deliveries are recorded</p>
                        </div>
                      </div>
                    ) : (
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
                          <RechartsTooltip
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
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Table */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Closure Details</h3>
                  <button
                    type="button"
                    onClick={() => setIsClosureDetailsModalOpen(true)}
                    disabled={allClosureDetails.length === 0}
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="button-view-more-closures"
                  >
                    View More
                  </button>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto scrollbar-hide">
                  {isLoadingClosureReports ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : allClosureDetails.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <p className="text-lg font-medium">No closure data available</p>
                        <p className="text-sm">Closures will appear here when recorded by Admin in Revenue Mapping</p>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

              </div>
            </div>

            {/* Right Sidebar - More Compact Design */}
            <div className="w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 space-y-3">
              {/* Tenure Card */}
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Tenure</h4>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-1" data-testid="value-tenure">{performanceSummary?.tenure || 0}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-200">Quarters</div>
                </div>
              </div>

              {/* Total Closures Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Closures</h4>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200" data-testid="value-total-closures">{performanceSummary?.totalClosures || 0}</div>
                </div>
              </div>

              {/* Recent Closure Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Recent Closure</h4>
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200" data-testid="value-recent-closure">{performanceSummary?.recentClosure || 'N/A'}</div>
                </div>
              </div>

              {/* Last Closure Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Last Closure</h4>
                  <div className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1" data-testid="value-last-closure-relative">
                    {performanceSummary?.lastClosureRelative ??
                      (performanceSummary?.totalClosures
                        ? `${performanceSummary.lastClosureMonths || 0} month${(performanceSummary.lastClosureMonths || 0) !== 1 ? 's' : ''} ${performanceSummary.lastClosureDays || 0} day${(performanceSummary.lastClosureDays || 0) !== 1 ? 's' : ''} ago`
                        : 'N/A')}
                  </div>
                  {performanceSummary?.lastClosureDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400" data-testid="value-last-closure-date">
                      {performanceSummary.lastClosureDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Summary Card */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">Total Revenue</h4>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1" data-testid="value-total-revenue">{formatIndianCurrency(performanceSummary?.totalRevenue || 0)}</div>
                  <div className="text-xs text-green-700 dark:text-green-300">All time closures value</div>
                </div>
              </div>

              {/* Incentive Summary Card */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">Total Incentives</h4>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1" data-testid="value-total-incentives">{formatIndianCurrency(performanceSummary?.totalIncentives || 0)}</div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">All time earned</div>
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
    const totalUnread = taChatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

    return (
      <div className="flex h-screen">
        <div className="flex-1 ml-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <AdminTopHeader companyName="Advisory Workspace" hideHelpButton={true} />
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Messages</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Communicate with Admin and Team Leaders</p>
              </div>
              {totalUnread > 0 && (
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 overflow-y-auto">
              {isLoadingChatRooms ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading messages...
                </div>
              ) : taChatRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No messages yet. Wait for Admin or TL to start a conversation.
                </div>
              ) : (
                <div className="space-y-3">
                  {taChatRooms.map((room: any) => {
                    // Get the other participant (not TA)
                    const otherParticipant = room.participants?.find((p: any) => p.participantId !== employee?.id);
                    const participantName = otherParticipant?.participantName || 'Unknown';
                    const participantRole = otherParticipant?.participantRole || '';
                    const roleLabel = participantRole === 'team_leader' ? 'TL' : participantRole === 'admin' ? 'Admin' : '';
                    const timeStr = room.lastMessageAt
                      ? new Date(room.lastMessageAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                      : new Date(room.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const unreadCount = room.unreadCount || 0;

                    return (
                      <div
                        key={room.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer ${unreadCount > 0 ? 'border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10' : ''
                          }`}
                        onClick={() => {
                          setSelectedChatRoom(room.id);
                          setIsChatModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {participantName} {roleLabel && <span className="text-xs text-gray-500">({roleLabel})</span>}
                              </div>
                              {unreadCount > 0 && (
                                <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm line-clamp-2 ${unreadCount > 0
                              ? 'text-gray-900 dark:text-white font-medium'
                              : 'text-gray-600 dark:text-gray-400'
                              }`}>
                              {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Click to view messages'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {timeStr}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        isMobile
          ? "flex h-screen max-h-[100dvh] flex-col overflow-hidden bg-gray-50"
          : sidebarTab === "pipeline"
            ? `h-screen max-h-screen overflow-hidden`
            : `min-h-screen`
      }
    >
      {isMobile ? (
        <>
          <AdminTopHeader
            companyName="Advisory Workspace"
            hideHelpButton={true}
            onNavigateToSection={() => setSidebarTab("pipeline")}
          />
          <div className="recruiter-mobile-pipeline-only flex min-h-0 flex-1 flex-col overflow-hidden">
            <style>{`.recruiter-mobile-pipeline-only .ml-16 { margin-left: 0 !important; }`}</style>
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              style={{ height: "calc(100dvh - 4rem)" }}
            >
              {renderMainContent()}
            </div>
          </div>
        </>
      ) : (
        <>
          <TeamLeaderMainSidebar
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            chatUnreadCount={totalUnreadCount}
          />
          <div className="min-h-0 overflow-hidden">
            {renderMainContent()}
          </div>
        </>
      )}

      {/* Target Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Target Details - All Quarters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {aggregatedTargets?.allQuarters && aggregatedTargets.allQuarters.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${quarter.status === 'Completed' ? 'bg-green-100 text-green-800' :
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
        title={`Delivered Candidates - ${format(selectedDate, 'dd-MM-yyyy')}`}
        rows={deliveredCandidates.map((candidate: any) => ({
          candidate: candidate.candidate,
          position: candidate.position,
          client: candidate.client,
          deliveredDate: candidate.deliveredDate,
          status: candidate.status
        }))}
        columns={[
          { key: 'candidate', label: 'Candidate' },
          { key: 'position', label: 'Position' },
          { key: 'client', label: 'Client' },
          { key: 'deliveredDate', label: 'Delivered Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage={`No delivered candidates on ${format(selectedDate, 'dd-MM-yyyy')}`}
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}
        testIdPrefix="delivered"
      />

      {/* Defaulted Modal */}
      <DailyDeliveryModal
        open={isDefaultedModalOpen}
        onOpenChange={setIsDefaultedModalOpen}
        title="Defaulted Requirements"
        rows={(dailyMetrics?.defaultedRequirements as any[]) || []}
        columns={[
          { key: 'requirement', label: 'Requirement' },
          { key: 'client', label: 'Client' },
          { key: 'pendingProfiles', label: 'Pending Profiles' },
          { key: 'status', label: 'Progress' }
        ]}
        emptyMessage="No defaulted requirements. All requirements are completed!"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}
        testIdPrefix="defaulted"
      />

      {/* Performance Modal - Full Graph with All Requirements */}
      <Dialog open={isPerformanceModalOpen} onOpenChange={setIsPerformanceModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Overall Performance - Full Graph</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 p-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600" data-testid="text-success-rate">
                  {(() => {
                    const totalResumes = performanceSummary?.totalResumesDelivered || 0;
                    const totalClosures = performanceSummary?.totalClosures || 0;
                    if (totalResumes > 0) {
                      return `${Math.round((totalClosures / totalResumes) * 100)}%`;
                    }
                    return '0%';
                  })()}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-xs text-gray-500 mt-1">(Closures / Resumes Delivered)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-total-closures">
                  {performanceSummary?.totalClosures || 0}
                </div>
                <div className="text-sm text-gray-600">Total Closures</div>
                <div className="text-xs text-gray-500 mt-1">All time closures</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600" data-testid="text-total-incentives">
                  {formatIndianCurrency(performanceSummary?.totalIncentives || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Incentives</div>
                <div className="text-xs text-gray-500 mt-1">All time earned</div>
              </div>
            </div>
            {/* Full Graph with All Requirements */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Requirement</h3>
              <div className="h-96">
                {recruiterRequirements && recruiterRequirements.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={recruiterRequirements.map((req: any) => ({
                        name: req.position || 'Unknown',
                        value: req.deliveredCount || 0,
                        target: getExpectedCount(req)
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} name="Delivered" />
                      <Line type="monotone" dataKey="target" stroke="#ec4899" strokeWidth={2} name="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No performance data available
                  </div>
                )}
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
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, candidateName: e.target.value }))}
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
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, position: e.target.value }))}
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
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, client: e.target.value }))}
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
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewDate: e.target.value }))}
                  data-testid="input-interview-date"
                />
              </div>
              <div>
                <Label htmlFor="interviewTime">Interview Time</Label>
                <Input
                  id="interviewTime"
                  type="time"
                  value={interviewForm.interviewTime}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewTime: e.target.value }))}
                  data-testid="input-interview-time"
                />
              </div>
              <div>
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select value={interviewForm.interviewType} onValueChange={(value) => setInterviewForm(prev => ({ ...prev, interviewType: value }))}>
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
          <div className="overflow-x-auto scrollbar-hide">
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
                        <span className={`px-2 py-1 rounded text-xs ${interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
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
          <div className="overflow-x-auto scrollbar-hide">
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
                        <span className={`px-2 py-1 rounded text-xs ${interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
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
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsPendingCasesModalOpen(false)} data-testid="button-close-pending-cases">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Requirement Count Modal */}
      <Dialog open={requirementCountModal.isOpen} onOpenChange={(open) => setRequirementCountModal({ isOpen: open, requirement: null })}>
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
              <Button variant="outline" onClick={() => setRequirementCountModal({ isOpen: false, requirement: null })}>Cancel</Button>
              <Button onClick={() => setRequirementCountModal({ isOpen: false, requirement: null })}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reason Modal for Screened Out */}
      <Dialog open={isReasonModalOpen} onOpenChange={(open) => {
        setIsReasonModalOpen(open);
        if (!open) {
          setReason('');
          setOtherReasonText('');
        }
      }}>
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
              <Select value={reason} onValueChange={(value) => {
                setReason(value);
                if (value !== 'Other (please specify)') {
                  setOtherReasonText('');
                }
              }}>
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
            {reason === 'Other (please specify)' && (
              <div>
                <Label htmlFor="other-reason">Please specify the reason</Label>
                <Textarea
                  id="other-reason"
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Enter the reason for screening out..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsReasonModalOpen(false);
                setReason('');
                setOtherReasonText('');
              }}>Cancel</Button>
              <Button
                onClick={archiveCandidate}
                className="bg-red-600 hover:bg-red-700"
                disabled={!reason || (reason === 'Other (please specify)' && !otherReasonText.trim())}
              >
                Archive Candidate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closure Form Modal */}
      <Dialog open={isClosureFormModalOpen} onOpenChange={setIsClosureFormModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Closure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  value={selectedCandidateForClosure?.candidateName || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="client">Client (Company)</Label>
                <Input
                  id="client"
                  value={selectedCandidateForClosure?.company || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position">Position (Role)</Label>
              <Input
                id="position"
                value={selectedCandidateForClosure?.roleApplied || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offeredOn">Offered On</Label>
                <StandardDatePicker
                  value={closureFormData.offeredOn ? new Date(closureFormData.offeredOn) : undefined}
                  onChange={(date) => {
                    if (date) {
                      setClosureFormData(prev => ({
                        ...prev,
                        offeredOn: format(date, 'yyyy-MM-dd')
                      }));
                    }
                  }}
                  placeholder="Select date"
                />
              </div>
              <div>
                <Label htmlFor="joinedOn">Joined On</Label>
                <StandardDatePicker
                  value={closureFormData.joinedOn ? new Date(closureFormData.joinedOn) : undefined}
                  onChange={(date) => {
                    if (date) {
                      setClosureFormData(prev => ({
                        ...prev,
                        joinedOn: format(date, 'yyyy-MM-dd')
                      }));
                    }
                  }}
                  placeholder="Select date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Input
                id="quarter"
                value={getCurrentQuarter()}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsClosureFormModalOpen(false);
                  setSelectedCandidateForClosure(null);
                  setClosureFormData({ offeredOn: '', joinedOn: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClosureSubmit}
                disabled={createClosureMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createClosureMutation.isPending ? 'Submitting...' : 'Submit Closure'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Resume Modal */}
      <UploadResumeModal
        isOpen={isUploadResumeModalOpen}
        onClose={() => setIsUploadResumeModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Resume uploaded successfully!');
          setShowSuccessAlert(true);
          setTimeout(() => {
            setShowSuccessAlert(false);
            setSuccessMessage('');
          }, 3000);
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
                  type="button"
                  onClick={() => {
                    setIsApplicantOverviewModalOpen(false);
                    setApplicantSearchQuery('');
                  }}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close"
                  data-testid="button-close-applicants-modal"
                >
                  <X className="h-5 w-5" />
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Onboard</th>
                  </tr>
                </thead>
                <tbody>
                  {getEffectiveApplicantData()
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
                    .map((applicant, index) => {
                      const isUpdating = updatingApplicantId === applicant.id;
                      const isTlTagged = Boolean(applicant.taggedByTeamLead);
                      const terminal = getApplicantTerminal(applicant);
                      return (
                        <tr
                          key={applicant.id || index}
                          title={
                            terminal.hoverLabel ??
                            (isTlTagged ? "Tagged by your TL" : undefined)
                          }
                          className={`border-b border-gray-100 transition-all duration-300 ${applicantOverviewRowClass(applicant, isUpdating)}`}
                        >
                          <td className="py-3 px-4 text-gray-900 transition-colors duration-200">{applicant.appliedOn}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium transition-colors duration-200">{applicant.candidateName}</td>
                          <td className="py-3 px-4 text-gray-900 transition-colors duration-200">{applicant.company}</td>
                          <td className="py-3 px-4 text-gray-900 transition-colors duration-200">{applicant.roleApplied}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${applicant.submission === 'Inbound'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}>
                              {applicant.submission}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {renderApplicantStatusCell(applicant, isUpdating)}
                          </td>
                          <td className="py-3 px-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 p-0"
                                    onClick={() => handleInviteClick(applicant)}
                                    disabled={
                                      !applicant.canSendOnboardInvite ||
                                      invitePendingApplicationId === applicant.id
                                    }
                                    data-testid={`button-onboard-modal-${applicant.id}`}
                                  >
                                    <PaperPlaneNudgeIcon className="h-4 w-4 shrink-0" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getOnboardTooltip(applicant)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite to StaffOS Confirmation Modal */}
      {isInviteConfirmModalOpen && applicantToInvite && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-200"
          onClick={handleCancelInvite}
          data-testid="invite-confirm-overlay"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
            data-testid="invite-confirm-modal"
          >
            <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100">
              <button
                onClick={handleCancelInvite}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-1.5 transition-colors"
                aria-label="Close"
                data-testid="button-close-invite-confirm"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <Send className="h-6 w-6 shrink-0 text-white" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invite to StaffOS
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {applicantToInvite?.staffosInviteSentAt
                      ? "Resend the StaffOS welcome email to this candidate."
                      : "Send an onboarding invite to this candidate."}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                    {(applicantToInvite.candidateName || '?')
                      .split(' ')
                      .map((n: string) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold text-gray-900 truncate"
                      data-testid="invite-confirm-candidate-name"
                    >
                      {applicantToInvite.candidateName || 'Unknown Candidate'}
                    </p>
                    {applicantToInvite.email ? (
                      <p
                        className="text-xs text-gray-500 truncate"
                        data-testid="invite-confirm-candidate-email"
                      >
                        {applicantToInvite.email}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600">
                        No email on file
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                We'll email{' '}
                <span className="font-medium text-gray-900">
                  {applicantToInvite.candidateName || 'this candidate'}
                </span>{' '}
                their StaffOS login URL, email, and a temporary password for first-time
                access.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelInvite}
                disabled={sendInviteMutation.isPending}
                className="h-9"
                data-testid="button-cancel-invite"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmInvite}
                disabled={sendInviteMutation.isPending || !applicantToInvite.email}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                data-testid="button-confirm-invite"
              >
                {sendInviteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                    Send Invite
                  </>
                )}
              </Button>
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
                type="button"
                onClick={() => setIsPendingMeetingsModalOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
                data-testid="button-close-meetings-modal"
              >
                <X className="h-5 w-5" />
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
                type="button"
                onClick={() => setIsCeoCommandsModalOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
                data-testid="button-close-commands-modal"
              >
                <X className="h-5 w-5" />
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

      <JobDescriptionDetailsModal
        open={isJDDetailsModalOpen}
        onOpenChange={setIsJDDetailsModalOpen}
        data={selectedJD}
        variant="delivery"
        subtitle="Review the job description for this requirement."
      />

      <JdVisibilityModal
        open={isJdVisibilityModalOpen}
        onOpenChange={setIsJdVisibilityModalOpen}
        requirementLabel={resolveRequirementDisplayId(jdVisibilityRequirement)}
        value={jdVisibilityValue}
        onValueChange={setJdVisibilityValue}
        onSave={handleSaveJdVisibility}
        isSaving={updateJdVisibilityMutation.isPending}
        audit={
          jdVisibilityRequirement
            ? {
                showToCandidate: parseRequirementJdVisibility(jdVisibilityRequirement).showToCandidate,
                updatedByRole: parseRequirementJdVisibility(jdVisibilityRequirement).updatedByRole,
                updatedByName: parseRequirementJdVisibility(jdVisibilityRequirement).updatedByName,
                updatedAt: parseRequirementJdVisibility(jdVisibilityRequirement).updatedAt,
              }
            : null
        }
      />

      {/* Chat Support Modal */}
      <ChatDock
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={userName}
        userRole={userRole}
      />

      {/* Chat Modal for viewing and replying to messages */}
      {selectedChatRoom && (
        <ChatModal
          roomId={selectedChatRoom}
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedChatRoom(null);
          }}
          onMessageSent={refetchChatRooms}
          employeeId={employee?.id}
        />
      )}
    </div>
  );
}
