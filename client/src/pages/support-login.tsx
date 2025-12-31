import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit, Headset, ArrowLeft } from "lucide-react";
import backgroundUrl from "@assets/Rectangle 1260_1758176515546.png";
import businessPersonUrl from "@assets/ChatGPT_Image_Jul_7__2025__07_40_50_PM-removebg-preview_1758176923888.png";

interface LoginForm {
  email: string;
  password: string;
}

export default function SupportLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/support-login", data);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      if (result.success && result.employee) {
        toast({
          title: "Support Login Successful",
          description: `Welcome, ${result.employee.name}!`,
        });

        navigate("/support-dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - New Design with Blue Background and Business Person */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="relative z-10 flex flex-col justify-between pr-8 pt-8 pb-8 text-white w-full">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-white" />
            <span className="text-lg font-bold text-white">StaffOS</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-start space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight">
                Support Team Portal
              </h1>
              <p className="text-lg opacity-90">
                Manage user conversations and provide exceptional support
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-[500px] h-[500px]">
            <img 
              src={businessPersonUrl}
              alt="Support Representative"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <BrainCircuit className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">StaffOS</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/employer-login")}
                data-testid="button-back-dashboard"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Headset className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Support Team Login
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Access the support dashboard
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="support@staffos.com"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    data-testid="input-support-email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    data-testid="input-support-password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                disabled={isLoading}
                data-testid="button-support-login"
              >
                {isLoading ? "Logging in..." : "Login to Support Dashboard"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Support Team Only:</strong> This login is exclusively for authorized support team members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
