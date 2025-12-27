import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit, BarChart3, Users, TrendingUp, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/employer/forgot-password", { email });
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Password Reset Request Sent",
        description: data.details || "A password reset email will be sent to the admin. You will be notified once processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send password reset request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/employee-login", data);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      if (result.success && result.employee) {
        setUser({
          type: 'employee',
          data: result.employee
        });

        sessionStorage.setItem('employee', JSON.stringify(result.employee));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.employee.name}!`,
        });

        setTimeout(() => {
          switch (result.employee.role) {
            case 'recruiter':
              navigate("/recruiter-login-2");
              break;
            case 'team_leader':
              navigate("/team-leader");
              break;
            case 'client':
              navigate("/client");
              break;
            case 'admin':
              navigate("/admin");
              break;
            case 'support':
              navigate("/support-dashboard");
              break;
            default:
              toast({
                title: "Unknown Role",
                description: "Your account role is not recognized. Please contact admin.",
                variant: "destructive",
              });
              break;
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      window.location.href = "/api/auth/google";
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPasswordConfirm = () => {
    const email = getValues("email");
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Modern SaaS Design with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Abstract geometric patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Floating geometric shapes */}
          <svg className="absolute top-32 right-20 w-20 h-20 text-blue-400/20" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-40 left-20 w-16 h-16 text-cyan-400/20" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" fill="currentColor" transform="rotate(45 50 50)" />
          </svg>
          <svg className="absolute top-1/2 right-1/4 w-12 h-12 text-indigo-400/20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="currentColor" />
          </svg>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* StaffOS logo at top left */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StaffOS</span>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center space-y-8 max-w-lg">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Powerful Hiring
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Analytics Platform
                </span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Transform your recruitment with data-driven insights. Track performance, optimize workflows, and make smarter hiring decisions.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-time Analytics</h3>
                  <p className="text-sm text-gray-400">Track hiring metrics and KPIs instantly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Team Performance</h3>
                  <p className="text-sm text-gray-400">Monitor and improve recruiter productivity</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Insights</h3>
                  <p className="text-sm text-gray-400">AI-powered recommendations for success</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicator */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Enterprise-grade security & compliance</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-3">
            <div className="hidden lg:flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="form-employer-login">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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

            {/* Forgot Password Link with Modal */}
            <div className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    data-testid="button-forgot-password"
                  >
                    Forgot Password?
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your password reset request will be sent to the admin team. You will receive an email notification once your request has been processed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-forgot-cancel">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleForgotPasswordConfirm}
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="button-forgot-submit"
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Send Request"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              data-testid="button-google-login"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
