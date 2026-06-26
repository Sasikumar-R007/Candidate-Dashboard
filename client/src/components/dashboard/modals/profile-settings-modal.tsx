import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Mail, Pencil, Settings, Shield, UserCircle } from "lucide-react";
import { LegalPoliciesSettingsCard } from "@/components/dashboard/legal-policies-settings-card";
import { Link } from "wouter";
import { useAuth, useCandidateAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { apiRequest, apiFileUpload, queryClient } from "@/lib/queryClient";
import { isClientPortalRole } from "@shared/client-roles";
import { formatEmployeeRoleDisplay, shouldShowEmployeeProfileId } from "@/lib/employee-display";
import { resolveProfilePictureUrl } from "@/lib/resolve-media-url";

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatClick?: () => void;
  initialView?: "profile" | "settings";
}

type NotificationPrefs = {
  email: boolean;
  inApp: boolean;
};

const defaultNotifications: NotificationPrefs = {
  email: true,
  inApp: true,
};

const ADMIN_STORAGE_KEYS = {
  autoRefresh: "adminPipelineAutoRefreshEnabled",
  refreshSeconds: "adminPipelineRefreshSeconds",
  performancePeriod: "adminDefaultPerformancePeriod",
};

export function ProfileSettingsModal({
  open,
  onOpenChange,
  initialView = "profile",
}: ProfileSettingsModalProps) {
  const { user, setUser } = useAuth();
  const employee = useEmployeeAuth();
  const candidate = useCandidateAuth();
  const [activeView, setActiveView] = useState<"profile" | "settings">(
    initialView === "settings" && employee?.role === "admin" ? "settings" : "profile",
  );
  const [profileData, setProfileData] = useState<any>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRemovingProfile, setIsRemovingProfile] = useState(false);
  const [isSavingSystemSettings, setIsSavingSystemSettings] = useState(false);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(defaultNotifications);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    employeeId: "",
    department: "",
    joiningDate: "",
  });
  const [systemSettings, setSystemSettings] = useState({
    pipelineAutoRefreshEnabled: false,
    pipelineRefreshSeconds: "10",
    adminDefaultPerformancePeriod: "monthly",
    employeeWelcomeMessage: "",
  });

  const isAdmin = employee?.role === "admin";

  const endpoint = useMemo(() => {
    if (employee?.role === "admin") return "/api/admin/profile";
    if (employee?.role === "team_leader") return "/api/team-leader/profile";
    if (employee?.role === "recruiter" || employee?.role === "talent_advisor") return "/api/recruiter/profile";
    if (isClientPortalRole(employee?.role)) return "/api/client/profile";
    if (candidate) return "/api/profile";
    return null;
  }, [candidate, employee?.role]);

  const uploadEndpoint = useMemo(() => {
    if (employee?.role === "admin") return "/api/admin/upload/profile";
    if (employee?.role === "team_leader") return "/api/team-leader/upload/profile";
    if (employee?.role === "recruiter" || employee?.role === "talent_advisor") return "/api/recruiter/upload/profile";
    if (isClientPortalRole(employee?.role)) return "/api/client/upload/profile";
    return "/api/upload/profile";
  }, [employee?.role]);

  useEffect(() => {
    if (!open) return;

    setActiveView(initialView === "settings" && isAdmin ? "settings" : "profile");
  }, [initialView, isAdmin, open]);

  useEffect(() => {
    if (!open || !endpoint) return;

    const loadProfile = async () => {
      try {
        const response = await apiRequest("GET", endpoint);
        const data = await response.json();
        setProfileData(data);
        setFormData({
          name: data?.name || employee?.name || candidate?.fullName || "",
          email: data?.email || employee?.email || candidate?.email || "",
          phone: data?.phone || employee?.phone || candidate?.phone || "",
          role: data?.role || employee?.role || "",
          employeeId: data?.employeeId || employee?.employeeId || "",
          department: data?.department || "",
          joiningDate: data?.joiningDate || "",
        });
        setProfilePreview(resolveProfilePictureUrl(data?.profilePicture) || null);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile details.",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [candidate?.email, candidate?.fullName, employee?.email, employee?.employeeId, employee?.name, endpoint, open]);

  useEffect(() => {
    if (!open || !isAdmin) return;

    const loadSystemSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/system-settings");
        const data = await response.json();
        setSystemSettings({
          pipelineAutoRefreshEnabled: window.localStorage.getItem(ADMIN_STORAGE_KEYS.autoRefresh) !== "false",
          pipelineRefreshSeconds: window.localStorage.getItem(ADMIN_STORAGE_KEYS.refreshSeconds) || "10",
          adminDefaultPerformancePeriod: window.localStorage.getItem(ADMIN_STORAGE_KEYS.performancePeriod) || "monthly",
          employeeWelcomeMessage: data?.employeeWelcomeMessage || "",
        });
      } catch {
        setSystemSettings((prev) => ({
          ...prev,
          pipelineAutoRefreshEnabled: window.localStorage.getItem(ADMIN_STORAGE_KEYS.autoRefresh) !== "false",
          pipelineRefreshSeconds: window.localStorage.getItem(ADMIN_STORAGE_KEYS.refreshSeconds) || "10",
          adminDefaultPerformancePeriod: window.localStorage.getItem(ADMIN_STORAGE_KEYS.performancePeriod) || "monthly",
        }));
      }
    };

    loadSystemSettings();
  }, [isAdmin, open]);

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedProfileFile(file);
      setProfilePreview(String(event.target?.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const syncProfileContext = (updatedProfile: any) => {
    if (user) {
      setUser({
        ...user,
        data: {
          ...(user as any).data,
          name: updatedProfile?.name ?? (user as any).data?.name,
          phone: updatedProfile?.phone ?? (user as any).data?.phone,
          department: updatedProfile?.department ?? (user as any).data?.department,
          profilePicture: updatedProfile?.profilePicture ?? null,
          bannerImage: updatedProfile?.bannerImage ?? (user as any).data?.bannerImage,
        },
      });
    }
    window.dispatchEvent(new CustomEvent("profile-updated"));
    if (isClientPortalRole(employee?.role)) {
      void queryClient.invalidateQueries({ queryKey: ["/api/client/profile"] });
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedProfileFile) return profileData?.profilePicture ?? null;
    const uploadForm = new FormData();
    uploadForm.append("file", selectedProfileFile);
    const response = await apiFileUpload(uploadEndpoint, uploadForm);
    if (!response.ok) {
      throw new Error("Failed to upload profile image");
    }
    const result = await response.json();
    return result.url || null;
  };

  const handleSaveProfile = async () => {
    if (!endpoint || !isEditingProfile) return;
    setIsSavingProfile(true);
    try {
      const uploadedProfilePicture = await uploadProfileImage();
      const payload = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        profilePicture: uploadedProfilePicture,
      };
      const response = await apiRequest("PATCH", endpoint, payload);
      const updatedProfile = await response.json();
      setProfileData(updatedProfile);
      setFormData((prev) => ({
        ...prev,
        name: updatedProfile?.name || prev.name,
        email: updatedProfile?.email || prev.email,
        phone: updatedProfile?.phone || prev.phone,
        role: updatedProfile?.role || prev.role,
        employeeId: updatedProfile?.employeeId || prev.employeeId,
        department: updatedProfile?.department || prev.department,
        joiningDate: updatedProfile?.joiningDate || prev.joiningDate,
      }));
      setProfilePreview(resolveProfilePictureUrl(updatedProfile?.profilePicture) || null);
      setSelectedProfileFile(null);
      setIsEditingProfile(false);
      syncProfileContext(updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Save profile error:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!endpoint) return;

    if (selectedProfileFile) {
      setSelectedProfileFile(null);
      setProfilePreview(resolveProfilePictureUrl(profileData?.profilePicture) || null);
      return;
    }

    if (!resolveProfilePictureUrl(profileData?.profilePicture)) return;

    setIsRemovingProfile(true);
    try {
      const response = await apiRequest("PATCH", endpoint, { profilePicture: null });
      const updatedProfile = await response.json();
      setProfileData(updatedProfile);
      setProfilePreview(null);
      syncProfileContext(updatedProfile);
      toast({
        title: "Profile photo removed",
        description: "Your default profile avatar is now in use.",
      });
    } catch (error) {
      console.error("Remove profile picture error:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile photo.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingProfile(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!isAdmin) return;

    setIsSavingSystemSettings(true);
    try {
      await apiRequest("PATCH", "/api/admin/system-settings", {
        employeeWelcomeMessage: systemSettings.employeeWelcomeMessage,
      });

      window.localStorage.setItem(ADMIN_STORAGE_KEYS.autoRefresh, String(systemSettings.pipelineAutoRefreshEnabled));
      window.localStorage.setItem(ADMIN_STORAGE_KEYS.refreshSeconds, systemSettings.pipelineRefreshSeconds);
      window.localStorage.setItem(ADMIN_STORAGE_KEYS.performancePeriod, systemSettings.adminDefaultPerformancePeriod);
      window.dispatchEvent(new CustomEvent("admin-settings-updated"));

      toast({
        title: "Success",
        description: "System settings updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update system settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSystemSettings(false);
    }
  };

  const savedProfileImage = resolveProfilePictureUrl(profileData?.profilePicture);
  const profileImage = profilePreview || savedProfileImage || null;
  const canRemoveProfilePhoto = Boolean(selectedProfileFile || savedProfileImage);
  const displayRole = formatEmployeeRoleDisplay(formData.role, { employeeRole: employee?.role });
  const showProfileId = shouldShowEmployeeProfileId(employee?.role ?? formData.role, formData.employeeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/50 backdrop-blur-[1px]"
        className="profile-settings-modal max-h-[min(88vh,720px)] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl md:max-h-[min(92vh,800px)] md:max-w-5xl md:rounded-2xl md:w-[calc(100%-2rem)]"
      >
        <DialogHeader className="border-b border-slate-200 bg-white px-4 py-3.5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-slate-900 md:text-xl">
                {activeView === "settings" ? "System Settings" : "Account Profile"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
                {activeView === "settings"
                  ? "Manage core admin preferences and the welcome message used for new user onboarding."
                  : "Review your account details, profile photo, and edit access from one place."}
              </DialogDescription>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveView((prev) => (prev === "profile" ? "settings" : "profile"))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:h-11 md:w-11 md:rounded-2xl"
                aria-label={activeView === "profile" ? "Open settings" : "Open profile"}
              >
                {activeView === "profile" ? <Settings className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="grid max-h-[calc(88vh-4.5rem)] gap-0 overflow-y-auto overflow-x-hidden md:max-h-[calc(92vh-5.5rem)] lg:max-h-[calc(92vh-86px)] lg:grid-cols-[280px_1fr] lg:overflow-hidden">
          <div className="overflow-y-auto border-b border-slate-200 bg-white px-4 py-3 lg:border-b-0 lg:border-r lg:bg-[#eef3fb] lg:px-6 lg:py-6">
            <div className="flex flex-row items-start gap-3 text-left lg:flex-col lg:items-center lg:text-center">
              <div className="relative shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-14 w-14 rounded-xl object-cover shadow-md lg:h-24 lg:w-24 lg:rounded-[28px]" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-semibold text-white shadow-md lg:h-24 lg:w-24 lg:rounded-[28px] lg:text-3xl">
                    {(formData.name || "A").trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <Label
                  htmlFor="profile-image"
                  className={`absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg transition lg:-bottom-2 lg:h-10 lg:w-10 lg:rounded-2xl ${
                    isEditingProfile ? "cursor-pointer hover:bg-slate-700" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!isEditingProfile}
                  onChange={(event) => handleProfileFileChange(event.target.files?.[0])}
                />
              </div>

              {canRemoveProfilePhoto ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveProfilePicture}
                  disabled={isRemovingProfile || isSavingProfile}
                  className="mt-3 hidden border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 lg:inline-flex"
                >
                  {isRemovingProfile ? "Removing..." : "Remove photo"}
                </Button>
              ) : null}

              <div className="min-w-0 flex-1 space-y-1 lg:mt-4 lg:w-full lg:flex-none lg:space-y-2">
                <h3 className="truncate text-sm font-semibold text-slate-900 lg:text-lg">{formData.name || "User"}</h3>
                {showProfileId ? (
                  <span
                    className="inline-flex rounded-[4px] border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-900 lg:mt-1"
                    data-testid="text-account-profile-id"
                  >
                    {formData.employeeId}
                  </span>
                ) : null}
                <p className="text-xs font-medium text-slate-600">{displayRole}</p>
                <p className="truncate text-xs text-slate-500 lg:hidden">{formData.email || "-"}</p>
                {canRemoveProfilePhoto ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveProfilePicture}
                    disabled={isRemovingProfile || isSavingProfile}
                    className="mt-1.5 h-7 border-red-200 px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700 lg:hidden"
                  >
                    {isRemovingProfile ? "Removing..." : "Remove photo"}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 hidden w-full gap-2 lg:mt-6 lg:grid lg:gap-3">
                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-2.5 p-3 text-left md:gap-3 md:p-4">
                    <Mail className="mt-0.5 h-3.5 w-3.5 text-slate-400 md:h-4 md:w-4" />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 md:text-[11px] md:tracking-[0.18em]">Email</div>
                      <div className="mt-0.5 text-xs font-medium text-slate-700 md:mt-1 md:text-sm">{formData.email || "-"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-2.5 p-3 text-left md:gap-3 md:p-4">
                    <Shield className="mt-0.5 h-3.5 w-3.5 text-slate-400 md:h-4 md:w-4" />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 md:text-[11px] md:tracking-[0.18em]">Role</div>
                      <div className="mt-0.5 text-xs font-medium text-slate-700 md:mt-1 md:text-sm">{displayRole}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-2.5 p-3 text-left md:gap-3 md:p-4">
                    <UserCircle className="mt-0.5 h-3.5 w-3.5 text-slate-400 md:h-4 md:w-4" />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 md:text-[11px] md:tracking-[0.18em]">Joined</div>
                      <div className="mt-0.5 text-xs font-medium text-slate-700 md:mt-1 md:text-sm">{formData.joiningDate || "-"}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>

          <div className="overflow-y-auto bg-white px-4 py-4 md:px-6 md:py-6">
            {activeView === "profile" ? (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 md:text-lg">Profile Details</h3>
                    <p className="mt-0.5 text-xs text-slate-500 md:text-sm">Tap edit to update your account information.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((prev) => !prev)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition md:h-11 md:w-11 md:rounded-2xl ${
                      isEditingProfile
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    aria-label="Toggle profile edit"
                  >
                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 md:text-sm">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-9 bg-white text-sm disabled:bg-slate-100 disabled:text-slate-500 md:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 md:text-sm">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-9 bg-white text-sm disabled:bg-slate-100 disabled:text-slate-500 md:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 md:text-sm">Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleFormChange("department", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-9 bg-white text-sm disabled:bg-slate-100 disabled:text-slate-500 md:h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 md:text-sm">Email</Label>
                    <Input value={formData.email} readOnly className="h-9 bg-slate-100 text-sm text-slate-500 md:h-11" />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  {isEditingProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg text-xs md:h-11 md:rounded-xl md:text-sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setSelectedProfileFile(null);
                        setProfilePreview(resolveProfilePictureUrl(profileData?.profilePicture) || null);
                        setFormData((prev) => ({
                          ...prev,
                          name: profileData?.name || employee?.name || candidate?.fullName || "",
                          phone: profileData?.phone || employee?.phone || candidate?.phone || "",
                          department: profileData?.department || "",
                        }));
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !isEditingProfile}
                    className="h-9 rounded-lg bg-slate-900 px-4 text-xs text-white hover:bg-slate-800 md:h-11 md:rounded-xl md:px-5 md:text-sm"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </div>

                {employee && !isAdmin ? (
                  <LegalPoliciesSettingsCard variant="modal" queryEnabled={open} className="rounded-2xl" />
                ) : null}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <LegalPoliciesSettingsCard variant="modal" queryEnabled={open} className="rounded-xl md:rounded-2xl" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900 md:text-lg">System Settings</h3>
                  <p className="text-xs text-slate-500 md:text-sm">Keep this focused on the few admin settings that actually affect daily operations.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="space-y-3 p-3 md:space-y-4 md:p-5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 md:text-sm">Pipeline Refresh</h4>
                        <p className="text-xs text-slate-500 md:text-sm">Control how frequently the admin pipeline refreshes.</p>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <div>
                          <div className="text-xs font-medium text-slate-800 md:text-sm">Auto-refresh pipeline</div>
                          <div className="text-[11px] text-slate-500 md:text-xs">Keeps pipeline data updated in the admin dashboard.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSystemSettings((prev) => ({
                              ...prev,
                              pipelineAutoRefreshEnabled: !prev.pipelineAutoRefreshEnabled,
                            }))
                          }
                          className={`relative h-6 w-11 rounded-full transition ${
                            systemSettings.pipelineAutoRefreshEnabled ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                              systemSettings.pipelineAutoRefreshEnabled ? "left-5" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-700 md:text-sm">Refresh interval in seconds</Label>
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          value={systemSettings.pipelineRefreshSeconds}
                          onChange={(e) =>
                            setSystemSettings((prev) => ({
                              ...prev,
                              pipelineRefreshSeconds: e.target.value,
                            }))
                          }
                          className="h-9 bg-white text-sm md:h-11"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="space-y-3 p-3 md:space-y-4 md:p-5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 md:text-sm">Performance Defaults</h4>
                        <p className="text-xs text-slate-500 md:text-sm">Choose the default period used when the admin performance page opens.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {["monthly", "quarterly", "yearly"].map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() =>
                              setSystemSettings((prev) => ({
                                ...prev,
                                adminDefaultPerformancePeriod: period,
                              }))
                            }
                            className={`rounded-xl border px-2.5 py-2.5 text-xs font-medium capitalize transition md:rounded-2xl md:px-3 md:py-3 md:text-sm ${
                              systemSettings.adminDefaultPerformancePeriod === period
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:rounded-2xl md:px-4 md:py-3">
                        <div className="text-xs font-medium text-slate-800 md:text-sm">Notification defaults</div>
                        <div className="mt-2 space-y-2.5 md:mt-3 md:space-y-3">
                          {[
                            { key: "email", label: "Email updates" },
                            { key: "inApp", label: "In-app updates" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 md:text-sm">{item.label}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    [item.key]: !prev[item.key as keyof NotificationPrefs],
                                  }))
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                  notificationPrefs[item.key as keyof NotificationPrefs] ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                                    notificationPrefs[item.key as keyof NotificationPrefs] ? "left-5" : "left-0.5"
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {isAdmin ? (
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="space-y-2.5 p-3 md:space-y-3 md:p-5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 md:text-sm">Agreement &amp; consent logs</h4>
                        <p className="text-xs text-slate-500 md:text-sm">
                          Open the read-only audit page for platform, job, client, and employee agreement acceptances.
                        </p>
                      </div>
                      <Button variant="outline" className="h-11 rounded-xl" asChild>
                        <Link href="/admin/consent-logs">Open consent logs</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="border-slate-200 bg-white shadow-none">
                  <CardContent className="space-y-3 p-3 md:space-y-4 md:p-5">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 md:text-sm">Welcome Mail Message</h4>
                      <p className="text-xs text-slate-500 md:text-sm">
                        This text is used in the employee welcome email. Login credentials are still added automatically by the system.
                      </p>
                    </div>

                    <Textarea
                      value={systemSettings.employeeWelcomeMessage}
                      onChange={(e) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          employeeWelcomeMessage: e.target.value,
                        }))
                      }
                      className="min-h-[160px] resize-none rounded-xl border-slate-200 bg-slate-50 text-xs md:min-h-[220px] md:rounded-2xl md:text-sm"
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSystemSettings}
                    disabled={isSavingSystemSettings}
                    className="h-9 rounded-lg bg-slate-900 px-4 text-xs text-white hover:bg-slate-800 md:h-11 md:rounded-xl md:px-5 md:text-sm"
                  >
                    {isSavingSystemSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
