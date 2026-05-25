import { useState, useMemo, useRef, useEffect } from 'react';
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
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Pause, User, MapPin, HandHeart, Upload, Edit3, Minus, Users, Play, Trophy, ArrowLeft, Send, Calendar as CalendarIcon, MoreVertical, HelpCircle, Download, ExternalLink, Eye, Trash2, Paperclip, Image as ImageIcon, File, Video, Link as LinkIcon, X, Smile, RotateCcw, UserCheck, Archive } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import SimpleClientHeader from '@/components/dashboard/simple-client-header';
import ClientMainSidebar from '@/components/dashboard/client-main-sidebar';
import AddCandidateModal from '@/components/dashboard/modals/add-candidate-modal';
import NudgesTab from '@/components/dashboard/tabs/nudges-tab';
import ActiveNudgesTable from "@/components/dashboard/active-nudges-table";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
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
  mapClientPipelineCandidate,
  isPipelineApplicationSessionId,
} from '@/lib/pipeline-session-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest, apiFileUpload } from '@/lib/queryClient';
import { useAuth, useEmployeeAuth } from '@/contexts/auth-context';
import ClientAgreementFirstLoginModal from '@/components/client-dashboard/client-agreement-first-login-modal';
import { ClientSharedProfilesModal } from '@/components/dashboard/modals/client-shared-profiles-modal';
import { logConsent } from '@/lib/consent-log';
import {
  CandidateCommentsSession,
  type CandidateCommentsSessionApplicant,
} from '@/components/dashboard/candidate-comments-session';
import { isClientPortalRole, isClientAdminRole } from "@shared/client-roles";
import {
  isClientPortalTabAllowed,
  normalizeClientPortalTab,
} from "@/lib/client-portal-nav";
import { ClientTeamTab } from "@/components/client-dashboard/client-team-tab";
import { ClientMembersSidebar } from "@/components/client-dashboard/client-members-sidebar";
import { ClientSettingsTab } from "@/components/client-dashboard/client-settings-tab";
import { ClientRequirementAssignModal } from "@/components/client-dashboard/client-requirement-assign-modal";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import ChangePasswordModal from "@/components/dashboard/modals/ChangePasswordModal";

