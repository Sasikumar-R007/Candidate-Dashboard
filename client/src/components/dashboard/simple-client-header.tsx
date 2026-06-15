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
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { resolveProfilePictureUrl } from "@/lib/resolve-media-url";

type PortalNudge = {
  id: string;
  candidateName?: string | null;
  jobTitle?: string | null;
  createdAt?: string | Date | null;
  isRead?: boolean | null;
  escalationLevel?: string | null;
  currentStatus?: string | null;
};

interface SimpleClientHeaderProps {
  companyName?: string;
  companyLogo?: string | null;
  clientProfilePicture?: string | null;
  clientName?: string;
  clientEmail?: string;
  activeTabId?: string;
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
  escalationLevel?: string | null;
  currentStatus?: string | null;
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
  escalationLevel?: string | null;
  currentStatus?: string | null;
};

export default function SimpleClientHeader({ 
  companyName = "Loading...",
  companyLogo = null,
  clientProfilePicture = null,
  clientName,
  clientEmail,
  activeTabId,
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
  const [profileImgError, setProfileImgError] = useState(false);
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();
  const dismissedStorageKey = getDismissedNotificationsKey(employee?.id);
  const [dismissedNotificationKeys, setDismissedNotificationKeys] = useState<Set<string>>(() =>
    readDismissedNotificationKeys(dismissedStorageKey),
  );

  const userName = clientName || employee?.name || "Client User";
  const userEmail = clientEmail || employee?.email || "";
  const fallbackLogoSrc = useMemo(() => resolveProfilePictureUrl(companyLogo), [companyLogo]);
  const profilePictureSrc = useMemo(
    () => resolveProfilePictureUrl(clientProfilePicture),
    [clientProfilePicture],
  );
  const avatarSrc = profilePictureSrc || fallbackLogoSrc;

  useEffect(() => {
    setProfileImgError(false);
  }, [avatarSrc]);

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
    staleTime: 15_000,
    refetchInterval: 20_000,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserDropdown && !target.closest('[data-testid="button-client-user-dropdown"]') && !target.closest('[data-testid="client-user-dropdown-menu"]')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserDropdown]);

  useEffect(() => {
    if (showUserDropdown) {
      setShowUserDropdown(false);
    }
  }, [activeTabId]);

  const portalNudgeItems = useMemo<EmployeeNotificationItem[]>(() => {
    return (portalNudges || []).map((n) => ({
      id: n.id,
      line: [n.candidateName || "Candidate", n.jobTitle || "Role"].filter(Boolean).join(" - "),
      createdAt:
        n.createdAt == null
          ? new Date().toISOString()
          : typeof n.createdAt === "string"
            ? n.createdAt
            : n.createdAt.toISOString(),
      isUnread: !n.isRead,
      escalationLevel: n.escalationLevel || "client",
      currentStatus: n.currentStatus || null,
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
          createdAt: item.createdAt || new Date().toISOString(),
          isUnread: item.isUnread,
          escalationLevel: item.escalationLevel,
          currentStatus: item.currentStatus,
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

  const headerUnreadCount = useMemo(
    () => visibleNotificationRows.filter((r) => r.isUnread).length,
    [visibleNotificationRows],
  );

  useNotificationSound(headerUnreadCount, true);

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
    beginSignOut();
    logoutMutation.mutate();
  };

  const handleProfileSettings = () => {
    setShowUserDropdown(false);
    onOpenProfileSettings?.();
  };

  const handlePasswordChange = () => {
    setShowUserDropdown(false);
    onOpenChangePassword?.();
  };

  const handleHelpClick = () => {
    setShowUserDropdown(false);
    onHelpClick?.();
  };
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-gray-900 md:text-lg">{companyName}</h1>
            {isClientAdmin && (
              <Badge className="hidden rounded-[6px] border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100 shrink-0 md:inline-flex">
                Client Admin
              </Badge>
            )}
          </div>
          {displayEmployeeId && (
            <p className="mt-0.5 hidden font-mono text-xs text-gray-500 md:block">{displayEmployeeId}</p>
          )}
        </div>
        
        {/* Right side - Notifications and User Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(false);
                setShowNotifications((prev) => !prev);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 md:h-10 md:w-10"
              data-testid="button-client-notifications"
            >
              <span className="relative inline-flex">
                <Bell size={18} />
                {headerUnreadCount > 0 && (
                  <>
                    <span
                      className="absolute -right-0.5 -top-0.5 z-10 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                      aria-hidden
                    />
                    <span className="absolute -right-1 -top-1 hidden min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white md:flex">
                      {headerUnreadCount > 99 ? "99+" : headerUnreadCount}
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2 py-1.5 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 rounded-lg md:px-3 md:py-2"
              data-testid="button-client-user-dropdown"
            >
              {avatarSrc && !profileImgError ? (
                <img
                  src={avatarSrc}
                  alt={userName}
                  className="h-9 w-9 rounded-full object-cover shadow-sm"
                  onError={() => setProfileImgError(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white shadow-sm">
                  {userName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium sm:inline">{userName}</span>
              <ChevronDown 
                size={16} 
                className={`hidden transition-transform duration-200 sm:inline ${showUserDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {showUserDropdown && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
                  onClick={() => setShowUserDropdown(false)}
                  aria-label="Close profile menu"
                  data-testid="client-profile-menu-backdrop"
                />
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-lg border border-gray-200 bg-white py-4 shadow-xl md:w-80"
                  data-testid="client-user-dropdown-menu"
                >
                {/* Profile Section */}
                <div className="px-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    {avatarSrc && !profileImgError ? (
                      <img
                        src={avatarSrc}
                        alt={userName}
                        className="h-12 w-12 flex-shrink-0 rounded-2xl object-cover"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                        {userName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
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

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleHelpClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    data-testid="button-client-help-inside-menu"
                  >
                    <HelpCircle size={16} />
                    <span>Help</span>
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
              </>
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
        isLoading={logoutMutation.isPending || isSigningOut}
      />
      
    </div>
  );
}