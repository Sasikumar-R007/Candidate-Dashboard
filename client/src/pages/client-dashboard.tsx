import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Pause, User, MapPin, HandHeart, Upload, Edit3, Minus, Users, Play, Trophy, ArrowLeft, Send, Calendar as CalendarIcon, MoreVertical, HelpCircle, Download, ExternalLink, Eye, Trash2, Paperclip, Image as ImageIcon, File, Video, Link as LinkIcon, X, Smile, RotateCcw, UserCheck, Archive, Loader2, Info } from "lucide-react";
import { CompanyBrandAvatar } from "@/components/client-brand-avatar";
import { resolveDisplayRoleId } from "@shared/requirement-jd-extras";
import {
  CLIENT_MOBILE_DIALOG_CLASS,
  CLIENT_MOBILE_DIALOG_WIDE_CLASS,
  resolveClientRoleDisplayId,
} from "@/lib/client-role-display";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import SimpleClientHeader from '@/components/dashboard/simple-client-header';
import ClientMainSidebar from '@/components/dashboard/client-main-sidebar';
import NudgesTab from '@/components/dashboard/tabs/nudges-tab';
import ActiveNudgesTable from "@/components/dashboard/active-nudges-table";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChatDock } from '@/components/chat/chat-dock';
import { RequirementRoleCell } from '@/components/dashboard/requirement-role-cell';
import { ClientPipelineTab } from '@/components/dashboard/client-pipeline-tab';
import { ClientMemberPipelineTab } from '@/components/dashboard/client-member-pipeline-tab';
import { PIPELINE_BUTTON_RADIUS_PX } from '@/lib/pipeline-ui-tokens';
import {
  ClosureReportsCardList,
  type ClosureReportRow,
} from '@/components/dashboard/closure-reports-card-list';
import {
  CLIENT_PIPELINE_STAGE_ORDER,
  buildPipelineSessionList,
  groupCandidatesByPipelineStage,
  isTerminalRejectedStatus,
  mapClientPipelineCandidate,
  isPipelineApplicationSessionId,
  resolvePipelineGroupingStatus,
} from '@/lib/pipeline-session-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest, apiFileUpload } from '@/lib/queryClient';
import { queryPresets } from '@/lib/query-config';
import { useAuth, useEmployeeAuth } from '@/contexts/auth-context';
import { SignOutDialog } from '@/components/ui/sign-out-dialog';
import ClientAgreementFirstLoginModal from '@/components/client-dashboard/client-agreement-first-login-modal';
import { ClientSharedProfilesModal } from '@/components/dashboard/modals/client-shared-profiles-modal';
import { logConsent } from '@/lib/consent-log';
import { resolveJdFileUrl } from '@/lib/resolve-upload-url';
import {
  CandidateCommentsSession,
  type CandidateCommentsSessionApplicant,
} from '@/components/dashboard/candidate-comments-session';
import { isClientPortalRole, isClientAdminRole } from "@shared/client-roles";
import {
  getClientPortalMobileNav,
  isClientPortalTabAllowed,
  normalizeClientPortalTab,
} from "@/lib/client-portal-nav";
import { ClientTeamTab } from "@/components/client-dashboard/client-team-tab";
import { ClientMobileBottomNav } from "@/components/client-dashboard/client-mobile-bottom-nav";
import {
  ClientRequirementsRoleMobileCards,
  type ClientRequirementRoleRow,
} from "@/components/client-dashboard/client-requirements-role-mobile-cards";
import { ClientSettingsTab } from "@/components/client-dashboard/client-settings-tab";
import { ClientMetricsReportDocument } from "@/components/client-dashboard/client-metrics-report-document";
import { ClientRequirementAssignModal } from "@/components/client-dashboard/client-requirement-assign-modal";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import ChangePasswordModal from "@/components/dashboard/modals/ChangePasswordModal";

