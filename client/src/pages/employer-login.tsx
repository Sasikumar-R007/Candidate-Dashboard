import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit } from "lucide-react";
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
import backgroundUrl from "@assets/Rectangle 1260_1758176515546.png";
import businessPersonUrl from "@assets/ChatGPT_Image_Jul_7__2025__07_40_50_PM-removebg-preview_1758176923888.png";

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>();

  // Forgot password mutation
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
      // Call employee authentication API
      const response = await apiRequest("POST", "/api/auth/employee-login", data);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      if (result.success && result.employee) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.employee.name}!`,
        });

        // Store employee data in sessionStorage for the session
        sessionStorage.setItem('employee', JSON.stringify(result.employee));

        // Navigate based on employee role
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
          default:
            toast({
              title: "Unknown Role",
              description: "Your account role is not recognized. Please contact admin.",
              variant: "destructive",
            });
            break;
        }
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
      // Redirect to Google OAuth endpoint
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
      {/* Left Side - New Design with Blue Background and Business Person */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden">
        {/* Blue textured background */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between pr-8 pt-8 pb-8 text-white w-full">
          {/* StaffOS logo at top left */}
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-white" />
            <span className="text-lg font-bold text-white">StaffOS</span>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center items-start space-y-6">
            {/* Main heading */}
            <div className="space-y-3">
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                Track. Improve.
                <br />
                Win every hire with
                <br />
                data-driven insights
              </h1>
              <p className="text-sm text-gray-200">
                Your hiring success, simplified into powerful metrics
              </p>
            </div>
            
            {/* Business person illustration */}
            <div className="flex justify-start w-full mt-6">
              <img 
                src={businessPersonUrl} 
                alt="Business analytics illustration" 
                className="max-w-sm w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with curved design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Curved white background shape that extends into left panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[130%] bg-white -translate-x-1/4 rounded-l-full z-0 hidden lg:block"></div>
        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <BrainCircuit className="w-12 h-12 text-gray-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Hello Again!</h2>
              <p className="text-gray-600 mt-2">Login to Your Account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-employer-login">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  className="w-full h-11 border border-gray-300 rounded bg-gray-50 px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm mb-1 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  className="w-full h-11 border border-gray-300 rounded bg-gray-50 px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Forgot Password Link with Modal */}
            <div className="text-left">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
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
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-base font-medium rounded transition-colors"
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full py-3 text-base font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              data-testid="button-google-login"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}