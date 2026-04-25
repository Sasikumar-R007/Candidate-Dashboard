import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Mail, Pencil, Settings, Shield, UserCircle } from "lucide-react";
import { useAuth, useCandidateAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
    pipelineAutoRefreshEnabled: true,
    pipelineRefreshSeconds: "10",
    adminDefaultPerformancePeriod: "monthly",
    employeeWelcomeMessage: "",
  });

  const isAdmin = employee?.role === "admin";

  const endpoint = useMemo(() => {
    if (employee?.role === "admin") return "/api/admin/profile";
    if (employee?.role === "team_leader") return "/api/team-leader/profile";
    if (employee?.role === "recruiter") return "/api/recruiter/profile";
    if (employee?.role === "client") return "/api/client/profile";
    if (candidate) return "/api/candidate/profile";
    return null;
  }, [candidate, employee?.role]);

  const uploadEndpoint = useMemo(() => {
    if (employee?.role === "admin") return "/api/admin/upload/profile";
    if (employee?.role === "team_leader") return "/api/team-leader/upload/profile";
    if (employee?.role === "recruiter") return "/api/recruiter/upload/profile";
    if (employee?.role === "client") return "/api/client/upload/profile";
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
        setProfilePreview(data?.profilePicture || null);
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

  const uploadProfileImage = async () => {
    if (!selectedProfileFile) return profileData?.profilePicture || null;
    const uploadForm = new FormData();
    uploadForm.append("file", selectedProfileFile);
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: uploadForm,
      credentials: "include",
    });
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
      setProfilePreview(updatedProfile?.profilePicture || uploadedProfilePicture || null);
      setSelectedProfileFile(null);
      setIsEditingProfile(false);
      if (user) {
        setUser({
          ...user,
          data: {
            ...(user as any).data,
            name: updatedProfile?.name ?? (user as any).data?.name,
            phone: updatedProfile?.phone ?? (user as any).data?.phone,
            department: updatedProfile?.department ?? (user as any).data?.department,
            profilePicture: updatedProfile?.profilePicture ?? (user as any).data?.profilePicture,
            bannerImage: updatedProfile?.bannerImage ?? (user as any).data?.bannerImage,
          },
        });
      }
      window.dispatchEvent(new CustomEvent("profile-updated"));
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
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

  const profileImage = profilePreview || profileData?.profilePicture || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-0 bg-[#f5f7fb] p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {activeView === "settings" ? "System Settings" : "Account Profile"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {activeView === "settings"
                  ? "Manage core admin preferences and the welcome message used for new user onboarding."
                  : "Review your account details, profile photo, and edit access from one place."}
              </DialogDescription>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveView((prev) => (prev === "profile" ? "settings" : "profile"))}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={activeView === "profile" ? "Open settings" : "Open profile"}
              >
                {activeView === "profile" ? <Settings className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="grid max-h-[calc(92vh-86px)] gap-0 overflow-hidden lg:grid-cols-[280px_1fr]">
          <div className="overflow-y-auto border-r border-slate-200 bg-[#eef3fb] px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-24 w-24 rounded-[28px] object-cover shadow-md" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-500 to-cyan-500 text-3xl font-semibold text-white shadow-md">
                    {(formData.name || "A").trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <Label
                  htmlFor="profile-image"
                  className={`absolute -bottom-2 right-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition ${
                    isEditingProfile ? "cursor-pointer hover:bg-slate-700" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <Camera className="h-4 w-4" />
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

              <h3 className="mt-5 text-lg font-semibold text-slate-900">{formData.name || "Admin"}</h3>
              <p className="text-sm text-slate-500">{formData.role || "Admin"}</p>

              <div className="mt-6 grid w-full gap-3">
                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-3 p-4 text-left">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Email</div>
                      <div className="mt-1 text-sm font-medium text-slate-700">{formData.email || "-"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-3 p-4 text-left">
                    <Shield className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Role</div>
                      <div className="mt-1 text-sm font-medium text-slate-700">{formData.role || "-"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/80 shadow-none">
                  <CardContent className="flex items-start gap-3 p-4 text-left">
                    <UserCircle className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Joined</div>
                      <div className="mt-1 text-sm font-medium text-slate-700">{formData.joiningDate || "-"}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-6">
            {activeView === "profile" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Profile Details</h3>
                    <p className="text-sm text-slate-500">Use the edit button to unlock changes for your account information.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((prev) => !prev)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                      isEditingProfile
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    aria-label="Toggle profile edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-11 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-11 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleFormChange("department", e.target.value)}
                      disabled={!isEditingProfile}
                      className="h-11 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Email</Label>
                    <Input value={formData.email} readOnly className="h-11 bg-slate-100 text-slate-500" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  {isEditingProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setSelectedProfileFile(null);
                        setProfilePreview(profileData?.profilePicture || null);
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
                    className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
                  <p className="text-sm text-slate-500">Keep this focused on the few admin settings that actually affect daily operations.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="space-y-4 p-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Pipeline Refresh</h4>
                        <p className="text-sm text-slate-500">Control how frequently the admin pipeline refreshes.</p>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-slate-800">Auto-refresh pipeline</div>
                          <div className="text-xs text-slate-500">Keeps pipeline data updated in the admin dashboard.</div>
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
                        <Label className="text-sm font-medium text-slate-700">Refresh interval in seconds</Label>
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
                          className="h-11 bg-white"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="space-y-4 p-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Performance Defaults</h4>
                        <p className="text-sm text-slate-500">Choose the default period used when the admin performance page opens.</p>
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
                            className={`rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition ${
                              systemSettings.adminDefaultPerformancePeriod === period
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-sm font-medium text-slate-800">Notification defaults</div>
                        <div className="mt-3 space-y-3">
                          {[
                            { key: "email", label: "Email updates" },
                            { key: "inApp", label: "In-app updates" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">{item.label}</span>
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

                <Card className="border-slate-200 bg-white shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Welcome Mail Message</h4>
                      <p className="text-sm text-slate-500">
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
                      className="min-h-[220px] resize-none rounded-2xl border-slate-200 bg-slate-50 text-sm"
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSystemSettings}
                    disabled={isSavingSystemSettings}
                    className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
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
