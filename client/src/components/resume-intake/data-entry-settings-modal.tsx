import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DataEntrySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name?: string;
    phone?: string | null;
    email?: string;
  } | null;
  onProfileUpdated: () => void;
}

const fieldClassName =
  "h-10 rounded-[6px] border border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

const disabledFieldClassName =
  "h-10 rounded-[6px] border border-slate-200 bg-slate-200 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400";

export default function DataEntrySettingsModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: DataEntrySettingsModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile, isOpen]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await apiRequest("PATCH", "/api/data-entry/profile", {
        name: name.trim(),
        phone: phone.trim() || null,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }
      toast({ title: "Profile updated" });
      onProfileUpdated();
      onClose();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to change password");
      }
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[8px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2 rounded-[6px] bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="profile" className="rounded-[4px]">
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-[4px]">
              Password
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="de-name" className="text-slate-700 dark:text-slate-300">
                Full name
              </Label>
              <Input
                id="de-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="de-phone" className="text-slate-700 dark:text-slate-300">
                Phone
              </Label>
              <Input
                id="de-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input value={profile?.email || ""} disabled className={disabledFieldClassName} />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-full rounded-[6px]"
            >
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
            </Button>
          </TabsContent>
          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="de-current-pw" className="text-slate-700 dark:text-slate-300">
                Current password
              </Label>
              <PasswordInput
                id="de-current-pw"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="de-new-pw" className="text-slate-700 dark:text-slate-300">
                New password
              </Label>
              <PasswordInput
                id="de-new-pw"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="de-confirm-pw" className="text-slate-700 dark:text-slate-300">
                Confirm new password
              </Label>
              <PasswordInput
                id="de-confirm-pw"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <Button
              onClick={handleSavePassword}
              disabled={isSavingPassword}
              className="w-full rounded-[6px]"
            >
              {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
