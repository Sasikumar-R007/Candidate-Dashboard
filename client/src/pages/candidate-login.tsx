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

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface OTPForm {
  otp: string;
}

export default function CandidateLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [, setLocation] = useLocation();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>();

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    watch,
  } = useForm<RegisterForm>();

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
  } = useForm<OTPForm>();

  const { toast } = useToast();
  const [currentEmail, setCurrentEmail] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-login', data);
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.requiresVerification) {
        setCurrentEmail(response.email);
        setShowOTP(true);
        if (response.otp) {
          alert(`Demo OTP: ${response.otp}`);
        }
        toast({
          title: "Verification Required",
          description: response.message,
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setLocation('/candidate');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-register', data);
      return await res.json();
    },
    onSuccess: (response) => {
      setCurrentEmail(response.email);
      setCandidateId(response.candidateId);
      setShowOTP(true);
      if (response.otp) {
        alert(`Demo OTP: ${response.otp}`);
      }
      toast({
        title: "Registration Successful",
        description: `Your candidate ID is ${response.candidateId}. Please verify with OTP.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed",
        variant: "destructive"
      });
    }
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-verify-otp', { email: currentEmail, otp: data.otp });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Successful",
        description: "Your account has been verified!",
      });
      setLocation('/candidate');
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
    }
  });

  const onLogin = (data: LoginForm) => {
    setCurrentEmail(data.email);
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    registerMutation.mutate(data);
  };

  const onVerifyOTP = (data: OTPForm) => {
    verifyOTPMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || verifyOTPMutation.isPending;

  if (showOTP) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Dark Blue Background with 2FA Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] relative overflow-hidden items-center justify-center p-12">
          <div className="max-w-md space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <span className="text-xl font-bold text-white">StaffOS</span>
            </div>

            {/* 2FA Title */}
            <div className="text-white space-y-4">
              <h1 className="text-3xl font-bold">2-Factor<br />Authentication</h1>
              <p className="text-gray-300 text-sm">2-step verification: extra security beyond your<br />password.</p>
            </div>

            {/* 2FA Illustration */}
            <div className="relative mt-12 flex justify-center">
              <svg width="300" height="250" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main user circle with blue background */}
                <circle cx="150" cy="100" r="60" fill="#5B8DB8"/>
                <circle cx="150" cy="80" r="25" fill="white"/>
                <path d="M 110 120 Q 150 140, 190 120" stroke="white" strokeWidth="15" fill="none" strokeLinecap="round"/>
                
                {/* Video call icon */}
                <circle cx="90" cy="170" r="22" fill="#E74C3C"/>
                <rect x="80" y="162" width="12" height="8" fill="white" rx="1"/>
                <path d="M 92 166 L 100 162 L 100 170 L 92 166 Z" fill="white"/>
                
                {/* Location pin */}
                <g transform="translate(180, 145)">
                  <path d="M 0 0 C -8 -8, -8 -20, 0 -28 C 8 -20, 8 -8, 0 0 Z" fill="#E67E22"/>
                  <circle cx="0" cy="-18" r="5" fill="white"/>
                </g>
                
                {/* Chat bubble */}
                <g transform="translate(210, 85)">
                  <rect x="0" y="0" width="35" height="25" rx="8" fill="#F39C12"/>
                  <path d="M 8 25 L 12 32 L 16 25" fill="#F39C12"/>
                  <line x1="8" y1="10" x2="27" y2="10" stroke="white" strokeWidth="2"/>
                  <line x1="8" y1="17" x2="20" y2="17" stroke="white" strokeWidth="2"/>
                </g>
                
                {/* Bottom decorative map/location elements */}
                <rect x="50" y="210" width="200" height="2" fill="#5B8DB8" opacity="0.3"/>
                <circle cx="80" cy="220" r="3" fill="#5DADE2"/>
                <circle cx="150" cy="225" r="3" fill="#5DADE2"/>
                <circle cx="220" cy="218" r="3" fill="#5DADE2"/>
                
                {/* Connecting lines */}
                <line x1="90" y1="170" x2="120" y2="140" stroke="#5B8DB8" strokeWidth="2" opacity="0.5"/>
                <line x1="210" y1="170" x2="180" y2="140" stroke="#5B8DB8" strokeWidth="2" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side - OTP Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Enter 2FA OTP sent to your Mobile</h2>
            </div>

            <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="space-y-6" data-testid="form-otp-verification">
              <div>
                <Input
                  type="text"
                  placeholder="6-digit OTP"
                  className="w-full h-14 text-center text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white"
                  data-testid="input-otp"
                  maxLength={6}
                  {...registerOTP("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Please enter a valid 6-digit OTP",
                    },
                  })}
                />
                {otpErrors.otp && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{otpErrors.otp.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white text-base font-semibold rounded-lg"
                data-testid="button-verify-otp"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="flex justify-between items-center text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                  data-testid="button-back-to-login"
                >
                  Back To Login
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  data-testid="button-resend-otp"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Dark Blue Background with Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2B4156] dark:bg-[#1a2633] relative overflow-hidden">
        <div className="w-full h-full flex flex-col justify-between p-12 relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white dark:bg-gray-200 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-[#2B4156] dark:text-[#1a2633]" />
            </div>
            <span className="text-2xl font-bold text-white dark:text-gray-100">StaffOS</span>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-20">
            <h1 className="text-4xl lg:text-5xl font-bold text-white dark:text-gray-100 leading-tight">
              Your Next<br />
              Opportunity Awaits
            </h1>
            <p className="text-gray-200 dark:text-gray-300 text-lg max-w-md">
              Access your opportunities and manage your applications
            </p>

            {/* Illustration */}
            <div className="relative mt-12">
              <svg className="w-full max-w-md" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Network connections */}
                <line x1="80" y1="80" x2="150" y2="120" stroke="#5B8DB8" strokeWidth="2" opacity="0.6"/>
                <line x1="150" y1="120" x2="200" y2="80" stroke="#5B8DB8" strokeWidth="2" opacity="0.6"/>
                <line x1="200" y1="80" x2="270" y2="100" stroke="#5B8DB8" strokeWidth="2" opacity="0.6"/>
                <line x1="150" y1="120" x2="180" y2="180" stroke="#5B8DB8" strokeWidth="2" opacity="0.6"/>
                <line x1="180" y1="180" x2="250" y2="170" stroke="#5B8DB8" strokeWidth="2" opacity="0.6"/>
                
                {/* Person 1 - Left */}
                <circle cx="80" cy="80" r="20" fill="#5B8DB8"/>
                <circle cx="80" cy="80" r="12" fill="white" opacity="0.9"/>
                <rect x="60" y="105" width="40" height="50" rx="5" fill="#4A6FA5"/>
                
                {/* Person 2 - Center */}
                <circle cx="150" cy="120" r="20" fill="#5B8DB8"/>
                <circle cx="150" cy="120" r="12" fill="white" opacity="0.9"/>
                <rect x="130" y="145" width="40" height="50" rx="5" fill="#4A6FA5"/>
                
                {/* Person 3 - Right Upper */}
                <circle cx="200" cy="80" r="20" fill="#5B8DB8"/>
                <circle cx="200" cy="80" r="12" fill="white" opacity="0.9"/>
                <rect x="180" y="105" width="40" height="50" rx="5" fill="#5DADE2"/>
                
                {/* Person 4 - Far Right */}
                <circle cx="270" cy="100" r="20" fill="#5B8DB8"/>
                <circle cx="270" cy="100" r="12" fill="white" opacity="0.9"/>
                <rect x="250" y="125" width="40" height="50" rx="5" fill="#4A6FA5"/>
                
                {/* Person 5 - Bottom */}
                <circle cx="180" cy="180" r="20" fill="#F39C12"/>
                <circle cx="180" cy="180" r="12" fill="white" opacity="0.9"/>
                <rect x="160" y="205" width="40" height="50" rx="5" fill="#E67E22"/>
                
                {/* Person 6 - Bottom Right */}
                <circle cx="250" cy="170" r="20" fill="#5B8DB8"/>
                <circle cx="250" cy="170" r="12" fill="white" opacity="0.9"/>
                <rect x="230" y="195" width="40" height="50" rx="5" fill="#16A085"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-[#2B4156] dark:bg-[#1a2633] rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white dark:text-gray-100" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLogin ? "Hello Again!" : "Create Account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isLogin ? "Login to Your Account" : "Sign up to get started"}
              </p>
            </div>

            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5" data-testid="form-candidate-login">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-login-email"
                    {...registerLogin("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {loginErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-login-password"
                    {...registerLogin("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.password.message}</p>
                  )}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-[#17A2B8] dark:text-blue-400 hover:text-[#138496] dark:hover:text-blue-300 font-medium"
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#2B4156] hover:bg-[#1f2f3e] dark:bg-[#1a2633] dark:hover:bg-[#0f1823] text-white text-base font-semibold rounded-lg"
                  data-testid="button-login"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or</span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Continue with
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-medium rounded-lg flex items-center justify-center"
                  data-testid="button-google-login"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Don't have an Account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-[#17A2B8] dark:text-blue-400 hover:text-[#138496] dark:hover:text-blue-300 font-semibold"
                    data-testid="button-switch-to-register"
                  >
                    Register Now
                  </button>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleSubmitSignup(onRegister)} className="space-y-5" data-testid="form-candidate-register">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-register-fullname"
                    {...registerSignup("fullName", {
                      required: "Full name is required",
                    })}
                  />
                  {signupErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{signupErrors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-register-email"
                    {...registerSignup("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {signupErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{signupErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-register-password"
                    {...registerSignup("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {signupErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{signupErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder=""
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 focus:border-[#2B4156] dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-800 placeholder:text-gray-400"
                    data-testid="input-register-confirm-password"
                    {...registerSignup("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => {
                        const password = watch("password");
                        return value === password || "Passwords do not match";
                      },
                    })}
                  />
                  {signupErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#2B4156] hover:bg-[#1f2f3e] dark:bg-[#1a2633] dark:hover:bg-[#0f1823] text-white text-base font-semibold rounded-lg"
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Already have an Account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#17A2B8] dark:text-blue-400 hover:text-[#138496] dark:hover:text-blue-300 font-semibold"
                    data-testid="button-switch-to-login"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
