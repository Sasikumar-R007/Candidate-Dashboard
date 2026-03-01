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
import { BrainCircuit, BarChart3, Users, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import staffosLogo3 from "@/assets/staffos logo 3.png";
import staffosLogo2 from "@/assets/staffos logo 2.png";
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
      {/* Left Side - Modern SaaS Design with Gradient - Matching Landing Page Theme */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #F5F3FF, #E8E4FF, #8776FF)' }}>
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* StaffOS logo at top left */}
          <div className="flex items-center space-x-2">
            <img
              src={staffosLogo2}
              alt="StaffOS Logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900">StaffOS</span>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center space-y-8 max-w-lg">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                Powerful Hiring
                <span className="block text-purple-600">
                  Analytics Platform
                </span>
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Transform your recruitment with data-driven insights. Track performance, optimize workflows, and make smarter hiring decisions.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/30 rounded-xl border border-white/40 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
                  <p className="text-sm text-gray-700">Track hiring metrics and KPIs instantly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/30 rounded-xl border border-white/40 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Team Performance</h3>
                  <p className="text-sm text-gray-700">Monitor and improve recruiter productivity</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/30 rounded-xl border border-white/40 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Insights</h3>
                  <p className="text-sm text-gray-700">AI-powered recommendations for success</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicator */}
          <div className="flex items-center space-x-2 text-gray-700 text-sm">
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
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access your dashboard</p>
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
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors font-poppins"
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
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-purple-600/20 transition-all font-poppins"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
