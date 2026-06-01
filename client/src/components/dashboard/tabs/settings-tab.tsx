import { useState } from 'react';
import { 
  Bell, Lock, Eye, Moon, Trash2, Shield, 
  Smartphone, Mail, Globe, UserX, ChevronRight,
  LogOut, CreditCard, HelpCircle, Loader2, KeyRound, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
import { motion, AnimatePresence } from "framer-motion";
import { LegalPoliciesSettingsCard } from "@/components/dashboard/legal-policies-settings-card";
import { cn } from "@/lib/utils";
import {
  CANDIDATE_DESKTOP_DIALOG_CLASSES,
  CANDIDATE_MOBILE_DIALOG_CLASSES,
} from "@/lib/candidate-ui-preferences";

interface SettingsTabProps {
  onOpenSupport?: () => void;
}

export default function SettingsTab({ onOpenSupport }: SettingsTabProps) {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: OTP, 2: Password, 3: Finale
  
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const [isRelogging, setIsRelogging] = useState(false);
  
  // Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'password' | 'delete';
  }>({ isOpen: false, type: 'password' });

  // Notifications State
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationStatus: true,
    marketing: false,
    security: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showExperience: true,
    anonymousSurveys: false,
  });

  // OTP Mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', '/api/auth/candidate-request-action-otp', { email });
      return await res.json();
    },
    onSuccess: (data) => {
      // In production we don't show OTP, but user asked for it in testing
      alert(`TESTING OTP: ${data.otp}`); 
      toast({ title: "OTP Sent", description: "Please check your email for the verification code." });
    },
    onError: () => toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" })
  });

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/candidate/change-password', {
        email: profile?.email,
        otp: otpValue,
        newPassword
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsOtpDialogOpen(false);
      setIsRelogging(true);
      toast({ title: "Success", description: "Password changed. Re-logging for security..." });
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    },
    onError: (err: any) => toast({ title: "Error", description: "Password change failed. Check your OTP.", variant: "destructive" })
  });

  // Delete Account Mutations
  const verifyPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/candidate-verify-password', {
        email: profile?.email,
        password: currentPasswordConfirm
      });
      return await res.json();
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/candidate/delete-account', {
        email: profile?.email,
        confirmCode: deleteConfirmText
      });
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = '/';
    }
  });

  const handleToggle = (category: 'notifications' | 'privacy', setting: string) => {
    if (category === 'notifications') {
      setNotifications(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof notifications] }));
    } else {
      setPrivacy(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof privacy] }));
    }
    toast({ title: "Setting updated", description: "Your preference has been saved." });
  };

  const handleStartDeleteFlow = () => {
    setDeleteStep(1);
    setOtpValue("");
    setCurrentPasswordConfirm("");
    setDeleteConfirmText("");
    setIsDeleteDialogOpen(true);
    if (profile?.email) requestOtpMutation.mutate(profile.email);
  };

  const proceedWithAction = () => {
    const type = confirmModal.type;
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    if (type === 'password') {
      setOtpValue("");
      setNewPassword("");
      setIsOtpDialogOpen(true);
      if (profile?.email) requestOtpMutation.mutate(profile.email);
    } else {
      handleStartDeleteFlow();
    }
  };

  if (isRelogging) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 z-[100] fixed inset-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Password Updated</h2>
            <p className="text-gray-400 font-medium text-sm animate-pulse">Re-authenticating your session...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const settingsDialogClass = cn(
    "rounded-2xl lg:rounded-[2.5rem] border-none shadow-2xl font-poppins",
    CANDIDATE_MOBILE_DIALOG_CLASSES,
    CANDIDATE_DESKTOP_DIALOG_CLASSES,
    "max-lg:p-5 max-lg:min-h-0 max-lg:overflow-y-auto max-lg:overscroll-contain lg:p-10 max-lg:max-w-none lg:max-w-md"
  );

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto px-0 py-3 sm:py-6 lg:py-10 space-y-5 lg:space-y-8 font-poppins overflow-x-hidden">
      <div className="hidden lg:flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Settings</h1>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-5 lg:gap-8">
        {/* Notifications */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl lg:rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2.5 sm:gap-4 border-b border-gray-50 dark:border-gray-700 pb-3 sm:pb-6 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold tracking-tight">Notifications</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs font-medium max-lg:normal-case max-lg:tracking-normal text-gray-400 sm:uppercase sm:tracking-wider">Choose how you want to be notified.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              <div className="flex items-start justify-between gap-4 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <Label className="text-sm font-bold">New Job Alerts</Label>
                  <p className="text-xs font-medium text-gray-400">Get notified when new jobs match your preferences.</p>
                </div>
                <Switch checked={notifications.jobAlerts} onCheckedChange={() => handleToggle('notifications', 'jobAlerts')} className="data-[state=checked]:bg-blue-600 shrink-0" />
              </div>
              <div className="flex items-start justify-between gap-4 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <Label className="text-sm font-bold">Application Updates</Label>
                  <p className="text-xs font-medium text-gray-400">Receive updates on your job application status.</p>
                </div>
                <Switch checked={notifications.applicationStatus} onCheckedChange={() => handleToggle('notifications', 'applicationStatus')} className="data-[state=checked]:bg-blue-600 shrink-0" />
              </div>
              {/* Disabled: Security Alerts */}
              <div className="flex items-start justify-between gap-4 p-4 sm:p-6 opacity-40 select-none grayscale cursor-not-allowed">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold">Security Alerts</Label>
                  <p className="text-xs font-medium text-gray-400">Critical alerts about your account security.</p>
                </div>
                <Switch disabled checked={true} className="data-[state=checked]:bg-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl lg:rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2.5 sm:gap-4 border-b border-gray-50 dark:border-gray-700 pb-3 sm:pb-6 p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold tracking-tight">Privacy & Visibility</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs font-medium max-lg:normal-case max-lg:tracking-normal text-gray-400 sm:uppercase sm:tracking-wider">Control who can see your profile.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              <div className="flex items-start justify-between gap-4 p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <Label className="text-sm font-bold">Recruiter Visibility</Label>
                  <p className="text-xs font-medium text-gray-400">Allow verified recruiters to find and contact you.</p>
                </div>
                <Switch checked={privacy.profileVisible} onCheckedChange={() => handleToggle('privacy', 'profileVisible')} className="data-[state=checked]:bg-blue-600 shrink-0" />
              </div>
              {/* Disabled: Show Work History */}
              <div className="flex items-start justify-between gap-4 p-4 sm:p-6 opacity-40 select-none grayscale cursor-not-allowed">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold">Show Work History</Label>
                  <p className="text-xs font-medium text-gray-400">Display your detailed experience on your profile.</p>
                </div>
                <Switch disabled checked={true} className="data-[state=checked]:bg-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <LegalPoliciesSettingsCard variant="dashboard" />

        {/* Security & Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl lg:rounded-[2rem] overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center gap-2.5 mb-0">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              <Button 
                variant="outline" 
                onClick={() => setConfirmModal({ isOpen: true, type: 'password' })}
                className="w-full justify-between h-11 sm:h-12 rounded-xl border-gray-100 font-bold text-[10px] sm:text-xs uppercase max-lg:tracking-wide sm:tracking-widest text-gray-600 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3"><Shield className="w-4 h-4" /> Change Password</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-between gap-2 px-3 h-11 sm:h-12 rounded-xl border border-dashed border-gray-200 min-w-0">
                <span className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase max-lg:tracking-wide sm:tracking-widest text-gray-400 min-w-0"><Smartphone className="w-4 h-4 shrink-0" /> <span className="truncate">Two-Factor Auth</span></span>
                {profile?.isVerified ? (
                   <Badge className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase">Active</Badge>
                ) : (
                   <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase">Not Done</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl lg:rounded-[2rem] overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center gap-2.5 mb-0">
                <Globe className="w-5 h-5 text-indigo-600 shrink-0" />
                <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {/* Disabled: Subscription */}
              <div className="w-full flex items-center justify-between gap-2 h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-100 opacity-40 select-none grayscale bg-gray-50/50 min-w-0">
                <span className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase max-lg:tracking-wide sm:tracking-widest text-gray-400 min-w-0"><CreditCard className="w-4 h-4 shrink-0" /> <span className="truncate">Subscription</span></span>
                <Badge variant="secondary" className="text-[8px] font-black uppercase">Free Plan</Badge>
              </div>
              <Button 
                variant="outline" 
                onClick={() => onOpenSupport?.()}
                className="w-full justify-between h-11 sm:h-12 rounded-xl border-gray-100 font-bold text-[10px] sm:text-xs uppercase max-lg:tracking-wide sm:tracking-widest text-gray-600 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3"><HelpCircle className="w-4 h-4" /> Help & Support</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-none shadow-sm bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl lg:rounded-[2rem] border border-rose-100/50 overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center gap-2.5 mb-1">
              <UserX className="w-5 h-5 text-rose-600 shrink-0" />
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-rose-600">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-[11px] font-bold max-lg:normal-case max-lg:tracking-normal text-rose-400 sm:uppercase sm:tracking-widest">Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xs font-medium text-rose-700/70 mb-4 sm:mb-6 leading-relaxed">
              Once you delete your account, all your data including applications and profile settings will be permanently removed.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setConfirmModal({ isOpen: true, type: 'delete' })}
              className="w-full max-lg:justify-center bg-rose-600 hover:bg-rose-700 rounded-xl px-6 sm:px-8 h-11 sm:h-12 font-bold text-[10px] sm:text-xs uppercase max-lg:tracking-wide sm:tracking-widest shadow-lg shadow-rose-200/40 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" /> Delete Account Permanently
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className={settingsDialogClass}>
          <DialogHeader>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 sm:mb-6 mx-auto">
              <KeyRound className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center tracking-tight mb-2">Change Password</DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-500 text-center leading-relaxed mb-4 sm:mb-6">
              A verification code has been sent to your email. Enter it along with your new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Code (OTP)</Label>
               <Input 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="0000" 
                  className="h-14 rounded-2xl bg-gray-50 border-none text-center text-2xl font-black tracking-[0.5em]"
                  maxLength={4}
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Password</Label>
               <PasswordInput 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold pr-12"
               />
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-6">
             <Button 
                onClick={() => changePasswordMutation.mutate()}
                disabled={changePasswordMutation.isPending || otpValue.length < 4 || newPassword.length < 6}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 sm:py-6 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
             >
                {changePasswordMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Step-by-Step UI */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={settingsDialogClass}>
           <AnimatePresence mode="wait">
              {deleteStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <AlertDialogHeader>
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 mx-auto"><Mail size={32} /></div>
                    <AlertDialogTitle className="text-2xl font-bold text-center mb-2">Step 1: Verify Email</AlertDialogTitle>
                    <AlertDialogDescription className="text-center mb-6">Enter the 4-digit code sent to your email to verify account ownership.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                    value={otpValue} onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="0000" maxLength={4}
                    className="h-14 rounded-2xl bg-gray-50 border-none text-center text-2xl font-black mb-6 tracking-[0.5em]"
                  />
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setDeleteStep(2)} disabled={otpValue.length < 4} className="w-full rounded-2xl bg-rose-600 font-bold py-6">Next Step</Button>
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-400 font-bold">Cancel</Button>
                  </div>
                </motion.div>
              )}

              {deleteStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <AlertDialogHeader>
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 mx-auto"><Lock size={32} /></div>
                    <AlertDialogTitle className="text-2xl font-bold text-center mb-2">Step 2: Security Check</AlertDialogTitle>
                    <AlertDialogDescription className="text-center mb-6">Please enter your current password to confirm this action.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <PasswordInput 
                    value={currentPasswordConfirm}
                    onChange={(e) => setCurrentPasswordConfirm(e.target.value)}
                    placeholder="Enter current password"
                    className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold pr-12 mb-6"
                  />
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={async () => {
                        try {
                          await verifyPasswordMutation.mutateAsync();
                          setDeleteStep(3);
                        } catch (e) {
                          toast({ title: "Error", description: "Incorrect password", variant: "destructive" });
                        }
                      }} 
                      disabled={verifyPasswordMutation.isPending || !currentPasswordConfirm}
                      className="w-full rounded-2xl bg-rose-600 font-bold py-6"
                    >
                      {verifyPasswordMutation.isPending ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleteStep(1)} className="text-gray-400 font-bold">Back</Button>
                  </div>
                </motion.div>
              )}

              {deleteStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <AlertDialogHeader>
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6 mx-auto"><AlertTriangle size={32} /></div>
                    <AlertDialogTitle className="text-2xl font-bold text-center mb-2">Final Confirmation</AlertDialogTitle>
                    <AlertDialogDescription className="text-center mb-6">Type <span className="font-black text-rose-600 uppercase">DELETE</span> below to confirm permanent account removal.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                    value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="h-14 rounded-2xl bg-gray-50 border-none text-center font-black mb-6"
                  />
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => deleteAccountMutation.mutate()} 
                      disabled={deleteAccountMutation.isPending || deleteConfirmText !== 'DELETE'}
                      className="w-full rounded-2xl bg-gray-900 hover:bg-black text-white font-bold py-6"
                    >
                      {deleteAccountMutation.isPending ? <Loader2 className="animate-spin" /> : "Confirm Deletion"}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-400 font-bold">Nevermind, take me back</Button>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pre-OTP Confirmation Modal */}
      <AlertDialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className={settingsDialogClass}>
          <AlertDialogHeader>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${confirmModal.type === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              <Shield size={32} />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center tracking-tight mb-2">
              {confirmModal.type === 'delete' ? 'Confirm Account Deletion' : 'Verify Identity'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500 text-center leading-relaxed">
              {confirmModal.type === 'delete' 
                ? "Wait! Are you sure? To proceed with account deletion, we need to verify your identity. A 4-digit verification code will be sent to your registered email."
                : "For your security, we need to verify your identity before changing your password. A 4-digit verification code will be sent to your registered email."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button 
              onClick={proceedWithAction}
              className={`w-full rounded-2xl font-bold py-6 shadow-xl transition-all active:scale-[0.98] ${confirmModal.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
            >
              Send Verification Code
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="text-gray-400 font-bold"
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="pt-10 flex flex-col items-center gap-4 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          StaffOS Candidate Portal • Version 2.4.1
        </p>
      </div>
    </div>
  );
}

function AlertTriangle({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
