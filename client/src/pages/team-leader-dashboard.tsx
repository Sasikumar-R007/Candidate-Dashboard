import { useState, useMemo, useEffect, useCallback } from 'react';
import TeamLeaderMainSidebar from '@/components/dashboard/team-leader-main-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamLeaderTeamBoxes from '@/components/dashboard/team-leader-team-boxes';
import TeamLeaderSidebar from '@/components/dashboard/team-leader-sidebar';
import TeamLeaderPerformanceGauge from '@/components/dashboard/team-leader-performance-gauge';
import AllQuartersTargetDialog from '@/components/dashboard/all-quarters-target-dialog';
import AddRequirementModal from '@/components/dashboard/modals/add-requirement-modal';
import JobDescriptionDetailsModal from '@/components/dashboard/modals/job-description-details-modal';
import { JdVisibilityModal } from '@/components/dashboard/modals/jd-visibility-modal';
import PostJobModal from '@/components/dashboard/modals/PostJobModal';
import UploadResumeModal from '@/components/dashboard/modals/UploadResumeModal';
import DailyDeliveryModal from '@/components/dashboard/modals/daily-delivery-modal';
import NudgesTab from '@/components/dashboard/tabs/nudges-tab';
import ActiveNudgesTable from "@/components/dashboard/active-nudges-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildStreqDisplayMap,
  getRequirementLookupId,
  getRequirementTaSplitMeta,
  getRequirementSplitBadgeLabel,
  parseRequirementJdVisibility,
  resolveRequirementDisplayId,
} from "@shared/requirement-jd-extras";
import { getRequirementResumeTarget } from "@shared/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, EditIcon, MoreVertical, Mail, UserRound, Plus, ExternalLink, Eye, Search, ArrowUp, Flag, Trophy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ChatDock } from '@/components/chat/chat-dock';
import { ChatModal } from '@/components/chat/admin-chat-modal';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { SearchBar } from '@/components/ui/search-bar';
import { useAuth, useEmployeeAuth } from '@/contexts/auth-context';
import { useStaggeredDashboardLoad } from '@/lib/use-staggered-dashboard-load';
import type { Requirement, Employee } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { adminCandidatesQueryOptions } from '@/lib/admin-candidates-query';
import {
  CandidateCommentsSession,
  type CandidateCommentsSessionApplicant,
} from '@/components/dashboard/candidate-comments-session';
import {
  TL_PIPELINE_STAGE_ORDER,
  buildPipelineSessionList,
  groupCandidatesByPipelineStage,
  mapTeamLeaderPipelineCandidate,
} from '@/lib/pipeline-session-utils';
import { useOpenCommentSessionListener } from '@/lib/open-comment-session';
import { useIsMobile, getIsMobileViewport } from "@/hooks/use-mobile";
import { TlPipelineTab } from '@/components/dashboard/tl-pipeline-tab';
import { ClosureReportsCardList } from '@/components/dashboard/closure-reports-card-list';

// Helper function to format numbers in Indian currency format
const formatIndianCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value).replace('₹', '').trim();
};

const formatMetricCount = (value: number | string | null | undefined): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = Number.isFinite(numericValue) ? Number(numericValue) : 0;
  return String(Math.max(0, Math.round(safeValue))).padStart(2, '0');
};

type TeamPerformanceRow = {
  member: string;
  requirements: number;
  profilesDelivered?: number;
  profilesRequired?: number;
  closures?: number;
};