export default function ClientDashboard() {
  const { logout, beginSignOut, isSigningOut } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showProfileNotLinkedSignOutDialog, setShowProfileNotLinkedSignOutDialog] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('overview');
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [sharedProfilesOpen, setSharedProfilesOpen] = useState(false);
  const [sharedProfilesRequirementId, setSharedProfilesRequirementId] = useState<string | null>(null);
  const [sharedProfilesRoleTitle, setSharedProfilesRoleTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jdFilePreviewUrl, setJdFilePreviewUrl] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [tempJdText, setTempJdText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pipelineDate, setPipelineDate] = useState<Date>(new Date());
  const [metricsDate, setMetricsDate] = useState<Date>(new Date());
  const [pipelinePeriod, setPipelinePeriod] = useState<string>("all");
  const [pipelineMonth, setPipelineMonth] = useState<string>(format(new Date(), "MMMM"));
  const [pipelineYear, setPipelineYear] = useState<string>(new Date().getFullYear().toString());
  const [pipelineQuarter, setPipelineQuarter] = useState<string>("Q1");
  const [metricsPeriod, setMetricsPeriod] = useState<string>("monthly");
  const [metricsRoleFilter, setMetricsRoleFilter] = useState<string>("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all'); // Single select for dropdown
  const [selectedRequirement, setSelectedRequirement] = useState<string>('all'); // Filter by requirement
  
  // Sample roles for testing dropdown
  const sampleRoles = [
    { id: 'all', name: 'All' },
    { id: 'sample-role-1', name: 'Software Engineer' },
    { id: 'sample-role-2', name: 'Data Scientist' },
    { id: 'sample-role-3', name: 'Product Manager' },
    { id: 'sample-role-4', name: 'UI/UX Designer' },
    { id: 'sample-role-5', name: 'DevOps Engineer' },
  ];
  
  const [showInterviewDropModal, setShowInterviewDropModal] = useState(false);
  const [showOfferDropModal, setShowOfferDropModal] = useState(false);
  const [expandedChart, setExpandedChart] = useState<"speed" | "quality" | null>(null);

  // Fetch drop rates from API (calculated from actual data)
  const { data: dropRatesData, isLoading: isLoadingDropRates } = useQuery({
    queryKey: ['/api/client/drop-rates'],
    placeholderData: {
      interviewDropRate: 25,
      offerDropRate: 20,
      totalInterviewsScheduled: 100,
      interviewsCompleted: 75,
      interviewsDropped: 25,
      totalOffersExtended: 50,
      offersAccepted: 40,
      offersDeclined: 10
    }
  });
  
  const [primarySkills, setPrimarySkills] = useState('');
  const [secondarySkills, setSecondarySkills] = useState('');
  const [knowledgeOnly, setKnowledgeOnly] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [isJdPreviewModalOpen, setIsJdPreviewModalOpen] = useState(false);
  const [jdPosition, setJdPosition] = useState('');
  const [jdPositionsInput, setJdPositionsInput] = useState('1');
  const [jdInvalidFields, setJdInvalidFields] = useState<Set<string>>(new Set());
  const [pipelineView, setPipelineView] = useState<'board' | 'candidate-session'>('board');
  const [sessionApplicationId, setSessionApplicationId] = useState<string | null>(null);
  const [sessionApplicantSnapshot, setSessionApplicantSnapshot] =
    useState<CandidateCommentsSessionApplicant | null>(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    speed: false,
    quality: false,
    impact: false
  });
  const jdFileInputRef = useRef<HTMLInputElement | null>(null);
  const [printMetrics, setPrintMetrics] = useState({
    speed: true,
    quality: true,
    impact: true
  });
  const [isMetricsReportActive, setIsMetricsReportActive] = useState(false);

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
      // Handle different date formats
      let date: Date;
      if (dateString.includes('-')) {
        const [day, month, year] = dateString.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '0 days ago';
      if (diffDays === 1) return '01 day ago';
      // Format with zero-padding for single digits (matching image: "07 days ago", "10 days ago")
      const paddedDays = diffDays < 10 ? `0${diffDays}` : diffDays.toString();
      return `${paddedDays} days ago`;
    } catch {
      return 'N/A';
    }
  };

  const [selectedRoleForView, setSelectedRoleForView] = useState<any>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<any>(null);
  const [isViewRoleModalOpen, setIsViewRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Edit JD form state
  const [editJdText, setEditJdText] = useState('');
  const [editJdFile, setEditJdFile] = useState<File | null>(null);
  const [editJdFilePreviewUrl, setEditJdFilePreviewUrl] = useState<string | null>(null);
  const [editPrimarySkills, setEditPrimarySkills] = useState('');
  const [editSecondarySkills, setEditSecondarySkills] = useState('');
  const [editKnowledgeOnly, setEditKnowledgeOnly] = useState('');
  const [editSpecialInstructions, setEditSpecialInstructions] = useState('');
  const [editJdPosition, setEditJdPosition] = useState('');
  const [editPositionsInput, setEditPositionsInput] = useState('1');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Fetch metrics data from API - with filters
  const { data: speedMetricsData } = useQuery({
    queryKey: ['/api/client/speed-metrics', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      if (metricsPeriod !== 'overall') {
        params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      }
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      const response = await apiRequest('GET', `/api/client/speed-metrics?${params.toString()}`);
      return response.json();
    }
  });

  const { data: qualityMetricsData } = useQuery({
    queryKey: ['/api/client/quality-metrics', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      if (metricsPeriod !== 'overall') {
        params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      }
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      const response = await apiRequest('GET', `/api/client/quality-metrics?${params.toString()}`);
      return response.json();
    }
  });

  const { data: impactMetrics = [] } = useQuery({
    queryKey: ['/api/client/impact-metrics', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      if (metricsPeriod !== 'overall') {
        params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      }
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      try {
        const response = await apiRequest('GET', `/api/client/impact-metrics?${params.toString()}`);
        const data = await response.json();
        return Array.isArray(data) ? data : (data ? [data] : []);
      } catch (error) {
        console.error('Error fetching impact metrics:', error);
        return [];
      }
    }
  });

  const { data: speedChartData } = useQuery({
    queryKey: ['/api/client/speed-metrics-chart', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      if (metricsPeriod !== 'overall') {
        params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      }
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      const response = await apiRequest('GET', `/api/client/speed-metrics-chart?${params.toString()}`);
      return response.json();
    }
  });

  const { data: qualityChartData } = useQuery({
    queryKey: ['/api/client/quality-metrics-chart', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      if (metricsPeriod !== 'overall') {
        params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      }
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      const response = await apiRequest('GET', `/api/client/quality-metrics-chart?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch dashboard stats from API
  const { data: dashboardStats } = useQuery({
    ...queryPresets.standard,
    queryKey: ['/api/client/dashboard-stats'],
    placeholderData: {
      rolesAssigned: 0,
      totalPositions: 0,
      activeRoles: 0,
      successfulHires: 0,
      pausedRoles: 0,
      withdrawnRoles: 0
    }
  });

  // Fetch roles/requirements from API
  const { data: allRolesData, isLoading: isLoadingRoles } = useQuery({
    ...queryPresets.standard,
    queryKey: ['/api/client/requirements'],
    placeholderData: [],
  });

  // Fetch pipeline data from API with filters
  const { data: pipelineData, isLoading: isLoadingPipeline } = useQuery({
    ...queryPresets.live,
    queryKey: ['/api/client/pipeline', selectedRequirement],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRequirement && selectedRequirement !== 'all') {
        params.append('requirementId', selectedRequirement);
      }
      const url = `/api/client/pipeline${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    placeholderData: []
  });

  // Use only real pipeline data - no sample data
  const mergedPipelineData = useMemo(() => {
    const realData = (pipelineData as any[]) || [];
    return realData;
  }, [pipelineData]);

  // Fetch closure reports from API
  const { data: allClosureReports = [], isLoading: isLoadingClosures } = useQuery<ClosureReportRow[]>({
    ...queryPresets.live,
    queryKey: ['/api/client/closures'],
    placeholderData: [],
  });
  const closureReportsList = Array.isArray(allClosureReports) ? allClosureReports : [];

  const computedDashboardStats = useMemo(() => {
    const roles = Array.isArray(allRolesData) ? (allRolesData as any[]) : [];
    const normalizeStatus = (value: string | null | undefined) => (value || '').trim().toLowerCase();
    const totalPositions = roles.reduce((sum: number, role: any) => sum + Math.max(1, Number(role?.noOfPositions) || 1), 0);
    const activeRoles = roles.filter((role: any) => {
      const status = normalizeStatus(role?.status);
      return status === 'active' || status === 'open' || status === 'in_progress' || status === 'in progress';
    }).length;
    const pausedRoles = roles.filter((role: any) => normalizeStatus(role?.status) === 'paused').length;
    return {
      rolesAssigned: roles.length || dashboardStats.rolesAssigned,
      totalPositions: totalPositions || dashboardStats.totalPositions,
      activeRoles: activeRoles || dashboardStats.activeRoles,
      pausedRoles: pausedRoles || dashboardStats.pausedRoles,
      withdrawnRoles: dashboardStats.withdrawnRoles,
      successfulHires: closureReportsList.length || dashboardStats.successfulHires,
    };
  }, [allRolesData, closureReportsList, dashboardStats]);

  // Fetch client profile from API
  const { data: clientProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/client/profile'],
  });
  const employee = useEmployeeAuth();
  const userName = clientProfile?.name || employee?.name || "Client User";
  const userRole = employee?.role || 'client';
  const isClientPortalUser = isClientPortalRole(employee?.role);
  const isClientAdmin =
    isClientAdminRole(employee?.role) ||
    (clientProfile as { isClientAdmin?: boolean } | undefined)?.isClientAdmin === true;

  const { data: activeNudges = [] } = useQuery({
    ...queryPresets.live,
    queryKey: ['/api/nudges'],
    enabled: isClientAdmin,
    placeholderData: [],
  });

  const [showClientAgreementModal, setShowClientAgreementModal] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRequirement, setAssignRequirement] = useState<{
    id: string;
    title: string;
    memberId: string | null;
  } | null>(null);

  const handleSidebarTabChange = (tab: string) => {
    const normalized = normalizeClientPortalTab(tab);
    if (isClientPortalTabAllowed(normalized, isClientAdmin)) {
      setSidebarTab(normalized);
    } else {
      setSidebarTab('overview');
    }
  };

  const clientMobileNavItems = useMemo(
    () =>
      getClientPortalMobileNav(isClientAdmin).map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
      })),
    [isClientAdmin],
  );

  useEffect(() => {
    const normalized = normalizeClientPortalTab(sidebarTab);
    if (!isClientPortalTabAllowed(normalized, isClientAdmin)) {
      setSidebarTab('overview');
    }
  }, [isClientAdmin, sidebarTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const redirectIfMobile = () => {
      if (mq.matches && normalizeClientPortalTab(sidebarTab) === "nudges") {
        setSidebarTab("overview");
      }
    };
    redirectIfMobile();
    mq.addEventListener("change", redirectIfMobile);
    return () => mq.removeEventListener("change", redirectIfMobile);
  }, [sidebarTab]);

  useEffect(() => {
    if (!isClientPortalUser) {
      setShowClientAgreementModal(false);
      return;
    }
    if (isLoadingProfile || !clientProfile) {
      return;
    }
    setShowClientAgreementModal(clientProfile.clientAgreementAccepted !== true);
  }, [isClientPortalUser, isLoadingProfile, clientProfile]);

  const clientHeaderProps = useMemo(
    () => ({
      companyName:
        (clientProfile as { company?: string })?.company ||
        (isLoadingProfile ? "Loading..." : "Company"),
      companyLogo: (clientProfile as { companyLogo?: string | null })?.companyLogo ?? null,
      clientProfilePicture: (clientProfile as { profilePicture?: string | null })?.profilePicture ?? null,
      clientName: (clientProfile as { name?: string })?.name || employee?.name || undefined,
      clientEmail: (clientProfile as { email?: string })?.email || employee?.email || undefined,
      activeTabId: sidebarTab,
      displayEmployeeId:
        employee?.employeeId || (clientProfile as { employeeId?: string })?.employeeId || null,
      isClientAdmin,
      onHelpClick: () => setIsHelpChatOpen(true),
      portalNudges: isClientAdmin ? activeNudges : [],
      onOpenNudges: () => handleSidebarTabChange("nudges"),
      onOpenClosures: () => {
        handleSidebarTabChange("pipeline");
        setIsClosureModalOpen(true);
      },
      onOpenPipeline: () => handleSidebarTabChange("pipeline"),
      onOpenProfileSettings: () => setProfileSettingsOpen(true),
      onOpenChangePassword: () => setChangePasswordOpen(true),
    }),
    [
      clientProfile,
      isLoadingProfile,
      employee,
      sidebarTab,
      isClientAdmin,
      activeNudges,
      allClosureReports,
    ],
  );

  const handleClientAgreementAccept = async () => {
    if (!employee?.id) return;
    const ok = await logConsent({
      user_id: employee.id,
      role: "client",
      consent_type: "client_agreement",
      policy_version: "2026-05-10",
    });
    if (ok) {
      await queryClient.invalidateQueries({ queryKey: ['/api/client/profile'] });
      setShowClientAgreementModal(false);
    } else {
      toast({
        title: "Could not save agreement",
        description: "Check your connection and try again. If this keeps happening, contact support.",
        variant: "destructive",
      });
    }
  };

  // Mutation for deleting a requirement/role
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/client/requirements/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/client/dashboard-stats'] });
      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully.",
      });
      setRoleToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive"
      });
    }
  });

  const profileNotLinkedLogoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/employee-logout", {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      window.location.href = "/";
    },
    onError: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      window.location.href = "/";
    },
  });

  const handleProfileNotLinkedSignOut = () => {
    setShowProfileNotLinkedSignOutDialog(true);
  };

  const confirmProfileNotLinkedSignOut = () => {
    beginSignOut();
    profileNotLinkedLogoutMutation.mutate();
  };

  // Filter pipeline data by period and selected roles
  const parseJdFromFile = async (file: File) => {
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setJdFilePreviewUrl(fileUrl);
    setIsParsingJd(true);
    try {
      const formData = new FormData();
      formData.append("jdFile", file);
      const response = await apiFileUpload("/api/client/parse-jd", formData);
      const parsed = await response.json();
      if (parsed.data) {
        if (parsed.data.position) {
          setJdPosition((prev) => prev || parsed.data.position);
        }
        if (parsed.data.primarySkills) {
          setPrimarySkills((prev) => prev || parsed.data.primarySkills);
        }
        if (parsed.data.secondarySkills) {
          setSecondarySkills((prev) => prev || parsed.data.secondarySkills);
        }
        if (parsed.data.knowledgeOnly) {
          setKnowledgeOnly((prev) => prev || parsed.data.knowledgeOnly);
        }
        if (parsed.data.specialInstructions) {
          setSpecialInstructions((prev) => prev || parsed.data.specialInstructions);
        }
        if (parsed.data.jdText) {
          setJdText((prev) => prev || parsed.data.jdText);
        }
      }
    } catch (error) {
      console.error("Failed to parse JD:", error);
      toast({
        title: "Parse notice",
        description: "Could not auto-fill fields from this file. You can still complete the form manually.",
      });
    } finally {
      setIsParsingJd(false);
    }
  };

  const resetJdUploadForm = () => {
    setIsParsingJd(false);
    setJdText('');
    setUploadedFile(null);
    if (jdFilePreviewUrl) {
      URL.revokeObjectURL(jdFilePreviewUrl);
    }
    setJdFilePreviewUrl(null);
    setPrimarySkills('');
    setSecondarySkills('');
    setKnowledgeOnly('');
    setSpecialInstructions('');
    setJdPosition('');
    setJdPositionsInput('1');
    setJdInvalidFields(new Set());
    if (jdFileInputRef.current) {
      jdFileInputRef.current.value = '';
    }
  };

  const getJdInvalidFields = useCallback(() => {
    const invalid = new Set<string>();
    if (!jdPosition.trim()) invalid.add('position');
    const positions = parseInt(jdPositionsInput, 10);
    if (!jdPositionsInput.trim() || !Number.isFinite(positions) || positions < 1) {
      invalid.add('positions');
    }
    if (!primarySkills.trim()) invalid.add('primarySkills');
    if (!secondarySkills.trim()) invalid.add('secondarySkills');
    if (!knowledgeOnly.trim()) invalid.add('knowledgeOnly');
    if (!specialInstructions.trim()) invalid.add('specialInstructions');
    if (!uploadedFile && !jdText.trim()) invalid.add('jdContent');
    return invalid;
  }, [
    jdPosition,
    jdPositionsInput,
    primarySkills,
    secondarySkills,
    knowledgeOnly,
    specialInstructions,
    uploadedFile,
    jdText,
  ]);

  const jdFieldBorder = (field: string, baseClass: string) =>
    cn(
      baseClass,
      jdInvalidFields.has(field) && 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500',
    );

  useEffect(() => {
    if (jdInvalidFields.size === 0) return;
    const currentInvalid = getJdInvalidFields();
    setJdInvalidFields((prev) => {
      const next = new Set(Array.from(prev).filter((field) => currentInvalid.has(field)));
      return next.size === prev.size ? prev : next;
    });
  }, [getJdInvalidFields, jdInvalidFields.size]);

  const validateJdUploadForm = () => {
    const invalid = getJdInvalidFields();
    if (invalid.size > 0) {
      setJdInvalidFields(invalid);
      toast({
        title: 'Please complete the highlighted fields',
        variant: 'destructive',
      });
      return false;
    }
    setJdInvalidFields(new Set());
    return true;
  };

  const handleJdPositionsChange = (value: string) => {
    setJdPositionsInput(value.replace(/[^\d]/g, ''));
  };

  const handleJdPositionsBlur = () => {
    if (!jdPositionsInput.trim() || Number(jdPositionsInput) < 1) {
      setJdPositionsInput('1');
    }
  };

  const openJdPreviewIfValid = () => {
    if (!validateJdUploadForm()) return;
    setIsJdPreviewModalOpen(true);
  };

  const filteredPipelineData = useMemo(() => {
    let filtered = [...mergedPipelineData];

    const getCandidateDateKey = (candidate: any): string | null => {
      const source = candidate?.appliedDate || candidate?.updatedAt || candidate?.createdAt;
      if (!source || source === 'N/A') return null;
      try {
        if (typeof source === 'string' && source.includes('-') && source.split('-').length === 3) {
          const [partA, partB, partC] = source.split('-');
          if (partA.length <= 2 && partB.length <= 2 && partC.length === 4) {
            const parsedDate = new Date(parseInt(partC, 10), parseInt(partB, 10) - 1, parseInt(partA, 10));
            return format(parsedDate, 'yyyy-MM-dd');
          }
        }
        return format(new Date(source), 'yyyy-MM-dd');
      } catch {
        return null;
      }
    };

    // Keep only real rows
    filtered = filtered.filter((c: any) => !(c.id && c.id.startsWith('sample-')));

    if (pipelinePeriod === "today") {
      const selectedDayKey = format(pipelineDate, 'yyyy-MM-dd');
      filtered = filtered.filter((c: any) => getCandidateDateKey(c) === selectedDayKey);
    }

    // Filter by selected role (single select) - Keep for backward compatibility
    if (selectedRole && selectedRole !== 'all') {
      filtered = filtered.filter((c: any) => {
        // Check if it's a sample role
        const sampleRole = sampleRoles.find(r => r.id === selectedRole);
        if (sampleRole && sampleRole.id !== 'all') {
          return c.roleApplied === sampleRole.name;
        }
        // Check if it's a real role from API
        const role = (allRolesData as any[]).find(r => r.roleId === selectedRole);
        if (role) {
          return c.roleApplied === role.role;
        }
        return false;
      });
    }

    return filtered;
  }, [mergedPipelineData, pipelinePeriod, pipelineDate, selectedRole, allRolesData, sampleRoles]);

  const pipelineForGrouping = useMemo(
    () =>
      filteredPipelineData.map((c) => ({
        ...c,
        currentStatus: resolvePipelineGroupingStatus(c.status, c.statusNote),
      })),
    [filteredPipelineData],
  );

  const groupedPipeline = useMemo(
    () => groupCandidatesByPipelineStage(pipelineForGrouping),
    [pipelineForGrouping],
  );

  const clientPipelineSessionList = useMemo(
    () =>
      buildPipelineSessionList(
        groupedPipeline,
        CLIENT_PIPELINE_STAGE_ORDER,
        (c) => mapClientPipelineCandidate(c),
      ),
    [groupedPipeline],
  );

  const clientPipelineRoleOptions = useMemo(
    () =>
      (Array.isArray(allRolesData) ? allRolesData : []).map((role: any) => ({
        id: String(role.id || role.roleId),
        label: role.position || role.role || "Requirement",
      })),
    [allRolesData],
  );


  // Safely get first impact metrics with default values
  const firstImpactMetrics = (impactMetrics && Array.isArray(impactMetrics) && impactMetrics.length > 0) 
    ? impactMetrics[0] 
    : (impactMetrics && !Array.isArray(impactMetrics))
    ? impactMetrics
    : {
        speedToHire: 0,
        revenueImpactOfDelay: 0,
        clientNps: 0,
        candidateNps: 0,
        feedbackTurnAround: 0,
        firstYearRetentionRate: 0,
        fulfillmentRate: 0,
        revenueRecovered: 0
      };

  const speedMetrics = {
    timeToFirstSubmission: 0,
    timeToInterview: 0,
    timeToOffer: 0,
    timeToFill: 0,
    ...(speedMetricsData || {}),
  } as Record<string, number>;

  const qualityMetrics = {
    submissionToShortList: 0,
    interviewToOffer: 0,
    offerAcceptance: 0,
    earlyAttrition: 0,
    ...(qualityMetricsData || {}),
  } as Record<string, number>;

  const speedTrendData = Array.isArray(speedChartData) ? speedChartData : [];
  const qualityTrendData = Array.isArray(qualityChartData) ? qualityChartData : [];

  const metricsRoleLabel = useMemo(() => {
    if (metricsRoleFilter === 'all') return 'All roles';
    const role = (Array.isArray(allRolesData) ? allRolesData : []).find(
      (r: any) => (r.id || r.roleId) === metricsRoleFilter,
    );
    return role?.position || role?.role || resolveClientRoleDisplayId(role) || 'Selected role';
  }, [metricsRoleFilter, allRolesData]);

  const metricsCardPeriodLabel = useMemo(() => {
    if (metricsPeriod === 'overall') return 'All time (overall)';
    if (metricsPeriod === 'daily') return format(metricsDate, 'MMMM d, yyyy');
    if (metricsPeriod === 'weekly') {
      const weekStart = new Date(metricsDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `Week of ${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(metricsDate, 'MMMM yyyy');
  }, [metricsPeriod, metricsDate]);

  const chartBasisLabel = `Last 6 months · monthly rollup · ${metricsRoleLabel}`;

  const metricsReportMeta = useMemo(
    () => ({
      companyName: (clientProfile as { company?: string })?.company || "Company",
      clientName: userName,
      clientEmail: (clientProfile as { email?: string })?.email || employee?.email,
      userRole: isClientAdmin ? "Client Admin" : "Client Member",
      department: (clientProfile as { department?: string | null })?.department ?? null,
      employeeId:
        (clientProfile as { employeeId?: string })?.employeeId ||
        employee?.employeeId ||
        null,
      generatedAt: format(new Date(), "MMMM d, yyyy · h:mm a"),
      recordPeriod: metricsCardPeriodLabel,
      periodType:
        metricsPeriod === "overall"
          ? "Overall"
          : metricsPeriod.charAt(0).toUpperCase() + metricsPeriod.slice(1),
      roleFilter: metricsRoleLabel,
      chartBasisLabel,
    }),
    [
      clientProfile,
      userName,
      employee?.email,
      employee?.employeeId,
      isClientAdmin,
      metricsCardPeriodLabel,
      metricsPeriod,
      metricsRoleLabel,
      chartBasisLabel,
    ],
  );

  // Show all roles in dashboard (user requested to show all, not just 2)
  const rolesData = useMemo(() => {
    const items = Array.isArray(allRolesData) ? [...allRolesData] : [];
    return items.sort((a: any, b: any) => {
      const aDate = new Date(a.createdAt || a.lastActiveRaw || a.sharedOnRaw || 0).getTime();
      const bDate = new Date(b.createdAt || b.lastActiveRaw || b.sharedOnRaw || 0).getTime();
      return bDate - aDate;
    });
  }, [allRolesData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'Withdrawn':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handlePipelineCandidateClick = (candidate: any) => {
    if (!candidate?.id || !isPipelineApplicationSessionId(candidate.id)) {
      toast({
        title: "Cannot open candidate",
        description: "This pipeline card is not linked to a job application yet.",
        variant: "destructive",
      });
      return;
    }
    const snapshot = mapClientPipelineCandidate(candidate);
    setSessionApplicationId(snapshot.id);
    setSessionApplicantSnapshot(snapshot);
    setPipelineView('candidate-session');
  };

  const handleSelectSessionApplicant = (applicant: CandidateCommentsSessionApplicant) => {
    setSessionApplicationId(applicant.id);
    setSessionApplicantSnapshot(applicant);
  };

  const handleCloseCandidateSession = () => {
    setPipelineView('board');
    setSessionApplicationId(null);
    setSessionApplicantSnapshot(null);
  };

  const renderMainContent = () => {
    const activeTab = normalizeClientPortalTab(sidebarTab);
    switch (activeTab) {
      case 'overview':
      case 'dashboard':
        return (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SimpleClientHeader {...clientHeaderProps} />

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 px-4 py-4 md:px-6 md:py-6">
              {/* Stats Cards - Individual Cards Design (Image 2) */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
                {/* Roles Assigned - Highlighted Card */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-blue-600 md:hidden">{computedDashboardStats.rolesAssigned}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-blue-600 md:text-xs">Roles Assigned</div>
                  <div className="hidden text-2xl font-bold text-blue-600 md:block">{computedDashboardStats.rolesAssigned}</div>
                </div>

                {/* Total Positions */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Users className="h-5 w-5 text-gray-600 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-gray-900 md:hidden">{computedDashboardStats.totalPositions}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-gray-600 md:text-xs">Total Positions</div>
                  <div className="hidden text-2xl font-bold text-gray-900 md:block">{computedDashboardStats.totalPositions}</div>
                </div>

                {/* Active Roles */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Play className="h-5 w-5 text-gray-600 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-gray-900 md:hidden">{computedDashboardStats.activeRoles}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-gray-600 md:text-xs">Active Roles</div>
                  <div className="hidden text-2xl font-bold text-gray-900 md:block">{computedDashboardStats.activeRoles}</div>
                </div>

                {/* Paused Roles */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Pause className="h-5 w-5 text-gray-600 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-gray-900 md:hidden">{computedDashboardStats.pausedRoles}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-gray-600 md:text-xs">Paused Roles</div>
                  <div className="hidden text-2xl font-bold text-gray-900 md:block">{computedDashboardStats.pausedRoles}</div>
                </div>

                {/* Withdrawn Roles */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Minus className="h-5 w-5 text-orange-500 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-orange-500 md:hidden">{computedDashboardStats.withdrawnRoles}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-orange-500 md:text-xs">Withdrawn Roles</div>
                  <div className="hidden text-2xl font-bold text-orange-500 md:block">{computedDashboardStats.withdrawnRoles}</div>
                </div>

                {/* Successful Hires */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:rounded-lg md:p-4">
                  <div className="mb-2 flex items-center justify-between md:mb-3 md:justify-center">
                    <Trophy className="h-5 w-5 text-green-500 md:h-6 md:w-6" />
                    <div className="text-xl font-bold text-green-500 md:hidden">{computedDashboardStats.successfulHires}</div>
                  </div>
                  <div className="mb-1 text-[11px] font-medium text-green-500 md:text-xs">Successful Hires</div>
                  <div className="hidden text-2xl font-bold text-green-500 md:block">{computedDashboardStats.successfulHires}</div>
                </div>
              </div>

              {/* Nudge Escalation Table */}
              <ActiveNudgesTable isClientAdmin={isClientAdmin} />

              {isClientAdmin && (
                <div className="mt-6 md:hidden">
                  <NudgesTab />
                </div>
              )}

                </div>
              </div>

            </div>
          </div>
        );

      case 'req_jd':
        return (
          <div className="h-full overflow-y-auto">
            <SimpleClientHeader {...clientHeaderProps} />
            <div className="space-y-4 px-4 py-4 md:space-y-6 md:px-6 md:py-6">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
                  <div className="flex items-center justify-between gap-2 md:contents">
                    <h3 className="text-base font-bold text-gray-900 md:text-lg">JD Upload</h3>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:order-last"
                            aria-label="JD upload information"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                          {isClientAdmin
                            ? "Upload a JD file (PDF or DOCX) and role details will be fetched automatically. Assign team members after submit."
                            : "Upload a JD file (PDF or DOCX). Submitted requirements are assigned to you automatically."}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={resetJdUploadForm}
                      className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:h-10 md:w-10"
                      title="Reset JD upload"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={openJdPreviewIfValid}
                      variant="outline"
                      className="h-9 flex-1 rounded border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 sm:flex-none md:px-6"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={openJdPreviewIfValid}
                      className="h-9 flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:flex-none md:px-6"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    {/* Drag & Drop Upload - Left Side */}
                    <div className="relative">
                      <input
                        ref={jdFileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await parseJdFromFile(file);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => {
                          if (!isParsingJd) jdFileInputRef.current?.click();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            await parseJdFromFile(file);
                          }
                        }}
                        className={jdFieldBorder(
                          'jdContent',
                          'relative flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30 md:min-h-[200px] md:p-8',
                        )}
                      >
                        {isParsingJd && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/90 backdrop-blur-[2px]">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
                            <p className="text-sm font-semibold text-blue-700">Parsing job description…</p>
                            <p className="text-xs text-gray-500 mt-1">Extracting role, skills, and instructions</p>
                          </div>
                        )}
                        {uploadedFile ? (
                          <>
                            <FileText className="h-10 w-10 text-blue-500 mb-3" />
                            <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {isParsingJd ? "Parsing…" : "Click to change file"}
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-gray-400 mb-3" />
                            <p className="text-gray-700 text-sm font-medium">Drag & Drop JD File Here</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX supported</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* JD Text Area - Right Side */}
                    <div
                      onClick={() => setIsJdModalOpen(true)}
                      className={jdFieldBorder(
                        'jdContent',
                        'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30 md:min-h-[200px] md:p-8',
                      )}
                    >
                      {jdText ? (
                        <>
                          <div className="mb-3">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Edit3 className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <p className="text-green-600 text-sm font-semibold mb-1">JD Content Added</p>
                          <p className="text-xs text-gray-500">Click to edit content</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-4">
                            <Edit3 className="h-10 w-10 text-blue-500 mx-auto" />
                          </div>
                          <p className="text-gray-700 text-sm font-medium">Copy & Paste Or Write Your Own JD</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Position/Role <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={jdPosition}
                        onChange={(e) => setJdPosition(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className={jdFieldBorder(
                          'position',
                          'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        No. of Positions <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={jdPositionsInput}
                        onChange={(e) => handleJdPositionsChange(e.target.value)}
                        onBlur={handleJdPositionsBlur}
                        placeholder="1"
                        className={jdFieldBorder(
                          'positions',
                          'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                        )}
                      />
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Primary Skills <span className="text-red-500">*</span></label>
                      <Input
                        value={primarySkills}
                        onChange={(e) => setPrimarySkills(e.target.value)}
                        placeholder="e.g., React, Node.js, TypeScript"
                        className={jdFieldBorder(
                          'primarySkills',
                          'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Skills <span className="text-red-500">*</span></label>
                      <Input
                        value={secondarySkills}
                        onChange={(e) => setSecondarySkills(e.target.value)}
                        placeholder="e.g., MongoDB, AWS, Docker"
                        className={jdFieldBorder(
                          'secondarySkills',
                          'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Knowledge Only <span className="text-red-500">*</span></label>
                      <Input
                        value={knowledgeOnly}
                        onChange={(e) => setKnowledgeOnly(e.target.value)}
                        placeholder="e.g., Agile, Scrum, DevOps"
                        className={jdFieldBorder(
                          'knowledgeOnly',
                          'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions <span className="text-red-500">*</span></label>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Enter special instructions..."
                      className={jdFieldBorder(
                        'specialInstructions',
                        'bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 min-h-[100px] placeholder:text-gray-400',
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Requirements / JD */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4">
                  <h3 className="text-base font-bold text-gray-900 md:text-lg">Requirements / JD</h3>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {isClientAdmin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-[4px] border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => navigate('/archives')}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 shrink-0 rounded-[4px] bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 md:h-9 md:px-4 md:text-sm"
                      onClick={() => setIsRolesModalOpen(true)}
                      disabled={!Array.isArray(allRolesData) || allRolesData.length === 0}
                    >
                      View more
                    </Button>
                  </div>
                </div>
                <ClientRequirementsRoleMobileCards
                  roles={rolesData as ClientRequirementRoleRow[]}
                  isLoading={isLoadingRoles}
                  isClientAdmin={isClientAdmin}
                  onView={(role) => {
                    const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId);
                    setSelectedRoleForView(fullRole || role);
                    setIsViewRoleModalOpen(true);
                  }}
                  onSharedProfiles={(role) => {
                    const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId) || role;
                    const rid = fullRole?.id || fullRole?.roleId || role.roleId;
                    if (!rid) return;
                    setSharedProfilesRequirementId(String(rid));
                    setSharedProfilesRoleTitle(fullRole?.position || fullRole?.role || role.role || "");
                    setSharedProfilesOpen(true);
                  }}
                  onEdit={(role) => {
                    const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId);
                    setSelectedRoleForEdit(fullRole || role);
                    setEditJdPosition(fullRole?.role || role?.role || "");
                    setEditPositionsInput(String(Math.max(1, Number(fullRole?.noOfPositions ?? role?.noOfPositions ?? 1) || 1)));
                    setEditJdText(fullRole?.jdText || role?.jdText || "");
                    setEditPrimarySkills(fullRole?.primarySkills || role?.primarySkills || "");
                    setEditSecondarySkills(fullRole?.secondarySkills || role?.secondarySkills || "");
                    setEditKnowledgeOnly(fullRole?.knowledgeOnly || role?.knowledgeOnly || "");
                    setEditSpecialInstructions(fullRole?.specialInstructions || role?.specialInstructions || "");
                    setEditJdFile(null);
                    if (editJdFilePreviewUrl) {
                      URL.revokeObjectURL(editJdFilePreviewUrl);
                    }
                    setEditJdFilePreviewUrl(null);
                    setIsEditRoleModalOpen(true);
                  }}
                  onDelete={(roleId) => setRoleToDelete(roleId)}
                  onAssign={(role) => {
                    const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId) || role;
                    setAssignRequirement({
                      id: fullRole.id || fullRole.roleId,
                      title: fullRole.position || fullRole.role || "Requirement",
                      memberId: fullRole.assignedClientMemberId || null,
                    });
                    setAssignModalOpen(true);
                  }}
                />
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Role ID</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Recruiter</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Shared On</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Profile Shared</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                        {isClientAdmin && (
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Assign</th>
                        )}
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingRoles ? (
                        <tr>
                          <td colSpan={isClientAdmin ? 10 : 9} className="px-6 py-8 text-center text-gray-500">Loading roles...</td>
                        </tr>
                      ) : rolesData.length === 0 ? (
                        <tr>
                          <td colSpan={isClientAdmin ? 10 : 9} className="px-6 py-8 text-center text-gray-500">No roles found. Upload a JD to get started.</td>
                        </tr>
                      ) : (
                        rolesData.map((role, index) => {
                          // Status badge styling based on image 2
                          const getStatusBadgeStyle = (status: string) => {
                            if (status === 'Active') {
                              return 'bg-gray-100 text-gray-800 border-gray-200';
                            } else if (status === 'Paused') {
                              return 'bg-gray-100 text-gray-800 border-gray-200';
                            } else if (status === 'Withdrawn') {
                              return 'bg-gray-100 text-gray-800 border-gray-200';
                            }
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                          };

                          const getStatusDotColor = (status: string) => {
                            if (status === 'Active') return 'bg-blue-500';
                            if (status === 'Paused') return 'bg-red-500';
                            return 'bg-gray-500';
                          };

                          return (
                            <tr key={role.roleId || index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={role.id || role.roleId}>{resolveClientRoleDisplayId(role)}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <RequirementRoleCell
                                  title={role.role}
                                  noOfPositions={role.noOfPositions}
                                  titleClassName="text-sm font-semibold text-gray-900"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{role.team}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{role.recruiter}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{role.sharedOn}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(role.status)}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(role.status)}`}></span>
                                  {role.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{role.profilesShared}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{role.lastActive}</td>
                              {isClientAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 px-2"
                                    title={
                                      (role as { assignedMemberName?: string }).assignedMemberName
                                        ? `Assigned: ${(role as { assignedMemberName?: string }).assignedMemberName}`
                                        : "Assign member"
                                    }
                                    onClick={() => {
                                      const fullRole = (allRolesData as any[]).find(
                                        (r) => r.roleId === role.roleId,
                                      ) || role;
                                      setAssignRequirement({
                                        id: fullRole.id || fullRole.roleId,
                                        title: fullRole.position || fullRole.role || "Requirement",
                                        memberId: fullRole.assignedClientMemberId || null,
                                      });
                                      setAssignModalOpen(true);
                                    }}
                                  >
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                    {(role as { assignedMemberName?: string | null }).assignedMemberName && (
                                      <span className="max-w-[72px] truncate text-xs text-gray-600">
                                        {(role as { assignedMemberName?: string }).assignedMemberName}
                                      </span>
                                    )}
                                  </Button>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      const fullRole = (allRolesData as any[]).find(r => r.roleId === role.roleId);
                                      setSelectedRoleForView(fullRole || role);
                                      setIsViewRoleModalOpen(true);
                                    }}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      const fullRole = (allRolesData as any[]).find(r => r.roleId === role.roleId) || role;
                                      const rid = fullRole?.id || fullRole?.roleId || role.roleId;
                                      if (!rid) return;
                                      setSharedProfilesRequirementId(String(rid));
                                      setSharedProfilesRoleTitle(fullRole?.position || fullRole?.role || role.role || '');
                                      setSharedProfilesOpen(true);
                                    }}>
                                      <Users className="mr-2 h-4 w-4" />
                                      Shared Profiles
                                    </DropdownMenuItem>
                                    {isClientAdmin && (
                                      <>
                                        <DropdownMenuItem onClick={() => {
                                          const fullRole = (allRolesData as any[]).find(r => r.roleId === role.roleId);
                                          setSelectedRoleForEdit(fullRole || role);
                                          setEditJdPosition(fullRole?.role || role?.role || '');
                                          setEditPositionsInput(String(Math.max(1, Number(fullRole?.noOfPositions ?? role?.noOfPositions ?? 1) || 1)));
                                          setEditJdText(fullRole?.jdText || role?.jdText || '');
                                          setEditPrimarySkills(fullRole?.primarySkills || role?.primarySkills || '');
                                          setEditSecondarySkills(fullRole?.secondarySkills || role?.secondarySkills || '');
                                          setEditKnowledgeOnly(fullRole?.knowledgeOnly || role?.knowledgeOnly || '');
                                          setEditSpecialInstructions(fullRole?.specialInstructions || role?.specialInstructions || '');
                                          setEditJdFile(null);
                                          if (editJdFilePreviewUrl) {
                                            URL.revokeObjectURL(editJdFilePreviewUrl);
                                          }
                                          setEditJdFilePreviewUrl(null);
                                          setIsEditRoleModalOpen(true);
                                        }}>
                                          <Edit3 className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => setRoleToDelete(role.roleId)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
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
              </div>

            </div>
          </div>
        );

      case 'pipeline':
      case 'requirements': {
        const pipelineCandidateSession = sessionApplicationId ? (
          <CandidateCommentsSession
            applicationId={sessionApplicationId}
            fallbackApplicant={sessionApplicantSnapshot}
            pipelineApplicants={clientPipelineSessionList}
            onSelectApplicant={handleSelectSessionApplicant}
            onBack={handleCloseCandidateSession}
            apiMode="client"
            canViewSalaryDetails={
              isClientAdmin ||
              (clientProfile as { canSeeSalaryDetails?: boolean } | undefined)
                ?.canSeeSalaryDetails === true
            }
            viewerName={userName}
            onClientRejected={() => {
              if (!sessionApplicationId) return;
              setSessionApplicantSnapshot((prev) =>
                prev && prev.id === sessionApplicationId
                  ? { ...prev, currentStatus: "Rejected" }
                  : prev,
              );
              queryClient.invalidateQueries({ queryKey: ["/api/client/pipeline"] });
              queryClient.invalidateQueries({ queryKey: ["/api/client/dashboard-stats"] });
            }}
          />
        ) : null;

        const sharedPipelineTabProps = {
          isLoading: isLoadingPipeline,
          isEmpty: !isLoadingPipeline && filteredPipelineData.length === 0,
          groupedByStage: groupedPipeline,
          selectedRequirement,
          onRequirementChange: setSelectedRequirement,
          roleOptions: clientPipelineRoleOptions,
          pipelineDate,
          pipelinePeriod,
          onPipelineDateChange: (date: Date) => {
            setPipelinePeriod("today");
            setPipelineDate(date);
          },
          onTodayClick: () => {
            setPipelinePeriod("today");
            setPipelineDate(new Date());
          },
          onAllClick: () => {
            setPipelinePeriod("all");
            setPipelineDate(new Date());
          },
          onCandidateClick: handlePipelineCandidateClick,
          getCandidateName: (c: any) => c.candidateName || "N/A",
          getRoleApplied: (c: any) =>
            c.roleApplied || c.requirementPosition || "N/A",
          getSubtitle: (c: any) => `TA: ${c.talentAdvisorName || "N/A"}`,
          getAppliedTimestamp: (c: any) =>
            calculateDaysAgo(c.appliedDate || c.updatedAt),
          isRejectedCandidate: (c: any) =>
            isTerminalRejectedStatus(c.status, c.statusNote),
          shouldSkipCandidate: (c: any) =>
            Boolean(c.id && String(c.id).startsWith("sample-")),
          pipelineView,
          candidateSession: pipelineCandidateSession,
        };

        const closureReportsFooter = (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 md:text-lg">Closure Reports</h3>
              {closureReportsList.length > 5 ? (
                <Button
                  variant="outline"
                  className="h-7 shrink-0 border-blue-600 px-2.5 py-0 text-xs text-blue-600 hover:bg-blue-50 md:h-9 md:px-4 md:py-2 md:text-sm"
                  style={{ borderRadius: PIPELINE_BUTTON_RADIUS_PX }}
                  onClick={() => setIsClosureModalOpen(true)}
                >
                  View More
                </Button>
              ) : null}
            </div>
            <ClosureReportsCardList
              reports={closureReportsList}
              isLoading={isLoadingClosures}
              maxRows={5}
              emptyMessage="No closure reports for your assigned requirements yet."
            />
          </div>
        );

        return (
          <div className="client-pipeline-tab-layout flex h-full min-h-0 flex-col overflow-hidden">
            <SimpleClientHeader {...clientHeaderProps} />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden max-md:overflow-y-auto max-md:overflow-x-hidden">
              {isClientAdmin ? (
                <ClientPipelineTab
                  title="Pipeline"
                  {...sharedPipelineTabProps}
                  closureReportsFooter={closureReportsFooter}
                />
              ) : (
                <ClientMemberPipelineTab
                  {...sharedPipelineTabProps}
                  closureReportsFooter={closureReportsFooter}
                />
              )}
            </div>
          </div>
        );
      }

      case 'reports':
        return (
          <div className="flex h-full flex-col">
            <div className="print:hidden">
              <SimpleClientHeader {...clientHeaderProps} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
              <div
                id="metrics-print-area"
                className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 md:space-y-6 md:p-6 print:overflow-visible print:bg-white"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 md:text-xl print:text-2xl">Speed Metrics</h2>
                    <p className="mt-0.5 text-xs text-gray-500 md:text-sm print:text-sm">
                      Based on: {metricsCardPeriodLabel} · {metricsRoleLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 print:hidden md:gap-3">
                    <Select value={metricsRoleFilter} onValueChange={setMetricsRoleFilter}>
                      <SelectTrigger className="h-9 w-full min-w-[7rem] sm:w-32">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {allRolesData && Array.isArray(allRolesData) && allRolesData.length > 0 ? (
                          allRolesData.map((role: any) => (
                            <SelectItem key={role.id || role.roleId} value={role.id || role.roleId}>
                              {role.position || role.role || resolveClientRoleDisplayId(role)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="active">Active Roles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {metricsPeriod === 'daily' && (
                      <StandardDatePicker
                        value={metricsDate}
                        onChange={(date) => date && setMetricsDate(date)}
                        placeholder="Select date"
                        className="h-9 w-full min-w-[8.5rem] sm:w-44 md:w-60"
                      />
                    )}
                    {metricsPeriod === 'monthly' && (
                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <Select value={format(metricsDate, 'MMMM')} onValueChange={(month) => {
                          const monthMap: Record<string, number> = {
                            'January': 0, 'February': 1, 'March': 2, 'April': 3,
                            'May': 4, 'June': 5, 'July': 6, 'August': 7,
                            'September': 8, 'October': 9, 'November': 10, 'December': 11
                          };
                          const newDate = new Date(metricsDate);
                          newDate.setMonth(monthMap[month]);
                          setMetricsDate(newDate);
                        }}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                              <SelectItem key={month} value={month}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={metricsDate.getFullYear().toString()} onValueChange={(year) => {
                          const newDate = new Date(metricsDate);
                          newDate.setFullYear(parseInt(year));
                          setMetricsDate(newDate);
                        }}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {metricsPeriod === 'weekly' && (
                      <StandardDatePicker
                        value={metricsDate}
                        onChange={(date) => date && setMetricsDate(date)}
                        placeholder="Select week start date"
                        className="h-9 w-full min-w-[8.5rem] sm:w-44 md:w-60"
                      />
                    )}
                    <Select value={metricsPeriod} onValueChange={setMetricsPeriod}>
                      <SelectTrigger className="h-9 w-full min-w-[5.5rem] sm:w-24">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="overall">Overall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Speed Metrics Row */}
                <div className={`grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4 ${!printMetrics.speed ? 'print:hidden' : ''}`} data-metric-section="speed">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:p-4">
                    <h3 className="mb-2 text-xs font-medium text-blue-700 md:text-sm">Time to 1st Submission</h3>
                    <div className="mb-2 flex items-end space-x-3">
                      <span className="text-2xl font-bold text-blue-900 md:text-3xl">{speedMetrics.timeToFirstSubmission}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:p-4">
                    <h3 className="mb-2 text-xs font-medium text-blue-700 md:text-sm">Time to Interview</h3>
                    <div className="mb-2 flex items-end space-x-3">
                      <span className="text-2xl font-bold text-blue-900 md:text-3xl">{speedMetrics.timeToInterview}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:p-4">
                    <h3 className="mb-2 text-xs font-medium text-blue-700 md:text-sm">Time to Offer</h3>
                    <div className="mb-2 flex items-end space-x-3">
                      <span className="text-2xl font-bold text-blue-900 md:text-3xl">{speedMetrics.timeToOffer}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:p-4">
                    <h3 className="mb-2 text-xs font-medium text-blue-700 md:text-sm">Time to Fill</h3>
                    <div className="mb-2 flex items-end space-x-3">
                      <span className="text-2xl font-bold text-blue-900 md:text-3xl">{speedMetrics.timeToFill}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                    </div>
                  </div>
                </div>

                {/* Speed Metrics Trend — below cards on mobile */}
                <div className="space-y-3 print:hidden md:hidden" data-metric-section="speed-trend-mobile">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Speed Metrics Trend</h3>
                      <p className="text-xs text-gray-500">{chartBasisLabel}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500"
                      onClick={() => setExpandedChart("speed")}
                      title="Open full view"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-48 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={speedTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} stroke="#9CA3AF" />
                        <RechartsTooltip contentStyle={{ fontSize: 12, backgroundColor: "#FFF", border: "1px solid #E5E7EB" }} />
                        <Legend wrapperStyle={{ fontSize: 9 }} iconType="line" />
                        <Line type="monotone" dataKey="timeToFirstSubmission" stroke="#06B6D4" strokeWidth={2} dot={false} name="1st Submission" />
                        <Line type="monotone" dataKey="timeToInterview" stroke="#EF4444" strokeWidth={2} dot={false} name="Interview" />
                        <Line type="monotone" dataKey="timeToOffer" stroke="#A855F7" strokeWidth={2} dot={false} name="Offer" />
                        <Line type="monotone" dataKey="timeToFill" stroke="#D97706" strokeWidth={2} dot={false} name="Fill" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className={`${!printMetrics.quality ? 'print:hidden' : ''}`} data-metric-section="quality">
                  <div className="mb-3 md:mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 md:text-xl">Quality Metrics</h2>
                    <p className="mt-0.5 text-xs text-gray-500 md:text-sm print:text-sm">
                      Based on: {metricsCardPeriodLabel} · {metricsRoleLabel}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-100 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-green-700 md:text-sm">Submission to Short List %</h3>
                      <div className="mb-2 flex items-end space-x-3">
                        <span className="text-2xl font-bold text-green-800 md:text-3xl">{qualityMetrics.submissionToShortList}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-100 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-green-700 md:text-sm">Interview to Offer %</h3>
                      <div className="mb-2 flex items-end space-x-3">
                        <span className="text-2xl font-bold text-green-800 md:text-3xl">{qualityMetrics.interviewToOffer}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-100 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-green-700 md:text-sm">Offer Acceptance %</h3>
                      <div className="mb-2 flex items-end space-x-3">
                        <span className="text-2xl font-bold text-green-800 md:text-3xl">{qualityMetrics.offerAcceptance}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-100 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-green-700 md:text-sm">Early Attrition %</h3>
                      <div className="mb-2 flex items-end space-x-3">
                        <span className="text-2xl font-bold text-green-800 md:text-3xl">{qualityMetrics.earlyAttrition}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics Trend — below cards on mobile */}
                <div className="mb-6 space-y-3 print:hidden md:hidden" data-metric-section="quality-trend-mobile">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Quality Metrics Trend</h3>
                      <p className="text-xs text-gray-500">{chartBasisLabel}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500"
                      onClick={() => setExpandedChart("quality")}
                      title="Open full view"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-48 rounded-lg border border-green-100 bg-green-50 p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={qualityTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} stroke="#9CA3AF" />
                        <RechartsTooltip contentStyle={{ fontSize: 12, backgroundColor: "#FFF", border: "1px solid #E5E7EB" }} />
                        <Legend wrapperStyle={{ fontSize: 9 }} iconType="line" />
                        <Line type="monotone" dataKey="submissionToShortList" stroke="#06B6D4" strokeWidth={2} dot={false} name="Submission Rate" />
                        <Line type="monotone" dataKey="interviewToOffer" stroke="#EF4444" strokeWidth={2} dot={false} name="Interview Rate" />
                        <Line type="monotone" dataKey="offerAcceptance" stroke="#A855F7" strokeWidth={2} dot={false} name="Offer Rate" />
                        <Line type="monotone" dataKey="earlyAttrition" stroke="#D97706" strokeWidth={2} dot={false} name="Attrition" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className={`${!printMetrics.impact ? 'print:hidden' : ''}`} data-metric-section="impact">
                  <div className="mb-3 md:mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 md:text-xl">Impact Metrics</h2>
                    <p className="mt-0.5 text-xs text-gray-500 md:text-sm print:text-sm">
                      Based on: {metricsCardPeriodLabel} · {metricsRoleLabel}
                    </p>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-red-700 md:text-sm">Speed to Hire value</h3>
                      <div className="text-2xl font-bold text-red-600 md:text-3xl">{firstImpactMetrics.speedToHire}</div>
                      <div className="text-sm text-gray-600 mt-1">Days faster*</div>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-red-700 md:text-sm">Revenue Impact Of Delay</h3>
                      <div className="text-2xl font-bold text-red-600 md:text-3xl">{firstImpactMetrics.revenueImpactOfDelay}</div>
                      <div className="text-sm text-gray-600 mt-1">Lost per Role*</div>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-purple-700 md:text-sm">Client NPS</h3>
                      <div className="text-2xl font-bold text-purple-600 md:text-3xl">+{firstImpactMetrics.clientNps}</div>
                      <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-purple-700 md:text-sm">Candidate NPS</h3>
                      <div className="text-2xl font-bold text-purple-600 md:text-3xl">+{firstImpactMetrics.candidateNps}</div>
                      <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-yellow-700 md:text-sm">Feedback Turn Around</h3>
                      <div className="text-2xl font-bold text-yellow-600 md:text-3xl">{firstImpactMetrics.feedbackTurnAround}</div>
                      <div className="text-sm text-gray-600 mt-1">days</div>
                      <div className="text-xs text-gray-500 mt-1">Industry Avg. 5 days*</div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-yellow-700 md:text-sm">First Year Retention Rate</h3>
                      <div className="text-2xl font-bold text-yellow-600 md:text-3xl">{firstImpactMetrics.firstYearRetentionRate}</div>
                      <div className="mt-1 text-sm text-gray-600">%</div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-yellow-700 md:text-sm">Fulfillment Rate</h3>
                      <div className="text-2xl font-bold text-yellow-600 md:text-3xl">{firstImpactMetrics.fulfillmentRate}</div>
                      <div className="mt-1 text-sm text-gray-600">%</div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                      <h3 className="mb-2 text-xs font-medium text-yellow-700 md:text-sm">Revenue Recovered</h3>
                      <div className="text-2xl font-bold text-yellow-600 md:text-3xl">
                        {firstImpactMetrics.revenueRecovered} <span className="text-xl md:text-2xl">L</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">Gained per hire*</div>
                    </div>
                  </div>
                </div>

                {/* Drop rates — mobile (scrolls with page, not in sidebar) */}
                <div className="relative grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 print:hidden md:hidden">
                  <button
                    type="button"
                    onClick={() => setShowInterviewDropModal(true)}
                    className="rounded-lg p-2 text-center transition-colors hover:bg-gray-100"
                    data-testid="button-interview-drop-rate-mobile"
                  >
                    <div className="mb-1 text-xs text-gray-600">Interview Drop Rate</div>
                    <div className="text-xl font-bold text-gray-900">
                      {isLoadingDropRates ? "..." : `${dropRatesData?.interviewDropRate || 0}%`}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferDropModal(true)}
                    className="rounded-lg p-2 text-center transition-colors hover:bg-gray-100"
                    data-testid="button-offer-drop-rate-mobile"
                  >
                    <div className="mb-1 text-xs text-gray-600">Offer Drop Rate</div>
                    <div className="text-xl font-bold text-gray-900">
                      {isLoadingDropRates ? "..." : `${dropRatesData?.offerDropRate || 0}%`}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: "Drop Rate Information",
                        description:
                          "Interview Drop Rate: candidates who drop out during interviews. Offer Drop Rate: candidates who decline offers.",
                      });
                    }}
                    className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white shadow-md hover:bg-purple-600"
                    aria-label="Drop rate help"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Download Button */}
                <div className="mt-4 flex justify-end print:hidden md:mt-6">
                  <Button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="flex h-9 items-center gap-2 rounded bg-cyan-400 px-4 py-2 text-sm text-black shadow-lg hover:bg-cyan-500 md:h-10 md:px-6"
                    data-testid="button-download-metrics"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="w-full shrink-0 space-y-4 overflow-y-auto border-t border-gray-200 bg-white p-4 md:w-80 md:border-l md:border-t-0 md:p-6 md:space-y-6 print:hidden">
                {/* Speed Metrics Chart - desktop sidebar only */}
                <div className="hidden space-y-4 md:block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-700">Speed Metrics Trend</h3>
                      <p className="mt-0.5 text-xs leading-snug text-gray-500">{chartBasisLabel}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-800"
                      onClick={() => setExpandedChart("speed")}
                      title="Open full view"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-48 rounded-lg border border-blue-100 bg-blue-50 p-3 md:h-56 md:p-4">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={speedTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            stroke="#9CA3AF"
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            stroke="#9CA3AF"
                          />
                          <RechartsTooltip
                            contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 10 }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="timeToFirstSubmission"
                            stroke="#06B6D4"
                            strokeWidth={2}
                            dot={false}
                            name="1st Submission"
                          />
                          <Line
                            type="monotone"
                            dataKey="timeToInterview"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={false}
                            name="Interview"
                          />
                          <Line
                            type="monotone"
                            dataKey="timeToOffer"
                            stroke="#A855F7"
                            strokeWidth={2}
                            dot={false}
                            name="Offer"
                          />
                          <Line
                            type="monotone"
                            dataKey="timeToFill"
                            stroke="#D97706"
                            strokeWidth={2}
                            dot={false}
                            name="Fill"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics Chart - desktop sidebar only */}
                <div className="hidden space-y-4 md:block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-700">Quality Metrics Trend</h3>
                      <p className="mt-0.5 text-xs leading-snug text-gray-500">{chartBasisLabel}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-800"
                      onClick={() => setExpandedChart("quality")}
                      title="Open full view"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-48 rounded-lg border border-green-100 bg-green-50 p-3 md:h-56 md:p-4">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={qualityTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            stroke="#9CA3AF"
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            stroke="#9CA3AF"
                          />
                          <RechartsTooltip
                            contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 10 }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="submissionToShortList"
                            stroke="#06B6D4"
                            strokeWidth={2}
                            dot={false}
                            name="Submission Rate"
                          />
                          <Line
                            type="monotone"
                            dataKey="interviewToOffer"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={false}
                            name="Interview Rate"
                          />
                          <Line
                            type="monotone"
                            dataKey="offerAcceptance"
                            stroke="#A855F7"
                            strokeWidth={2}
                            dot={false}
                            name="Offer Rate"
                          />
                          <Line
                            type="monotone"
                            dataKey="earlyAttrition"
                            stroke="#D97706"
                            strokeWidth={2}
                            dot={false}
                            name="Attrition"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <Dialog open={expandedChart !== null} onOpenChange={(open) => !open && setExpandedChart(null)}>
                  <DialogContent className={`${CLIENT_MOBILE_DIALOG_WIDE_CLASS} md:max-w-5xl`}>
                    <DialogHeader>
                      <DialogTitle>
                        {expandedChart === "speed" ? "Speed Metrics Trend" : "Quality Metrics Trend"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="h-[min(52vh,520px)] rounded-lg border border-gray-200 bg-white p-3 md:h-[520px] md:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        {expandedChart === "speed" ? (
                          <LineChart data={speedTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
                            <RechartsTooltip contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }} />
                            <Legend />
                            <Line type="monotone" dataKey="timeToFirstSubmission" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="1st Submission" />
                            <Line type="monotone" dataKey="timeToInterview" stroke="#EF4444" strokeWidth={2.5} dot={false} name="Interview" />
                            <Line type="monotone" dataKey="timeToOffer" stroke="#A855F7" strokeWidth={2.5} dot={false} name="Offer" />
                            <Line type="monotone" dataKey="timeToFill" stroke="#D97706" strokeWidth={2.5} dot={false} name="Fill" />
                          </LineChart>
                        ) : (
                          <LineChart data={qualityTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} stroke="#9CA3AF" />
                            <RechartsTooltip contentStyle={{ fontSize: 12, backgroundColor: '#FFF', border: '1px solid #E5E7EB' }} />
                            <Legend />
                            <Line type="monotone" dataKey="submissionToShortList" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="Submission Rate" />
                            <Line type="monotone" dataKey="interviewToOffer" stroke="#EF4444" strokeWidth={2.5} dot={false} name="Interview Rate" />
                            <Line type="monotone" dataKey="offerAcceptance" stroke="#A855F7" strokeWidth={2.5} dot={false} name="Offer Rate" />
                            <Line type="monotone" dataKey="earlyAttrition" stroke="#D97706" strokeWidth={2.5} dot={false} name="Attrition" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Drop Rates Section - desktop sidebar */}
                <div className="relative hidden rounded-lg border border-gray-200 bg-gray-50 p-4 md:block">
                  {/* Interview Drop of Rate - Clickable */}
                  <button
                    onClick={() => setShowInterviewDropModal(true)}
                    className="w-full text-center mb-4 hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
                    data-testid="button-interview-drop-rate"
                  >
                    <div className="text-sm text-gray-600 mb-1">Interview Drop of Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoadingDropRates ? '...' : `${dropRatesData?.interviewDropRate || 0}%`}
                    </div>
                  </button>
                  
                  {/* Offer Drop of Rate - Clickable */}
                  <button
                    onClick={() => setShowOfferDropModal(true)}
                    className="w-full text-center hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
                    data-testid="button-offer-drop-rate"
                  >
                    <div className="text-sm text-gray-600 mb-1">Offer Drop of Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoadingDropRates ? '...' : `${dropRatesData?.offerDropRate || 0}%`}
                    </div>
                  </button>
                  
                  {/* Help Icon - Purple circle with question mark */}
                  <button
                    onClick={() => {
                      toast({
                        title: "Drop Rate Information",
                        description: "Interview Drop Rate: Percentage of candidates who drop out during interviews. Offer Drop Rate: Percentage of candidates who decline offers.",
                      });
                    }}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md z-10"
                    data-testid="button-drop-rate-help"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Interview Drop Rate Modal - Simplified */}
                <Dialog open={showInterviewDropModal} onOpenChange={setShowInterviewDropModal}>
                  <DialogContent className={CLIENT_MOBILE_DIALOG_CLASS}>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Interview Drop of Rate</DialogTitle>
                      <DialogDescription>
                        View interview drop-off rate metrics
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {isLoadingDropRates ? '...' : `${dropRatesData?.interviewDropRate || 0}%`}
                        </div>
                        <p className="text-sm text-gray-600">Candidates who drop out during interviews</p>
                        <p className="text-xs text-gray-500 mt-2">Calculated from actual interview records</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Offer Drop Rate Modal - Simplified */}
                <Dialog open={showOfferDropModal} onOpenChange={setShowOfferDropModal}>
                  <DialogContent className={CLIENT_MOBILE_DIALOG_CLASS}>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Offer Drop of Rate</DialogTitle>
                      <DialogDescription>
                        View offer drop-off rate metrics
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {isLoadingDropRates ? '...' : `${dropRatesData?.offerDropRate || 0}%`}
                        </div>
                        <p className="text-sm text-gray-600">Candidates who decline offers</p>
                        <p className="text-xs text-gray-500 mt-2">Calculated from actual application data</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="flex h-full min-h-0 flex-col">
            <SimpleClientHeader {...clientHeaderProps} />
            <ClientTeamTab />
          </div>
        );

      case 'settings':
        return (
          <div className="flex h-full min-h-0 flex-col">
            <SimpleClientHeader {...clientHeaderProps} />
            <ClientSettingsTab
              companyName={(clientProfile as any)?.company}
              userName={userName}
              userEmail={(clientProfile as any)?.email}
              isClientAdmin={isClientAdmin}
            />
          </div>
        );

      case 'nudges':
        return (
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
            <div className="flex-1 overflow-y-auto p-6">
              <NudgesTab />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleMetricCheckboxChange = (metric: 'speed' | 'quality' | 'impact') => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = selectedMetrics.speed && selectedMetrics.quality && selectedMetrics.impact;
    setSelectedMetrics({
      speed: !allSelected,
      quality: !allSelected,
      impact: !allSelected
    });
  };

  const handleReportReadyToPrint = useCallback(() => {
    const cleanupPrint = () => {
      document.body.classList.remove("client-metrics-print");
      window.removeEventListener("afterprint", cleanupPrint);
      setIsMetricsReportActive(false);
      setPrintMetrics({
        speed: true,
        quality: true,
        impact: true,
      });
      setSelectedMetrics({
        speed: false,
        quality: false,
        impact: false,
      });
    };

    window.addEventListener("afterprint", cleanupPrint);
    document.body.classList.add("client-metrics-print");
    window.print();
  }, []);

  const handleDownloadPDF = () => {
    const hasSelection = selectedMetrics.speed || selectedMetrics.quality || selectedMetrics.impact;

    if (!hasSelection) {
      toast({
        title: "No Metrics Selected",
        description: "Please select at least one metric to download.",
        variant: "destructive",
      });
      return;
    }

    setPrintMetrics({
      speed: selectedMetrics.speed,
      quality: selectedMetrics.quality,
      impact: selectedMetrics.impact,
    });

    setIsDownloadModalOpen(false);

    toast({
      title: "Preparing report",
      description: "Building your metrics document with charts. The print dialog will open shortly.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });

    setIsMetricsReportActive(true);
  };

  // Profile not linked - show access restricted message
  if (!isLoadingProfile && clientProfile && !(clientProfile as any).profileLinked) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl text-gray-900" data-testid="text-profile-not-linked-title">Profile Not Linked</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600" data-testid="text-profile-not-linked-message">
                Your client workspace access is pending. An administrator needs to link your account to a client profile before you can access the workspace.
              </p>
              <p className="text-sm text-gray-500">
                Please contact your administrator or wait for your account to be configured.
              </p>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-400 mb-4">
                  Logged in as: {(clientProfile as any).email}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50"
                  onClick={handleProfileNotLinkedSignOut}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <SignOutDialog
          open={showProfileNotLinkedSignOutDialog}
          onOpenChange={setShowProfileNotLinkedSignOutDialog}
          onConfirm={confirmProfileNotLinkedSignOut}
          userName={(clientProfile as any).email}
          isLoading={profileNotLinkedLogoutMutation.isPending || isSigningOut}
        />
      </div>
    );
  }

  const blockClientDashboard = isClientPortalUser && showClientAgreementModal;

  return (
    <div className="flex h-screen bg-gray-100">
      <ClientAgreementFirstLoginModal
        open={blockClientDashboard}
        onAccept={handleClientAgreementAccept}
      />
      <div
        className={`contents ${blockClientDashboard ? 'pointer-events-none select-none' : ''}`}
        aria-hidden={blockClientDashboard}
      >
        {/* Client Sidebar with Toggle */}
        <ClientMainSidebar
          activeTab={sidebarTab}
          onTabChange={handleSidebarTabChange}
          onExpandedChange={setIsSidebarExpanded}
          isClientAdmin={isClientAdmin}
        />

        {/* Main Content Area */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-x-hidden md:ml-16">
          {/* Middle Section */}
          <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white pb-20 md:pb-0">
            {renderMainContent()}
          </div>
        </div>
      </div>

      <ClientMobileBottomNav
        activeTab={normalizeClientPortalTab(sidebarTab)}
        items={clientMobileNavItems}
        onTabChange={handleSidebarTabChange}
      />

      <ClientMetricsReportDocument
        active={isMetricsReportActive}
        onReadyToPrint={handleReportReadyToPrint}
        printMetrics={printMetrics}
        speedMetrics={speedMetrics}
        qualityMetrics={qualityMetrics}
        impactMetrics={firstImpactMetrics}
        speedTrendData={speedTrendData}
        qualityTrendData={qualityTrendData}
        meta={metricsReportMeta}
      />

      {/* Roles Modal */}
      <Dialog open={isRolesModalOpen} onOpenChange={setIsRolesModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_WIDE_CLASS} max-h-[92vh]`}>
          <DialogHeader>
            <DialogTitle>All Roles & Status</DialogTitle>
          </DialogHeader>
          <div className="max-h-[min(70vh,560px)] overflow-y-auto md:hidden">
            <ClientRequirementsRoleMobileCards
              roles={(Array.isArray(allRolesData) ? allRolesData : []) as ClientRequirementRoleRow[]}
              isLoading={isLoadingRoles}
              isClientAdmin={isClientAdmin}
              onView={(role) => {
                const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId);
                setSelectedRoleForView(fullRole || role);
                setIsViewRoleModalOpen(true);
              }}
              onSharedProfiles={(role) => {
                const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId) || role;
                const rid = fullRole?.id || fullRole?.roleId || role.roleId;
                if (!rid) return;
                setSharedProfilesRequirementId(String(rid));
                setSharedProfilesRoleTitle(fullRole?.position || fullRole?.role || role.role || "");
                setSharedProfilesOpen(true);
                setIsRolesModalOpen(false);
              }}
              onEdit={(role) => {
                const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId);
                setSelectedRoleForEdit(fullRole || role);
                setEditJdPosition(fullRole?.role || role?.role || "");
                setEditPositionsInput(String(Math.max(1, Number(fullRole?.noOfPositions ?? role?.noOfPositions ?? 1) || 1)));
                setEditJdText(fullRole?.jdText || role?.jdText || "");
                setEditPrimarySkills(fullRole?.primarySkills || role?.primarySkills || "");
                setEditSecondarySkills(fullRole?.secondarySkills || role?.secondarySkills || "");
                setEditKnowledgeOnly(fullRole?.knowledgeOnly || role?.knowledgeOnly || "");
                setEditSpecialInstructions(fullRole?.specialInstructions || role?.specialInstructions || "");
                setEditJdFile(null);
                if (editJdFilePreviewUrl) URL.revokeObjectURL(editJdFilePreviewUrl);
                setEditJdFilePreviewUrl(null);
                setIsEditRoleModalOpen(true);
              }}
              onDelete={(roleId) => setRoleToDelete(roleId)}
              onAssign={(role) => {
                const fullRole = (allRolesData as any[]).find((r) => r.roleId === role.roleId) || role;
                setAssignRequirement({
                  id: fullRole.id || fullRole.roleId,
                  title: fullRole.position || fullRole.role || "Requirement",
                  memberId: fullRole.assignedClientMemberId || null,
                });
                setAssignModalOpen(true);
              }}
              layout="stack"
            />
          </div>
          <div className="hidden max-h-[60vh] overflow-x-auto overflow-y-auto md:block">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shared on</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles Shared</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(allRolesData) && allRolesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">No roles found.</td>
                  </tr>
                ) : (
                  (Array.isArray(allRolesData) ? allRolesData : []).map((role, index) => (
                    <tr key={role.roleId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={role.id || role.roleId}>{resolveClientRoleDisplayId(role)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <RequirementRoleCell
                          title={role.role}
                          noOfPositions={role.noOfPositions}
                          titleClassName="text-sm font-semibold text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.team}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.recruiter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.sharedOn}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                          {role.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{role.profilesShared}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastActive}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRoleForView(role);
                              setIsViewRoleModalOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const rid = role?.id || role?.roleId;
                              if (!rid) return;
                              setSharedProfilesRequirementId(String(rid));
                              setSharedProfilesRoleTitle(role?.position || role?.role || '');
                              setSharedProfilesOpen(true);
                              setIsRolesModalOpen(false);
                            }}>
                              <Users className="mr-2 h-4 w-4" />
                              Shared Profiles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedRoleForEdit(role);
                              // Initialize edit form with current values
                              setEditJdPosition(role?.role || '');
                              setEditPositionsInput(String(Math.max(1, Number(role?.noOfPositions ?? 1) || 1)));
                              setEditJdText(role?.jdText || '');
                              setEditPrimarySkills(role?.primarySkills || '');
                              setEditSecondarySkills(role?.secondarySkills || '');
                              setEditKnowledgeOnly(role?.knowledgeOnly || '');
                              setEditSpecialInstructions(role?.specialInstructions || '');
                              setEditJdFile(null);
                              if (editJdFilePreviewUrl) {
                                URL.revokeObjectURL(editJdFilePreviewUrl);
                              }
                              setEditJdFilePreviewUrl(null);
                              setIsEditRoleModalOpen(true);
                            }}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoleToDelete(role.roleId)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <ClientSharedProfilesModal
        open={sharedProfilesOpen}
        onOpenChange={(o) => {
          setSharedProfilesOpen(o);
          if (!o) setSharedProfilesRequirementId(null);
        }}
        requirementId={sharedProfilesRequirementId}
        roleTitle={sharedProfilesRoleTitle}
      />

      {/* JD Text Modal */}
      <Dialog open={isJdModalOpen} onOpenChange={setIsJdModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} md:max-w-2xl`}>
          <DialogHeader>
            <DialogTitle>Write Job Description</DialogTitle>
            <DialogDescription>
              Create a new job description for your requirement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description Content</label>
              <textarea
                value={tempJdText}
                onChange={async (e) => {
                  const text = e.target.value;
                  setTempJdText(text);
                  
                  // Parse JD text to auto-fill fields (debounced)
                  if (text.length > 100) {
                    try {
                      const response = await apiRequest('POST', '/api/client/parse-jd', { jdText: text });
                      const parsed = await response.json();
                      if (parsed.data) {
                        if (parsed.data.position && !jdPosition) {
                          setJdPosition(parsed.data.position);
                        }
                        if (parsed.data.primarySkills && !primarySkills) {
                          setPrimarySkills(parsed.data.primarySkills);
                        }
                        if (parsed.data.secondarySkills && !secondarySkills) {
                          setSecondarySkills(parsed.data.secondarySkills);
                        }
                        if (parsed.data.knowledgeOnly && !knowledgeOnly) {
                          setKnowledgeOnly(parsed.data.knowledgeOnly);
                        }
                      }
                    } catch (error) {
                      // Silent fail - parsing is optional
                    }
                  }
                }}
                placeholder="Enter your job description here..."
                className="h-48 w-full resize-none rounded border border-gray-300 p-3 text-sm md:h-64"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempJdText(jdText);
                  setIsJdModalOpen(false);
                }}
                className="rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setJdText(tempJdText);
                  setIsJdModalOpen(false);
                }}
                className="bg-cyan-400 hover:bg-cyan-500 text-black rounded"
              >
                Save JD Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* JD Preview Modal */}
      <Dialog open={isJdPreviewModalOpen} onOpenChange={setIsJdPreviewModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} md:max-w-3xl`}>
          <DialogHeader>
            <DialogTitle>Job Description Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-12rem)]">
            {/* Job Card Design */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              {/* Company Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <CompanyBrandAvatar
                  logoUrl={(clientProfile as { companyLogo?: string | null })?.companyLogo}
                  companyName={(clientProfile as { company?: string })?.company}
                  size="lg"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {(clientProfile as any)?.company || 'Company Name'}
                  </h3>
                  <p className="text-sm text-gray-500">Job Description</p>
                </div>
              </div>

              {/* Job Description Content */}
              <div className="space-y-4">
                {/* JD File Preview */}
                {uploadedFile && jdFilePreviewUrl && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">JD Document</h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      {uploadedFile.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf') ? (
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <iframe
                            src={jdFilePreviewUrl}
                            className="w-full h-[500px]"
                            title="JD PDF Preview"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Document File</p>
                              <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <a
                              href={jdFilePreviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open Document
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* JD Text Content */}
                {jdText && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">JD Text Content</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] max-h-[400px] overflow-y-auto">
                      {jdText}
                    </div>
                  </div>
                )}

                {!uploadedFile && !jdText && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h4>
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] flex items-center justify-center">
                      No job description provided. Please upload a file or enter text.
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {(primarySkills || secondarySkills || knowledgeOnly) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                    <div className="space-y-2">
                      {primarySkills && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">Primary Skills: </span>
                          <span className="text-sm text-gray-700">{primarySkills}</span>
                        </div>
                      )}
                      {secondarySkills && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">Secondary Skills: </span>
                          <span className="text-sm text-gray-700">{secondarySkills}</span>
                        </div>
                      )}
                      {knowledgeOnly && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">Knowledge Only: </span>
                          <span className="text-sm text-gray-700">{knowledgeOnly}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {specialInstructions && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
                      {specialInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsJdPreviewModalOpen(false)}
              className="rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!validateJdUploadForm()) return;

                  let jdFileUrl = null;

                  // Upload file if present
                  if (uploadedFile) {
                    const formData = new FormData();
                    formData.append('jdFile', uploadedFile);

                    const uploadResponse = await apiFileUpload('/api/client/upload-jd-file', formData);
                    const uploadData = await uploadResponse.json();
                    jdFileUrl = uploadData.url;
                  }

                  // Submit JD
                  const response = await apiRequest('POST', '/api/client/submit-jd', {
                    jdText: jdText || null,
                    jdFile: jdFileUrl,
                    position: jdPosition,
                    noOfPositions: parseInt(jdPositionsInput, 10) || 1,
                    primarySkills,
                    secondarySkills,
                    knowledgeOnly,
                    specialInstructions
                  });

                  if (response.ok) {
                    const result = await response.json().catch(() => ({}));
                    toast({
                      title: "JD Submitted",
                      description:
                        result.message ||
                        (isClientAdmin
                          ? "Your job description has been submitted successfully."
                          : "Your job description has been submitted and assigned to you."),
                    });
                    setIsJdPreviewModalOpen(false);
                    // Reset form
                    resetJdUploadForm();
                    // Refresh requirements list
                    queryClient.invalidateQueries({ queryKey: ['/api/client/requirements'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/admin/client-jds'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications-feed'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/employee/notifications-feed'] });
                  } else {
                    throw new Error('Failed to submit JD');
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to submit job description. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-cyan-400 hover:bg-cyan-500 text-black rounded"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={roleToDelete !== null} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} md:max-w-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roleToDelete) {
                  deleteRoleMutation.mutate(roleToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Role Modal */}
      <Dialog open={isViewRoleModalOpen} onOpenChange={setIsViewRoleModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} md:max-w-4xl`}>
          <DialogHeader>
            <DialogTitle>View Role Details</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-8rem)]">
            {selectedRoleForView && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role ID</label>
                    <p className="text-sm text-gray-900">{resolveClientRoleDisplayId(selectedRoleForView)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Team</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.team || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Recruiter</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.recruiter || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(selectedRoleForView.status)}`}>
                      {selectedRoleForView.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Shared On</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.sharedOn}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Profiles Shared</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.profilesShared || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Last Active</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.lastActive}</p>
                  </div>
                </div>

                {/* JD Document Section */}
                {(selectedRoleForView.jdFile || selectedRoleForView.jdText) && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Job Description</h4>

                    {/* JD File Preview */}
                    {selectedRoleForView.jdFile && (() => {
                      const storedJdUrl = resolveJdFileUrl(selectedRoleForView.jdFile);
                      return (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">JD Document</label>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                          {selectedRoleForView.jdFile.toLowerCase().endsWith('.pdf') && storedJdUrl ? (
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                              <iframe
                                src={storedJdUrl}
                                className="w-full h-[500px]"
                                title="JD PDF Preview"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Document File</p>
                                <p className="text-sm text-gray-600">{selectedRoleForView.jdFile.split('/').pop()}</p>
                              </div>
                              {storedJdUrl && (
                              <a
                                href={storedJdUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Document
                              </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })()}

                    {/* JD Text Content */}
                    {selectedRoleForView.jdText && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">JD Text Content</label>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] max-h-[400px] overflow-y-auto">
                          {selectedRoleForView.jdText}
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    {(selectedRoleForView.primarySkills || selectedRoleForView.secondarySkills || selectedRoleForView.knowledgeOnly) && (
                      <div className="mt-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Skills</label>
                        <div className="space-y-2">
                          {selectedRoleForView.primarySkills && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">Primary Skills: </span>
                              <span className="text-sm text-gray-700">{selectedRoleForView.primarySkills}</span>
                            </div>
                          )}
                          {selectedRoleForView.secondarySkills && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">Secondary Skills: </span>
                              <span className="text-sm text-gray-700">{selectedRoleForView.secondarySkills}</span>
                            </div>
                          )}
                          {selectedRoleForView.knowledgeOnly && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">Knowledge Only: </span>
                              <span className="text-sm text-gray-700">{selectedRoleForView.knowledgeOnly}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {selectedRoleForView.specialInstructions && (
                      <div className="mt-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">Special Instructions</label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
                          {selectedRoleForView.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsViewRoleModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditRoleModalOpen} onOpenChange={(open) => {
        setIsEditRoleModalOpen(open);
        if (!open) {
          // Reset form when closing
          setEditJdText('');
          setEditJdFile(null);
          if (editJdFilePreviewUrl) {
            URL.revokeObjectURL(editJdFilePreviewUrl);
          }
          setEditJdFilePreviewUrl(null);
          setEditPrimarySkills('');
          setEditSecondarySkills('');
          setEditKnowledgeOnly('');
          setEditSpecialInstructions('');
          setEditJdPosition('');
          setEditPositionsInput('1');
        }
      }}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} md:max-w-3xl`}>
          <DialogHeader>
            <DialogTitle>Edit Job Description</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-8rem)]">
            {selectedRoleForEdit && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role ID</label>
                    <p className="text-sm text-gray-900">{resolveClientRoleDisplayId(selectedRoleForEdit)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Current Role</label>
                    <p className="text-sm text-gray-900">{selectedRoleForEdit.role}</p>
                  </div>
                </div>

                {/* Position Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position/Role</label>
                  <Input
                    value={editJdPosition}
                    onChange={(e) => setEditJdPosition(e.target.value)}
                    placeholder={selectedRoleForEdit.role || "e.g., Senior Software Engineer"}
                    className="bg-white border-gray-300 rounded-md placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">No. of Positions</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={editPositionsInput}
                    onChange={(e) => setEditPositionsInput(e.target.value.replace(/[^\d]/g, ''))}
                    onBlur={() => {
                      if (!editPositionsInput.trim() || Number(editPositionsInput) < 1) {
                        setEditPositionsInput('1');
                      }
                    }}
                    placeholder="1"
                    className="bg-white border-gray-300 rounded-md [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {/* JD Upload Section */}
                <div className="grid grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditJdFile(file);
                          const fileUrl = URL.createObjectURL(file);
                          setEditJdFilePreviewUrl(fileUrl);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center min-h-[150px] flex flex-col justify-center items-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/30">
                      {editJdFile ? (
                        <>
                          <div className="mb-2">
                            <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <p className="text-green-600 text-sm font-medium mb-1">{editJdFile.name}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditJdFile(null);
                              if (editJdFilePreviewUrl) {
                                URL.revokeObjectURL(editJdFilePreviewUrl);
                              }
                              setEditJdFilePreviewUrl(null);
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove file
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-gray-700 text-sm font-medium">Upload New JD File</p>
                          <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">JD Text</label>
                    <Textarea
                      value={editJdText}
                      onChange={(e) => setEditJdText(e.target.value)}
                      placeholder={selectedRoleForEdit.jdText || "Enter job description text..."}
                      className="bg-white border-gray-300 rounded-md min-h-[150px] placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Skills</label>
                    <Input
                      value={editPrimarySkills}
                      onChange={(e) => setEditPrimarySkills(e.target.value)}
                      placeholder={selectedRoleForEdit.primarySkills || "e.g., React, Node.js, TypeScript"}
                      className="bg-white border-gray-300 rounded-md placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Skills</label>
                    <Input
                      value={editSecondarySkills}
                      onChange={(e) => setEditSecondarySkills(e.target.value)}
                      placeholder={selectedRoleForEdit.secondarySkills || "e.g., MongoDB, AWS, Docker"}
                      className="bg-white border-gray-300 rounded-md placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Knowledge Only</label>
                    <Input
                      value={editKnowledgeOnly}
                      onChange={(e) => setEditKnowledgeOnly(e.target.value)}
                      placeholder={selectedRoleForEdit.knowledgeOnly || "e.g., Agile, Scrum, DevOps"}
                      className="bg-white border-gray-300 rounded-md placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <Textarea
                    value={editSpecialInstructions}
                    onChange={(e) => setEditSpecialInstructions(e.target.value)}
                    placeholder={selectedRoleForEdit.specialInstructions || "Enter special instructions..."}
                    className="bg-white border-gray-300 rounded-md min-h-[100px] placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsEditRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!selectedRoleForEdit?.roleId) return;

                  let jdFileUrl = selectedRoleForEdit.jdFile || null;

                  // Upload new file if present
                  if (editJdFile) {
                    const formData = new FormData();
                    formData.append('jdFile', editJdFile);

                    const uploadResponse = await apiFileUpload('/api/client/upload-jd-file', formData);
                    const uploadData = await uploadResponse.json();
                    jdFileUrl = uploadData.url;
                  }

                  // Update requirement
                  const response = await apiRequest('PATCH', `/api/client/requirements/${selectedRoleForEdit.roleId}`, {
                    position: editJdPosition || selectedRoleForEdit.role,
                    noOfPositions: parseInt(editPositionsInput, 10) || selectedRoleForEdit.noOfPositions || 1,
                    jdText: editJdText || selectedRoleForEdit.jdText || null,
                    jdFile: jdFileUrl,
                    primarySkills: editPrimarySkills || selectedRoleForEdit.primarySkills || null,
                    secondarySkills: editSecondarySkills || selectedRoleForEdit.secondarySkills || null,
                    knowledgeOnly: editKnowledgeOnly || selectedRoleForEdit.knowledgeOnly || null,
                    specialInstructions: editSpecialInstructions || selectedRoleForEdit.specialInstructions || null
                  });

                  if (response.ok) {
                    toast({
                      title: "JD Updated",
                      description: "Job description has been updated successfully.",
                    });
                    setIsEditRoleModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['/api/client/requirements'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/client/dashboard-stats'] });
                  } else {
                    throw new Error('Failed to update JD');
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to update job description. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closure Reports Modal */}
      <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_WIDE_CLASS} overflow-hidden md:max-w-5xl`}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 md:text-xl">
              All Closure Reports
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-1 pb-2">
            <ClosureReportsCardList
              reports={closureReportsList}
              isLoading={isLoadingClosures}
              emptyMessage="No closure reports available"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Metrics Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className={`${CLIENT_MOBILE_DIALOG_CLASS} print:hidden md:max-w-md`}>
          <DialogHeader>
            <DialogTitle>Download Metrics as PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Select the metrics you want to include in your PDF download. Your selected metrics will be downloaded as a PDF file.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="speed-metrics"
                  checked={selectedMetrics.speed}
                  onCheckedChange={() => handleMetricCheckboxChange('speed')}
                  data-testid="checkbox-speed-metrics"
                />
                <Label
                  htmlFor="speed-metrics"
                  className="text-sm font-medium cursor-pointer"
                >
                  Speed Metrics (with graphs)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="quality-metrics"
                  checked={selectedMetrics.quality}
                  onCheckedChange={() => handleMetricCheckboxChange('quality')}
                  data-testid="checkbox-quality-metrics"
                />
                <Label
                  htmlFor="quality-metrics"
                  className="text-sm font-medium cursor-pointer"
                >
                  Quality Metrics (with graphs)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="impact-metrics"
                  checked={selectedMetrics.impact}
                  onCheckedChange={() => handleMetricCheckboxChange('impact')}
                  data-testid="checkbox-impact-metrics"
                />
                <Label
                  htmlFor="impact-metrics"
                  className="text-sm font-medium cursor-pointer"
                >
                  Impact Metrics (with graphs)
                </Label>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="select-all"
                    checked={selectedMetrics.speed && selectedMetrics.quality && selectedMetrics.impact}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <Label
                    htmlFor="select-all"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Select All
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> The selected metrics will be downloaded as a PDF file. You can use your browser's print-to-PDF function to save the document.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDownloadModalOpen(false)}
                className="rounded"
                data-testid="button-cancel-download"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-cyan-400 hover:bg-cyan-500 text-black rounded flex items-center gap-2"
                data-testid="button-confirm-download"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileSettingsModal
        open={profileSettingsOpen}
        onOpenChange={setProfileSettingsOpen}
      />
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <ClientRequirementAssignModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        requirementId={assignRequirement?.id ?? null}
        requirementTitle={assignRequirement?.title}
        currentMemberId={assignRequirement?.memberId}
      />

      {/* Chat Support */}
      <ChatDock
        open={isHelpChatOpen && !blockClientDashboard}
        onClose={() => setIsHelpChatOpen(false)}
        userName={userName}
        userRole={userRole}
      />
    </div>
  );
}
