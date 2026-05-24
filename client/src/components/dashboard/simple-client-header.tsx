import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, User, Settings, LogOut, HelpCircle, Bell } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

type PortalNudge = {
  id: string;
  candidateName?: string | null;
  jobTitle?: string | null;
  createdAt?: string | Date | null;
  isRead?: boolean | null;
};

interface SimpleClientHeaderProps {
  companyName?: string;
  clientName?: string;
  clientEmail?: string;
  displayEmployeeId?: string | null;
  isClientAdmin?: boolean;
  onHelpClick?: () => void;
  /** Active client nudges from /api/nudges — used when feed is still loading or empty */
  portalNudges?: PortalNudge[];
  onOpenNudges?: () => void;
  onOpenClosures?: () => void;
  onOpenPipeline?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenChangePassword?: () => void;
}

type EmployeeNotificationItem = {
  id: string;
  line: string;
  createdAt?: string | null;
  isUnread?: boolean;
};

type EmployeeNotificationFeed = {
  role: string;
  newRequirements: EmployeeNotificationItem[];
  nudges: EmployeeNotificationItem[];
  escalatedNudges: EmployeeNotificationItem[];
  closures: EmployeeNotificationItem[];
  newCandidateApplied: EmployeeNotificationItem[];
  unreadCount: number;
};

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

type NotificationRow = {
  key: string;
  kind: string;
  id: string;
  line: string;
  createdAt?: string | null;
  isUnread?: boolean;
};