export default function ClientDashboard() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
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
  const [isJdPreviewModalOpen, setIsJdPreviewModalOpen] = useState(false);
  const [jdPosition, setJdPosition] = useState('');
  const [jdNoOfPositions, setJdNoOfPositions] = useState(1);
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

  // Helper function to format Role ID shortly
  const formatRoleId = (id: string) => {
    if (!id) return 'N/A';
    if (id.includes('-')) {
      // Format UUID as ROL-XXXXXX
      return `ROL-${id.split('-')[0].substring(0, 6).toUpperCase()}`;
    }
    return id;
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
  const [editNoOfPositions, setEditNoOfPositions] = useState(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Fetch metrics data from API - with filters
  const { data: speedMetricsData } = useQuery({
    queryKey: ['/api/client/speed-metrics', metricsPeriod, metricsDate, metricsRoleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', metricsPeriod);
      params.append('date', format(metricsDate, 'yyyy-MM-dd'));
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
      params.append('date', format(metricsDate, 'yyyy-MM-dd'));
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
      params.append('date', format(metricsDate, 'yyyy-MM-dd'));
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
      params.append('date', format(metricsDate, 'yyyy-MM-dd'));
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
      params.append('date', format(metricsDate, 'yyyy-MM-dd'));
      if (metricsRoleFilter !== 'all') {
        params.append('role', metricsRoleFilter);
      }
      const response = await apiRequest('GET', `/api/client/quality-metrics-chart?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch dashboard stats from API
  const { data: dashboardStats } = useQuery({
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
    queryKey: ['/api/client/requirements'],
    placeholderData: [],
    staleTime: 0,
    refetchOnMount: 'always'
  });

  // Fetch pipeline data from API with filters
  const { data: pipelineData, isLoading: isLoadingPipeline } = useQuery({
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

  useEffect(() => {
    const normalized = normalizeClientPortalTab(sidebarTab);
    if (!isClientPortalTabAllowed(normalized, isClientAdmin)) {
      setSidebarTab('overview');
    }
  }, [isClientAdmin, sidebarTab]);

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
      clientName: (clientProfile as { name?: string })?.name || employee?.name || undefined,
      clientEmail: (clientProfile as { email?: string })?.email || employee?.email || undefined,
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

  // Filter pipeline data by period and selected roles
  const resetJdUploadForm = () => {
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
    setJdNoOfPositions(1);
    if (jdFileInputRef.current) {
      jdFileInputRef.current.value = '';
    }
  };

  const isJdFormReady = useMemo(() => {
    return (
      !!jdPosition.trim() &&
      jdNoOfPositions >= 1 &&
      !!primarySkills.trim() &&
      !!secondarySkills.trim() &&
      !!knowledgeOnly.trim() &&
      !!specialInstructions.trim() &&
      (!!uploadedFile || !!jdText.trim())
    );
  }, [jdPosition, jdNoOfPositions, primarySkills, secondarySkills, knowledgeOnly, specialInstructions, uploadedFile, jdText]);

  const openJdPreviewIfValid = () => {
    if (!isJdFormReady) {
      toast({
        title: "Required fields missing",
        description: "Please complete Position, No. of Positions, skills, special instructions, and JD file/text.",
        variant: "destructive"
      });
      return;
    }
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

  const groupedPipeline = useMemo(
    () => groupCandidatesByPipelineStage(filteredPipelineData),
    [filteredPipelineData],
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
                <div className="space-y-6 px-6 py-6">
              {/* Stats Cards - Individual Cards Design (Image 2) */}
              <div className="grid grid-cols-6 gap-4">
                {/* Roles Assigned - Highlighted Card */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-xs font-medium text-blue-600 mb-1">Roles Assigned</div>
                  <div className="text-2xl font-bold text-blue-600">{computedDashboardStats.rolesAssigned}</div>
                </div>

                {/* Total Positions */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Total Positions</div>
                  <div className="text-2xl font-bold text-gray-900">{computedDashboardStats.totalPositions}</div>
                </div>

                {/* Active Roles */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Play className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Active Roles</div>
                  <div className="text-2xl font-bold text-gray-900">{computedDashboardStats.activeRoles}</div>
                </div>

                {/* Paused Roles */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Pause className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Paused Roles</div>
                  <div className="text-2xl font-bold text-gray-900">{computedDashboardStats.pausedRoles}</div>
                </div>

                {/* Withdrawn Roles */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Minus className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-xs font-medium text-orange-500 mb-1">Withdrawn Roles</div>
                  <div className="text-2xl font-bold text-orange-500">{computedDashboardStats.withdrawnRoles}</div>
                </div>

                {/* Successful Hires */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <Trophy className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-xs font-medium text-green-500 mb-1">Successful Hires</div>
                  <div className="text-2xl font-bold text-green-500">{computedDashboardStats.successfulHires}</div>
                </div>
              </div>

              {/* Nudge Escalation Table */}
              <ActiveNudgesTable />

                </div>
              </div>

              {isClientAdmin && <ClientMembersSidebar />}
            </div>
          </div>
        );

      case 'req_jd':
        return (
          <div className="h-full overflow-y-auto">
            <SimpleClientHeader {...clientHeaderProps} />
            <div className="px-6 py-6 space-y-6">
              {!isClientAdmin && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  View-only access. Contact your Client Admin to create or update requirements.
                </p>
              )}

              {isClientAdmin && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">JD Upload</h3>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={resetJdUploadForm}
                      className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      title="Reset JD upload"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={openJdPreviewIfValid}
                      variant="outline"
                      className="px-6 py-2 rounded border-gray-300 hover:bg-gray-50"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={openJdPreviewIfValid}
                      disabled={!isJdFormReady}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Drag & Drop Upload - Left Side */}
                    <div className="relative">
                      <input
                        ref={jdFileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            const fileUrl = URL.createObjectURL(file);
                            setJdFilePreviewUrl(fileUrl);
                            
                            // Parse JD file to auto-fill fields
                            try {
                              const formData = new FormData();
                              formData.append('jdFile', file);
                              const response = await apiFileUpload('/api/client/parse-jd', formData);
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
                                if (parsed.data.specialInstructions && !specialInstructions) {
                                  setSpecialInstructions(parsed.data.specialInstructions);
                                }
                                if (parsed.data.jdText && !jdText) {
                                  setJdText(parsed.data.jdText);
                                }
                              }
                            } catch (error) {
                              console.error('Failed to parse JD:', error);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => jdFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            const fileUrl = URL.createObjectURL(file);
                            setJdFilePreviewUrl(fileUrl);
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors h-full min-h-[200px] flex flex-col items-center justify-center"
                      >
                        {uploadedFile ? (
                          <>
                            <FileText className="h-10 w-10 text-blue-500 mb-3" />
                            <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Click to change file</p>
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors min-h-[200px] flex flex-col items-center justify-center"
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

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Position/Role <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={jdPosition}
                        onChange={(e) => setJdPosition(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        No. of Positions <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={jdNoOfPositions}
                        onChange={(e) => setJdNoOfPositions(Math.max(1, parseInt(e.target.value || '1', 10) || 1))}
                        className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Skills <span className="text-red-500">*</span></label>
                      <Input
                        value={primarySkills}
                        onChange={(e) => setPrimarySkills(e.target.value)}
                        placeholder="e.g., React, Node.js, TypeScript"
                        className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Skills <span className="text-red-500">*</span></label>
                      <Input
                        value={secondarySkills}
                        onChange={(e) => setSecondarySkills(e.target.value)}
                        placeholder="e.g., MongoDB, AWS, Docker"
                        className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Knowledge Only <span className="text-red-500">*</span></label>
                      <Input
                        value={knowledgeOnly}
                        onChange={(e) => setKnowledgeOnly(e.target.value)}
                        placeholder="e.g., Agile, Scrum, DevOps"
                        className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions <span className="text-red-500">*</span></label>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Enter special instructions..."
                      className="bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 min-h-[100px] placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Requirements / JD */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900">Requirements / JD</h3>
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
                      className="shrink-0 rounded-[4px] bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setIsRolesModalOpen(true)}
                      disabled={!Array.isArray(allRolesData) || allRolesData.length === 0}
                    >
                      View more
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={role.roleId}>{formatRoleId(role.roleId)}</td>
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
                                          setEditNoOfPositions(Math.max(1, Number(fullRole?.noOfPositions ?? role?.noOfPositions ?? 1) || 1));
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
                  ? { ...prev, currentStatus: "Screened Out" }
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
          isRejectedCandidate: (c: any) => {
            const s = (c.currentStatus || c.status || "").toLowerCase();
            return s.includes("reject") || s.includes("screened out");
          },
          shouldSkipCandidate: (c: any) =>
            Boolean(c.id && String(c.id).startsWith("sample-")),
          pipelineView,
          candidateSession: pipelineCandidateSession,
        };

        const closureReportsFooter = (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Closure Reports</h3>
              {closureReportsList.length > 5 ? (
                <Button
                  variant="outline"
                  className="border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
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
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SimpleClientHeader {...clientHeaderProps} />
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
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
          <div className="flex flex-col h-full">
            {/* Simple Client Header */}
            <div className="print:hidden">
              <SimpleClientHeader {...clientHeaderProps} />
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Main Content Area */}
              <div id="metrics-print-area" className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
                {/* Header with controls */}
                <div className="flex justify-between items-center print:mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 print:text-2xl">Speed Metrics</h2>
                  <div className="flex items-center space-x-4 print:hidden">
                    <Select value={metricsRoleFilter} onValueChange={setMetricsRoleFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {allRolesData && Array.isArray(allRolesData) && allRolesData.length > 0 ? (
                          allRolesData.map((role: any) => (
                            <SelectItem key={role.id || role.roleId} value={role.id || role.roleId}>{role.position || role.role || role.roleId}</SelectItem>
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
                        className="w-60"
                      />
                    )}
                    {metricsPeriod === 'monthly' && (
                      <div className="flex gap-2">
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
                        className="w-60"
                      />
                    )}
                    <Select value={metricsPeriod} onValueChange={setMetricsPeriod}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Speed Metrics Row */}
                <div className={`grid grid-cols-4 gap-4 ${!printMetrics.speed ? 'print:hidden' : ''}`} data-metric-section="speed">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Time to 1st Submission</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToFirstSubmission}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Interview</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToInterview}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Offer</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToOffer}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Fill</h3>
                    <div className="flex items-end space-x-3 mb-2">
                      <span className="text-3xl font-bold text-blue-900">{speedMetricsData.timeToFill}</span>
                      <span className="text-sm text-blue-700 mb-1">days</span>
                      <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className={`${!printMetrics.quality ? 'print:hidden' : ''}`} data-metric-section="quality">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Metrics</h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-medium text-green-700 mb-2">Submission to Short List %</h3>
                      <div className="flex items-end space-x-3 mb-2">
                        <span className="text-3xl font-bold text-green-800">{qualityMetricsData.submissionToShortList}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-medium text-green-700 mb-2">Interview to Offer %</h3>
                      <div className="flex items-end space-x-3 mb-2">
                        <span className="text-3xl font-bold text-green-800">{qualityMetricsData.interviewToOffer}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-medium text-green-700 mb-2">Offer Acceptance %</h3>
                      <div className="flex items-end space-x-3 mb-2">
                        <span className="text-3xl font-bold text-green-800">{qualityMetricsData.offerAcceptance}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                      </div>
                    </div>

                    <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-medium text-green-700 mb-2">Early Attrition %</h3>
                      <div className="flex items-end space-x-3 mb-2">
                        <span className="text-3xl font-bold text-green-800">{qualityMetricsData.earlyAttrition}</span>
                        <span className="text-sm text-green-700 mb-1">%</span>
                        <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className={`${!printMetrics.impact ? 'print:hidden' : ''}`} data-metric-section="impact">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Metrics</h2>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h3 className="text-sm font-medium text-red-700 mb-2">Speed to Hire value</h3>
                      <div className="text-3xl font-bold text-red-600">{firstImpactMetrics.speedToHire}</div>
                      <div className="text-sm text-gray-600 mt-1">Days faster*</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h3 className="text-sm font-medium text-red-700 mb-2">Revenue Impact Of Delay</h3>
                      <div className="text-3xl font-bold text-red-600">{firstImpactMetrics.revenueImpactOfDelay}</div>
                      <div className="text-sm text-gray-600 mt-1">Lost per Role*</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Client NPS</h3>
                      <div className="text-3xl font-bold text-purple-600">+{firstImpactMetrics.clientNps}</div>
                      <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-700 mb-2">Candidate NPS</h3>
                      <div className="text-3xl font-bold text-purple-600">+{firstImpactMetrics.candidateNps}</div>
                      <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-700 mb-2">Feedback Turn Around</h3>
                      <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.feedbackTurnAround}</div>
                      <div className="text-sm text-gray-600 mt-1">days</div>
                      <div className="text-xs text-gray-500 mt-1">Industry Avg. 5 days*</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-700 mb-2">First Year Retention Rate</h3>
                      <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.firstYearRetentionRate}</div>
                      <div className="text-sm text-gray-600 mt-1">%</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-700 mb-2">Fulfillment Rate</h3>
                      <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.fulfillmentRate}</div>
                      <div className="text-sm text-gray-600 mt-1">%</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-sm font-medium text-yellow-700 mb-2">Revenue Recovered</h3>
                      <div className="text-3xl font-bold text-yellow-600">{firstImpactMetrics.revenueRecovered} <span className="text-2xl">L</span></div>
                      <div className="text-sm text-gray-600 mt-1">Gained per hire*</div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-end mt-6 print:hidden">
                  <Button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded shadow-lg flex items-center gap-2"
                    data-testid="button-download-metrics"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Right Sidebar with Charts */}
              <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto print:hidden">
                {/* Speed Metrics Chart - 4 Lines */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Speed Metrics Trend</h3>
                  <div className="h-56 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={speedChartData}>
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
                          <Tooltip
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

                {/* Quality Metrics Chart - 4 Lines */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Quality Metrics Trend</h3>
                  <div className="h-56 bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={qualityChartData}>
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
                          <Tooltip
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

                {/* Drop Rates Section - Fully Functional */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
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
                  <DialogContent className="sm:max-w-md">
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
                  <DialogContent className="sm:max-w-md">
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
      impact: selectedMetrics.impact
    });

    setIsDownloadModalOpen(false);

    toast({
      title: "Download Confirmation",
      description: "Your metrics will be downloaded as a PDF file. Use your browser's print dialog to save as PDF.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });

    setTimeout(() => {
      window.print();

      setPrintMetrics({
        speed: true,
        quality: true,
        impact: true
      });

      setSelectedMetrics({
        speed: false,
        quality: false,
        impact: false
      });
    }, 500);
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
                  onClick={() => logout()}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
        <div className="flex min-h-0 min-w-0 flex-1 ml-16 overflow-x-hidden">
          {/* Middle Section */}
          <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Roles Modal */}
      <Dialog open={isRolesModalOpen} onOpenChange={setIsRolesModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Roles & Status</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={role.roleId}>{formatRoleId(role.roleId)}</td>
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
                              setEditNoOfPositions(Math.max(1, Number(role?.noOfPositions ?? 1) || 1));
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
        <DialogContent className="max-w-2xl">
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
                className="w-full h-64 border border-gray-300 rounded p-3 resize-none text-sm"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Job Description Preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-12rem)]">
            {/* Job Card Design */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              {/* Company Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {(clientProfile as any)?.company && (clientProfile as any).company !== 'Loading...'
                    ? (clientProfile as any).company.charAt(0).toUpperCase()
                    : 'C'}
                </div>
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
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
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
                  if (!isJdFormReady) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill all required JD fields before submitting.",
                      variant: "destructive"
                    });
                    return;
                  }

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
                    noOfPositions: jdNoOfPositions,
                    primarySkills,
                    secondarySkills,
                    knowledgeOnly,
                    specialInstructions
                  });

                  if (response.ok) {
                    toast({
                      title: "JD Submitted",
                      description: "Your job description has been submitted successfully.",
                    });
                    setIsJdPreviewModalOpen(false);
                    // Reset form
                    resetJdUploadForm();
                    // Refresh requirements list
                    queryClient.invalidateQueries({ queryKey: ['/api/client/requirements'] });
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
        <AlertDialogContent>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>View Role Details</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-8rem)]">
            {selectedRoleForView && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role ID</label>
                    <p className="text-sm text-gray-900">{selectedRoleForView.roleId}</p>
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
                    {selectedRoleForView.jdFile && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-600 mb-2 block">JD Document</label>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                          {selectedRoleForView.jdFile.toLowerCase().endsWith('.pdf') ? (
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                              <iframe
                                src={selectedRoleForView.jdFile}
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
                              <a
                                href={selectedRoleForView.jdFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
          setEditNoOfPositions(1);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Job Description</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-8rem)]">
            {selectedRoleForEdit && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role ID</label>
                    <p className="text-sm text-gray-900">{selectedRoleForEdit.roleId}</p>
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
                    type="number"
                    min={1}
                    value={editNoOfPositions}
                    onChange={(e) => setEditNoOfPositions(Math.max(1, parseInt(e.target.value || '1', 10) || 1))}
                    className="bg-white border-gray-300 rounded-md"
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
                    noOfPositions: editNoOfPositions || selectedRoleForEdit.noOfPositions || 1,
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
        <DialogContent className="mx-auto max-h-[80vh] max-w-5xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
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
        <DialogContent className="max-w-md print:hidden">
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
