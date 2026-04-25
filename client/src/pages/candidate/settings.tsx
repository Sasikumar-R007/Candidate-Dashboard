import { useJobPreferences, useUpdateJobPreferences } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  Eye,
  UserX,
  Briefcase,
  Save,
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  const { data: preferences, isLoading } = useJobPreferences();
  const updatePrefsMutation = useUpdateJobPreferences();

  if (isLoading) {
    return <Card className="animate-pulse h-96 bg-white border-slate-200" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account & Preferences</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your search criteria and security</p>
        </div>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-900/20 font-bold text-xs h-11 px-6 rounded-xl">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Search Preferences */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Employment Preferences
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">How you want to work and be contacted</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Preferred Job Titles</Label>
                  <p className="text-xs text-slate-500 mb-2">Comma separated titles you are looking for</p>
                  <Input defaultValue={preferences?.jobTitles || "Full Stack Developer, Backend Architect"} className="h-11 border-slate-200 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Preferred Locations</Label>
                  <p className="text-xs text-slate-500 mb-2">Cities or regions for on-site work</p>
                  <Input defaultValue={preferences?.locations || "Remote, Bengaluru, Mumbai"} className="h-11 border-slate-200 focus-visible:ring-indigo-500" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Work Mode Preference</Label>
                <div className="flex flex-wrap gap-6 mt-2">
                  <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <Checkbox id="remote" defaultChecked />
                    <label htmlFor="remote" className="text-sm font-bold text-slate-700 cursor-pointer">Remote</label>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <Checkbox id="hybrid" defaultChecked />
                    <label htmlFor="hybrid" className="text-sm font-bold text-slate-700 cursor-pointer">Hybrid</label>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <Checkbox id="onsite" />
                    <label htmlFor="onsite" className="text-sm font-bold text-slate-700 cursor-pointer">On-site</label>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Instructions to Recruiters</Label>
                <textarea
                  className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                  defaultValue={preferences?.instructions || "Prefer WhatsApp or Email initially. Available for calls after 5 PM."}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1/3: Security & Misc */}
        <div className="space-y-8">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <Shield className="h-5 w-5 text-indigo-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100">
                <Lock className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-semibold">Change Password</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100">
                <Bell className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-semibold">Notifications</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-100 shadow-sm bg-red-50/30 overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black text-red-600 flex items-center gap-2 uppercase tracking-tighter">
                <UserX className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-[10px] font-bold text-red-500/60 leading-relaxed mb-4 uppercase tracking-widest">Permanent Actions</p>
              <Button variant="outline" className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-bold text-xs h-10 rounded-xl">
                Deactivate Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
