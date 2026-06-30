import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, UserCircle } from "lucide-react";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import ChangePasswordModal from "@/components/dashboard/modals/ChangePasswordModal";
import { AppVersionBadge } from "@/components/dashboard/app-version-badge";

type ClientSettingsTabProps = {
  companyName?: string;
  userName?: string;
  userEmail?: string;
  isClientAdmin?: boolean;
};

export function ClientSettingsTab({
  companyName,
  userName,
  userEmail,
  isClientAdmin,
}: ClientSettingsTabProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile and account security.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>
              {userName}
              {userEmail ? ` · ${userEmail}` : ""}
              {companyName ? ` · ${companyName}` : ""}
              {isClientAdmin ? " · Client Admin" : " · Client Member"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="justify-start" onClick={() => setProfileOpen(true)}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile & preferences
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => setPasswordOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change password
            </Button>
          </CardContent>
        </Card>

        <AppVersionBadge className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm" />
      </div>

      <ProfileSettingsModal open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  );
}
