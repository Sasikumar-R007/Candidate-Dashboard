import { useState, useEffect } from "react";
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
import { confirmSessionAfterAuth } from "@/lib/verify-session-client";
import type { Candidate } from "@shared/schema";
import { BrainCircuit, Briefcase, Target, Rocket, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import staffosLogo3 from "@/assets/staffos logo 3.png";
import staffosLogo2 from "@/assets/staffos logo 2.png";
import { useAuth } from "@/contexts/auth-context";
import ForgotPasswordModal from "@/components/dashboard/modals/ForgotPasswordModal";

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
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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

      if (!res.ok) {
        const message =
          (typeof responseData?.message === "string" && responseData.message) ||
          (res.status === 401 ? "Invalid email or password." : "Login failed. Please try again.");
        throw new Error(message);
      }

      return responseData;
    },
    onSuccess: async (response) => {
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
        sessionStorage.removeItem("staffos.candidate.helpFabHidden");
        const loginUser = {
          type: 'candidate' as const,
          data: response.candidate as Candidate,
        };
        setUser(loginUser);

        const sessionData = await confirmSessionAfterAuth();
        if (sessionData?.authenticated && sessionData.user) {
          setUser({
            type: 'candidate',
            data: sessionData.user as Candidate,
          });
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
        } else {
          // Keep login user in memory — do not call verifySession() here (it clears user on failure).
          setUser(loginUser);
          toast({
            title: "Login Successful",
            description:
              "Signed in. If the dashboard does not load, wait a few seconds and refresh this page once.",
          });
        }

        setTimeout(() => {
          if (response.candidate.registrationStage === 'completed') { setLocation('/candidate'); } else { setLocation('/candidate/upload-resume'); }
        }, 100);
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Login Failed",
        description: formatApiErrorMessage(error, "Invalid email or password."),
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
    onError: (error: unknown) => {
      toast({
        title: "Registration Failed",
        description: formatApiErrorMessage(error, "Registration failed. Please try again."),
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
    onError: (error: unknown) => {
      toast({
        title: "Failed to Resend",
        description: formatApiErrorMessage(error, "Please try again later."),
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
        sessionStorage.removeItem("staffos.candidate.helpFabHidden");
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
    onError: (error: unknown) => {
      toast({
        title: "Verification Failed",
        description: formatApiErrorMessage(error, "Invalid or expired verification code."),
        variant: "destructive"
      });
    }
  });

  // Check URL params to auto-show OTP form when coming from registration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const verify = params.get('verify');
    
    if (verify === 'true' && email) {
      setCurrentEmail(email);
      setShowOTP(true);
      setOtpExpiry(600); // Reset timer to 10 minutes
      setIsLogin(false); // Hide login form
      
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
      
      toast({
        title: "Verification Required",
        description: `Please check your email (${email}) for the verification code.`,
      });
    }
  }, []);

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
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Modern 2FA Design */}
        <div className="hidden lg:flex lg:h-screen lg:w-1/2 lg:shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          {/* Abstract geometric patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
            
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
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-300">
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
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-300" />
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
        <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto bg-white p-6 dark:bg-gray-900 sm:px-8 lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-6 xl:px-20">
          <div className="my-auto w-full max-w-[26rem] space-y-6 sm:space-y-8 lg:mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">Enter Verification Code</h2>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">We sent a 4-digit code to {currentEmail}</p>
              {otpExpiry > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">
                  Code expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <p className="text-sm text-red-500 dark:text-red-400 font-poppins">Code expired. Please request a new one.</p>
              )}
            </div>

            <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="space-y-6" data-testid="form-otp-verification">
              <div>
                <Input
                  type="text"
                  placeholder="Enter 4-digit code"
                  className="w-full h-14 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white font-poppins"
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
                className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all font-poppins"
                data-testid="button-verify-otp"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="flex justify-between items-center text-sm pt-2 font-poppins">
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
                  className="text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Side - Modern SaaS Design with Gradient - Matching Landing Page Theme */}
      <div
        className="hidden lg:flex lg:h-screen lg:w-1/2 lg:shrink-0 relative overflow-hidden"
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
                Your Next
                <span className="block text-blue-200">
                  Opportunity Awaits
                </span>
              </h1>
              <p className="text-lg text-blue-100/90 leading-relaxed">
                Discover amazing career opportunities and take control of your professional journey with StaffOS.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Premium Job Listings</h3>
                  <p className="text-sm text-blue-100/80">Access exclusive opportunities from top companies</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Matching</h3>
                  <p className="text-sm text-blue-100/80">Get matched with roles that fit your skills</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-lg bg-white/10 rounded-xl border border-white/20 shadow-lg shadow-blue-950/20">
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Fast-Track Applications</h3>
                  <p className="text-sm text-blue-100/80">Apply with one click and track progress</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust indicator */}
          <div className="flex items-center space-x-2 text-blue-100/85 text-sm">
            <Shield className="w-4 h-4" />
            <span>Trusted by thousands of job seekers</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto bg-white p-6 dark:bg-gray-900 sm:px-8 lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-6 xl:px-20">
        <div className="my-auto w-full max-w-[26rem] space-y-6 sm:space-y-8 lg:mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2">
            <img
              src={staffosLogo3}
              alt="StaffOS Logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          {/* Form Container */}
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <div className="hidden lg:flex justify-center">
                <img
                  src={staffosLogo3}
                  alt="StaffOS Logo"
                  className="h-14 w-14 rounded-xl object-contain shadow-lg"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">
                {isLogin ? "Sign in to access your workspace" : "Join thousands of successful candidates"}
              </p>
            </div>

            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5" data-testid="form-candidate-login">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-sm text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors font-poppins"
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all font-poppins"
                  data-testid="button-login"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center text-sm font-poppins">
                  <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setLocation('/candidate-registration')}
                    className="text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
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
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Email Address
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Password
                  </Label>
                  <PasswordInput
                    id="registerPassword"
                    placeholder="Create a password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                    Confirm Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-white dark:bg-gray-800 transition-all font-poppins"
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
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all font-poppins"
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm font-poppins">
                  <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#2563EB] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
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

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={isLogin ? watch('email' as any) : undefined}
      />
    </div>
  );
}
