import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { formatApiErrorMessage } from "@/lib/api-error-message";
import { apiRequest } from "@/lib/queryClient";
import { Users, ArrowLeft, Briefcase, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";
import staffosLogo3 from "@/assets/staffos logo 3.png";
import staffosLogo2 from "@/assets/staffos logo 2.png";
import rocketIcon from "@/assets/Icons/rocket.png";
import suitcaseIcon from "@/assets/Icons/suitcase.png";
import securityIcon from "@/assets/Icons/security.png";
import lineChartIcon from "@/assets/Icons/line-chart.png";
import { PaperPlaneNudgeIcon } from "@/components/landing/paper-plane-nudge-icon";
import { useAuth } from "@/contexts/auth-context";
import { getDefaultRouteForAuthUser } from "@/lib/auth-routing";
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
import { AlertTriangle } from "lucide-react";
import ForgotPasswordModal from "@/components/dashboard/modals/ForgotPasswordModal";

interface LoginForm {
  email: string;
  password: string;
}

type HeldLoginInfo = {
  message: string;
  holdUntilLabel?: string;
};

export default function EmployerLogin() {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [heldLoginInfo, setHeldLoginInfo] = useState<HeldLoginInfo | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, isVerified, verifySession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthLoading || !isVerified) {
      return;
    }

    const redirectPath = getDefaultRouteForAuthUser(user);
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [user, isAuthLoading, isVerified, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setHeldLoginInfo(null);
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiBase}/api/auth/employee-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.accountHeld) {
          setHeldLoginInfo({
            message:
              result.holdMessage ||
              "Your account is on hold. You cannot access StaffOS at this time.",
            holdUntilLabel: result.holdUntilLabel,
          });
        }
        throw new Error(result.message || "Login failed");
      }

      if (result.success && result.employee) {
        const sessionOk = await verifySession();
        if (!sessionOk) {
          throw new Error("Session could not be verified after login. Please try again.");
        }

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.employee.name}!`,
        });

        setTimeout(() => {
          const route = getDefaultRouteForAuthUser({
            type: "employee",
            data: result.employee,
          });
          if (route) {
            navigate(route);
          } else {
            toast({
              title: "Unknown Role",
              description: "Your account role is not recognized. Please contact admin.",
              variant: "destructive",
            });
          }
        }, 300);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: formatApiErrorMessage(error, "Please check your email and password and try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden min-h-screen overflow-hidden border-0 lg:flex lg:h-screen lg:w-1/2 lg:shrink-0">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8F7FF] via-[#F4F1FF] to-[#EEF4FF]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(91, 67, 221, 0.14), transparent 42%), radial-gradient(circle at 88% 82%, rgba(37, 99, 235, 0.12), transparent 40%), radial-gradient(circle at 70% 12%, rgba(99, 102, 241, 0.08), transparent 35%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(91, 67, 221, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(91, 67, 221, 0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col gap-4 py-6 pl-6 pr-6 xl:gap-5 xl:py-8 xl:pl-9 xl:pr-12 lg:max-xl:py-5 lg:max-xl:pl-7">
          <header className="shrink-0">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-[#4A3EC8]">Why StaffOS?</p>
            <div className="mt-1.5 h-[2px] w-9 rounded bg-[#4A3EC8]" />
            <h1 className="mt-2 text-xl font-semibold leading-[1.15] tracking-[-0.01em] text-[#080C2A] xl:text-[28px] 2xl:text-[32px]">
              All Your Hiring Needs
              <br />
              All in One Platform.
            </h1>
          </header>

          <div className="min-h-[12rem] flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-hide">
            <div className="flex flex-col gap-3 pb-2">
          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-3">
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F3EEFF] xl:h-11 xl:w-11">
                <img src={rocketIcon} alt="" className="h-6 w-6 object-contain xl:h-7 xl:w-7" aria-hidden />
              </div>
              <p className="text-sm leading-[1.2] font-semibold text-[#0D122B] xl:text-[15px]">India&apos;s First Free ATS</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#5B43DD]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Modern hiring<br />made simple.</p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#E9F9F0]">
                <img src={suitcaseIcon} alt="" className="h-7 w-7 object-contain" aria-hidden />
              </div>
              <p className="text-[15px] leading-[1.2] font-semibold text-[#0D122B]">Free Job Posting</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#23A868]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Post jobs for free.<br />Pay only when you hire.</p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#EAF2FF]">
                <img src={securityIcon} alt="" className="h-5 w-5 object-contain" aria-hidden />
              </div>
              <p className="text-[15px] leading-[1.2] font-semibold text-[#0D122B]">Free Background<br />Verification</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#1E6BFF]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Verified candidate checks<br />within 7 days after onboarding.</p>
            </div>
          </div>

          <div className="[@media(max-height:720px)]:hidden">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-[#4A3EC8]">HIGHLIGHTS</p>
            <div className="mt-1.5 h-[2px] w-9 rounded bg-[#4A3EC8]" />
          </div>

          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-3">
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#FFF3E9]">
                <Users className="h-7 w-7 text-[#DE7E33]" strokeWidth={1.9} />
              </div>
              <p className="text-[15px] leading-[1.2] font-semibold text-[#0D122B]">Expert Recruiter Team</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#D97A32]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Industry-trained recruiters<br />for faster and quality-driven hiring.</p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#F3EEFF]">
                <PaperPlaneNudgeIcon className="h-7 w-7 text-[#6542D9]" />
              </div>
              <p className="text-[15px] leading-[1.2] font-semibold text-[#0D122B]">Powered by Nudges</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#5B43DD]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Structured updates with smart escalation.<br />No more chasing recruiters for updates.</p>
            </div>
            <div className="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm shadow-[#5B43DD]/8 backdrop-blur-[2px] xl:rounded-2xl xl:px-4 xl:py-3.5">
              <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#E8F8F1]">
                <img src={lineChartIcon} alt="" className="h-7 w-7 object-contain" aria-hidden />
              </div>
              <p className="text-[15px] leading-[1.2] font-semibold text-[#0D122B]">Pipeline Visibility<br />&amp; Metrics</p>
              <div className="my-1.5 h-[2px] w-8 rounded bg-[#14A26A]" />
              <p className="text-[12px] leading-[1.35] text-[#2A304A]">Track every hiring stage<br />and measure progress in real time.</p>
            </div>
          </div>
            </div>
          </div>

          <footer className="flex w-full shrink-0 items-center justify-between gap-2 rounded-xl border border-[#E0DCFF] bg-white/75 px-3 py-3 shadow-md shadow-[#5B43DD]/10 backdrop-blur-sm xl:rounded-2xl xl:px-4 xl:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[8px] [@media(max-height:800px)]:h-9 [@media(max-height:800px)]:w-9">
                <img src={staffosLogo2} alt="StaffOS" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug tracking-tight text-[#111827] [@media(max-height:800px)]:text-sm">
                  <span className="text-[#4B43CC]">StaffOS</span> - The Operating System for Hiring.
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#2A304A] [@media(max-height:720px)]:hidden">ATS. Recruiters. Visibility. Verification.</p>
                <p className="text-[12px] font-semibold leading-snug text-[#4B43CC] [@media(max-height:800px)]:mt-0.5 [@media(max-height:800px)]:text-[11px]">All in one seamless workflow.</p>
              </div>
            </div>
            <div className="relative ml-3 hidden h-16 w-16 shrink-0 sm:block [@media(max-height:720px)]:hidden">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#B9BDD6]" />
              <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[6px]">
                <img src={staffosLogo2} alt="StaffOS" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -left-0.5 top-0 flex h-5 w-5 items-center justify-center rounded-[4px] bg-white text-[#D97A32] shadow-sm"><Users className="h-3 w-3" /></div>
              <div className="absolute -right-0.5 top-0 flex h-5 w-5 items-center justify-center rounded-[4px] bg-white text-[#14A26A] shadow-sm"><TrendingUp className="h-3 w-3" /></div>
              <div className="absolute left-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-[4px] bg-white text-[#1E6BFF] shadow-sm"><Shield className="h-3 w-3" /></div>
              <div className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-[4px] bg-white text-[#23A868] shadow-sm"><Briefcase className="h-3 w-3" /></div>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto border-0 bg-white px-4 py-8 dark:bg-gray-900 sm:px-8 lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-6 xl:px-20">
        <div className="my-auto w-full max-w-[26rem] space-y-6 sm:space-y-8 lg:mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
            <img
              src={staffosLogo3}
              alt="StaffOS Logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-3">
            <div className="hidden lg:flex justify-center">
              <img
                src={staffosLogo3}
                alt="StaffOS Logo"
                className="h-14 w-14 rounded-xl object-contain shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access your workspace</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-employer-login">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
                  data-testid="input-email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
                  data-testid="input-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors font-poppins"
                data-testid="button-forgot-password"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all font-poppins"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={getValues("email")}
      />

      <AlertDialog open={Boolean(heldLoginInfo)} onOpenChange={(open) => !open && setHeldLoginInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Account On Hold
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="whitespace-pre-wrap">{heldLoginInfo?.message}</p>
                {heldLoginInfo?.holdUntilLabel && (
                  <p>
                    Access resumes:{" "}
                    <span className="font-medium text-gray-900">
                      {heldLoginInfo.holdUntilLabel}
                    </span>
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setHeldLoginInfo(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
