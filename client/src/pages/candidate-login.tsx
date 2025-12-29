import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit, Briefcase, Target, Rocket, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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
  const { setUser } = useAuth();

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
  const [otpExpiry, setOtpExpiry] = useState(600); // 10 minutes in seconds

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      // Use fetch directly to handle 403 responses properly
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const fullUrl = `${API_BASE_URL}/api/auth/candidate-login`;
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const responseData = await res.json();

      // If 403 with requiresVerification, treat as success
      if (res.status === 403 && responseData.requiresVerification) {
        return responseData;
      }

      // For other non-ok responses, throw error
      if (!res.ok) {
        throw new Error(`${res.status}: ${JSON.stringify(responseData)}`);
      }

      return responseData;
    },
    onSuccess: (response) => {
      if (response.requiresVerification) {
        setCurrentEmail(response.email);
        setShowOTP(true);
        setOtpExpiry(600); // Reset timer to 10 minutes
        // OTP is now sent via email, no need for alert
        toast({
          title: "Verification Required",
          description: response.message || "Please check your email for the verification code",
        });
      } else if (response.success && response.candidate) {
        setUser({
          type: 'candidate',
          data: response.candidate
        });

        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        setTimeout(() => {
          setLocation('/candidate');
        }, 100);
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
      setOtpExpiry(600); // Reset timer to 10 minutes
      // OTP is now sent via email, no need for alert
      toast({
        title: "Registration Successful",
        description: `Your candidate ID is ${response.candidateId}. Please check your email for the verification code.`,
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

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/resend-otp', { email: currentEmail });
      return await res.json();
    },
    onSuccess: () => {
      setOtpExpiry(600); // Reset timer to 10 minutes
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-verify-otp', { email: currentEmail, otp: data.otp });
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success && response.candidate) {
        setUser({
          type: 'candidate',
          data: response.candidate
        });

        toast({
          title: "Verification Successful",
          description: "Your account has been verified!",
        });

        setTimeout(() => {
          setLocation('/candidate');
        }, 100);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
    }
  });

  // OTP expiry timer
  useEffect(() => {
    if (showOTP && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOTP, otpExpiry]);

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

  const isLoading = loginMutation.isPending || registerMutation.isPending || verifyOTPMutation.isPending || resendOTPMutation.isPending;

  if (showOTP) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Modern 2FA Design */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
          {/* Abstract geometric patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StaffOS</span>
            </div>

            {/* 2FA Content */}
            <div className="flex-1 flex flex-col justify-center space-y-8 max-w-lg">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Secure
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Verification
                  </span>
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We've sent a 6-digit code to your registered email. Enter it to complete the verification process.
                </p>
              </div>

              {/* Security illustration */}
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Extra layer of security for your account</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicator */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>

        {/* Right Side - OTP Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Verification Code</h2>
              <p className="text-gray-500 dark:text-gray-400">We sent a 4-digit code to {currentEmail}</p>
              {otpExpiry > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Code expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <p className="text-sm text-red-500 dark:text-red-400">Code expired. Please request a new one.</p>
              )}
            </div>

            <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="space-y-6" data-testid="form-otp-verification">
              <div>
                <Input
                  type="text"
                  placeholder="Enter 4-digit code"
                  className="w-full h-14 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:bg-gray-800 dark:text-white"
                  data-testid="input-otp"
                  maxLength={4}
                  {...registerOTP("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{4}$/,
                      message: "Please enter a valid 4-digit OTP",
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
                className="w-full h-12 bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white text-base font-semibold rounded-xl shadow-lg"
                data-testid="button-verify-otp"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="flex justify-between items-center text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </button>
                <button
                  type="button"
                  onClick={() => resendOTPMutation.mutate()}
                  disabled={resendOTPMutation.isPending || otpExpiry > 0}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-resend-otp"
                >
                  {resendOTPMutation.isPending ? "Sending..." : "Resend Code"}
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
      {/* Left Side - Modern SaaS Design with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        {/* Abstract geometric patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Floating geometric shapes */}
          <svg className="absolute top-32 right-20 w-20 h-20 text-emerald-400/20" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-40 left-20 w-16 h-16 text-cyan-400/20" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" fill="currentColor" transform="rotate(45 50 50)" />
          </svg>
          <svg className="absolute top-1/2 right-1/4 w-12 h-12 text-teal-400/20" viewBox="0 0 100 100">
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
                Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Opportunity Awaits
                </span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Discover amazing career opportunities and take control of your professional journey with StaffOS.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Premium Job Listings</h3>
                  <p className="text-sm text-gray-400">Access exclusive opportunities from top companies</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Matching</h3>
                  <p className="text-sm text-gray-400">Get matched with roles that fit your skills</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Fast-Track Applications</h3>
                  <p className="text-sm text-gray-400">Apply with one click and track progress</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicator */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Trusted by thousands of job seekers</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <div className="hidden lg:flex justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isLogin ? "Sign in to continue your journey" : "Join thousands of successful candidates"}
              </p>
            </div>

            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5" data-testid="form-candidate-login">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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
                    <p className="text-sm text-red-600 dark:text-red-400">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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
                    <p className="text-sm text-red-600 dark:text-red-400">{loginErrors.password.message}</p>
                  )}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white text-base font-semibold rounded-xl shadow-lg shadow-emerald-900/20 transition-all"
                  data-testid="button-login"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-medium rounded-xl flex items-center justify-center transition-all"
                  data-testid="button-google-login"
                  onClick={() => {
                    toast({
                      title: "Google Login Not Available",
                      description: "Currently this page doesn't support Google Login. This feature will be implemented later.",
                      variant: "default",
                    });
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setLocation('/candidate-registration')}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors"
                    data-testid="button-switch-to-register"
                  >
                    Create one <ArrowRight className="w-4 h-4" />
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
                    placeholder="John Doe"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
                    data-testid="input-register-fullname"
                    {...registerSignup("fullName", {
                      required: "Full name is required",
                    })}
                  />
                  {signupErrors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{signupErrors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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
                    <p className="text-sm text-red-600 dark:text-red-400">{signupErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <PasswordInput
                    id="registerPassword"
                    placeholder="Create a password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
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
                    <p className="text-sm text-red-600 dark:text-red-400">{signupErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all"
                    data-testid="input-register-confirm-password"
                    {...registerSignup("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val: string) => {
                        if (watch('password') !== val) {
                          return "Passwords do not match";
                        }
                      },
                    })}
                  />
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white text-base font-semibold rounded-xl shadow-lg shadow-emerald-900/20 transition-all"
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors"
                    data-testid="button-switch-to-login"
                  >
                    Sign In
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
