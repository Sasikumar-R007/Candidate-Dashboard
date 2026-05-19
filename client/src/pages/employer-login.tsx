import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit, BarChart3, Users, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import staffosLogo3 from "@/assets/staffos logo 3.png";
import staffosLogo2 from "@/assets/staffos logo 2.png";
import { useAuth } from "@/contexts/auth-context";
import { getDefaultRouteForAuthUser } from "@/lib/auth-routing";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import ForgotPasswordModal from "@/components/dashboard/modals/ForgotPasswordModal";

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployerLogin() {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
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
    
    try {
      const response = await apiRequest("POST", "/api/auth/employee-login", data);
      const result = await response.json();

      if (!response.ok) {
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
        description: error instanceof Error ? error.message : "Please check your email and password and try again.",
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
    <div className="min-h-screen flex">
      {/* Left Side - Modern SaaS Design with Gradient - Matching Landing Page Theme */}
      <div
        className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(96, 165, 250, 0.35), transparent 28%), radial-gradient(circle at 82% 78%, rgba(14, 165, 233, 0.28), transparent 32%), linear-gradient(135deg, #0B1F5E 0%, #1D4ED8 48%, #2563EB 100%)",
        }}
      >
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* StaffOS logo at top left */}
          <div className="flex items-center space-x-2">
            <img
              src={staffosLogo2}
              alt="StaffOS Logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-white">StaffOS</span>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center space-y-8 max-w-lg">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                Powerful Hiring
                <span className="block text-blue-200">
                  Analytics Platform
                </span>
              </h1>
              <p className="text-lg text-blue-100/90 leading-relaxed">
                Transform your recruitment with data-driven insights. Track performance, optimize workflows, and make smarter hiring decisions.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-time Analytics</h3>
                  <p className="text-sm text-blue-100/80">Track hiring metrics and KPIs instantly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Team Performance</h3>
                  <p className="text-sm text-blue-100/80">Monitor and improve recruiter productivity</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Insights</h3>
                  <p className="text-sm text-blue-100/80">AI-powered recommendations for success</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicator */}
          <div className="flex items-center space-x-2 text-blue-100/85 text-sm">
            <Shield className="w-4 h-4" />
            <span>Enterprise-grade security & compliance</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
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
    </div>
  );
}
