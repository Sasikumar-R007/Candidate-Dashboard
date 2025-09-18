import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { BrainCircuit, Globe } from "lucide-react";
import illustrationUrl from "@assets/recruiter ,Team lead ,Admin_1758168597473.png";

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic with API endpoint
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Handle successful login (redirect, store token, etc.)
      console.log("Login successful");
    } catch (error) {
      // TODO: Handle login error (show toast notification, etc.)
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Blue Background with Branding and Illustration with Curve */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
        {/* Curved edge */}
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-gray-50 rounded-l-[100px] transform translate-x-10"></div>
        {/* Background texture/pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-slate-800" />
            </div>
            <span className="text-2xl font-bold">StaffOS</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8 max-w-md">
            <div>
              <h1 className="text-2xl font-bold leading-tight mb-4">
                Track. Improve.
                <br />
                Win every hire with
                <br />
                data-driven insights
              </h1>
              <p className="text-slate-300 text-sm">
                Your hiring success, simplified into powerful metrics
              </p>
            </div>

            {/* Illustration */}
            <div className="flex justify-center">
              <img 
                src={illustrationUrl} 
                alt="Track, Improve, Win every hire with data-driven insights" 
                className="w-full max-w-lg h-auto object-contain"
              />
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex space-x-4 opacity-60">
            <div className="w-16 h-1 bg-white/30 rounded"></div>
            <div className="w-8 h-1 bg-white/50 rounded"></div>
            <div className="w-4 h-1 bg-white/40 rounded"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">StaffOS</span>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Globe className="w-12 h-12 text-slate-600" />
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
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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
                    className="w-full h-11 border border-gray-300 rounded-md px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
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

              {/* Forgot Password Link */}
              <div className="text-left">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  data-testid="button-forgot-password"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-base font-medium rounded-md transition-colors"
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}