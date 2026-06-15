import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Settings, KeyRound, LogOut, HelpCircle, Bell, MessageCircle, Briefcase, Users, CheckCircle, Calendar } from "lucide-react";
import NotificationPanel, {
  type NotificationNavigateSection,
  type NotificationPanelRow,
  type NotificationSectionConfig,
} from "@/components/dashboard/notification-panel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import ChangePasswordModal from "@/components/dashboard/modals/ChangePasswordModal";
import type { UserActivity } from "@shared/schema";
import { formatEmployeeRoleDisplay } from "@/lib/employee-display";
import { resolveProfilePictureUrl } from "@/lib/resolve-media-url";
import { useNotificationSound } from "@/hooks/use-notification-sound";

interface AdminTopHeaderProps {
  companyName?: string;
  onHelpClick?: () => void;
  hideHelpButton?: boolean;
  /** Admin only: switches dashboard sidebar to the Nudges session */
  onOpenNudgesTab?: () => void;
  /** Navigate to the dashboard section for a clicked notification */
  onNavigateToSection?: (section: NotificationNavigateSection) => void;
}

type AdminNotificationFeed = {
  closures: Array<{ id: string; line: string; createdAt: string | null }>;
  adminNudges: Array<{ id: string; line: string; createdAt: string | null; isUnread: boolean }>;
  clientEscalations: Array<{ id: string; line: string; createdAt: string | null; isUnread: boolean }>;
  unreadAdminNudges: number;
  unreadClientEscalations: number;
};

type EmployeeNotificationItem = {
  id: string;
  line: string;
  createdAt: string | null;
  isUnread: boolean;
  escalationLevel?: string | null;
  currentStatus?: string | null;
};

type EmployeeNotificationFeed = {
  role: string;
  newRequirements: EmployeeNotificationItem[];
  clientJdSubmissions?: EmployeeNotificationItem[];
  nudges: EmployeeNotificationItem[];
  escalatedNudges: EmployeeNotificationItem[];
  closures: EmployeeNotificationItem[];
  newCandidateApplied: EmployeeNotificationItem[];
  unreadCount: number;
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'requirement_added':
      return { icon: Briefcase, bgClass: 'bg-blue-100 dark:bg-blue-900', textClass: 'text-blue-600 dark:text-blue-400' };
    case 'candidate_pipeline_changed':
      return { icon: Users, bgClass: 'bg-purple-100 dark:bg-purple-900', textClass: 'text-purple-600 dark:text-purple-400' };
    case 'closure_made':
      return { icon: CheckCircle, bgClass: 'bg-green-100 dark:bg-green-900', textClass: 'text-green-600 dark:text-green-400' };
    case 'candidate_submitted':
      return { icon: MessageCircle, bgClass: 'bg-orange-100 dark:bg-orange-900', textClass: 'text-orange-600 dark:text-orange-400' };
    case 'interview_scheduled':
      return { icon: Calendar, bgClass: 'bg-cyan-100 dark:bg-cyan-900', textClass: 'text-cyan-600 dark:text-cyan-400' };
    default:
      return { icon: Bell, bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400' };
  }
}

function getDismissedNotificationsKey(employeeId?: string | null): string | null {
  return employeeId ? `staffos-dismissed-notifications:${employeeId}` : null;
}

function readDismissedNotificationKeys(storageKey: string | null): Set<string> {
  if (!storageKey) return new Set();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((k) => typeof k === "string")) : new Set();
  } catch {
    return new Set();
  }
}

