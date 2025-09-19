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
import candidateImageUrl from "@assets/cand f_1758168663913.png";

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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-login', data);
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.requiresVerification) {
        setCurrentEmail(response.email);
        setShowOTP(true);
        // For demo purposes, show OTP in alert as requested
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

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await apiRequest('POST', '/api/auth/candidate-register', data);
      return await res.json();
    },
    onSuccess: (response) => {
      setCurrentEmail(response.email);
      setCandidateId(response.candidateId);
      setShowOTP(true);
      // For demo purposes, show OTP in alert as requested
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

  // OTP verification mutation
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Enter 2FA OTP sent to your Mobile</h2>
            </div>

            <form onSubmit={handleSubmitOTP(onVerifyOTP)} className="space-y-4" data-testid="form-otp-verification">
              <div>
                <Input
                  type="text"
                  placeholder="6-digit OTP"
                  className="w-full h-12 text-center text-lg border border-gray-300 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 text-base font-medium rounded"
                data-testid="button-verify-otp"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-gray-600 hover:text-gray-800"
                  data-testid="button-back-to-login"
                >
                  Back To Login
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500"
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
    <div className="min-h-screen flex">
      {/* Left Side - Exact Design from Image */}
      <div className="hidden lg:flex lg:w-1/2 items-end relative overflow-hidden">
        <img
          src={candidateImageUrl} 
          alt="Your Next Opportunity Awaits - Access your opportunities and manage your applications" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">StaffOS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4 mb-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Hello Again!" : "Create Account"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isLogin ? "Login to Your Account" : "Sign up to get started"}
                </p>
              </div>
            </div>

            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4" data-testid="form-candidate-login">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium text-sm mb-1 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
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
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                  )}
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
                    data-testid="button-forgot-password"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-base font-medium rounded-lg"
                  data-testid="button-login"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-4">
                  <span className="text-gray-600">Or</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 text-base font-medium rounded-lg flex items-center justify-center space-x-2"
                  data-testid="button-google-login"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>

                <div className="text-center">
                  <span className="text-gray-600">Don't have an Account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                    data-testid="button-switch-to-register"
                  >
                    Register Now
                  </button>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleSubmitSignup(onRegister)} className="space-y-4" data-testid="form-candidate-register">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder=""
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
                    data-testid="input-register-fullname"
                    {...registerSignup("fullName", {
                      required: "Full name is required",
                    })}
                  />
                  {signupErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registerEmail" className="text-gray-700 font-medium text-sm mb-1 block">
                    Email
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder=""
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    <p className="mt-1 text-sm text-red-600">{signupErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registerPassword" className="text-gray-700 font-medium text-sm mb-1 block">
                    Password
                  </Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder=""
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    <p className="mt-1 text-sm text-red-600">{signupErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm mb-1 block">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder=""
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-base font-medium rounded-lg"
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <span className="text-gray-600">Already have an Account? </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
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