export default function SimpleClientHeader({ 
  companyName = "Loading...",
  clientName,
  clientEmail,
  displayEmployeeId,
  isClientAdmin = false,
  onHelpClick,
  portalNudges = [],
  onOpenNudges,
  onOpenClosures,
  onOpenPipeline,
  onOpenProfileSettings,
  onOpenChangePassword,
}: SimpleClientHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<string>('all');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();
  const dismissedStorageKey = getDismissedNotificationsKey(employee?.id);
  const [dismissedNotificationKeys, setDismissedNotificationKeys] = useState<Set<string>>(() =>
    readDismissedNotificationKeys(dismissedStorageKey),
  );

  const userName = clientName || employee?.name || "Client User";
  const userEmail = clientEmail || employee?.email || "";

  const {
    data: employeeFeed,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchNotificationFeed,
  } = useQuery<EmployeeNotificationFeed>({
    queryKey: ["/api/employee/notifications-feed"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employee/notifications-feed");
      return await res.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  useEffect(() => {
    if (showNotifications) {
      void refetchNotificationFeed();
    }
  }, [showNotifications, refetchNotificationFeed]);

  const notificationTabs = useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "newProfiles", label: "New Profiles" },
      { id: "nudges", label: "Nudges" },
      { id: "closures", label: "Closures" },
    ],
    []
  );

  const notificationSections = useMemo((): NotificationSectionConfig[] => {
    return [
      {
        id: "newProfiles",
        heading: "New profiles shared",
        headingClassName: "text-violet-700",
        kinds: ["newProfile"],
        tabId: "newProfiles",
        navigateTo: "newCandidates",
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
        id: "closures",
        heading: "Candidate moved to closure",
        headingClassName: "text-emerald-700",
        kinds: ["closure"],
        tabId: "closures",
        navigateTo: "closures",
      },
    ];
  }, []);

  useEffect(() => {
    if (!notificationTabs.some((tab) => tab.id === notificationTab)) {
      setNotificationTab(notificationTabs[0]?.id || "all");
    }
  }, [notificationTabs, notificationTab]);

  const portalNudgeItems = useMemo<EmployeeNotificationItem[]>(() => {
    return (portalNudges || []).map((n) => ({
      id: n.id,
      line: [n.candidateName || "Candidate", n.jobTitle || "Role"].filter(Boolean).join(" - "),
      createdAt:
        n.createdAt == null
          ? null
          : typeof n.createdAt === "string"
            ? n.createdAt
            : n.createdAt.toISOString(),
      isUnread: !n.isRead,
    }));
  }, [portalNudges]);

  const dismissNotificationMutation = useMutation({
    mutationFn: async ({ kind, id }: { kind: string; id: string }) => {
      const res = await apiRequest("PATCH", "/api/employee/notifications/dismiss", { kind, id });
      return res.json();
    },
    onSuccess: () => {
      void refetchNotificationFeed();
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
    },
  });

  const dismissNotification = (row: NotificationRow) => {
    setDismissedNotificationKeys((prev) => {
      const next = new Set(prev);
      next.add(row.key);
      if (dismissedStorageKey) {
        localStorage.setItem(dismissedStorageKey, JSON.stringify(Array.from(next)));
      }
      return next;
    });
    if (row.kind === "nudge") {
      dismissNotificationMutation.mutate({ kind: row.kind, id: row.id });
    }
  };

  const allNotificationRows = useMemo(() => {
    const rows: NotificationRow[] = [];
    const pushRows = (kind: string, items: EmployeeNotificationItem[]) => {
      items.forEach((item) =>
        rows.push({
          key: `${kind}-${item.id}`,
          kind,
          id: item.id,
          line: item.line,
          createdAt: item.createdAt,
          isUnread: item.isUnread,
        }),
      );
    };
    const feedNudges = employeeFeed?.nudges?.length ? employeeFeed.nudges : portalNudgeItems;
    pushRows("newProfile", employeeFeed?.newCandidateApplied || []);
    pushRows("nudge", feedNudges);
    pushRows("closure", employeeFeed?.closures || []);
    return rows.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [employeeFeed, portalNudgeItems]);

  const visibleNotificationRows = useMemo(
    () => allNotificationRows.filter((row) => !dismissedNotificationKeys.has(row.key)),
    [allNotificationRows, dismissedNotificationKeys],
  );

  const panelRows = useMemo((): NotificationPanelRow[] => visibleNotificationRows, [visibleNotificationRows]);

  const handlePanelNavigate = (section: NotificationNavigateSection) => {
    setShowNotifications(false);
    if (section === "closures") onOpenClosures?.();
    if (section === "nudges") onOpenNudges?.();
    if (section === "newCandidates") onOpenPipeline?.();
  };

  const headerUnreadCount = useMemo(() => {
    const fromRows = visibleNotificationRows.filter((r) => r.isUnread).length;
    if (employeeFeed && !feedError) {
      return Math.max(employeeFeed.unreadCount, fromRows);
    }
    return fromRows;
  }, [visibleNotificationRows, employeeFeed, feedError]);
  
  // Logout mutation for client (employee)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/employer-login';
    },
    onError: () => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/employer-login';
    }
  });

  const handleLogout = () => {
    setShowUserDropdown(false);
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate();
    setShowSignOutDialog(false);
  };

  const handleProfileSettings = () => {
    setShowUserDropdown(false);
    onOpenProfileSettings?.();
  };

  const handlePasswordChange = () => {
    setShowUserDropdown(false);
    onOpenChangePassword?.();
  };
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Company + role badge */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{companyName}</h1>
            {isClientAdmin && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 shrink-0">
                Client Admin
              </Badge>
            )}
          </div>
          {displayEmployeeId && (
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{displayEmployeeId}</p>
          )}
        </div>
        
        {/* Right side - Help, Notifications and User Profile */}
        <div className="flex items-center gap-4">
          {/* Help Button */}
          <button 
            onClick={onHelpClick}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
            data-testid="button-header-help"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Help</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(false);
                setShowNotifications((prev) => !prev);
              }}
              className="relative flex items-center justify-center h-10 w-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              data-testid="button-client-notifications"
            >
              <Bell size={18} />
              {headerUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {headerUnreadCount}
                </span>
              )}
            </button>
          </div>
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 rounded-lg"
              data-testid="button-client-user-dropdown"
            >
              {/* Company Initial Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {companyName && companyName !== 'Loading...' ? companyName.charAt(0).toUpperCase() : 'C'}
              </div>
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-4 z-50">
                {/* Profile Section */}
                <div className="px-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    {/* Company Initial Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                      {companyName && companyName !== 'Loading...' ? companyName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold text-gray-900 truncate">
                        {userName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        Client - {companyName}
                      </div>
                      {userEmail && (
                        <div className="text-xs text-gray-400 truncate">
                          {userEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleProfileSettings}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    data-testid="button-client-profile-settings"
                  >
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>

                  <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handlePasswordChange}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    data-testid="button-client-change-password"
                  >
                    <Settings size={16} />
                    <span>Change Password</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <button 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
                    data-testid="button-client-header-logout"
                  >
                    <LogOut size={16} />
                    <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          />
          <div className="fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[min(96vw,720px)] flex-col overflow-hidden rounded-l-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <NotificationPanel
              rows={panelRows}
              tabs={notificationTabs}
              sections={notificationSections}
              activeTab={notificationTab}
              onTabChange={setNotificationTab}
              isLoading={feedLoading}
              isError={feedError && !employeeFeed && portalNudgeItems.length === 0}
              onRetry={() => void refetchNotificationFeed()}
              onDismiss={dismissNotification}
              onNavigate={(section) => handlePanelNavigate(section)}
            />
          </div>
        </>
      )}
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={userName}
        isLoading={logoutMutation.isPending}
      />
      
    </div>
  );
}