export default function AdminTopHeader({
  companyName = "Scaling Theory",
  onHelpClick,
  hideHelpButton = false,
  onOpenNudgesTab,
  onNavigateToSection,
}: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<string>('all');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [profileModalView, setProfileModalView] = useState<"profile" | "settings">("profile");
  const [profileData, setProfileData] = useState<any>(null);
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();
  const dismissedStorageKey = getDismissedNotificationsKey(employee?.id);
  const [dismissedNotificationKeys, setDismissedNotificationKeys] = useState<Set<string>>(() =>
    readDismissedNotificationKeys(dismissedStorageKey),
  );
  const [profileImgError, setProfileImgError] = useState(false);

  const userRole = employee?.role || "admin";
  const normalizedRole = (userRole || "").toLowerCase().replace(/[\s-]+/g, "_");
  const isAdmin = normalizedRole === "admin" || normalizedRole.includes("admin");
  const isTL = normalizedRole === "team_leader" || normalizedRole === "teamleader" || normalizedRole === "tl";
  const isTA =
    normalizedRole === "recruiter" ||
    normalizedRole === "talent_advisor" ||
    normalizedRole === "ta";

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activities', userRole],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/user-activities/${userRole}?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: showUserDropdown,
  });
  
  useEffect(() => {
    const loadProfileData = async () => {
      if (!employee?.role) return;

      try {
        let endpoint = '';
        switch (employee.role) {
          case 'recruiter':
            endpoint = '/api/recruiter/profile';
            break;
          case 'team_leader':
            endpoint = '/api/team-leader/profile';
            break;
          case 'admin':
            endpoint = '/api/admin/profile';
            break;
          case 'client':
            endpoint = '/api/client/profile';
            break;
        }

        if (endpoint) {
          try {
            const response = await apiRequest('GET', endpoint);
            const data = await response.json();
            setProfileData(data);
          } catch (error) {
            // Silently fail - profile data is optional
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();

    const handleProfileUpdated = () => {
      loadProfileData();
    };

    window.addEventListener('profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('profile-updated', handleProfileUpdated);
  }, [employee?.role]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserDropdown && !target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
      if (showNotifications && !target.closest('.notification-panel-container')) {
        setShowNotifications(false);
      }
    };

    if (showUserDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown, showNotifications]);
  
  const profilePictureSrc = useMemo(
    () => resolveProfilePictureUrl(profileData?.profilePicture),
    [profileData?.profilePicture],
  );
  useEffect(() => {
    setProfileImgError(false);
  }, [profilePictureSrc]);

  const userName = profileData?.name || employee?.name || "Admin User";
  const userEmail = profileData?.email || employee?.email || "";
  const displayCompanyName = companyName;
  
  const displayRole = formatEmployeeRoleDisplay(profileData?.role || userRole, { employeeRole: userRole });

  const notificationFeedKey = isAdmin
    ? "/api/admin/notifications-feed"
    : "/api/employee/notifications-feed";

  const {
    data: employeeFeed,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchNotificationFeed,
  } = useQuery<EmployeeNotificationFeed>({
    queryKey: [notificationFeedKey],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", notificationFeedKey);
        const data = await res.json();
        if (isAdmin) {
          const adminData = data as {
            closures?: EmployeeNotificationItem[];
            adminNudges?: EmployeeNotificationItem[];
            clientEscalations?: EmployeeNotificationItem[];
            clientJdSubmissions?: EmployeeNotificationItem[];
            nudges?: EmployeeNotificationItem[];
            escalatedNudges?: EmployeeNotificationItem[];
            unreadAdminNudges?: number;
            unreadClientEscalations?: number;
            unreadClientJdSubmissions?: number;
          };
          const nudges = adminData.adminNudges ?? adminData.nudges ?? [];
          const escalated = adminData.clientEscalations ?? adminData.escalatedNudges ?? [];
          const closures = adminData.closures ?? [];
          const clientJds = adminData.clientJdSubmissions ?? [];
          return {
            role: "admin",
            closures,
            nudges,
            escalatedNudges: escalated,
            clientJdSubmissions: clientJds,
            newRequirements: [],
            newCandidateApplied: [],
            unreadCount:
              (adminData.unreadAdminNudges ?? 0) +
              (adminData.unreadClientEscalations ?? 0) +
              (adminData.unreadClientJdSubmissions ?? 0) +
              closures.filter((c) => c.isUnread).length,
          };
        }
        return data as EmployeeNotificationFeed;
      } catch (err) {
        console.warn("[notifications-feed] fetch failed:", err);
        return {
          role: isAdmin ? "admin" : "employee",
          closures: [],
          nudges: [],
          escalatedNudges: [],
          newRequirements: [],
          newCandidateApplied: [],
          unreadCount: 0,
        } as EmployeeNotificationFeed;
      }
    },
    enabled: isAdmin || isTL || isTA,
    retry: 1,
  });

  useEffect(() => {
    if (showNotifications && (isAdmin || isTL || isTA)) {
      void refetchNotificationFeed();
    }
  }, [showNotifications, isAdmin, isTL, isTA, refetchNotificationFeed]);

  const markNudgeReadMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/notifications/nudges/${nudgeId}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationFeedKey] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications-feed"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
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
      window.location.href = '/';
    },
    onError: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      window.location.href = '/';
    },
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: async ({ kind, id }: { kind: string; id: string }) => {
      const res = await apiRequest("PATCH", "/api/employee/notifications/dismiss", { kind, id });
      return res.json();
    },
    onSuccess: () => {
      void refetchNotificationFeed();
    },
  });

  const notificationTabs = useMemo(() => {
    if (isAdmin) {
      return [
        { id: "all", label: "All" },
        { id: "clientJds", label: "Client JDs" },
        { id: "closures", label: "Candidate Closures" },
        { id: "nudges", label: "Nudges" },
        { id: "escalations", label: "Nudges Escalations" },
      ];
    }
    if (isTL) {
      return [
        { id: "all", label: "All" },
        { id: "newRequirements", label: "New Requirements" },
        { id: "nudges", label: "Nudges" },
        { id: "escalatedNudges", label: "Nudges Escalations" },
        { id: "closures", label: "Candidate Closures" },
      ];
    }
    return [
      { id: "all", label: "All" },
      { id: "newRequirements", label: "New Requirements" },
      { id: "nudges", label: "Nudges" },
      { id: "escalatedNudges", label: "Nudges Escalations" },
      { id: "newCandidateApplied", label: "New Profiles" },
    ];
  }, [isAdmin, isTL]);

  const notificationSections = useMemo((): NotificationSectionConfig[] => {
    if (isAdmin) {
      return [
        {
          id: "clientJds",
          heading: "New JD from Client",
          headingClassName: "text-cyan-700",
          kinds: ["clientJd"],
          tabId: "clientJds",
          navigateTo: "requirements",
        },
        {
          id: "closures",
          heading: "Candidate moved to closure",
          headingClassName: "text-emerald-700",
          kinds: ["closure"],
          tabId: "closures",
          navigateTo: "closures",
        },
        {
          id: "nudges",
          heading: "Nudges - Action Needed",
          headingClassName: "text-amber-700",
          kinds: ["nudge"],
          tabId: "nudges",
          showActButton: true,
          showTimeRemaining: true,
          navigateTo: "nudges",
        },
        {
          id: "escalations",
          heading: "Nudges - Action Escalation",
          headingClassName: "text-orange-800",
          kinds: ["escalation"],
          tabId: "escalations",
          showTimeRemaining: true,
          navigateTo: "escalations",
        },
      ];
    }
    if (isTL) {
      return [
        {
          id: "closures",
          heading: "Candidate moved to closure",
          headingClassName: "text-emerald-700",
          kinds: ["closure"],
          tabId: "closures",
          navigateTo: "closures",
        },
        {
          id: "requirements",
          heading: "New Requirements",
          headingClassName: "text-blue-700",
          kinds: ["newRequirement"],
          tabId: "newRequirements",
          navigateTo: "requirements",
        },
        {
          id: "nudges",
          heading: "Nudges - Action Needed",
          headingClassName: "text-amber-700",
          kinds: ["nudge"],
          tabId: "nudges",
          showTimeRemaining: true,
          navigateTo: "nudges",
        },
        {
          id: "escalated",
          heading: "Nudges - Action Escalation",
          headingClassName: "text-orange-800",
          kinds: ["escalatedNudge"],
          tabId: "escalatedNudges",
          showTimeRemaining: true,
          navigateTo: "escalations",
        },
      ];
    }
    return [
      {
        id: "closures",
        heading: "Candidate moved to closure",
        headingClassName: "text-emerald-700",
        kinds: ["closure"],
        tabId: "closures",
        navigateTo: "closures",
      },
      {
        id: "requirements",
        heading: "New Requirements",
        headingClassName: "text-blue-700",
        kinds: ["newRequirement"],
        tabId: "newRequirements",
        navigateTo: "requirements",
      },
      {
        id: "nudges",
        heading: "Nudges - Action Needed",
        headingClassName: "text-amber-700",
        kinds: ["nudge"],
        tabId: "nudges",
        showTimeRemaining: true,
        navigateTo: "nudges",
      },
      {
        id: "escalated",
        heading: "Nudges - Action Escalation",
        headingClassName: "text-orange-800",
        kinds: ["escalatedNudge"],
        tabId: "escalatedNudges",
        showTimeRemaining: true,
        navigateTo: "escalations",
      },
      {
        id: "candidates",
        heading: "New Candidate Applied",
        headingClassName: "text-violet-700",
        kinds: ["newCandidate"],
        tabId: "newCandidateApplied",
        navigateTo: "newCandidates",
      },
    ];
  }, [isAdmin, isTL]);

  useEffect(() => {
    if (!notificationTabs.some((t) => t.id === notificationTab)) {
      setNotificationTab(notificationTabs[0]?.id || "all");
    }
  }, [notificationTabs, notificationTab]);

  type FeedRow = NotificationPanelRow & { sort: number };

  const dismissNotification = (row: NotificationPanelRow) => {
    setDismissedNotificationKeys((prev) => {
      const next = new Set(prev);
      next.add(row.key);
      if (dismissedStorageKey) {
        localStorage.setItem(dismissedStorageKey, JSON.stringify(Array.from(next)));
      }
      return next;
    });

    if (row.kind === "nudge" || row.kind === "escalation" || row.kind === "escalatedNudge") {
      dismissNotificationMutation.mutate({ kind: row.kind, id: row.id });
    }
  };

  const mergedRows = useMemo<FeedRow[]>(() => {
    if (!employeeFeed) return [];
    const rows: FeedRow[] = [];

    const pushRows = (kind: string, items: EmployeeNotificationItem[], includeNudgeId = false) => {
      for (const item of items) {
        rows.push({
          key: `${kind}-${item.id}`,
          kind,
          line: item.line,
          createdAt: item.createdAt || new Date().toISOString(),
          isUnread: item.isUnread,
          escalationLevel: item.escalationLevel,
          currentStatus: item.currentStatus,
          nudgeId: includeNudgeId ? item.id : undefined,
          sort: item.createdAt ? new Date(item.createdAt).getTime() : 0,
          id: item.id,
        });
      }
    };

    if (isAdmin) {
      pushRows("clientJd", employeeFeed.clientJdSubmissions ?? []);
      pushRows("closure", employeeFeed.closures);
      pushRows("nudge", employeeFeed.nudges, true);
      pushRows("escalation", employeeFeed.escalatedNudges);
    } else if (isTL) {
      pushRows("newRequirement", employeeFeed.newRequirements);
      pushRows("nudge", employeeFeed.nudges);
      pushRows("escalatedNudge", employeeFeed.escalatedNudges);
      pushRows("closure", employeeFeed.closures);
    } else {
      pushRows("newRequirement", employeeFeed.newRequirements);
      pushRows("nudge", employeeFeed.nudges);
      pushRows("escalatedNudge", employeeFeed.escalatedNudges);
      pushRows("closure", employeeFeed.closures);
      pushRows("newCandidate", employeeFeed.newCandidateApplied);
    }
    return rows.sort((a, b) => b.sort - a.sort);
  }, [employeeFeed, isAdmin, isTL]);

  const visibleRows = useMemo(
    () => mergedRows.filter((row) => !dismissedNotificationKeys.has(row.key)),
    [mergedRows, dismissedNotificationKeys],
  );

  const panelRows = useMemo((): NotificationPanelRow[] => visibleRows, [visibleRows]);

  const headerUnreadCount = useMemo(
    () => visibleRows.filter((r) => r.isUnread).length,
    [visibleRows],
  );

  useNotificationSound(headerUnreadCount, isAdmin || isTL || isTA);

  const navigateForSection = (section: NotificationNavigateSection) => {
    const storageKey = isTL
      ? "tlDashboardSidebarTab"
      : isAdmin
        ? "adminDashboardSidebarTab"
        : "recruiterDashboardSidebarTab";

    const tabBySection: Record<NotificationNavigateSection, string> = isAdmin
      ? {
          closures: "performance",
          nudges: "nudges",
          escalations: "nudges",
          pipeline: "pipeline",
          requirements: "requirements",
          newCandidates: "pipeline",
        }
      : {
          closures: "performance",
          nudges: "nudges",
          escalations: "nudges",
          pipeline: "pipeline",
          requirements: "requirements",
          newCandidates: "pipeline",
        };

    sessionStorage.setItem(storageKey, tabBySection[section]);
    window.dispatchEvent(
      new CustomEvent("staffos-notification-navigate", { detail: { section, storageKey, tab: tabBySection[section] } }),
    );
    onNavigateToSection?.(section);
    if (section === "nudges" || section === "escalations") {
      onOpenNudgesTab?.();
    }
    setShowNotifications(false);
    void queryClient.invalidateQueries({ queryKey: ["/api/nudges"] });
  };

  const handlePanelNavigate = (_section: NotificationNavigateSection, row: NotificationPanelRow) => {
    const section = notificationSections.find((s) => s.kinds.includes(row.kind))?.navigateTo ?? "nudges";
    navigateForSection(section);
  };

  const handleActOnNudge = async (row: NotificationPanelRow) => {
    if (row.nudgeId) {
      try {
        await markNudgeReadMutation.mutateAsync(row.nudgeId);
      } catch {
        /* still navigate */
      }
    }
    navigateForSection("nudges");
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    beginSignOut();
    logoutMutation.mutate();
  };

  const handleProfileSettings = () => {
    setShowUserDropdown(false);
    setProfileModalView("profile");
    setShowProfileSettings(true);
  };

  const handlePasswordChange = () => {
    setShowUserDropdown(false);
    setIsChangePasswordModalOpen(true);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="flex items-center min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pl-2">
          {companyName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!hideHelpButton && (
          <button 
            onClick={onHelpClick}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-header-help"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Help</span>
          </button>
        )}

        {(isAdmin || isTL || isTA) && (
          <div className="relative notification-panel-container">
            <button
              type="button"
              onClick={() => {
                setShowUserDropdown(false);
                setShowNotifications((prev) => !prev);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Notifications"
              data-testid="button-header-notification"
            >
              <span className="relative inline-flex">
                <Bell size={20} strokeWidth={2} />
                {headerUnreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white dark:ring-slate-800" />
                )}
              </span>
            </button>

            {showNotifications && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px]"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="notification-panel-container fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[min(96vw,720px)] flex-col overflow-hidden rounded-l-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                  <NotificationPanel
                    rows={panelRows}
                    tabs={notificationTabs}
                    sections={notificationSections}
                    activeTab={notificationTab}
                    onTabChange={setNotificationTab}
                    isLoading={feedLoading}
                    isError={feedError && !employeeFeed}
                    hasStaleFeed={feedError && !!employeeFeed && panelRows.length > 0}
                    onRetry={() => void refetchNotificationFeed()}
                    onDismiss={dismissNotification}
                    onNavigate={handlePanelNavigate}
                    onActOnNudge={isAdmin ? handleActOnNudge : undefined}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="relative user-dropdown-container">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            {profilePictureSrc && !profileImgError ? (
              <img
                src={profilePictureSrc}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
                onError={() => setProfileImgError(true)}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium" data-testid="text-profile-name">{userName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-profile-role">{displayRole}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 top-full mt-3 w-72 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)] z-50"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                {profilePictureSrc && !profileImgError ? (
                  <img
                    src={profilePictureSrc}
                    alt={userName}
                    className="h-11 w-11 rounded-2xl object-cover"
                    onError={() => setProfileImgError(true)}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-base font-semibold">
                    {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{displayRole}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleProfileSettings}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-profile-settings"
                >
                  <Settings size={17} />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handlePasswordChange}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-change-password"
                >
                  <KeyRound size={17} />
                  <span>Change Password</span>
                </button>

                {(isAdmin || isTL || isTA) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowNotifications(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Bell size={17} />
                    <span>Notifications</span>
                  </button>
                )}

                <div className="my-2 border-t border-slate-200" />

                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  data-testid="button-admin-header-logout"
                >
                  <LogOut size={17} />
                  <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={userName}
        isLoading={logoutMutation.isPending || isSigningOut}
      />
      
      <ProfileSettingsModal
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
        initialView={profileModalView}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </header>
  );
}