function getPerformanceBadgeStyles(grade?: string) {
  switch (grade) {
    case 'A':
      return { label: 'A', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', title: 'Average performance' };
    case 'B':
      return { label: 'B', badgeBg: 'bg-red-100', badgeText: 'text-red-700', title: 'Below target' };
    default:
      return { label: 'G', badgeBg: 'bg-green-100', badgeText: 'text-green-700', title: 'Good performance' };
  }
}

interface PerformanceChartProps {
  data: TeamPerformanceRow[];
  height?: string;
}

function PerformanceChart({ data, height = "100%" }: PerformanceChartProps) {
  const maxVal = Math.max(
    1,
    ...data.flatMap((row) => [
      row.requirements || 0,
      row.profilesDelivered || 0,
      row.closures || 0,
    ]),
  );
  const yMax = Math.max(5, Math.ceil(maxVal * 1.15));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="member"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={52}
        />
        <YAxis
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          domain={[0, yMax]}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Bar dataKey="requirements" name="Requirements" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="profilesDelivered" name="Profiles Delivered" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="closures" name="Closures" fill="#a855f7" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function TeamLeaderDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const employee = useEmployeeAuth();
  const { requirementsReady, pipelineReady, closuresReady } = useStaggeredDashboardLoad();
  const isMobile = useIsMobile();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // ALL useState hooks MUST be here at the top, before any conditionals
  // Restore sidebarTab from sessionStorage for proper back navigation
  const initialSidebarTab = () => {
    if (getIsMobileViewport()) {
      return "pipeline";
    }
    const saved = sessionStorage.getItem('tlDashboardSidebarTab');
    sessionStorage.removeItem('tlDashboardSidebarTab');
    if (saved === 'chat') return 'dashboard';
    return saved ? saved : 'dashboard';
  };
  
  const [sidebarTab, setSidebarTab] = useState(initialSidebarTab());

  useEffect(() => {
    const handleNotificationNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: string; storageKey?: string }>).detail;
      if (detail?.storageKey && detail.storageKey !== "tlDashboardSidebarTab") return;
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

  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('team');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isClosureDetailsModalOpen, setIsClosureDetailsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [assignments, setAssignments] = useState<{[key: string]: string}>({'mobile-app-dev': 'Arun'});
  const [isReallocating, setIsReallocating] = useState(false);
  const [isAssignmentConfirmOpen, setIsAssignmentConfirmOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [jdText, setJdText] = useState<string>('');
  const [splitRequirementEnabled, setSplitRequirementEnabled] = useState(false);
  const [taSplitRows, setTaSplitRows] = useState<
    Array<{ talentAdvisor: string; noOfPositions: string }>
  >([{ talentAdvisor: "", noOfPositions: "1" }, { talentAdvisor: "", noOfPositions: "1" }]);
  const [selectedJD, setSelectedJD] = useState<Requirement | null>(null);
  const [isJDPreviewModalOpen, setIsJDPreviewModalOpen] = useState(false);
  const [isJdVisibilityModalOpen, setIsJdVisibilityModalOpen] = useState(false);
  const [jdVisibilityRequirement, setJdVisibilityRequirement] = useState<any | null>(null);
  const [jdVisibilityValue, setJdVisibilityValue] = useState(true);
  const [pendingJobStatusById, setPendingJobStatusById] = useState<Record<string, string>>({});
  const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false);
  const [isViewMoreRequirementsModalOpen, setIsViewMoreRequirementsModalOpen] = useState(false);
  const [isViewClosuresModalOpen, setIsViewClosuresModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isDefaultedModalOpen, setIsDefaultedModalOpen] = useState(false);
  const [isMeetingsModalOpen, setIsMeetingsModalOpen] = useState(false);
  const [isCeoCommentsModalOpen, setIsCeoCommentsModalOpen] = useState(false);
  const [isPerformanceGraphModalOpen, setIsPerformanceGraphModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState<'team' | 'private'>('team');
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);
  const [selectedDailyMetricsFilter, setSelectedDailyMetricsFilter] = useState('overall');
  const [requirementSearch, setRequirementSearch] = useState('');
  const [selectedPerformanceMember, setSelectedPerformanceMember] = useState<string>('all');
  const [teamMembersSearch, setTeamMembersSearch] = useState('');
  const [selectedPipelineRecruiter, setSelectedPipelineRecruiter] = useState<string>('all');
  const [pipelineDate, setPipelineDate] = useState<Date | null>(null);
  const [pipelineView, setPipelineView] = useState<"board" | "candidate-session">("board");
  const [sessionApplicationId, setSessionApplicationId] = useState<string | null>(null);
  const [sessionApplicantSnapshot, setSessionApplicantSnapshot] =
    useState<CandidateCommentsSessionApplicant | null>(null);
  
  const [teamChatMessages, setTeamChatMessages] = useState([
    { id: 1, sender: "John Mathew", message: "Good morning team! Please review the requirements for today", time: "9:00 AM", isOwn: true },
    { id: 2, sender: "Kavitha", message: "Good morning sir. I've reviewed the Frontend Developer position. Ready to proceed.", time: "9:05 AM", isOwn: false },
    { id: 3, sender: "Rajesh", message: "Working on the UI/UX Designer requirement. Will update shortly.", time: "9:10 AM", isOwn: false },
    { id: 4, sender: "Sowmiya", message: "Backend Developer position - I have 2 potential candidates to share", time: "9:15 AM", isOwn: false },
    { id: 5, sender: "John Mathew", message: "Great! Please share the profiles by EOD today", time: "9:20 AM", isOwn: true },
    { id: 6, sender: "Kalaiselvi", message: "QA Tester requirement - interviewed 3 candidates yesterday", time: "9:25 AM", isOwn: false },
    { id: 7, sender: "Malathi", message: "Mobile App Developer role - client wants to schedule interviews", time: "9:30 AM", isOwn: false }
  ]);

  const [privateChatMessages, setPrivateChatMessages] = useState<{[key: string]: any[]}>({
    'arun-hr': [
      { id: 1, sender: "Arun Kumar", message: "Hi John, need to discuss the new hire onboarding process", time: "10:30 AM", isOwn: false },
      { id: 2, sender: "John Mathew", message: "Sure, let's schedule a meeting for tomorrow", time: "10:35 AM", isOwn: true }
    ],
    'priya-client': [
      { id: 1, sender: "Priya Singh", message: "The client wants to increase the requirements count", time: "11:00 AM", isOwn: false },
      { id: 2, sender: "John Mathew", message: "Let me check our capacity and get back to you", time: "11:05 AM", isOwn: true }
    ],
    'david-ceo': [
      { id: 1, sender: "David Johnson", message: "Great work on this quarter's targets!", time: "2:00 PM", isOwn: false },
      { id: 2, sender: "John Mathew", message: "Thank you sir! The team has been working hard", time: "2:05 PM", isOwn: true }
    ],
    'sarah-ops': [
      { id: 1, sender: "Sarah Williams", message: "Can we review the resource allocation for next month?", time: "3:30 PM", isOwn: false },
      { id: 2, sender: "John Mathew", message: "Yes, I'll prepare the report by Friday", time: "3:35 PM", isOwn: true }
    ]
  });

  // Handle sending new chat messages
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        sender: "John Mathew",
        message: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      
      if (chatType === 'team') {
        setTeamChatMessages([...teamChatMessages, newMsg]);
      } else if (activeChatUser && chatType === 'private') {
        setPrivateChatMessages(prev => ({
          ...prev,
          [activeChatUser]: [...(prev[activeChatUser] || []), newMsg]
        }));
      }
      setNewMessage("");
    }
  };

  // Handle starting private chat
  const handleStartPrivateChat = (userId: string) => {
    setChatType('private');
    setActiveChatUser(userId);
  };

  // Handle switching back to team chat
  const handleSwitchToTeamChat = () => {
    setChatType('team');
    setActiveChatUser(null);
  };

  // Get current chat messages
  const getCurrentChatMessages = () => {
    if (chatType === 'team') {
      return teamChatMessages;
    } else if (activeChatUser && chatType === 'private') {
      return privateChatMessages[activeChatUser] || [];
    }
    return [];
  };

  // Get current chat title
  const getCurrentChatTitle = () => {
    if (chatType === 'team') {
      return 'Team Chat - Requirements Discussion';
    } else if (activeChatUser) {
      const contact = [...chatTeamMembers, ...individualContacts].find(c => c.id === activeChatUser);
      return `Private Chat - ${contact?.name || 'Unknown'}`;
    }
    return 'Chat';
  };

  // Use API data - declare queries before useMemo hooks that depend on them
  const { data: teamLeaderProfile } = useQuery({
    queryKey: ['/api/team-leader/profile'],
  });
  const userName = teamLeaderProfile?.name || employee?.name || "Team Leader User";
  const userRole = employee?.role || 'team_leader';

  // Fetch team leader stats for profile metrics
  const { data: teamLeaderStats } = useQuery({
    queryKey: ['/api/team-leader/stats'],
  });

  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/team-leader/team-members'],
  });

  const { data: targetMetrics } = useQuery({
    queryKey: ['/api/team-leader/target-metrics'],
  });

  const { data: aggregatedTargets } = useQuery<any>({
    queryKey: ['/api/team-leader/aggregated-targets'],
  });

  const { data: dailyMetrics } = useQuery<any>({
    queryKey: ['/api/team-leader/daily-metrics', format(selectedDate, 'yyyy-MM-dd'), selectedDailyMetricsFilter],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;
      const response = await fetch(createApiUrl(`/api/team-leader/daily-metrics?date=${dateStr}&memberId=${selectedDailyMetricsFilter}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch daily metrics');
      return response.json();
    },
    enabled: !!employee,
  });

  // Fetch pipeline counts for the right sidebar
  const { data: pipelineCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ['/api/team-leader/pipeline-counts'],
    enabled: !!employee && pipelineReady,
  });

  const { data: meetings = [], isLoading: isLoadingMeetings, isError: isErrorMeetings } = useQuery<any[]>({
    queryKey: ['/api/team-leader/meetings'],
  });

  // Fetch chat rooms for TL (direct messages with Admin/TA)
  const { data: chatRoomsData, isLoading: isLoadingChatRooms, refetch: refetchChatRooms } = useQuery<{ rooms: any[] }>({
    queryKey: ['/api/chat/rooms'],
    enabled: !!employee,
  });

  // Filter chat rooms to show only direct messages (Admin-TL/TA conversations)
  const tlChatRooms = useMemo(() => {
    if (!chatRoomsData?.rooms) return [];
    return chatRoomsData.rooms.filter((room: any) => {
      // Only show direct messages
      if (room.type !== 'direct') return false;
      // Check if room has participants (should have Admin or TA)
      const participants = room.participants || [];
      return participants.some((p: any) => p.participantId !== employee?.id);
    });
  }, [chatRoomsData, employee?.id]);

  const { data: detailedMeetings = [], isLoading: isLoadingDetailedMeetings } = useQuery<any[]>({
    queryKey: ['/api/team-leader/meetings/details'],
    enabled: !!employee,
  });

  const { data: ceoComments = [], isLoading: isLoadingCeoComments, isError: isErrorCeoComments } = useQuery<any[]>({
    queryKey: ['/api/team-leader/ceo-comments'],
  });

  const combinedCeoFeed = useMemo(() => {
    const items: Array<{
      id: string;
      kind: 'command' | 'message';
      label: string;
      text: string;
      unread?: number;
      roomId?: string;
    }> = [];

    tlChatRooms.forEach((room: any) => {
      const otherParticipant = room.participants?.find((p: any) => p.participantId !== employee?.id);
      const participantName = otherParticipant?.participantName || 'Unknown';
      const participantRole = otherParticipant?.participantRole || '';
      const roleLabel =
        participantRole === 'recruiter' ? 'TA' : participantRole === 'admin' ? 'Admin' : '';
      const unreadCount = room.unreadCount || 0;
      items.push({
        id: `chat-${room.id}`,
        kind: 'message',
        label: `Message · ${participantName}${roleLabel ? ` (${roleLabel})` : ''}`,
        text:
          unreadCount > 0
            ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
            : 'Click to open conversation',
        unread: unreadCount,
        roomId: room.id,
      });
    });

    if (Array.isArray(ceoComments)) {
      ceoComments.forEach((comment: any) => {
        items.push({
          id: `ceo-${comment.id}`,
          kind: 'command',
          label: 'CEO Command',
          text: comment.comment,
        });
      });
    }

    return items;
  }, [tlChatRooms, ceoComments, employee?.id]);

  const tlProfileId =
    (teamLeaderProfile as { employeeId?: string } | undefined)?.employeeId || employee?.employeeId;

  // Fetch pipeline data for team leader
  const { data: pipelineData = [], isLoading: isLoadingPipeline, isError: isErrorPipeline, refetch: refetchPipeline } = useQuery<any[]>({
    queryKey: ['/api/team-leader/pipeline', selectedPipelineRecruiter, pipelineDate !== null ? format(pipelineDate, 'yyyy-MM-dd') : 'all'],
    enabled: !!employee && pipelineReady,
    queryFn: async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;
      const params = new URLSearchParams();
      if (selectedPipelineRecruiter && selectedPipelineRecruiter !== 'all') {
        params.append('ta', selectedPipelineRecruiter);
      }
      const url = `/api/team-leader/pipeline${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(createApiUrl(url), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pipeline data');
      return response.json();
    },
  });

  // Fetch requirements from API
  const { data: requirementsData = [], isLoading: isLoadingRequirements } = useQuery<Requirement[]>({
    queryKey: ['/api/team-leader/requirements'],
    enabled: !!employee && requirementsReady,
  });

  const visibleRequirementsData = requirementsData as any[];

  const streqDisplayMap = useMemo(() => {
    const byRealId = new Map<string, { id: string; createdAt?: string; sourceDetails?: string | null }>();
    for (const req of visibleRequirementsData) {
      const realId = getRequirementLookupId(req);
      if (!realId || byRealId.has(realId)) continue;
      byRealId.set(realId, {
        id: realId,
        createdAt: req.createdAt,
        sourceDetails: req.sourceDetails,
      });
    }
    return buildStreqDisplayMap(Array.from(byRealId.values()));
  }, [visibleRequirementsData]);

  const getRequirementDisplayId = (requirement: any) => {
    const fromApi = requirement.displayRequirementId?.trim();
    if (fromApi && /^STREQ\d+$/i.test(fromApi)) {
      return fromApi.toUpperCase();
    }
    return resolveRequirementDisplayId(
      requirement,
      streqDisplayMap.get(getRequirementLookupId(requirement)),
    );
  };

  // Fetch team performance data from API
  const { data: teamPerformanceData = [] } = useQuery<any[]>({
    queryKey: ['/api/team-leader/team-performance'],
    enabled: !!employee,
  });

  // Fetch closures data from API
  const { data: closureData = [], isLoading: isLoadingClosures } = useQuery<any[]>({
    queryKey: ['/api/team-leader/closures'],
    enabled: !!employee && closuresReady,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/team-leader/closures');
      if (!response.ok) throw new Error('Failed to fetch closures');
      return response.json();
    },
  });

  const tlClosureReportsForPipeline = useMemo(
    () =>
      (closureData as any[]).map((closure: any) => ({
        id: closure.id,
        candidate: closure.name || closure.candidate || "N/A",
        position: closure.position || "N/A",
        client: closure.company || closure.client || "N/A",
        talentAdvisor: closure.talentAdvisor || "Unassigned",
        quarter: closure.closureMonth || closure.quarter || "N/A",
        offeredDate: closure.offeredDate || "—",
        joinedDate: closure.joinedDate || "—",
      })),
    [closureData],
  );

  const { data: sourcingJobCounts } = useQuery<{ total: number; active: number; closed: number; draft: number }>({
    queryKey: ['/api/team-leader/sourcing/jobs-counts', employee?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/recruiter/jobs/counts');
      return await response.json();
    },
    enabled: !!employee && employee.role === 'team_leader',
  });

  const { data: sourcingCandidateCounts } = useQuery<{ total: number; active: number; inactive: number }>({
    queryKey: ['/api/team-leader/sourcing/candidates-counts', employee?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/recruiter/candidates/counts');
      return await response.json();
    },
    enabled: !!employee && employee.role === 'team_leader',
  });

  const { data: tlSourcingJobs = [] } = useQuery<any[]>({
    queryKey: ['/api/team-leader/sourcing/jobs', employee?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/recruiter/jobs');
      return await response.json();
    },
    enabled: !!employee && employee.role === 'team_leader',
  });

  const { data: tlSourcingCandidatesPage } = useQuery({
    ...adminCandidatesQueryOptions(1, 20),
    enabled: !!employee && employee.role === 'team_leader',
  });
  const tlSourcingCandidates = tlSourcingCandidatesPage?.data ?? [];

  // Fetch team performance graph data
  const { data: performanceGraphData, isLoading: isLoadingPerformanceGraph } = useQuery<{
    members: { id: string; name: string }[];
    chartData: { quarter: string; resumesDelivered: number; closures: number }[];
    selectedMemberId: string;
  }>({
    queryKey: [`/api/team-leader/team-performance-graph?memberId=${selectedPerformanceMember}`],
    enabled: !!employee,
  });

  useEffect(() => {
    const handleProfileUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/stats'] });
    };

    window.addEventListener('profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('profile-updated', handleProfileUpdated);
  }, [queryClient]);

  // Get available talent advisors dynamically from team members
  const talentAdvisors = useMemo(() => {
    if (Array.isArray(teamMembers) && teamMembers.length > 0) {
      return teamMembers.map((member: any) => member.name);
    }
    return [];
  }, [teamMembers]);

  const activeTlJobs = useMemo(
    () => tlSourcingJobs.filter((job: any) => String(job.status || '').toLowerCase() === 'active'),
    [tlSourcingJobs]
  );

  const tlOwnedCandidates = useMemo(
    () => tlSourcingCandidates,
    [tlSourcingCandidates],
  );

  const tlResumeCount = tlSourcingCandidatesPage?.total ?? tlOwnedCandidates.length;

  const formatSourcingDate = (value: string | Date | null | undefined) => {
    if (!value) return '-';
    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return '-';
    return format(parsedDate, 'dd MMM yyyy');
  };

  const handleEditJob = (job: any) => {
    let skills = [];
    try { skills = typeof job.primarySkills === 'string' ? JSON.parse(job.primarySkills) : (job.primarySkills || []); } catch(e) {}
    
    setJobFormData({
      id: job.id,
      requirementId: job.requirementId || '',
      companyName: job.companyName || '',
      companyTagline: job.companyTagline || '',
      companyType: job.companyType || '',
      market: job.market || '',
      field: job.field || '',
      noOfPositions: String(job.noOfPositions || 1),
      role: job.role || '',
      experience: job.experience || '',
      location: job.location || '',
      workMode: job.workMode || '',
      employmentType: 'Full-time', // Not mapped in DB schema
      salaryPackage: job.salaryPackage || '',
      aboutCompany: job.aboutCompany || '',
      roleDefinitions: job.roleDefinitions || '',
      keyResponsibility: job.keyResponsibility || '',
      primarySkills: skills.slice(0, 5),
      secondarySkills: skills.slice(5, 10),
      knowledgeOnly: skills.slice(10, 15),
      companyLogo: job.companyLogo || ''
    });
    
    setIsPostJobModalOpen(true);
  };

  const renderSourcingJobCards = (jobs: any[], emptyMessage: string) => {
    if (jobs.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job: any) => (
          <div
            key={job.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{job.role || 'Untitled Role'}</p>
                <p className="mt-1 text-sm text-slate-600">{job.companyName || '-'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                String(job.status || '').toLowerCase() === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {job.status || 'Unknown'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Experience</p>
                <p className="mt-1 font-medium text-slate-800">{job.experience || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Location</p>
                <p className="mt-1 font-medium text-slate-800">{job.location || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Work Mode</p>
                <p className="mt-1 font-medium text-slate-800">{job.workMode || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Posted Date</p>
                <p className="mt-1 font-medium text-slate-800">{formatSourcingDate(job.postedDate || job.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 px-3 py-3 text-sm text-slate-700">
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Package</p>
                <p className="mt-1 font-medium text-slate-900">{job.salaryPackage || `${job.salaryMin ? job.salaryMin/100000 + 'L - ' : ''}${job.salaryMax ? job.salaryMax/100000 + 'L' : ''}`}</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Status</p>
                <Select
                  value={pendingJobStatusById[job.id] ?? String(job.status || 'Active')}
                  onValueChange={(value) =>
                    setPendingJobStatusById((prev) => ({ ...prev, [job.id]: value }))
                  }
                >
                  <SelectTrigger className="mt-1 h-8 w-full text-xs border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="mt-2 h-7 w-full rounded bg-blue-600 px-2 text-[11px] text-white hover:bg-blue-700"
                  onClick={() => {
                    const nextStatus = pendingJobStatusById[job.id] ?? String(job.status || "Active");
                    updateRecruiterJobMutation.mutate(
                      { id: job.id, data: { status: nextStatus } },
                      {
                        onSuccess: () => {
                          setPendingJobStatusById((prev) => {
                            const next = { ...prev };
                            delete next[job.id];
                            return next;
                          });
                        },
                      },
                    );
                  }}
                  disabled={updateRecruiterJobMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-medium">
                {job.assignedTaName ? `Assigned to ${job.assignedTaName}` : 'Assigned to —'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 rounded-[4px] text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEditJob(job)}
              >
                <EditIcon className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Static priority distribution - fixed counts that never change
  const priorityDistribution = {
    HIGH: { Easy: 6, Medium: 4, Tough: 2 },
    MEDIUM: { Easy: 5, Medium: 3, Tough: 2 },
    LOW: { Easy: 4, Medium: 3, Tough: 2 },
  };

  // Chat team members are derived from real team members query
  const chatTeamMembers = useMemo(() => {
    return (teamMembers || []).map((member: any) => ({
      id: String(member.id),
      name: member.name,
      role: member.position || 'Recruiter',
      status: member.status || 'online'
    }));
  }, [teamMembers]);

  // Individual contacts - currently empty, could be populated from other API
  const individualContacts: { id: string; name: string; role: string; status: string }[] = [];

  // Mutation to assign talent advisor to requirement
  const assignTalentAdvisorMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      talentAdvisor?: string;
      jdText?: string;
      splitRequirement?: boolean;
      splits?: Array<{ talentAdvisor: string; noOfPositions: number }>;
    }) => {
      const { id, ...body } = payload;
      const res = await apiRequest('POST', `/api/team-leader/requirements/${id}/assign-ta`, body);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to assign Talent Advisor');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/requirements'] });
      resetAssignmentModalState();
      toast({
        title: "Success",
        description: data?.split
          ? `Requirement split across ${data.requirements?.length || 0} Talent Advisors.`
          : "Talent Advisor assigned successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign Talent Advisor",
        variant: "destructive",
      });
    },
  });

  // Mutation to update recruiter job status and assignment
  const updateRecruiterJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/recruiter/jobs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/sourcing/jobs', employee?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
      toast({
        title: "Success",
        description: "Job updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/team-leader/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/requirements'] });
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

  const handleAssign = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setIsReallocating(false);
    setSelectedAssignee(requirement.talentAdvisor || '');
    setJdText(requirement.jdText || '');
    setSplitRequirementEnabled(false);
    const total = Math.max(1, Number(requirement.noOfPositions) || 1);
    setTaSplitRows([
      { talentAdvisor: "", noOfPositions: String(Math.max(1, Math.floor(total / 2))) },
      { talentAdvisor: "", noOfPositions: String(Math.max(1, total - Math.floor(total / 2))) },
    ]);
    setIsAssignmentModalOpen(true);
  };

  const handleReallocate = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setIsReallocating(true);
    setSelectedAssignee(requirement.talentAdvisor || '');
    setJdText(requirement.jdText || '');
    setSplitRequirementEnabled(false);
    setIsAssignmentModalOpen(true);
  };

  const resetAssignmentModalState = () => {
    setIsAssignmentModalOpen(false);
    setIsAssignmentConfirmOpen(false);
    setSelectedRequirement(null);
    setSelectedAssignee('');
    setJdText('');
    setSplitRequirementEnabled(false);
    setTaSplitRows([
      { talentAdvisor: "", noOfPositions: "1" },
      { talentAdvisor: "", noOfPositions: "1" },
    ]);
  };

  const assignmentTotalPositions = Math.max(
    1,
    Number(selectedRequirement?.noOfPositions) || 1,
  );

  const assignedSplitPositions = taSplitRows.reduce(
    (sum, row) => sum + Math.max(0, parseInt(row.noOfPositions, 10) || 0),
    0,
  );

  const remainingSplitPositions = assignmentTotalPositions - assignedSplitPositions;
  const splitPositionsOverLimit = assignedSplitPositions > assignmentTotalPositions;
  const splitPositionsExcess = assignedSplitPositions - assignmentTotalPositions;

  const isSplitAssignmentValid =
    !splitPositionsOverLimit &&
    remainingSplitPositions === 0 &&
    taSplitRows.filter((r) => r.talentAdvisor.trim()).length >= 2;

  const canUseSplitAssignment = Boolean(
    selectedRequirement &&
      !isReallocating &&
      !selectedRequirement.talentAdvisorId &&
      !selectedRequirement.talentAdvisor &&
      !getRequirementTaSplitMeta(selectedRequirement),
  );

  const isTaReassignment = Boolean(
    selectedRequirement?.talentAdvisor &&
      selectedAssignee &&
      selectedAssignee !== selectedRequirement.talentAdvisor,
  );

  const handleRequestAssignmentConfirm = () => {
    if (!selectedRequirement) return;
    if (splitRequirementEnabled) {
      const validRows = taSplitRows.filter((row) => row.talentAdvisor.trim());
      if (validRows.length < 2) return;
      if (!isSplitAssignmentValid) return;
      setIsAssignmentConfirmOpen(true);
      return;
    }
    if (!selectedAssignee) return;
    setIsAssignmentConfirmOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedRequirement) return;
    const lookupId = getRequirementLookupId(selectedRequirement);
    if (splitRequirementEnabled) {
      const splits = taSplitRows
        .filter((row) => row.talentAdvisor.trim())
        .map((row) => ({
          talentAdvisor: row.talentAdvisor.trim(),
          noOfPositions: Math.max(1, parseInt(row.noOfPositions, 10) || 1),
        }));
      assignTalentAdvisorMutation.mutate({
        id: lookupId,
        splitRequirement: true,
        splits,
        jdText: jdText.trim() || undefined,
      });
    } else {
      if (!selectedAssignee) return;
      assignTalentAdvisorMutation.mutate({
        id: lookupId,
        talentAdvisor: selectedAssignee,
        jdText: jdText.trim() || undefined,
      });
    }
    setIsAssignmentConfirmOpen(false);
  };
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [isActiveJobsModalOpen, setIsActiveJobsModalOpen] = useState(false);
  const [isPostedJobsModalOpen, setIsPostedJobsModalOpen] = useState(false);
  const [isUploadedResumesModalOpen, setIsUploadedResumesModalOpen] = useState(false);
  const [jobFormError, setJobFormError] = useState('');
  const [resumeFormError, setResumeFormError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobFormData, setJobFormData] = useState({
    requirementId: '',
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
    employmentType: '',
    salaryPackage: '',
    aboutCompany: '',
    roleDefinitions: '',
    keyResponsibility: '',
    primarySkills: [],
    secondarySkills: [],
    knowledgeOnly: [],
    companyLogo: ''
  });
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

  // Group pipeline candidates by status for the pipeline view with filters
  const groupedPipelineCandidates = useMemo(() => {
    if (!Array.isArray(pipelineData)) return {};
    
    // Filter by TA (recruiter) if selected
    let filteredData = pipelineData;
    if (selectedPipelineRecruiter && selectedPipelineRecruiter !== 'all') {
      filteredData = pipelineData.filter((candidate: any) => {
        // Match by recruiterId if available, otherwise by name
        return candidate.recruiterId === selectedPipelineRecruiter || 
               (candidate.recruiter || '').toLowerCase() === selectedPipelineRecruiter.toLowerCase();
      });
    }
    
    // Filter by date if selected (null means show all)
    if (pipelineDate !== null) {
      const filterDate = format(pipelineDate, 'yyyy-MM-dd');
      filteredData = filteredData.filter((candidate: any) => {
        let dateToCheck: string | null = null;
        // Try appliedDate first (from job_applications)
        if (candidate.appliedDate) {
          try {
            const date = new Date(candidate.appliedDate);
            dateToCheck = format(date, 'yyyy-MM-dd');
          } catch {
            // Try appliedOn format (DD-MM-YYYY)
            if (candidate.appliedOn && candidate.appliedOn !== 'N/A') {
              try {
                const [day, month, year] = candidate.appliedOn.split('-');
                const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                dateToCheck = format(parsedDate, 'yyyy-MM-dd');
              } catch {
                return false;
              }
            }
          }
        } else if (candidate.appliedOn && candidate.appliedOn !== 'N/A') {
          // Parse appliedOn date (format: DD-MM-YYYY)
          try {
            const [day, month, year] = candidate.appliedOn.split('-');
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            dateToCheck = format(parsedDate, 'yyyy-MM-dd');
          } catch {
            return false;
          }
        } else if (candidate.createdAt) {
          // Fallback to createdAt
          try {
            const date = new Date(candidate.createdAt);
            dateToCheck = format(date, 'yyyy-MM-dd');
          } catch {
            return false;
          }
        }
        if (!dateToCheck) return false;
        return dateToCheck === filterDate;
      });
    }
    
    return groupCandidatesByPipelineStage(filteredData);
  }, [pipelineData, selectedPipelineRecruiter, pipelineDate]);

  const tlPipelineSessionList = useMemo(
    () =>
      buildPipelineSessionList(
        groupedPipelineCandidates,
        TL_PIPELINE_STAGE_ORDER,
        (c) => mapTeamLeaderPipelineCandidate(c),
      ),
    [groupedPipelineCandidates],
  );

  const handlePipelineCandidateClick = (candidate: any) => {
    if (!candidate?.id) return;
    const snapshot = mapTeamLeaderPipelineCandidate(candidate);
    setSessionApplicationId(snapshot.id);
    setSessionApplicantSnapshot(snapshot);
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
  
  // Handle immediate refetch when switching to pipeline tab
  useEffect(() => {
    if (sidebarTab !== 'pipeline' || !employee) return;
    
    // Immediately refetch when switching to pipeline tab
    refetchPipeline();
    queryClient.invalidateQueries({ queryKey: ['/api/team-leader/pipeline'] });
    queryClient.invalidateQueries({ queryKey: ['/api/team-leader/pipeline-counts'] });
  }, [sidebarTab, employee, refetchPipeline, queryClient]);

  // Check authentication - wait for loading to complete
  useEffect(() => {
    // Don't check auth until loading is complete
    if (isLoading) return;
    
    // Only run auth check once
    if (hasCheckedAuth) return;
    
    // Give a small delay to allow auth context to update after login
    const timer = setTimeout(() => {
      // Check if user is logged in as an employee with team_leader role
      if (!user || user.type !== 'employee') {
        toast({
          title: "Authentication Required",
          description: "Please login to access Delivery Workspace",
          variant: "destructive",
        });
        navigate('/employer-login');
        setHasCheckedAuth(true);
        return;
      }
      
      // Check if employee has team_leader role
      const employeeData = user.data as Employee;
      if (employeeData.role !== 'team_leader') {
        toast({
          title: "Access Denied",
          description: "You must be a Team Leader to access this page",
          variant: "destructive",
        });
        navigate('/employer-login');
        setHasCheckedAuth(true);
        return;
      }
      
      // Mark auth as checked if valid
      setHasCheckedAuth(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, hasCheckedAuth, navigate, toast]);
  
  // Show loading state while auth is being checked
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading Delivery Workspace...</div>
        </div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will be redirected by useEffect)
  if (!employee || employee.role !== 'team_leader') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading Delivery Workspace...</div>
        </div>
      </div>
    );
  }

  if (!teamLeaderProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading Delivery Workspace...</div>
        </div>
      </div>
    );
  }

  const renderNudgesContent = () => (
    <div className="flex min-h-screen">
      <div className="flex-1 ml-16 bg-gray-50">
        <AdminTopHeader
          companyName="Delivery Workspace"
          onHelpClick={() => setIsHelpChatOpen(true)}
        />
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
        return renderTeamContent();
      case 'requirements':
        return renderRequirementsContent();
      case 'pipeline':
        return renderPipelineContent();
      case 'performance':
        return renderPerformanceContent();
      case 'nudges':
        return renderNudgesContent();
      default:
        return renderTeamContent();
    }
  };

  const renderTeamContent = () => {
    // Get team leader stats data
    const stats = teamLeaderStats || {
      name: userName,
      image: teamLeaderProfile?.profilePicture || null,
      members: Array.isArray(teamMembers) ? teamMembers.length : 0,
      tenure: "0",
      qtrsAchieved: 0,
      nextMilestone: "0",
      performanceScore: 0
    };

    // Calculate tenure in years
    const tenureYears = stats.tenure ?? "0";
    const performanceBadge = getPerformanceBadgeStyles(dailyMetrics?.overallPerformance);

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader 
            companyName="Delivery Workspace" 
            onHelpClick={() => setIsHelpChatOpen(true)}
          />
          <div className="flex h-screen">
            {/* Main Content - Middle Section (Scrollable) */}
            <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto h-full">
              {/* Top Section - TL Summary and Performance */}
              <div className="space-y-4">
                <Card className="overflow-hidden border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {stats.image ? (
                            <img
                              src={stats.image}
                              alt={stats.name}
                              className="h-14 w-14 rounded-[18px] object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white shadow-md">
                              <span className="text-lg font-bold text-white">
                                {stats.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">{stats.name}</h2>
                            {tlProfileId ? (
                              <span
                                className="inline-flex rounded-[4px] border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-blue-800"
                                data-testid="text-tl-dashboard-profile-id"
                              >
                                {tlProfileId}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">Team Leader</p>
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 xl:max-w-[560px]">
                        <button
                          onClick={() => {
                            setJobFormError('');
                            setJobFormData({
                              requirementId: '',
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
                              employmentType: '',
                              salaryPackage: '',
                              aboutCompany: '',
                              roleDefinitions: '',
                              keyResponsibility: '',
                              primarySkills: [],
                              secondarySkills: [],
                              knowledgeOnly: [],
                              companyLogo: '',
                            });
                            setIsPostJobModalOpen(true);
                          }}
                          className="whitespace-nowrap rounded border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          data-testid="button-tl-post-job"
                        >
                          Post Jobs
                        </button>
                        <button
                          onClick={() => setIsUploadResumeModalOpen(true)}
                          className="whitespace-nowrap rounded border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          data-testid="button-tl-upload-resume"
                        >
                          Upload Resume
                        </button>
                        <button
                          onClick={() => window.open('/source-resume', '_blank')}
                          className="whitespace-nowrap rounded border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          data-testid="button-tl-source-resume"
                        >
                          Source Resume
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.9fr)]">
                  <Card className="overflow-hidden border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 flex flex-col justify-between min-h-[100px]">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">Qtrs Achieved</span>
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-emerald-700">{stats.qtrsAchieved ?? 0}</p>
                        </div>

                        <div className="rounded-lg border border-orange-100 bg-orange-50 p-4 flex flex-col justify-between min-h-[100px]">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700">Next Milestone</span>
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-orange-600">{stats.nextMilestone ?? "0"}</p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 flex flex-col justify-between min-h-[100px]">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">Tenure</span>
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-blue-700">
                            {tenureYears}
                            <span className="ml-1 text-sm font-semibold text-blue-500">y</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsActiveJobsModalOpen(true)}
                          className="rounded-lg border border-emerald-100 bg-white p-4 text-left transition-colors hover:bg-emerald-50 flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <p className="text-xs font-semibold text-emerald-600">Active Jobs</p>
                            <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-emerald-700">{activeTlJobs.length || sourcingJobCounts?.active || 0}</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPostedJobsModalOpen(true)}
                          className="rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50 flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <p className="text-xs font-semibold text-slate-500">Posted Jobs</p>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-slate-900">{tlSourcingJobs.length || sourcingJobCounts?.total || 0}</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsUploadedResumesModalOpen(true)}
                          className="rounded-lg border border-blue-100 bg-white p-4 text-left transition-colors hover:bg-blue-50 flex flex-col justify-between min-h-[100px]"
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <p className="text-xs font-semibold text-blue-600">Uploaded Resumes</p>
                            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <p className="mt-2.5 text-2xl font-bold text-blue-700">{tlResumeCount || sourcingCandidateCounts?.total || 0}</p>
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="mb-2.5">
                        <p className="text-lg font-semibold text-slate-900">Team Performance</p>
                      </div>

                      <div className="flex flex-1 items-center justify-center rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-2.5">
                        <TeamLeaderPerformanceGauge value={stats.performanceScore ?? 0} size={230} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Nudge Escalation Table */}
              <ActiveNudgesTable />

              {/* Target Section */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Target</CardTitle>
                  <button
                    onClick={() => setIsTargetModalOpen(true)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                    data-testid="button-view-all-targets"
                  >
                    View All
                  </button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-4 gap-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                    <div className="text-center py-6 px-4 border-r border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Current Quarter</p>
                      <p className="text-xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? `${aggregatedTargets.currentQuarter.quarter}-${aggregatedTargets.currentQuarter.year}` 
                          : `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`}
                      </p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Minimum Target</p>
                      <p className="text-xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.minimumTarget) 
                          : '0'}
                      </p>
                    </div>
                    <div className="text-center py-6 px-4 border-r border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Target Achieved</p>
                      <p className="text-xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.targetAchieved) 
                          : '0'}
                      </p>
                    </div>
                    <div className="text-center py-6 px-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Incentive Earned</p>
                      <p className="text-xl font-bold text-gray-900">
                        {aggregatedTargets?.currentQuarter 
                          ? formatIndianCurrency(aggregatedTargets.currentQuarter.incentiveEarned) 
                          : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Metrics Section */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daily Metrics</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedDailyMetricsFilter} onValueChange={setSelectedDailyMetricsFilter}>
                      <SelectTrigger
                        className={`w-32 h-8 text-sm border-gray-300 ${
                          selectedDailyMetricsFilter === 'overall'
                            ? 'bg-gray-200 text-gray-900 font-medium hover:bg-gray-200'
                            : 'bg-white'
                        }`}
                        data-testid="select-daily-metrics-filter"
                      >
                        <SelectValue placeholder="Overall" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <StandardDatePicker
                      value={selectedDate}
                      onChange={(date) => date && setSelectedDate(date)}
                      placeholder="Select date"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left side - Metrics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Total Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">{formatMetricCount(dailyMetrics?.totalRequirements)}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Avg. Resumes per Requirement</span>
                        <span className="text-2xl font-bold text-blue-600">{formatMetricCount(dailyMetrics?.avgResumesPerRequirement)}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Requirements per Recruiter</span>
                        <span className="text-2xl font-bold text-blue-600">{formatMetricCount(dailyMetrics?.requirementsPerRecruiter)}</span>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-700">Completed Requirements</span>
                        <span className="text-2xl font-bold text-blue-600">{formatMetricCount(dailyMetrics?.completedRequirements)}</span>
                      </div>
                    </div>

                    {/* Middle section - Daily Delivery */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Daily Delivery</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-green-500 rounded-lg p-4 text-center">
                          <h5 className="text-sm font-medium text-green-700 mb-2">Delivered</h5>
                          <div className="text-3xl font-bold text-green-600" data-testid="text-delivered-count">
                            {formatMetricCount(dailyMetrics?.dailyDeliveryDelivered)}
                          </div>
                        </div>
                        <div className="border-2 border-red-500 rounded-lg p-4 text-center">
                          <h5 className="text-sm font-medium text-red-700 mb-2">Defaulted</h5>
                          <div className="text-3xl font-bold text-red-600" data-testid="text-defaulted-count">
                            {formatMetricCount(dailyMetrics?.dailyDeliveryDefaulted)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Overall Performance */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${performanceBadge.badgeBg}`}
                          title={performanceBadge.title}
                        >
                          <span className={`font-bold text-sm ${performanceBadge.badgeText}`}>
                            {performanceBadge.label}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Overall Performance</h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 ml-auto"
                          onClick={() => setIsPerformanceGraphModalOpen(true)}
                          data-testid="button-expand-performance-graph"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                      <div className="h-48 mt-2">
                        <PerformanceChart
                          data={(dailyMetrics?.performanceData as TeamPerformanceRow[]) || []}
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Section - Meetings and CEO Commands */}
              <div className="grid grid-cols-2 gap-6">
                {/* Pending Meetings */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Meetings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      {isLoadingMeetings ? (
                        <div className="text-center py-4 text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mx-auto mb-2"></div>
                          Loading meetings...
                        </div>
                      ) : isErrorMeetings ? (
                        <div className="text-center py-4 text-red-500">
                          Failed to load meetings
                        </div>
                      ) : Array.isArray(meetings) && meetings.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6">
                          {meetings.map((meeting: any, index: number) => (
                            <div key={meeting.id || index} className={`text-center ${index > 0 ? 'border-l border-gray-300 pl-6' : ''}`}>
                              <h3 className="text-sm font-medium text-gray-700 mb-3">{meeting.type}</h3>
                              <div className="text-4xl font-bold text-gray-900 mb-4" data-testid={`text-meeting-count-${index}`}>
                                {meeting.count}
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm font-medium"
                                onClick={() => setIsMeetingsModalOpen(true)}
                                data-testid={`button-view-meetings-${index}`}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No pending meetings
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CEO Commands */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">CEO Commands</CardTitle>
                    <button
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                      onClick={() => setIsCeoCommentsModalOpen(true)}
                      data-testid="button-view-more-comments"
                    >
                      View More
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-slate-800 rounded-lg p-6 text-white space-y-4">
                      {isLoadingCeoComments || isLoadingChatRooms ? (
                        <div className="text-center py-2 text-cyan-300/60">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-300/30 border-t-cyan-300 mx-auto mb-2"></div>
                          Loading commands and messages...
                        </div>
                      ) : isErrorCeoComments ? (
                        <div className="text-center py-2 text-red-400">
                          Failed to load commands
                        </div>
                      ) : combinedCeoFeed.length > 0 ? (
                        combinedCeoFeed.slice(0, 4).map((item, index) => (
                          <div
                            key={item.id}
                            className={`text-sm font-medium ${
                              item.kind === 'message'
                                ? 'cursor-pointer rounded-md border border-cyan-500/30 bg-slate-700/40 px-3 py-2 text-cyan-100 hover:bg-slate-700/70'
                                : 'text-cyan-300'
                            }`}
                            data-testid={`text-ceo-feed-${index}`}
                            onClick={() => {
                              if (item.kind === 'message' && item.roomId) {
                                setSelectedChatRoom(item.roomId);
                                setIsChatModalOpen(true);
                              }
                            }}
                          >
                            <span className="block text-[10px] uppercase tracking-wide text-cyan-400/90 mb-0.5">
                              {item.label}
                              {item.unread ? ` · ${item.unread} new` : ''}
                            </span>
                            {item.text}
                          </div>
                        ))
                      ) : (
                        <div className="text-cyan-300/60 text-sm">
                          No CEO commands or messages at the moment
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Team Members Sidebar - Right Section (Non-scrollable) */}
            <div className="flex-shrink-0">
              <TeamLeaderSidebar />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequirementsContent = () => {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader 
            companyName="StaffOS" 
            onHelpClick={() => setIsHelpChatOpen(true)}
          />
          <div className="px-6 py-6 space-y-6 h-full">
            {/* Requirements Section with Priority Distribution */}
            <div className="flex gap-6 h-full">
              {/* Middle Section - Requirements Table (Scrollable) */}
              <div className="flex-1 overflow-y-auto">
                <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left p-3 font-semibold text-gray-700 w-[88px]">ID</th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-[200px] max-w-[200px]">Positions</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Resume Count</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Criticality</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Company</th>
                          <th className="text-left p-3 font-semibold text-gray-700">SPOC</th>
                          <th className="text-left p-3 font-semibold text-gray-700">Talent Advisor</th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-[72px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingRequirements ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-gray-600">
                              Loading requirements...
                            </td>
                          </tr>
                        ) : visibleRequirementsData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-gray-600">
                              No requirements assigned to you yet.
                            </td>
                          </tr>
                        ) : (
                          visibleRequirementsData.slice(0, 10).map((requirement: any) => {
                            const isReassigned = requirement.assignmentStatus === "reassigned";
                            const isOnHold = requirement.managementStatus === "hold";
                            const isRecentlyClosed = requirement.managementStatus === "closed" && requirement.isRecentlyClosed;
                            const positionCount = requirement.noOfPositions ?? 1;
                            const taSplitMeta = getRequirementTaSplitMeta(requirement);
                            const splitBadge = getRequirementSplitBadgeLabel(requirement);
                            return (
                            <tr 
                              key={requirement.id} 
                              className={`border-b border-gray-100 ${isReassigned ? 'opacity-50 cursor-not-allowed bg-gray-100' : isRecentlyClosed ? 'bg-red-100 hover:bg-red-200' : isOnHold ? 'bg-yellow-100/80 hover:bg-yellow-100' : ''}`}
                              title={isReassigned ? "Reassigned to another TA" : isRecentlyClosed ? "Requirement was closed and will leave this list after 24 hours" : isOnHold ? "Requirement is on Hold" : undefined}
                            >
                              <td className="p-3 w-[88px] text-xs font-semibold text-slate-600 whitespace-nowrap">
                                {getRequirementDisplayId(requirement)}
                              </td>
                              <td className="p-3 w-[200px] max-w-[200px] text-gray-900">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="min-w-0">
                                    <span className="font-medium text-gray-900 block truncate" title={requirement.position}>
                                      {requirement.position}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {positionCount} position{positionCount !== 1 ? 's' : ''}
                                      {splitBadge && (
                                        <span
                                          className={`ml-1 font-medium ${
                                            taSplitMeta ? "text-purple-700" : "text-indigo-700"
                                          }`}
                                          title={splitBadge.title}
                                        >
                                          • {splitBadge.label}
                                        </span>
                                      )}
                                      {taSplitMeta?.totalSplits
                                        ? ` (${taSplitMeta.splitIndex}/${taSplitMeta.totalSplits})`
                                        : ''}
                                    </p>
                                  </div>
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
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="text-sm font-bold text-red-900">
                                  {requirement.resumeCount || '00/00'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded inline-flex items-center ${
                                  requirement.criticality.toUpperCase() === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  requirement.criticality.toUpperCase() === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full mr-1 ${
                                    requirement.criticality.toUpperCase() === 'HIGH' ? 'bg-red-500' :
                                    requirement.criticality.toUpperCase() === 'MEDIUM' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  }`}></span>
                                  {requirement.criticality.toUpperCase()}-{requirement.toughness || 'Medium'}
                                </span>
                              </td>
                              <td className="p-3 text-gray-900">{requirement.company}</td>
                              <td className="p-3 text-gray-900">{requirement.spoc}</td>
                              <td className="p-3 text-gray-900">
                                {requirement.needsTalentAdvisorReassignment && requirement.talentAdvisor ? (
                                  <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    {requirement.talentAdvisor}
                                  </span>
                                ) : (
                                  requirement.talentAdvisor || 'not-assigned'
                                )}
                              </td>
                              <td className="p-3 w-[72px]">
                                {isRecentlyClosed ? (
                                  <span className="text-xs text-red-700 font-medium">Archived</span>
                                ) : isReassigned ? (
                                  <span className="text-xs text-gray-400">—</span>
                                ) : (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        data-testid={`button-requirement-actions-${requirement.id}`}
                                      >
                                        <MoreVertical className="h-4 w-4 text-gray-600" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => {
                                          setSelectedJD(requirement);
                                          setIsJDPreviewModalOpen(true);
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View JD
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => openJdVisibilityModal(requirement)}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        JD Visibility
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleAssign(requirement)}
                                        data-testid={`button-assign-ta-${requirement.id}`}
                                      >
                                        <UserRound className="mr-2 h-4 w-4" />
                                        Assign TA
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end gap-4 p-4 border-t border-gray-200">
                    <Button 
                      className="px-6 py-2 bg-red-400 hover:bg-red-500 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        sessionStorage.setItem('tlDashboardSidebarTab', sidebarTab);
                        navigate('/archives');
                      }}
                      disabled={false}
                      data-testid="button-archives"
                    >
                      Archives
                    </Button>
                    <button
                      className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setIsViewMoreRequirementsModalOpen(true)}
                      disabled={visibleRequirementsData.length <= 5}
                      data-testid="button-view-more-requirements"
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section - Priority Distribution (Dynamic) */}
              <div className="w-80 bg-white border-l border-gray-200 px-6 py-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                  
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* HIGH Priority Group */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                            <span className="text-sm font-semibold text-red-800">HIGH</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Easy</span>
                              <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Easy}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Med</span>
                              <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Medium}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Tough</span>
                              <span className="text-sm font-semibold text-red-600">{priorityDistribution.HIGH.Tough}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* MED Priority Group */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded">
                            <span className="text-sm font-semibold text-yellow-800">MED</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Easy</span>
                              <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Easy}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Med</span>
                              <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Medium}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Tough</span>
                              <span className="text-sm font-semibold text-yellow-600">{priorityDistribution.MEDIUM.Tough}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* LOW Priority Group */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                            <span className="text-sm font-semibold text-green-800">LOW</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Easy</span>
                              <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Easy}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Med</span>
                              <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Medium}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 hover-elevate rounded">
                              <span className="text-xs text-gray-600">Tough</span>
                              <span className="text-sm font-semibold text-green-600">{priorityDistribution.LOW.Tough}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        {isAssignmentModalOpen && selectedRequirement && (
          <Dialog open={isAssignmentModalOpen} onOpenChange={(open) => !open && resetAssignmentModalState()}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b border-gray-100">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Assign Requirement
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-y-auto modal-thin-scrollbar px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Requirement Details:</h4>
                  <div className="space-y-2">
                    <div><strong>Position:</strong> {selectedRequirement.position}</div>
                    <div><strong>Company:</strong> {selectedRequirement.company}</div>
                    <div><strong>Criticality:</strong> <span className="text-red-600">{selectedRequirement.criticality.toUpperCase()}-{selectedRequirement.toughness || 'Medium'}</span></div>
                    <div><strong>SPOC:</strong> {selectedRequirement.spoc}</div>
                    <div><strong>Total positions:</strong> {assignmentTotalPositions}</div>
                  </div>
                </div>

                {canUseSplitAssignment && (
                  <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Split requirement</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Assign multiple TAs with a position count each (must total {assignmentTotalPositions}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSplitRequirementEnabled((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        splitRequirementEnabled ? "bg-purple-600" : "bg-gray-300"
                      }`}
                      data-testid="toggle-split-requirement"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          splitRequirementEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}
                
                {splitRequirementEnabled && canUseSplitAssignment ? (
                  <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-medium text-gray-900">Split among Talent Advisors</Label>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          splitPositionsOverLimit
                            ? "text-red-700"
                            : remainingSplitPositions === 0
                              ? "text-green-700"
                              : "text-amber-700"
                        }`}
                      >
                        {splitPositionsOverLimit
                          ? `${assignedSplitPositions}/${assignmentTotalPositions} — over limit`
                          : remainingSplitPositions === 0
                            ? "All positions assigned"
                            : `${remainingSplitPositions} remaining`}
                      </span>
                    </div>

                    {splitPositionsOverLimit && (
                      <p className="text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        Total assigned ({assignedSplitPositions}) exceeds required ({assignmentTotalPositions}) by{" "}
                        {splitPositionsExcess}. Reduce positions before confirming.
                      </p>
                    )}

                    {taSplitRows.map((row, index) => {
                      const positions = Math.max(1, parseInt(row.noOfPositions, 10) || 1);
                      const previewTarget = getRequirementResumeTarget({
                        criticality: selectedRequirement.criticality,
                        toughness: selectedRequirement.toughness,
                        noOfPositions: positions,
                      });
                      return (
                        <div
                          key={index}
                          className="rounded-md border border-violet-100 bg-white/90 p-3 shadow-sm space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-3 items-start">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium text-gray-700">Talent Advisor {index + 1}</Label>
                              <Select
                                value={row.talentAdvisor}
                                onValueChange={(value) => {
                                  setTaSplitRows((prev) =>
                                    prev.map((entry, i) =>
                                      i === index ? { ...entry, talentAdvisor: value } : entry,
                                    ),
                                  );
                                }}
                              >
                                <SelectTrigger className="mt-1.5 h-10 w-full bg-slate-100 border-slate-300 text-gray-900">
                                  <SelectValue placeholder="Select TA" />
                                </SelectTrigger>
                                <SelectContent>
                                  {talentAdvisors.map((advisor) => (
                                    <SelectItem key={advisor} value={advisor}>
                                      {advisor}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="min-w-0">
                              <Label className="text-xs font-medium text-gray-700">Positions</Label>
                              <Input
                                type="number"
                                min={1}
                                max={assignmentTotalPositions}
                                value={row.noOfPositions}
                                onChange={(e) => {
                                  setTaSplitRows((prev) =>
                                    prev.map((entry, i) =>
                                      i === index
                                        ? { ...entry, noOfPositions: e.target.value }
                                        : entry,
                                    ),
                                  );
                                }}
                                className={`mt-1.5 h-10 w-full bg-slate-100 border-slate-300 text-gray-900 ${
                                  splitPositionsOverLimit ? "border-red-300 focus-visible:ring-red-400" : ""
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-violet-800/80">Resume target: {previewTarget}</p>
                        </div>
                      );
                    })}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTaSplitRows((prev) => [
                            ...prev,
                            { talentAdvisor: "", noOfPositions: "1" },
                          ])
                        }
                      >
                        + Add TA
                      </Button>
                      {taSplitRows.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTaSplitRows((prev) => prev.slice(0, -1))}
                        >
                          Remove last
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
                    <Label htmlFor="talent-advisor" className="text-sm font-medium text-gray-800">
                      Assign to Talent Advisor:
                    </Label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger className="mt-2 bg-white border-blue-200" data-testid="select-talent-advisor">
                        <SelectValue placeholder="Select a Talent Advisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {talentAdvisors.map(advisor => (
                          <SelectItem key={advisor} value={advisor}>{advisor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRequirement.talentAdvisor && (
                      <p className="mt-2 text-xs text-blue-800/80">
                        Currently assigned: <span className="font-semibold">{selectedRequirement.talentAdvisor}</span>
                      </p>
                    )}
                  </div>
                )}
                
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <Label htmlFor="jd-text" className="text-sm font-medium text-gray-800">
                    JD Text (Optional):
                  </Label>
                  <Textarea
                    id="jd-text"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Enter JD text to share with Talent Advisor..."
                    className="mt-2 min-h-[100px] bg-white border-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">Note: JD file will not be shared to Talent Advisor, only text.</p>
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-background shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAssignmentModalState}
                    className="px-6 py-2 rounded"
                    data-testid="button-cancel-assignment"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-2 rounded"
                    onClick={handleRequestAssignmentConfirm}
                    disabled={
                      assignTalentAdvisorMutation.isPending ||
                      (splitRequirementEnabled
                        ? !isSplitAssignmentValid
                        : !selectedAssignee)
                    }
                    data-testid="button-confirm-assignment"
                  >
                    {assignTalentAdvisorMutation.isPending
                      ? 'Assigning...'
                      : splitRequirementEnabled
                        ? 'Review split assignment'
                        : isReallocating || isTaReassignment
                          ? 'Review & Confirm'
                          : 'Confirm Assignment'}
                  </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <AlertDialog open={isAssignmentConfirmOpen} onOpenChange={setIsAssignmentConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {splitRequirementEnabled
                  ? 'Confirm split assignment'
                  : isReallocating || isTaReassignment
                    ? 'Confirm TA reassignment'
                    : 'Confirm TA assignment'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-gray-600">
                  {splitRequirementEnabled ? (
                    <>
                      <p>
                        Split <span className="font-semibold text-gray-900">{selectedRequirement?.position}</span> at{' '}
                        <span className="font-semibold text-gray-900">{selectedRequirement?.company}</span> across{' '}
                        {taSplitRows.filter((r) => r.talentAdvisor.trim()).length} Talent Advisors?
                      </p>
                      <ul className="rounded-md border border-purple-100 bg-purple-50/50 px-3 py-2 space-y-1">
                        {taSplitRows
                          .filter((r) => r.talentAdvisor.trim())
                          .map((row, idx) => (
                            <li key={idx} className="text-gray-800">
                              <span className="font-medium">{row.talentAdvisor}</span>
                              {' — '}
                              {row.noOfPositions} position{parseInt(row.noOfPositions, 10) !== 1 ? 's' : ''}
                              {' (target '}
                              {getRequirementResumeTarget({
                                criticality: selectedRequirement?.criticality,
                                toughness: selectedRequirement?.toughness,
                                noOfPositions: parseInt(row.noOfPositions, 10) || 1,
                              })}
                              {' resumes)'}
                            </li>
                          ))}
                      </ul>
                      <p className="text-xs text-gray-500">
                        Each TA will see a separate requirement row marked TA Split with the same requirement ID.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Assign <span className="font-semibold text-gray-900">{selectedAssignee}</span> to{' '}
                        <span className="font-semibold text-gray-900">{selectedRequirement?.position}</span> at{' '}
                        <span className="font-semibold text-gray-900">{selectedRequirement?.company}</span>?
                      </p>
                      {(isReallocating || isTaReassignment) && (
                        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                          Changing the Talent Advisor will reset all metrics and records linked to this requirement for the
                          previous TA. The new TA will start fresh for this role.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAssignment}
                className="bg-gray-800 hover:bg-gray-900"
              >
                {splitRequirementEnabled
                  ? 'Confirm split'
                  : isReallocating || isTaReassignment
                    ? 'Confirm reassignment'
                    : 'Confirm assignment'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <JobDescriptionDetailsModal
          open={isJDPreviewModalOpen}
          onOpenChange={setIsJDPreviewModalOpen}
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
      
      // First, try to parse as ISO date string (most common format from backend)
      if (typeof dateString === 'string') {
        // Check if it's an ISO date string (contains 'T' or ends with 'Z')
        if (dateString.includes('T') || dateString.endsWith('Z')) {
          date = new Date(dateString);
        } 
        // Check if it's in DD-MM-YYYY format (exactly 10 characters, 2 dashes)
        else if (dateString.length === 10 && dateString.split('-').length === 3) {
          const parts = dateString.split('-');
          // If first part is > 12, it's likely DD-MM-YYYY, otherwise try YYYY-MM-DD
          if (parseInt(parts[0]) > 12) {
            // DD-MM-YYYY format
            const [day, month, year] = parts;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            // YYYY-MM-DD format
            const [year, month, day] = parts;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        } 
        // Try standard Date parsing as fallback
        else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '0 days ago';
      if (diffDays === 1) return '01 day ago';
      const paddedDays = diffDays < 10 ? `0${diffDays}` : diffDays.toString();
      return `${paddedDays} days ago`;
    } catch {
      return 'N/A';
    }
  };

  const renderPipelineContent = () => {
    const pipelineTab = (
      <TlPipelineTab
        isLoading={isLoadingPipeline}
        isError={isErrorPipeline}
        isEmpty={
          !isLoadingPipeline &&
          !isErrorPipeline &&
          (!Array.isArray(pipelineData) || pipelineData.length === 0)
        }
        groupedByStage={groupedPipelineCandidates}
        onCandidateClick={handlePipelineCandidateClick}
        selectedRecruiter={selectedPipelineRecruiter}
        onRecruiterChange={setSelectedPipelineRecruiter}
        teamMembers={teamMembers}
        pipelineDate={pipelineDate}
        onPipelineDateChange={setPipelineDate}
        pipelineView={pipelineView}
        candidateSession={
          sessionApplicationId ? (
            <CandidateCommentsSession
              applicationId={sessionApplicationId}
              fallbackApplicant={sessionApplicantSnapshot}
              pipelineApplicants={tlPipelineSessionList}
              onSelectApplicant={handleSelectSessionApplicant}
              onBack={handleCloseCandidateSession}
            />
          ) : null
        }
        closureReportsFooter={
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Closure Reports</h3>
              {closureData.length > 5 && (
                <Button
                  variant="outline"
                  className="border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  style={{ borderRadius: 6 }}
                  onClick={() => setIsViewClosuresModalOpen(true)}
                  data-testid="button-view-closures"
                >
                  View More
                </Button>
              )}
            </div>
            <ClosureReportsCardList
              reports={tlClosureReportsForPipeline}
              isLoading={isLoadingClosures}
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
      <div className="employee-pipeline-tab-layout flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="ml-16 flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">
          <AdminTopHeader
            companyName="Delivery Workspace"
            onHelpClick={() => setIsHelpChatOpen(true)}
          />
          <div className="employee-pipeline-tab-scroll flex min-h-0 flex-1 flex-col overflow-hidden">
            {pipelineTab}
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceContent = () => {
    // Use real data from API queries (teamPerformanceData and closureData defined at component level)

    return (
      <div className="flex min-h-screen">
        <div className="flex-1 ml-16 bg-gray-50">
          <AdminTopHeader 
            companyName="StaffOS" 
            onHelpClick={() => setIsHelpChatOpen(true)}
          />
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            
            {/* Team Performance Graph Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Team Performance Graph</CardTitle>
                <Select
                  value={selectedPerformanceMember}
                  onValueChange={setSelectedPerformanceMember}
                >
                  <SelectTrigger
                    className="w-48 border-slate-300 bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    data-testid="select-performance-member"
                  >
                    <SelectValue placeholder="Select Team Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Members</SelectItem>
                    {performanceGraphData?.members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingPerformanceGraph ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : performanceGraphData?.chartData && performanceGraphData.chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceGraphData.chartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                          allowDecimals={false}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#22c55e"
                          style={{ fontSize: '12px' }}
                          tick={{ fill: '#22c55e' }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="resumesDelivered"
                          name="Resumes Delivered"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="closures"
                          name="Closures"
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* List of Closures Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-gray-900">List of Closures</CardTitle>
                <button
                  className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                  onClick={() => setIsViewClosuresModalOpen(true)}
                  data-testid="button-view-closures"
                >
                  View More
                </button>
              </CardHeader>
              <CardContent className="p-3">
                {closureData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No closures recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Position</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Company</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Closure Month</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Talent Advisor</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Package</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closureData.slice(0, 5).map((closure: any, index: number) => (
                          <tr key={`${closure.name}-${index}`} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                            <td className="py-3 px-4 text-gray-900 font-medium">{closure.name}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.position}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.company}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.closureMonth}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.talentAdvisor}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.package}</td>
                            <td className="py-3 px-4 text-gray-600">{closure.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        {/* Target Section */}
        <Card>
          <CardHeader>
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-0 bg-blue-50 rounded overflow-hidden">
              <div className="bg-blue-100 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Current Quarter</p>
                <p className="text-lg font-bold text-gray-900">
                  {aggregatedTargets?.currentQuarter 
                    ? `${aggregatedTargets.currentQuarter.quarter}-${aggregatedTargets.currentQuarter.year}` 
                    : "N/A"}
                </p>
              </div>
              <div className="bg-blue-50 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Minimum Target</p>
                <p className="text-lg font-bold text-gray-900">
                  {aggregatedTargets?.currentQuarter 
                    ? formatIndianCurrency(aggregatedTargets.currentQuarter.minimumTarget) 
                    : "0"}
                </p>
              </div>
              <div className="bg-blue-100 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Target Achieved</p>
                <p className="text-lg font-bold text-gray-900">
                  {aggregatedTargets?.currentQuarter 
                    ? formatIndianCurrency(aggregatedTargets.currentQuarter.targetAchieved) 
                    : "0"}
                </p>
              </div>
              <div className="bg-blue-50 text-center py-6 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Incentive Earned</p>
                <p className="text-lg font-bold text-gray-900">
                  {aggregatedTargets?.currentQuarter 
                    ? formatIndianCurrency(aggregatedTargets.currentQuarter.incentiveEarned) 
                    : "0"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors">View All</button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Metrics Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Metrics</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Overall</span>
              <StandardDatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                placeholder="Select date"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {/* Left side - 2x2 Grid */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Total Requirements</p>
                  <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600">{formatMetricCount((dailyMetrics as any)?.totalRequirements)}</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Avg. Resumes per Requirement</p>
                  <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600">{formatMetricCount((dailyMetrics as any)?.avgResumesPerRequirement)}</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Requirements per Recruiter</p>
                  <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600">{formatMetricCount((dailyMetrics as any)?.requirementsPerRecruiter)}</span>
                  </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded">
                  <p className="text-sm text-gray-500 mb-2">Completed Requirements</p>
                  <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600">{formatMetricCount((dailyMetrics as any)?.completedRequirements)}</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Daily Delivery & Performance */}
              <div className="space-y-4">
                <div className="bg-slate-800 text-white p-6 rounded">
                  <h3 className="text-lg font-semibold mb-4">Daily Delivery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-2">Delivered</p>
                        <p className="text-3xl font-bold mb-3">{formatMetricCount(dailyMetrics?.dailyDeliveryDelivered)}</p>
                      <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">View</Button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-2">Defaulted</p>
                      <p className="text-3xl font-bold mb-3">{formatMetricCount(dailyMetrics?.dailyDeliveryDefaulted)}</p>
                      <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">View</Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                  <div className="text-sm text-gray-600 mb-2">Overall Performance</div>
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">G</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors">View More</button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pending Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-50 p-4 rounded text-center">
                  <h3 className="font-semibold text-sm mb-2">TL's Meeting</h3>
                  <p className="text-3xl font-bold text-cyan-600 mb-2">3</p>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">View</Button>
                </div>
                <div className="bg-cyan-50 p-4 rounded text-center">
                  <h3 className="font-semibold text-sm mb-2">CEO's Meeting</h3>
                  <p className="text-3xl font-bold text-cyan-600 mb-2">1</p>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CEO Commands */}
          <Card>
            <CardHeader>
              <CardTitle>CEO Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 text-white p-4 rounded">
                <div className="space-y-2 text-sm">
                  <div>Discuss with Shri Ragavi on her production</div>
                  <div>Discuss with Kavya about her leaves</div>
                  <div>Discuss with Umar for data</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTeamSidebar = () => {
    // Use real team members from API
    const teamData = (teamMembers || []).map((member: any) => ({
      name: member.name,
      salary: member.salary || '0 INR',
      year: member.year || "",
      count: parseInt(member.profilesCount) || 0,
      profilePicture: member.profilePicture
    }));

    if (teamData.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Team</h3>
            <p className="text-sm text-gray-500">No team members assigned yet.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Team</h3>
          <div className="space-y-4">
            {teamData.map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.profilePicture || undefined} alt={member.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{member.name}</div>
                    <div className="text-xs text-blue-600">{member.salary}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{member.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOldDashboardTabContent = () => {
    switch (activeTab) {
      case 'team':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Team Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-team-section-title">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {((teamMembers as any) || []).map((member: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1" data-testid={`text-member-name-${index}`}>
                            {member.name}
                          </h3>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1" data-testid={`text-member-salary-${index}`}>
                            {member.salary}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400" data-testid={`text-member-profiles-${index}`}>
                            {member.profilesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-target-section-title">Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                  <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Quarter</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-current-quarter">
                      {aggregatedTargets?.currentQuarter 
                        ? `${aggregatedTargets.currentQuarter.quarter}-${aggregatedTargets.currentQuarter.year}` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Target</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-minimum-target">
                      {aggregatedTargets?.currentQuarter 
                        ? formatIndianCurrency(aggregatedTargets.currentQuarter.minimumTarget) 
                        : '0'}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-gray-700 text-center py-6 px-4 border-r border-blue-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Achieved</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-target-achieved">
                      {aggregatedTargets?.currentQuarter 
                        ? formatIndianCurrency(aggregatedTargets.currentQuarter.targetAchieved) 
                        : '0'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-750 text-center py-6 px-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incentive Earned</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-incentive-earned">
                      {aggregatedTargets?.currentQuarter 
                        ? formatIndianCurrency(aggregatedTargets.currentQuarter.incentiveEarned) 
                        : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Metrics Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle data-testid="text-daily-metrics-title">Daily Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  <StandardDatePicker
                    value={selectedDate}
                    onChange={(date) => date && setSelectedDate(date)}
                    placeholder="Select date"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {/* Left side - 2x2 Grid */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Requirements</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-requirements">
                          {formatMetricCount((dailyMetrics as any)?.totalRequirements)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Completed Requirements</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-completed-requirements">
                          {formatMetricCount((dailyMetrics as any)?.completedRequirements)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avg. Resumes per Requirement</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-resumes">
                          {formatMetricCount((dailyMetrics as any)?.avgResumesPerRequirement)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requirements per Recruiter</p>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-requirements-per-recruiter">
                          {formatMetricCount((dailyMetrics as any)?.requirementsPerRecruiter)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Daily Delivery */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded shadow-sm p-6 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Daily Delivery</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Delivered</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-daily-delivered">
                          {formatMetricCount(dailyMetrics?.dailyDeliveryDelivered)}
                        </p>
                        <button
                          className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                          data-testid="button-view-delivered"
                          onClick={() => setIsDeliveredModalOpen(true)}
                        >
                          View
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Defaulted</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-daily-defaulted">
                          {formatMetricCount(dailyMetrics?.dailyDeliveryDefaulted)}
                        </p>
                        <button
                          className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                          data-testid="button-view-defaulted"
                          onClick={() => setIsDefaultedModalOpen(true)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    <button
                      className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                      data-testid="button-view-more"
                    >
                      View More
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-6">
              {/* CEO Comments */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-ceo-comments-title">CEO Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded">
                    <ul className="space-y-2 text-sm">
                      {((ceoComments as any) || []).map((commentObj: any, index: number) => (
                        <li key={index} data-testid={`text-ceo-comment-${index}`}>
                          {commentObj.comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-pending-meetings-title">Pending Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {((meetings as any) || []).map((meeting: any, index: number) => (
                      <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded text-center">
                        <h3 className="font-semibold text-sm" data-testid={`text-meeting-type-${index}`}>{meeting.type}</h3>
                        <p className="text-2xl font-bold text-blue-600 my-2" data-testid={`text-meeting-count-${index}`}>
                          {meeting.count}
                        </p>
                        <Button variant="outline" size="sm" data-testid={`button-view-meeting-${index}`}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Priority Distribution Section */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-red-500 mb-1">HIGH</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-red-500">10</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-blue-500 mb-1">MEDIUM</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-blue-500">5</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">LOW</p>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-gray-500">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Requirements</CardTitle>
                <SearchBar
                  value={requirementSearch}
                  onChange={setRequirementSearch}
                  placeholder="Search requirements..."
                  testId="input-search-requirements"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Positions</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Criticality</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Recruiter</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Reallocate</th>
                      </tr>
                    </thead>
                    <tbody>
                  {visibleRequirementsData
                        .filter((requirement) => 
                          requirement.position.toLowerCase().includes(requirementSearch.toLowerCase()) ||
                          requirement.criticality.toLowerCase().includes(requirementSearch.toLowerCase()) ||
                          requirement.company.toLowerCase().includes(requirementSearch.toLowerCase()) ||
                          (requirement.spoc && requirement.spoc.toLowerCase().includes(requirementSearch.toLowerCase())) ||
                          (requirement.talentAdvisor && requirement.talentAdvisor.toLowerCase().includes(requirementSearch.toLowerCase()))
                        )
                        .map((requirement: any) => (
                        <tr
                          key={requirement.id}
                          className={`border-b border-gray-100 dark:border-gray-800 ${requirement.managementStatus === 'closed' && requirement.isRecentlyClosed ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30' : requirement.managementStatus === 'hold' ? 'bg-yellow-100/80 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' : ''}`}
                          title={requirement.managementStatus === 'closed' && requirement.isRecentlyClosed ? 'Requirement was closed and will leave this list after 24 hours' : requirement.managementStatus === 'hold' ? 'Requirement is on Hold' : undefined}
                        >
                          <td className="py-4 px-4 text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span>{requirement.position}</span>
                              {requirement.managementStatus === 'closed' && requirement.isRecentlyClosed && (
                                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  Closed
                                </span>
                              )}
                              {requirement.managementStatus === 'hold' && (
                                <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  On Hold
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              requirement.criticality.toUpperCase() === 'HIGH' 
                                ? 'bg-red-100 text-red-800' 
                                : requirement.criticality.toUpperCase() === 'MEDIUM'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {requirement.criticality.toUpperCase()}-{requirement.toughness || 'Medium'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{requirement.company}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{requirement.spoc || '-'}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{requirement.talentAdvisor || '-'}</td>
                          <td className="py-4 px-4">
                            {requirement.managementStatus === 'closed' && requirement.isRecentlyClosed ? (
                              <span className="text-sm font-medium text-red-700">Archived</span>
                            ) : requirement.talentAdvisor ? (
                              requirement.needsTalentAdvisorReassignment ? (
                                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                  {requirement.talentAdvisor}
                                </span>
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400">{requirement.talentAdvisor}</span>
                              )
                            ) : (
                              <Button 
                                size="sm" 
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded btn-rounded"
                                onClick={() => handleAssign(requirement)}
                              >
                                Assign
                              </Button>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {requirement.talentAdvisor && !(requirement.managementStatus === 'closed' && requirement.isRecentlyClosed) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded btn-rounded"
                                onClick={() => handleReallocate(requirement)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between">
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors btn-rounded">
                    View More
                  </button>
                  <Button variant="outline" className="rounded btn-rounded">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'pipeline':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Pipeline Stages */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 1</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 2</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Level 3</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Final Round</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">HR Round</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Offer Stage</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Closure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                            Keerthana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <div className="flex items-center justify-between">
                            <span className={`inline-block flex-1 text-center px-3 py-2 rounded text-sm ${candidateColors['Keerthana']}`}>
                              Keerthana
                            </span>
                            <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="ml-2 p-1">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Closure Report</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="candidate-name">Candidate Name</Label>
                                    <Input id="candidate-name" placeholder="Enter name" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="fixed-ctc">Fixed CTC</Label>
                                    <Input id="fixed-ctc" placeholder="Enter CTC" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Input id="client" placeholder="Enter client" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="talent-advisor">Talent Advisor</Label>
                                    <Input id="talent-advisor" placeholder="Enter advisor" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input id="position" placeholder="Enter position" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="offered-date">Offered Date</Label>
                                    <Input id="offered-date" type="date" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="joining-date">Joining Date</Label>
                                    <Input id="joining-date" type="date" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="comments">Comments</Label>
                                    <Input id="comments" placeholder="Enter comments" className="bg-gray-50 dark:bg-gray-700 border rounded" />
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">Send Report</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                      {/* Row 2 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                            Vishnu Purana
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <div className="flex items-center justify-between">
                            <span className={`inline-block flex-1 text-center px-3 py-2 rounded text-sm ${candidateColors['Vishnu Purana']}`}>
                              Vishnu Purana
                            </span>
                            <Button variant="ghost" size="sm" className="ml-2 p-1">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Row 3 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Chanakya']}`}>
                            Chanakya
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 4 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Adhya']}`}>
                            Adhya
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 5 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vanshika']}`}>
                            Vanshika
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 6 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Reyansh']}`}>
                            Reyansh
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Reyansh']}`}>
                            Reyansh
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 7 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Saurang']}`}>
                            Saurang
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                      {/* Row 8 */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 w-32">
                          <span className={`inline-block w-full text-center px-3 py-2 rounded text-sm ${candidateColors['Vihana']}`}>
                            Vihana
                          </span>
                        </td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                        <td className="p-3 w-32"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Team Performance Graph */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Team Performance Graph</CardTitle>
                <Select
                  value={selectedPerformanceMember}
                  onValueChange={setSelectedPerformanceMember}
                >
                  <SelectTrigger
                    className="w-[200px] border-slate-300 bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    data-testid="select-performance-member"
                  >
                    <SelectValue placeholder="Select Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {performanceGraphData?.members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {isLoadingPerformanceGraph ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : performanceGraphData?.chartData && performanceGraphData.chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceGraphData.chartData} barGap={8}>
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
                          label={{ value: 'Resumes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          tick={{ fill: '#6b7280' }}
                          label={{ value: 'Closures', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="resumesDelivered" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                          name="Resumes Delivered"
                        />
                        <Bar 
                          yAxisId="right" 
                          dataKey="closures" 
                          fill="#22c55e" 
                          radius={[4, 4, 0, 0]} 
                          name="Closures"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Performance Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Joining Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Tenure</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Closures</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Last Closure</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Qtrs Achieved</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">David Wilson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">23-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,3 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">4</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">23-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">3</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tom Anderson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">28-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,3 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">8</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">29-04-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">6</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Robert Kim</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">04-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,2 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">9</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">02-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">11</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kevin Brown</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">12-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs,2 months</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">13</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18-05-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">5</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mel Gibson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">05-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2 yrs</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">5</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">01-06-2023</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">13</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors">View Full List</button>
                </div>
              </CardContent>
            </Card>

            {/* List of Closures Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>List Of Closures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Candidate</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Positions</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Quarter</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">CTC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">David Wilson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Frontend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">TechCorp</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kavitha</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">15,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,12,455</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tom Anderson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">UI/UX Designer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Designify</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">ASO, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Rajesh</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">25,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,87,425</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Robert Kim</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Backend Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">CodeLabs</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">MJJ, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Sowmiya</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">18,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">1,34,946</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kevin Brown</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">QA Tester</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">AppLogic</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">PMA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Kalaiselvi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">30,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">2,24,910</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mel Gibson</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Mobile App Developer</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Tesco</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">NDA, 2025</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">Malathi</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">50,00,000</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">4,49,820</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors">View Full List</button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="px-6 py-6 space-y-6">
            {/* Default content - same as team tab */}
          </div>
        );
    }
  };

  return (
    <div
      className={
        isMobile
          ? "flex h-screen max-h-[100dvh] flex-col overflow-hidden bg-gray-50"
          : "min-h-screen"
      }
    >
      {isMobile ? (
        <>
          <AdminTopHeader
            companyName="Delivery Workspace"
            onHelpClick={() => setIsHelpChatOpen(true)}
            onNavigateToSection={() => setSidebarTab("pipeline")}
          />
          <div className="tl-mobile-pipeline-only flex min-h-0 flex-1 flex-col overflow-hidden">
            <style>{`.tl-mobile-pipeline-only .ml-16 { margin-left: 0 !important; }`}</style>
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
          />
          {renderMainContent()}
        </>
      )}

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        linkableRequirements={visibleRequirementsData as any[]}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/team-leader/sourcing/jobs-counts', employee?.id] });
          queryClient.invalidateQueries({ queryKey: ['/api/team-leader/sourcing/jobs', employee?.id] });
          queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
          queryClient.refetchQueries({ queryKey: ['/api/team-leader/sourcing/jobs', employee?.id] });
          queryClient.refetchQueries({ queryKey: ['/api/team-leader/sourcing/jobs-counts', employee?.id] });
        }}
        formData={jobFormData}
        setFormData={setJobFormData}
        formError={jobFormError}
        setFormError={setJobFormError}
      />

      <UploadResumeModal
        isOpen={isUploadResumeModalOpen}
        onClose={() => setIsUploadResumeModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/team-leader/sourcing/candidates-counts', employee?.id] });
          queryClient.invalidateQueries({ queryKey: ['/api/team-leader/sourcing/candidates', employee?.id] });
          queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
          queryClient.invalidateQueries({ queryKey: ['/api/source-resume/search'] });
          queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
          queryClient.refetchQueries({ queryKey: ['/api/team-leader/sourcing/candidates', employee?.id] });
          queryClient.refetchQueries({ queryKey: ['/api/team-leader/sourcing/candidates-counts', employee?.id] });
        }}
        formData={resumeFormData}
        setFormData={setResumeFormData}
        resumeFile={resumeFile}
        setResumeFile={setResumeFile}
        formError={resumeFormError}
        setFormError={setResumeFormError}
      />

      <Dialog open={isActiveJobsModalOpen} onOpenChange={setIsActiveJobsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Active Jobs</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {renderSourcingJobCards(activeTlJobs, 'No active jobs posted by this team leader yet.')}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPostedJobsModalOpen} onOpenChange={setIsPostedJobsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Posted Jobs</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {renderSourcingJobCards(tlSourcingJobs, 'No jobs have been posted by this team leader yet.')}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadedResumesModalOpen} onOpenChange={setIsUploadedResumesModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uploaded Resumes</DialogTitle>
          </DialogHeader>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="p-3 text-sm font-semibold text-slate-600">Candidate ID</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Name</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Email</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Current Role</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Location</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {tlOwnedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                      No resumes have been uploaded by this team leader yet.
                    </td>
                  </tr>
                ) : (
                  tlOwnedCandidates.map((candidate: any) => (
                    <tr key={candidate.id} className="border-b border-slate-100">
                      <td className="p-3 text-sm text-slate-700">{candidate.candidateId || '-'}</td>
                      <td className="p-3 text-sm font-medium text-slate-900">{candidate.fullName || '-'}</td>
                      <td className="p-3 text-sm text-slate-700">{candidate.email || '-'}</td>
                      <td className="p-3 text-sm text-slate-700">{candidate.currentRole || candidate.designation || '-'}</td>
                      <td className="p-3 text-sm text-slate-700">{candidate.location || '-'}</td>
                      <td className="p-3 text-sm text-slate-700">{formatSourcingDate(candidate.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Closure Details Modal */}
      <Dialog open={isClosureDetailsModalOpen} onOpenChange={setIsClosureDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Closure Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingClosures ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                <span className="ml-2 text-gray-500 dark:text-gray-400">Loading closure reports...</span>
              </div>
            ) : closureData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No closure reports available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidate</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Position</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Client</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Package</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Closure Month</th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closureData.map((closure: any, index: number) => (
                      <tr 
                        key={`closure-modal-${index}`} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        data-testid={`row-closure-modal-${index}`}
                      >
                        <td className="p-3 text-gray-900 dark:text-white">{closure.name}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.position}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.company}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.talentAdvisor}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.package}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.closureMonth}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{closure.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Closures: {closureData.length} | Total Revenue: {closureData.reduce((sum: number, c: any) => sum + (parseFloat(c.revenue?.replace(/,/g, '') || '0')), 0).toLocaleString('en-IN')}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsClosureDetailsModalOpen(false)}
                className="btn-rounded"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View More Requirements Modal */}
      <Dialog open={isViewMoreRequirementsModalOpen} onOpenChange={setIsViewMoreRequirementsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">All Requirements</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300 w-[88px]">ID</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300 w-[200px] max-w-[200px]">Positions</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Resume Count</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Criticality</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Company</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">SPOC</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Talent Advisor</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequirementsData.map((requirement: any, index) => {
                    const positionCount = requirement.noOfPositions ?? 1;
                    const taSplitMeta = getRequirementTaSplitMeta(requirement);
                    const splitBadge = getRequirementSplitBadgeLabel(requirement);
                    return (
                    <tr key={requirement.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="p-3 w-[88px] text-xs font-semibold text-slate-600 border border-gray-300 whitespace-nowrap">
                        {getRequirementDisplayId(requirement)}
                      </td>
                      <td className="p-3 w-[200px] max-w-[200px] text-gray-900 border border-gray-300">
                        <div className="font-medium truncate" title={requirement.position}>{requirement.position}</div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {positionCount} position{positionCount !== 1 ? 's' : ''}
                          {splitBadge && (
                            <span
                              className={`ml-1 font-medium ${
                                taSplitMeta ? "text-purple-700" : "text-indigo-700"
                              }`}
                              title={splitBadge.title}
                            >
                              • {splitBadge.label}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="p-3 border border-gray-300">
                        <span className="text-sm font-bold text-red-900">
                          {requirement.resumeCount || '00/00'}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-300">
                        <span className={`text-xs font-semibold px-2 py-1 rounded inline-flex items-center ${
                          requirement.criticality.toUpperCase() === 'HIGH' ? 'bg-red-100 text-red-800' :
                          requirement.criticality.toUpperCase() === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            requirement.criticality.toUpperCase() === 'HIGH' ? 'bg-red-500' :
                            requirement.criticality.toUpperCase() === 'MEDIUM' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></span>
                          {requirement.criticality.toUpperCase()}-{requirement.toughness || 'Medium'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-900 border border-gray-300">{requirement.company}</td>
                      <td className="p-3 text-gray-900 border border-gray-300">{requirement.spoc || '-'}</td>
                      <td className="p-3 text-gray-900 border border-gray-300">{requirement.talentAdvisor || 'Unassigned'}</td>
                      <td className="p-3 border border-gray-300">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          requirement.talentAdvisor ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {requirement.talentAdvisor ? 'Assigned' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => setIsViewMoreRequirementsModalOpen(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Graph Modal */}
      <Dialog open={isPerformanceGraphModalOpen} onOpenChange={setIsPerformanceGraphModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Performance - Detailed View
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-start gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Requirements</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Profiles Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Closures</span>
              </div>
            </div>
            <div className="h-[420px]">
              <PerformanceChart
                data={(dailyMetrics?.performanceData as TeamPerformanceRow[]) || []}
                height="100%"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closures Modal */}
      <Dialog open={isViewClosuresModalOpen} onOpenChange={setIsViewClosuresModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">All Closures</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Name</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Position</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Company</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Closure Month</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Talent Advisor</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Package</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border border-gray-300">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {closureData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-600 border border-gray-300">
                        No closures data available
                      </td>
                    </tr>
                  ) : (
                    closureData.map((closure: any, index: number) => (
                      <tr key={closure.id || index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 text-gray-900 border border-gray-300 font-medium">{closure.name || closure.candidate || '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.position || '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.company || closure.client || '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.closureMonth || closure.quarter || '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.talentAdvisor || '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.package ? `₹${closure.package}` : closure.ctc ? `₹${closure.ctc}` : '-'}</td>
                        <td className="p-3 text-gray-600 border border-gray-300">{closure.revenue ? `₹${closure.revenue}` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => setIsViewClosuresModalOpen(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Delivery Modals */}
      <DailyDeliveryModal
        open={isDeliveredModalOpen}
        onOpenChange={setIsDeliveredModalOpen}
        title="Delivered Items"
        rows={dailyMetrics?.deliveredItems as any[] || []}
        columns={[
          { key: 'requirement', label: 'Requirement' },
          { key: 'candidate', label: 'Candidate' },
          { key: 'client', label: 'Client' },
          { key: 'deliveredDate', label: 'Delivered Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No delivered items today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}
        testIdPrefix="delivered"
      />

      <DailyDeliveryModal
        open={isDefaultedModalOpen}
        onOpenChange={setIsDefaultedModalOpen}
        title="Defaulted Items"
        rows={dailyMetrics?.defaultedItems as any[] || []}
        columns={[
          { key: 'requirement', label: 'Requirement' },
          { key: 'candidate', label: 'Candidate' },
          { key: 'client', label: 'Client' },
          { key: 'expectedDate', label: 'Expected Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No defaulted items today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}
        testIdPrefix="defaulted"
      />

      {/* Meetings Modal */}
      <Dialog open={isMeetingsModalOpen} onOpenChange={setIsMeetingsModalOpen}>
        <DialogContent className="max-w-5xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Pending Meetings
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Meeting Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Person</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Agenda</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDetailedMeetings ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                          Loading meetings...
                        </div>
                      </td>
                    </tr>
                  ) : detailedMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        No meetings scheduled
                      </td>
                    </tr>
                  ) : (
                    detailedMeetings.map((meeting: any, index: number) => (
                      <tr key={meeting.id || index} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{meeting.meetingType}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.time}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.person}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.agenda}</td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            meeting.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => setIsMeetingsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-meetings-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CEO Comments Modal */}
      <Dialog open={isCeoCommentsModalOpen} onOpenChange={setIsCeoCommentsModalOpen}>
        <DialogContent className="max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              CEO Commands
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              {isLoadingCeoComments || isLoadingChatRooms ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                    Loading commands and messages...
                  </div>
                </div>
              ) : combinedCeoFeed.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No CEO commands or messages at the moment
                </div>
              ) : (
                combinedCeoFeed.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${
                      item.kind === 'message'
                        ? 'bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                    onClick={() => {
                      if (item.kind === 'message' && item.roomId) {
                        setSelectedChatRoom(item.roomId);
                        setIsChatModalOpen(true);
                        setIsCeoCommentsModalOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {item.label}
                        {item.unread ? ` · ${item.unread} new` : ''}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm font-medium">{item.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setIsCeoCommentsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-comments-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Support */}
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

      <ChatDock 
        open={isHelpChatOpen} 
        onClose={() => setIsHelpChatOpen(false)} 
        userName={userName}
        userRole={userRole}
      />

      <AllQuartersTargetDialog
        open={isTargetModalOpen}
        onOpenChange={setIsTargetModalOpen}
        allQuarters={aggregatedTargets?.allQuarters || []}
        formatIndianCurrency={formatIndianCurrency}
      />
    </div>
  );
}
