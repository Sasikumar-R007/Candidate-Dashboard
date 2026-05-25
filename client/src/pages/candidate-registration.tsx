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
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import staffosLogo2 from "@/assets/staffos logo 2.png";
import staffosLogo3 from "@/assets/staffos logo 3.png";

interface RegisterFormData {
  fullName: string;
  email: string;
}

interface OTPFormData {
  otp: string;
}

export default function CandidateRegistration() {
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(600);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const {
    register: registerInput,
    handleSubmit: handleSubmitInput,
    formState: { errors: inputErrors },
  } = useForm<RegisterFormData>();

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>();

  // OTP expiry timer
  useEffect(() => {
    if (showOTP && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOTP, otpExpiry]);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await apiRequest("POST", "/api/auth/candidate-register", data);
      return await res.json();
    },
    onSuccess: (response) => {
      setCurrentEmail(response.email);
      setShowOTP(true);
      setOtpExpiry(600);
      
      // OTP is now sent via email, no need for alert

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${response.email}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPFormData) => {
      const res = await apiRequest("POST", "/api/auth/candidate-verify-otp", {
        email: currentEmail,
        otp: data.otp,
      });
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        setShowPassword(true);
        toast({
          title: "Email Verified",
          description: "Please set a secure password for your account.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    },
  });

  const completeRegistrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/candidate-complete-registration", {
        email: currentEmail,
        password: data.password,
      });
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Registration Complete",
          description: "Your account is ready! Now let's upload your resume.",
        });
        setTimeout(() => {
          setLocation("/candidate/upload-resume");
        }, 500);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete registration",
        variant: "destructive",
      });
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/resend-otp", { email: currentEmail });
    },
    onSuccess: () => {
      setOtpExpiry(600);
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    },
  });

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const onVerifyOTP = (data: OTPFormData) => {
    verifyOTPMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-white font-poppins">
      {/* Left decoration — candidate login blue gradient theme */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(96, 165, 250, 0.35), transparent 28%), radial-gradient(circle at 82% 78%, rgba(14, 165, 233, 0.28), transparent 32%), linear-gradient(135deg, #0B1F5E 0%, #1D4ED8 48%, #2563EB 100%)",
        }}
      >
        <div className="relative z-10 flex h-full min-h-screen w-full flex-col justify-between p-12">
          <div className="flex items-center space-x-2">
            <img src={staffosLogo2} alt="StaffOS" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-white">StaffOS</span>
          </div>

          <div className="max-w-md">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
              Launch Your Career with{" "}
              <span className="text-blue-200">StaffOS</span>
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90">
              Find the perfect role, matched perfectly to your skills and aspirations.
              Simple, fast, and secure.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-blue-100/85">
            <Shield className="h-5 w-5 shrink-0" />
            <span>Trusted by top tech talent globally</span>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex min-h-screen w-full items-center justify-center border-0 bg-white p-8 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-2 flex items-center justify-center gap-2 lg:hidden">
            <img src={staffosLogo3} alt="StaffOS" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-gray-900">StaffOS</span>
          </div>

          {!showOTP ? (
            <div className="space-y-8">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">Get Started</h2>
                <p className="text-gray-500 font-poppins">Enter your details to begin your journey.</p>
              </div>

              <form onSubmit={handleSubmitInput(onRegister)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 font-poppins">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="h-12 border-gray-200 focus:border-[#2563EB] focus:ring-blue-100 rounded-xl"
                    {...registerInput("fullName", { required: "Full name is required" })}
                  />
                  {inputErrors.fullName && <p className="text-xs text-red-500 mt-1">{inputErrors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-poppins">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 border-gray-200 focus:border-[#2563EB] focus:ring-blue-100 rounded-xl"
                    {...registerInput("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                    })}
                  />
                  {inputErrors.email && <p className="text-xs text-red-500 mt-1">{inputErrors.email.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
                >
                  {registerMutation.isPending ? "Starting..." : "Continue"}
                </Button>

                <p className="text-center text-sm text-gray-500 font-poppins">
                  Already have an account?{" "}
                  <Link href="/candidate-login" className="text-[#2563EB] font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          ) : !showPassword ? (
            <div className="space-y-8">
              <div className="text-center lg:text-left space-y-2">
                <div className="flex justify-center lg:justify-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">Verify Your Email</h2>
                <p className="text-gray-500 font-poppins">We sent a 4-digit code to {currentEmail}</p>
              </div>

              <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    maxLength={4}
                    placeholder="Enter code"
                    className="h-16 text-center text-3xl font-mono tracking-widest border-2 border-gray-200 focus:border-[#2563EB] focus:ring-blue-100 rounded-2xl"
                    {...registerOTP("otp", {
                      required: "OTP is required",
                      pattern: { value: /^\d{4}$/, message: "Must be 4 digits" }
                    })}
                  />
                  {otpErrors.otp && <p className="text-xs text-red-500 text-center">{otpErrors.otp.message}</p>}

                  <div className="text-center">
                    {otpExpiry > 0 ? (
                      <p className="text-sm text-gray-500">
                        Code expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                      </p>
                    ) : (
                      <p className="text-sm text-red-500">Code expired</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={verifyOTPMutation.isPending}
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold"
                >
                  {verifyOTPMutation.isPending ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={() => resendOTPMutation.mutate()}
                    disabled={otpExpiry > 0 || resendOTPMutation.isPending}
                    className="text-[#2563EB] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendOTPMutation.isPending ? "Resending..." : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center lg:text-left space-y-2">
                <div className="flex justify-center lg:justify-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">Set Password</h2>
                <p className="text-gray-500 font-poppins">Secure your account with a strong password.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const password = (e.target as any).password.value;
                  const confirmPassword = (e.target as any).confirmPassword.value;
                  if (password !== confirmPassword) {
                    toast({
                      title: "Passwords do not match",
                      variant: "destructive"
                    });
                    return;
                  }
                  completeRegistrationMutation.mutate({ password });
                }} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 font-poppins">New Password</Label>
                    <PasswordInput
                      name="password"
                      placeholder="••••••••"
                      required
                      className="h-12 border-gray-200 focus:border-[#2563EB] focus:ring-blue-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 font-poppins">Confirm Password</Label>
                    <PasswordInput
                      name="confirmPassword"
                      placeholder="••••••••"
                      required
                      className="h-12 border-gray-200 focus:border-[#2563EB] focus:ring-blue-100 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={completeRegistrationMutation.isPending}
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold"
                >
                  {completeRegistrationMutation.isPending ? "Setting up..." : "Complete Registration"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
