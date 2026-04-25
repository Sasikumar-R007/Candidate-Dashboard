
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }: ForgotPasswordModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/forgot-password/request", { email });
      if (res.ok) {
        toast({
          title: "Code Sent",
          description: "Please check your email for the verification code.",
        });
        setStep("otp");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to send code");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/forgot-password/verify", { email, otp });
      if (res.ok) {
        toast({
          title: "Verified",
          description: "Code verified. Please set your new password.",
        });
        setStep("reset");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Invalid code");
      }
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/forgot-password/reset", { email, otp, newPassword });
      if (res.ok) {
        setStep("success");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Reset failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
            {step === "email" && <Mail size={24} className="text-blue-400" />}
            {step === "otp" && <ShieldCheck size={24} className="text-green-400" />}
            {step === "reset" && <Lock size={24} className="text-purple-400" />}
            {step === "success" && <CheckCircle2 size={24} className="text-emerald-400" />}
          </div>
          <DialogTitle className="text-xl font-bold mb-1 tracking-tight">
            {step === "email" && "Reset Password"}
            {step === "otp" && "Verify Email"}
            {step === "reset" && "New Password"}
            {step === "success" && "All Done!"}
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm leading-relaxed">
            {step === "email" && "Enter your email address and we'll send you a verification code."}
            {step === "otp" && `We've sent a 6-digit code to ${email}`}
            {step === "reset" && "Please create a strong password for your account."}
            {step === "success" && "Your password has been reset successfully. You can now log in."}
          </DialogDescription>
        </div>

        <div className="p-6 bg-white">
          {step === "email" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500 text-sm placeholder:text-slate-300"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !email}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-200 transition-all group"
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                  <>
                    Send Code
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <Label className="text-xs font-semibold text-slate-500">Verification Code</Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="h-14 text-center text-2xl tracking-[8px] font-bold bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500 placeholder:text-slate-200"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep("email")}
                  className="h-11 px-4 rounded-xl border-slate-200 text-slate-600 font-semibold text-sm"
                >
                  <ArrowLeft size={18} />
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || otp.length < 6}
                  className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-green-200 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify Code"}
                </Button>
              </div>
              <p className="text-center text-xs text-slate-400">
                Didn't receive it? <button type="button" onClick={handleRequestOTP} className="text-blue-600 font-semibold hover:underline">Resend</button>
              </p>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-purple-500 text-sm placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-purple-500 text-sm placeholder:text-slate-300"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !newPassword}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-200 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-2">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <Button 
                onClick={resetAndClose}
                className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold text-sm shadow-lg transition-all"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
